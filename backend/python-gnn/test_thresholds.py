"""
Threshold Testing Script
Tests different critical node thresholds and compares performance
"""

import torch
import torch.nn as nn
from model import ImpactPredictor
from incident_loader import load_real_incidents
import numpy as np
import json
from datetime import datetime


def fine_tune_with_threshold(
    synthetic_model_path: str,
    incidents_file: str,
    critical_threshold: float,
    epochs: int = 20,
    lr: float = 1e-4,
    pos_weight_value: float = 5.0,
    save_path: str = None
):
    """
    Fine-tune with specific critical node threshold.
    
    Args:
        critical_threshold: Threshold for critical nodes (e.g., 0.2, 0.4, 0.5)
    """
    
    print("=" * 70)
    print(f"🎯 TESTING THRESHOLD: {critical_threshold}")
    print("=" * 70)
    
    # Load pre-trained synthetic model
    print(f"\n📦 Loading synthetic model from {synthetic_model_path}...")
    predictor = ImpactPredictor(model_path=synthetic_model_path)
    model = predictor.model
    device = predictor.device
    print(f"✓ Model loaded successfully on {device}")
    
    # Freeze Layer 1
    print("\n🔒 Freezing Layer 1 (conv1)...")
    for param in model.conv1.parameters():
        param.requires_grad = False
    
    # Optimizer
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=lr
    )
    
    # Loss with imbalance handling
    pos_weight = torch.tensor([pos_weight_value], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight, reduction='none')
    
    # Load real incidents
    print(f"\n📂 Loading incidents from {incidents_file}...")
    real_incidents = load_real_incidents(incidents_file)
    print(f"✓ Loaded {len(real_incidents)} incidents")
    
    # Count critical nodes at this threshold
    critical_count = 0
    total_nodes = 0
    for data in real_incidents:
        node_impacts = data.y[:, 0]  # Impact probability dimension
        critical_mask = (node_impacts > -1) & (node_impacts > critical_threshold)
        critical_count += critical_mask.sum().item()
        total_nodes += (node_impacts > -1).sum().item()
    
    critical_pct = critical_count / total_nodes * 100 if total_nodes > 0 else 0
    print(f"   Critical nodes at threshold {critical_threshold}: {critical_count}/{total_nodes} ({critical_pct:.1f}%)")
    
    # Fine-tuning loop
    print(f"\n🔥 Starting Fine-Tuning (threshold={critical_threshold})...")
    
    best_loss = float('inf')
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        batches = 0
        
        for data in real_incidents:
            data = data.to(device)
            optimizer.zero_grad()
            
            # Forward pass
            logits = model(data.x, data.edge_index, data.edge_attr)
            
            # Mask unknown labels
            mask = data.y > -1
            num_known = mask.sum().item()
            
            if num_known == 0:
                continue
            
            # Compute base loss
            loss_all = criterion(logits, data.y)
            
            # Apply THRESHOLD-BASED WEIGHTING
            # Critical nodes get extra weight
            weights = torch.ones_like(data.y)
            
            # Identify critical nodes based on threshold
            node_impacts = data.y[:, 0]  # Impact probability (dimension 0)
            critical_nodes = node_impacts > critical_threshold
            
            # Apply 3× weight to critical nodes
            for i in range(data.y.shape[0]):
                if critical_nodes[i]:
                    weights[i, :] = 3.0
            
            # Weighted loss
            weighted_loss_all = loss_all * weights
            loss_masked = weighted_loss_all[mask].mean()
            
            # Backward pass
            loss_masked.backward()
            
            torch.nn.utils.clip_grad_norm_(
                filter(lambda p: p.requires_grad, model.parameters()),
                max_norm=1.0
            )
            
            optimizer.step()
            
            total_loss += loss_masked.item()
            batches += 1
        
        avg_loss = total_loss / max(batches, 1)
        
        if avg_loss < best_loss:
            best_loss = avg_loss
            best_epoch = epoch + 1
        
        # Only print every 5 epochs to reduce output
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"Epoch {epoch+1:02d}/{epochs} | Loss: {avg_loss:.4f} | {'🌟' if avg_loss == best_loss else ''}")
    
    print(f"\n✅ Best Loss: {best_loss:.4f} (Epoch {best_epoch})")
    
    # Save model
    if save_path:
        predictor.save_model(save_path)
        print(f"💾 Saved to {save_path}")
    
    return predictor, best_loss


