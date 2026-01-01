"""
Backtest & Evaluation System
Compare GNN predictions against historical reality
"""

import torch
import numpy as np
from model import ImpactPredictor
from incident_loader import load_real_incidents
import json
from typing import List, Dict, Tuple
from datetime import datetime


class BacktestEngine:
    """
    Backtesting engine for GNN model evaluation.
    
    Answers the question: "If we had this model back then, 
    would it have predicted what actually happened?"
    """
    
    def __init__(self, model_path: str, model_name: str = "Model"):
        """
        Initialize backtest engine with a trained model.
        
        Args:
            model_path: Path to model checkpoint
            model_name: Human-readable name for reports
        """
        self.model_name = model_name
        self.predictor = ImpactPredictor(model_path=model_path)
        self.predictor.model.eval()
        self.device = self.predictor.device
        
        self.results = []
    
    def predict_incident(self, data) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict outcomes for a single incident.
        
        Args:
            data: PyTorch Geometric Data object
            
        Returns:
            predictions: (num_nodes, 12) probability predictions
            ground_truth: (num_nodes, 12) actual outcomes (-1 for unknown)
        """
        data = data.to(self.device)
        
        with torch.no_grad():
            logits = self.predictor.model(data.x, data.edge_index, data.edge_attr)
            probs = torch.sigmoid(logits)
        
        predictions = probs.cpu().numpy()
        ground_truth = data.y.cpu().numpy()
        
        return predictions, ground_truth
    
    def evaluate_ranking(self, predictions: np.ndarray, ground_truth: np.ndarray, k: int = 5) -> Dict:
        """
        Evaluate if model correctly identifies top-K at-risk nodes.
        
        This is CRITICAL: In real life, you can't inspect every node.
        You want the model to correctly rank the most at-risk nodes first.
        
        Args:
            predictions: (num_nodes,) impact probabilities
            ground_truth: (num_nodes,) actual impacts (0-1)
            k: Top-K nodes to check
            
        Returns:
            Dict with ranking metrics
        """
        # Get known labels only
        mask = ground_truth >= 0
        if mask.sum() == 0:
            return {'error': 'no_known_labels'}
        
        pred = predictions[mask]
        truth = ground_truth[mask]
        
        # Rank nodes by predicted risk (highest first)
        ranked_indices = np.argsort(pred)[::-1]
        
        # Top-K predicted nodes
        top_k_indices = ranked_indices[:k]
        
        # Which nodes were actually impacted (truth > 0.5)
        actually_impacted = truth > 0.5
        
        if actually_impacted.sum() == 0:
            # No actual impacts (all healthy)
            return {
                'top_k_precision': 1.0 if pred[top_k_indices].max() < 0.5 else 0.0,
                'top_k_recall': 1.0,
                'actually_impacted': 0,
                'predicted_impacted_in_top_k': (pred[top_k_indices] > 0.5).sum()
            }
        
        # How many of the actually impacted nodes are in Top-K?
        actually_impacted_indices = np.where(actually_impacted)[0]
        hits = np.isin(actually_impacted_indices, top_k_indices).sum()
        
        # Metrics
        precision = hits / k  # Of Top-K predicted, how many were right?
        recall = hits / actually_impacted.sum()  # Of actual impacts, how many did we catch?
        
        return {
            'top_k_precision': precision,
            'top_k_recall': recall,
            'hits': hits,
            'actually_impacted': int(actually_impacted.sum()),
            'predicted_impacted_in_top_k': int((pred[top_k_indices] > 0.5).sum())
        }
    
    def backtest_incident(self, data, k: int = 5) -> Dict:
        """
        Run backtest on a single incident.
        
        Args:
            data: PyTorch Geometric Data object
            k: Top-K nodes for ranking evaluation
            
        Returns:
            Dict with detailed results
        """
        predictions, ground_truth = self.predict_incident(data)
        
        # Get known labels mask
        mask = ground_truth >= 0
        known_count = mask.sum()
        
        if known_count == 0:
            return {
                'incident_id': data.incident_id,
                'date': data.date,
                'error': 'no_known_labels',
                'num_nodes': data.x.shape[0]
            }
        
        # Extract impact probability (dimension 0)
        pred_impact = predictions[:, 0]
        truth_impact = ground_truth[:, 0]
        
        # Create 1D mask for impact dimension
        mask_1d = truth_impact >= 0
        
        # MAE on known labels
        mae = np.abs(pred_impact[mask_1d] - truth_impact[mask_1d]).mean()
        
        # RMSE on known labels
        rmse = np.sqrt(((pred_impact[mask_1d] - truth_impact[mask_1d]) ** 2).mean())
        
        # Ranking metrics
        ranking = self.evaluate_ranking(pred_impact, truth_impact, k=k)
        
        # Binary classification metrics (threshold = 0.5)
        pred_binary = (pred_impact[mask_1d] > 0.5).astype(int)
        truth_binary = (truth_impact[mask_1d] > 0.5).astype(int)
        
        tp = ((pred_binary == 1) & (truth_binary == 1)).sum()
        fp = ((pred_binary == 1) & (truth_binary == 0)).sum()
        tn = ((pred_binary == 0) & (truth_binary == 0)).sum()
        fn = ((pred_binary == 0) & (truth_binary == 1)).sum()
        
        accuracy = (tp + tn) / (tp + fp + tn + fn) if (tp + fp + tn + fn) > 0 else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        
        result = {
            'incident_id': data.incident_id,
            'date': data.date,
            'num_nodes': data.x.shape[0],
            'known_labels': int(known_count),
            'mae': float(mae),
            'rmse': float(rmse),
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'tp': int(tp), 'fp': int(fp), 'tn': int(tn), 'fn': int(fn),
            'ranking': ranking
        }
        
        self.results.append(result)
        return result
    
    def backtest_all(self, incidents_file: str, k: int = 5) -> List[Dict]:
        """
        Run backtest on all incidents in file.
        
        Args:
            incidents_file: Path to incidents JSON
            k: Top-K for ranking evaluation
            
        Returns:
            List of result dictionaries
        """
        print("=" * 70)
        print(f"🔍 BACKTESTING: {self.model_name}")
        print("=" * 70)
        
        # Load incidents
        print(f"\n📂 Loading incidents from {incidents_file}...")
        incidents = load_real_incidents(incidents_file)
        
        if len(incidents) == 0:
            print("❌ No incidents found")
            return []
        
        print(f"✓ Loaded {len(incidents)} incidents\n")
        
        # Run backtest on each incident
        self.results = []
        
        for i, data in enumerate(incidents):
            print(f"\n{'='*70}")
            print(f"Incident {i+1}/{len(incidents)}: {data.incident_id}")
            print(f"Date: {data.date}")
            print(f"{'='*70}")
            
            result = self.backtest_incident(data, k=k)
            
            if 'error' in result:
                print(f"⚠ {result['error']}")
                continue
            
            # Print results
            print(f"\n📊 Prediction Quality:")
            print(f"  MAE:        {result['mae']:.4f}")
            print(f"  RMSE:       {result['rmse']:.4f}")
            print(f"  Accuracy:   {result['accuracy']:.1%}")
            print(f"  Precision:  {result['precision']:.1%}")
            print(f"  Recall:     {result['recall']:.1%}")
            print(f"  F1-Score:   {result['f1_score']:.3f}")
            
            print(f"\n🎯 Top-{k} Ranking:")
            rank = result['ranking']
            print(f"  Precision:  {rank['top_k_precision']:.1%} ({rank.get('hits', 0)}/{k} correct)")
            print(f"  Recall:     {rank['top_k_recall']:.1%} (caught {rank.get('hits', 0)}/{rank.get('actually_impacted', 0)} impacts)")
            
            print(f"\n📈 Confusion Matrix:")
            print(f"  TP: {result['tp']:3d}  FP: {result['fp']:3d}")
            print(f"  FN: {result['fn']:3d}  TN: {result['tn']:3d}")
        
        # Print summary
        self._print_summary()
        
        return self.results
    
    def _print_summary(self):
        """Print aggregate statistics"""
        if len(self.results) == 0:
            return
        
        valid_results = [r for r in self.results if 'error' not in r]
        
        if len(valid_results) == 0:
            return
        
        print("\n" + "=" * 70)
        print(f"📈 AGGREGATE RESULTS ({len(valid_results)} incidents)")
        print("=" * 70)
        
        avg_mae = np.mean([r['mae'] for r in valid_results])
        avg_rmse = np.mean([r['rmse'] for r in valid_results])
        avg_accuracy = np.mean([r['accuracy'] for r in valid_results])
        avg_precision = np.mean([r['precision'] for r in valid_results])
        avg_recall = np.mean([r['recall'] for r in valid_results])
        avg_f1 = np.mean([r['f1_score'] for r in valid_results])
        
        avg_rank_precision = np.mean([r['ranking']['top_k_precision'] for r in valid_results])
        avg_rank_recall = np.mean([r['ranking']['top_k_recall'] for r in valid_results])
        
        print(f"\n🎯 Prediction Quality:")
        print(f"  Average MAE:       {avg_mae:.4f}")
        print(f"  Average RMSE:      {avg_rmse:.4f}")
        print(f"  Average Accuracy:  {avg_accuracy:.1%}")
        print(f"  Average Precision: {avg_precision:.1%}")
        print(f"  Average Recall:    {avg_recall:.1%}")
        print(f"  Average F1-Score:  {avg_f1:.3f}")
        
        print(f"\n🏆 Top-K Ranking:")
        print(f"  Avg Precision:     {avg_rank_precision:.1%}")
        print(f"  Avg Recall:        {avg_rank_recall:.1%}")
        
        print("=" * 70)
    
    def save_results(self, output_file: str):
        """Save backtest results to JSON"""
        output = {
            'model_name': self.model_name,
            'timestamp': datetime.now().isoformat(),
            'num_incidents': len(self.results),
            'results': self.results
        }
        
        with open(output_file, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\n💾 Results saved to {output_file}")


def compare_models(
    model_paths: Dict[str, str],
    incidents_file: str,
    k: int = 5
):
    """
    Compare multiple models side-by-side on same incidents.
    
    Args:
        model_paths: Dict of {model_name: model_path}
        incidents_file: Path to incidents JSON
        k: Top-K for ranking
    """
    print("\n" + "=" * 70)
    print("⚖️  MODEL COMPARISON")
    print("=" * 70)
    print(f"\nModels: {', '.join(model_paths.keys())}")
    print(f"Test Data: {incidents_file}")
    print(f"Top-K Ranking: {k}\n")
    
    # Run backtest for each model
    all_results = {}
    
    for model_name, model_path in model_paths.items():
        print(f"\n{'='*70}")
        print(f"Testing: {model_name}")
        print(f"{'='*70}")
        
        engine = BacktestEngine(model_path, model_name)
        results = engine.backtest_all(incidents_file, k=k)
        all_results[model_name] = results
    
    # Print comparison table
    print("\n" + "=" * 70)
    print("📊 COMPARISON TABLE")
    print("=" * 70)
    
    metrics = ['mae', 'rmse', 'accuracy', 'precision', 'recall', 'f1_score']
    
    print(f"\n{'Metric':<15} ", end='')
    for model_name in model_paths.keys():
        print(f"{model_name:<20} ", end='')
    print()
    print("-" * (15 + 20 * len(model_paths)))
    
    for metric in metrics:
        print(f"{metric.upper():<15} ", end='')
        
        for model_name in model_paths.keys():
            results = all_results[model_name]
            valid = [r[metric] for r in results if 'error' not in r]
            
            if len(valid) > 0:
                avg = np.mean(valid)
                if metric in ['accuracy', 'precision', 'recall']:
                    print(f"{avg:>18.1%}  ", end='')
                else:
                    print(f"{avg:>18.4f}  ", end='')
            else:
                print(f"{'N/A':>18}  ", end='')
        print()
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    import sys
    
    print("\n" + "=" * 70)
    print("GNN BACKTEST ENGINE")
    print("=" * 70)
    print("\nUsage:")
    print("  python backtest.py <mode> [args]")
    print("\nModes:")
    print("  single  - Test single model")
    print("  compare - Compare synthetic vs fine-tuned")
    print("\nExamples:")
    print("  python backtest.py single")
    print("  python backtest.py compare")
    print("=" * 70)
    
    if len(sys.argv) < 2:
        mode = "single"
    else:
        mode = sys.argv[1]
    
    if mode == "single":
        # Test single model
        engine = BacktestEngine(
            model_path="models/gnn_model.pt",
            model_name="Synthetic GNN"
        )
        engine.backtest_all("data/real_incidents.json", k=5)
        engine.save_results("results/backtest_synthetic.json")
    
    elif mode == "compare":
        # Compare models
        compare_models(
            model_paths={
                'Synthetic': 'models/gnn_model.pt',
                'Fine-Tuned': 'models/gnn_production_v1.pt'
            },
            incidents_file="data/real_incidents.json",
            k=5
        )
    
    else:
        print(f"\n❌ Unknown mode: {mode}")
        print("   Valid modes: single, compare")