def evaluate_threshold_model(model_path: str, test_incidents_file: str, threshold_name: str):
    """
    Evaluate a threshold-specific model.
    """
    from backtest import BacktestEngine
    
    print(f"\n{'='*70}")
    print(f"📊 Evaluating: {threshold_name}")
    print(f"{'='*70}")
    
    engine = BacktestEngine(model_path, threshold_name)
    results = []
    
    # Load test data
    incidents = load_real_incidents(test_incidents_file)
    
    for data in incidents:
        result = engine.backtest_incident(data, k=5)
        if 'error' not in result:
            results.append(result)
    
    # Compute averages
    if len(results) > 0:
        avg_mae = np.mean([r['mae'] for r in results])
        avg_accuracy = np.mean([r['accuracy'] for r in results])
        avg_precision = np.mean([r['precision'] for r in results])
        avg_recall = np.mean([r['recall'] for r in results])
        avg_f1 = np.mean([r['f1_score'] for r in results])
        
        return {
            'threshold_name': threshold_name,
            'mae': avg_mae,
            'accuracy': avg_accuracy,
            'precision': avg_precision,
            'recall': avg_recall,
            'f1_score': avg_f1,
            'num_incidents': len(results)
        }
    
    return None


def run_threshold_comparison():
    """
    Main comparison function: test thresholds 0.2, 0.4, 0.5
    """
    print("\n" + "=" * 70)
    print("🔬 THRESHOLD COMPARISON EXPERIMENT")
    print("Testing Critical Node Thresholds: 0.2, 0.4, 0.5")
    print("=" * 70)
    
    thresholds = [0.2, 0.4, 0.5]
    results_summary = []
    
    # Fine-tune with each threshold
    for threshold in thresholds:
        model_path = f"models/gnn_threshold_{threshold:.1f}.pt"
        
        predictor, best_loss = fine_tune_with_threshold(
            synthetic_model_path="models/gnn_model.pt",
            incidents_file="data/real_incidents.json",
            critical_threshold=threshold,
            epochs=20,
            lr=1e-4,
            pos_weight_value=5.0,
            save_path=model_path
        )
        
        # Evaluate
        result = evaluate_threshold_model(
            model_path=model_path,
            test_incidents_file="data/real_incidents.json",
            threshold_name=f"Threshold {threshold:.1f}"
        )
        
        if result:
            result['training_loss'] = best_loss
            results_summary.append(result)
        
        print("\n" + "-" * 70 + "\n")
    
    # Print comparison table
    print("\n" + "=" * 70)
    print("📊 THRESHOLD COMPARISON RESULTS")
    print("=" * 70)
    
    print(f"\n{'Metric':<20} ", end='')
    for threshold in thresholds:
        print(f"Threshold {threshold:<6.1f} ", end='')
    print()
    print("-" * 70)
    
    metrics = ['training_loss', 'mae', 'accuracy', 'precision', 'recall', 'f1_score']
    metric_names = ['Training Loss', 'MAE', 'Accuracy', 'Precision', 'Recall', 'F1-Score']
    
    for metric, name in zip(metrics, metric_names):
        print(f"{name:<20} ", end='')
        
        for result in results_summary:
            value = result[metric]
            if metric in ['accuracy', 'precision', 'recall']:
                print(f"{value:>14.1%} ", end='')
            else:
                print(f"{value:>14.4f} ", end='')
        print()
    
    print("\n" + "=" * 70)
    
    # Find best threshold
    best_f1_idx = np.argmax([r['f1_score'] for r in results_summary])
    best_threshold = thresholds[best_f1_idx]
    best_f1 = results_summary[best_f1_idx]['f1_score']
    
    print(f"\n🏆 BEST THRESHOLD: {best_threshold:.1f}")
    print(f"   F1-Score: {best_f1:.4f}")
    print(f"   Precision: {results_summary[best_f1_idx]['precision']:.1%}")
    print(f"   Recall: {results_summary[best_f1_idx]['recall']:.1%}")
    
    # Save results
    output = {
        'timestamp': datetime.now().isoformat(),
        'thresholds_tested': thresholds,
        'results': results_summary,
        'best_threshold': best_threshold,
        'best_f1_score': best_f1
    }
    
    with open('results/threshold_comparison.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Results saved to results/threshold_comparison.json")
    print("=" * 70)
    
    return results_summary


if __name__ == "__main__":
    import os
    
    # Create results directory
    os.makedirs('results', exist_ok=True)
    
    # Run comparison
    results = run_threshold_comparison()
