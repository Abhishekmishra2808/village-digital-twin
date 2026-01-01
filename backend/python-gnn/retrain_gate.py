"""
Targeted Gate Retraining Script
=================================

GOAL: Train the gated status veto to learn when a node's failure status 
should override neighborhood smoothing, WITHOUT relearning topology or 
breaking calibration.

This is targeted retraining, not full model training.

STRICT RULES:
✅ Train: gate_network, (optional) conv4 (final output projection)
❌ Freeze: conv1, conv2, conv3, input_projection, bn layers, status_projection

SUCCESS CRITERIA (ALL MUST PASS):
1. Failed nodes cross alert threshold at α ≈ 2.5
2. Healthy nodes remain below threshold
3. Node ranking preserved
4. Probability range bounded (< 0.9)
5. Mean probability remains low (< 0.05)

If ANY fail → automatic rollback.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from model import ImpactPredictor, FocalLoss
from incident_loader import load_real_incidents
import numpy as np
from typing import Dict, List, Tuple
import os
from datetime import datetime


class GateRetrainer:
    """
    Specialized retraining for gate network only.
    Preserves all message-passing layers and topology knowledge.
    """
    
    def __init__(
        self,
        model_path: str,
        incidents_file: str,
        lr: float = 1e-4,
        epochs: int = 10,
        pos_weight: float = 5.0,
        use_focal: bool = False,
        focal_gamma: float = 2.0,
        focal_alpha: float = 0.75,
        train_output_layer: bool = False
    ):
        """
        Initialize gate retrainer.
        
        Args:
            model_path: Path to pre-trained model
            incidents_file: Path to real incidents JSON
            lr: Learning rate (1e-4 or 5e-5 recommended)
            epochs: 5-15 epochs max
            pos_weight: BCEWithLogitsLoss pos_weight (default 5.0)
            use_focal: Use focal loss (OPTIONAL, only if false negatives persist)
            focal_gamma: Focal loss gamma (≤ 2.0)
            focal_alpha: Focal loss alpha (≤ 0.75)
            train_output_layer: Also train conv4 (final projection)
        """
        # Load pre-trained model
        print("=" * 80)
        print("🎯 TARGETED GATE RETRAINING")
        print("=" * 80)
        print(f"\n📦 Loading pre-trained model: {model_path}")
        
        self.predictor = ImpactPredictor(model_path=model_path)
        self.model = self.predictor.model
        self.device = self.predictor.device
        
        self.incidents_file = incidents_file
        self.lr = lr
        self.epochs = epochs
        self.pos_weight_value = pos_weight
        self.use_focal = use_focal
        self.focal_gamma = focal_gamma
        self.focal_alpha = focal_alpha
        self.train_output_layer = train_output_layer
        
        # Backup for rollback
        self.backup_path = None
        self.pre_metrics = None
        
        # Validation: ensure focal loss parameters are within bounds
        if use_focal:
            if focal_gamma > 2.0:
                print(f"⚠️  WARNING: focal_gamma={focal_gamma} > 2.0. Clamping to 2.0")
                self.focal_gamma = 2.0
            if focal_alpha > 0.75:
                print(f"⚠️  WARNING: focal_alpha={focal_alpha} > 0.75. Clamping to 0.75")
                self.focal_alpha = 0.75
    
    def _freeze_layers(self):
        """
        CRITICAL: Freeze all message-passing layers.
        Only train gate_network and optionally conv4.
        """
        print("\n🔒 FREEZING LAYERS (preserving topology knowledge)...")
        
        trainable_params = []
        frozen_params = []
        
        for name, param in self.model.named_parameters():
            # Train ONLY: gate_network, optionally conv4
            if 'gate_network' in name:
                param.requires_grad = True
                trainable_params.append(name)
            elif 'conv4' in name and self.train_output_layer:
                param.requires_grad = True
                trainable_params.append(name)
            else:
                # Freeze EVERYTHING else
                param.requires_grad = False
                frozen_params.append(name)
        
        print(f"\n✅ Trainable parameters ({len(trainable_params)}):")
        for name in trainable_params:
            print(f"   - {name}")
        
        print(f"\n❌ Frozen parameters ({len(frozen_params)}):")
        if len(frozen_params) <= 20:
            for name in frozen_params:
                print(f"   - {name}")
        else:
            for name in frozen_params[:10]:
                print(f"   - {name}")
            print(f"   ... and {len(frozen_params) - 10} more")
        
        # Count parameters
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        frozen = total_params - trainable
        
        print(f"\n📊 Parameter Summary:")
        print(f"   Total: {total_params:,}")
        print(f"   Trainable: {trainable:,} ({trainable/total_params*100:.1f}%)")
        print(f"   Frozen: {frozen:,} ({frozen/total_params*100:.1f}%)")
        
        # Safety check: ensure message-passing is frozen
        critical_layers = ['conv1', 'conv2', 'conv3', 'input_projection', 'status_projection']
        for layer_name in critical_layers:
            for name, param in self.model.named_parameters():
                if layer_name in name and param.requires_grad:
                    raise RuntimeError(
                        f"❌ CRITICAL ERROR: {name} is trainable but should be frozen!\n"
                        f"   This violates the retraining protocol. Aborting."
                    )
        
        print("✅ Layer freeze verification passed: all message-passing layers frozen")
    
    def _setup_training(self):
        """Setup optimizer and loss function."""
        print(f"\n⚙️  TRAINING CONFIGURATION")
        print(f"   Learning rate: {self.lr:.6f}")
        print(f"   Epochs: {self.epochs}")
        print(f"   pos_weight: {self.pos_weight_value:.1f}")
        
        # Optimizer: only train unfrozen parameters
        self.optimizer = torch.optim.Adam(
            filter(lambda p: p.requires_grad, self.model.parameters()),
            lr=self.lr
        )
        
        # Loss function
        if self.use_focal:
            print(f"   Loss: FocalLoss(gamma={self.focal_gamma}, alpha={self.focal_alpha})")
            pos_weight = torch.tensor([self.pos_weight_value], device=self.device)
            self.criterion = FocalLoss(
                alpha=self.focal_alpha,
                gamma=self.focal_gamma,
                pos_weight=pos_weight
            )
        else:
            print(f"   Loss: BCEWithLogitsLoss")
            pos_weight = torch.tensor([self.pos_weight_value], device=self.device)
            self.criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight, reduction='none')
    
    def _load_data(self) -> List[torch.Tensor]:
        """Load real incidents for training."""
        print(f"\n📂 Loading incidents: {self.incidents_file}")
        
        incidents = load_real_incidents(self.incidents_file)
        
        if len(incidents) == 0:
            raise RuntimeError("❌ No valid incidents found. Cannot retrain.")
        
        print(f"✓ Loaded {len(incidents)} incidents")
        
        # Statistics
        total_nodes = sum(data.x.shape[0] for data in incidents)
        labeled_nodes = sum((data.y[:, 0] >= 0).sum().item() for data in incidents)
        failed_nodes = sum(((data.x[:, 12] < 0.5) & (data.y[:, 0] >= 0)).sum().item() for data in incidents)
        healthy_nodes = labeled_nodes - failed_nodes
        
        print(f"   Total nodes: {total_nodes}")
        print(f"   Labeled nodes: {labeled_nodes}")
        print(f"   Failed nodes: {failed_nodes}")
        print(f"   Healthy nodes: {healthy_nodes}")
        
        if labeled_nodes < 10:
            raise RuntimeError("❌ Too few labeled nodes (<10). Need more training data.")
        
        if failed_nodes == 0:
            raise RuntimeError("❌ No failed nodes in dataset. Cannot train gate.")
        
        return incidents
    
    def _compute_metrics(self, incidents: List[torch.Tensor]) -> Dict[str, float]:
        """
        Compute validation metrics for success criteria.
        
        Returns:
            Dictionary with:
            - failed_mean_prob: Mean probability for failed nodes
            - healthy_mean_prob: Mean probability for healthy nodes
            - overall_mean_prob: Mean probability across all nodes
            - max_prob: Maximum probability
            - threshold_crossing_rate: % of failed nodes above α=2.5 threshold
        """
        self.model.eval()
        
        all_failed_probs = []
        all_healthy_probs = []
        all_probs = []
        failed_above_threshold = 0
        total_failed = 0
        
        with torch.no_grad():
            for data in incidents:
                data = data.to(self.device)
                
                # Get predictions
                logits = self.model(data.x, data.edge_index)
                probs = torch.sigmoid(logits).cpu().numpy()
                
                # Extract status (failed vs healthy)
                status = data.x[:, 12].cpu().numpy()
                failed_mask = status < 0.5
                healthy_mask = status >= 0.5
                
                # Only consider labeled nodes
                labeled_mask = (data.y[:, 0] >= 0).cpu().numpy()
                
                # Failed nodes
                failed_labeled = failed_mask & labeled_mask
                if failed_labeled.sum() > 0:
                    failed_probs = probs[failed_labeled, 0]
                    all_failed_probs.extend(failed_probs)
                    
                    # Count how many cross threshold
                    # Threshold = exp(-α) ≈ exp(-2.5) ≈ 0.082
                    threshold = np.exp(-2.5)
                    failed_above_threshold += (failed_probs >= threshold).sum()
                    total_failed += len(failed_probs)
                
                # Healthy nodes
                healthy_labeled = healthy_mask & labeled_mask
                if healthy_labeled.sum() > 0:
                    healthy_probs = probs[healthy_labeled, 0]
                    all_healthy_probs.extend(healthy_probs)
                
                # All labeled nodes
                all_probs.extend(probs[labeled_mask, 0])
        
        metrics = {
            'failed_mean_prob': np.mean(all_failed_probs) if all_failed_probs else 0.0,
            'healthy_mean_prob': np.mean(all_healthy_probs) if all_healthy_probs else 0.0,
            'overall_mean_prob': np.mean(all_probs) if all_probs else 0.0,
            'max_prob': np.max(all_probs) if all_probs else 0.0,
            'threshold_crossing_rate': failed_above_threshold / total_failed if total_failed > 0 else 0.0,
            'total_failed': total_failed,
            'total_healthy': len(all_healthy_probs)
        }
        
        return metrics
    
    def _check_success_criteria(self, metrics: Dict[str, float]) -> Tuple[bool, List[str]]:
        """
        Check if retraining meets all success criteria.
        
        Returns:
            (success: bool, failures: List[str])
        """
        failures = []
        
        # 1. Failed nodes should cross threshold (≥ 50% crossing rate)
        if metrics['threshold_crossing_rate'] < 0.5:
            failures.append(
                f"❌ Failed nodes don't cross threshold: {metrics['threshold_crossing_rate']*100:.1f}% "
                f"(need ≥50%)"
            )
        
        # 2. Healthy nodes should stay low (mean < 0.05)
        if metrics['healthy_mean_prob'] >= 0.05:
            failures.append(
                f"❌ Healthy nodes too high: mean={metrics['healthy_mean_prob']:.4f} (need <0.05)"
            )
        
        # 3. Overall mean probability should stay low (< 0.05)
        if metrics['overall_mean_prob'] >= 0.05:
            failures.append(
                f"❌ Mean probability too high: {metrics['overall_mean_prob']:.4f} (need <0.05)"
            )
        
        # 4. Max probability should be bounded (< 0.9)
        if metrics['max_prob'] >= 0.9:
            failures.append(
                f"❌ Probability saturation: max={metrics['max_prob']:.4f} (need <0.9)"
            )
        
        # 5. Failed nodes should have higher probability than healthy
        if metrics['failed_mean_prob'] <= metrics['healthy_mean_prob']:
            failures.append(
                f"❌ Node ranking broken: failed={metrics['failed_mean_prob']:.4f} "
                f"vs healthy={metrics['healthy_mean_prob']:.4f}"
            )
        
        success = len(failures) == 0
        return success, failures
    
    def _train_epoch(self, incidents: List[torch.Tensor], epoch: int) -> float:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0.0
        n_batches = 0
        
        for data in incidents:
            data = data.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            logits = self.model(data.x, data.edge_index)
            
            # Compute loss (only on labeled nodes)
            labeled_mask = (data.y[:, 0] >= 0).to(self.device)
            
            if labeled_mask.sum() == 0:
                continue  # Skip if no labeled nodes
            
            # Loss per node
            if self.use_focal:
                loss = self.criterion(logits[labeled_mask], data.y[labeled_mask])
            else:
                loss_per_node = self.criterion(logits[labeled_mask], data.y[labeled_mask])
                loss = loss_per_node.mean()
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            n_batches += 1
        
        avg_loss = total_loss / n_batches if n_batches > 0 else 0.0
        return avg_loss
    
    def _check_gate_saturation(self, incidents: List[torch.Tensor]) -> Tuple[bool, float, float]:
        """
        Check if gate values are saturating (all near 0 or 1).
        
        Returns:
            (saturated: bool, mean_gate: float, std_gate: float)
        """
        self.model.eval()
        all_gates = []
        
        with torch.no_grad():
            for data in incidents:
                data = data.to(self.device)
                
                # Forward through conv layers to get x3
                x = data.x
                edge_index = data.edge_index
                
                # Replicate model forward to extract x3
                x_input = x
                x1 = self.model.conv1(x, edge_index)
                x1 = self.model.bn1(x1)
                x1 = F.relu(x1)
                x1 = self.model.dropout(x1)
                
                x_input_proj = self.model.input_projection(x_input)
                x2 = self.model.conv2(x1, edge_index)
                x2 = self.model.bn2(x2)
                x2 = F.relu(x2)
                x2 = x2 + x_input_proj
                x2 = self.model.dropout(x2)
                
                x3 = self.model.conv3(x2, edge_index)
                x3 = self.model.bn3(x3)
                x3 = F.relu(x3)
                x3 = x3 + x1
                x3 = self.model.dropout(x3)
                
                # Get gate values
                gate = self.model.gate_network(x3).cpu().numpy()
                all_gates.append(gate)
        
        all_gates = np.concatenate(all_gates, axis=0)
        mean_gate = all_gates.mean()
        std_gate = all_gates.std()
        
        # Saturated if mean < 0.1 or > 0.9
        saturated = mean_gate < 0.1 or mean_gate > 0.9
        
        return saturated, mean_gate, std_gate
    
    def retrain(self, save_path: str = None) -> bool:
        """
        Execute targeted gate retraining with automatic validation and rollback.
        
        Returns:
            success: bool - True if retraining successful, False if rolled back
        """
        try:
            # Step 1: Backup current model
            backup_dir = "models/backups"
            os.makedirs(backup_dir, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.backup_path = f"{backup_dir}/gate_backup_{timestamp}.pt"
            self.predictor.save_model(self.backup_path)
            print(f"\n💾 Backup saved: {self.backup_path}")
            
            # Step 2: Freeze layers
            self._freeze_layers()
            
            # Step 3: Setup training
            self._setup_training()
            
            # Step 4: Load data
            incidents = self._load_data()
            
            # Step 5: Compute pre-training metrics (baseline)
            print(f"\n📊 PRE-TRAINING METRICS (Baseline)")
            print("=" * 80)
            self.pre_metrics = self._compute_metrics(incidents)
            for key, value in self.pre_metrics.items():
                if isinstance(value, float):
                    print(f"   {key}: {value:.4f}")
                else:
                    print(f"   {key}: {value}")
            
            pre_success, pre_failures = self._check_success_criteria(self.pre_metrics)
            if pre_success:
                print("\n✅ Pre-training model already meets success criteria")
            else:
                print("\n⚠️  Pre-training model has issues:")
                for failure in pre_failures:
                    print(f"   {failure}")
            
            # Step 6: Train
            print(f"\n🚀 TRAINING ({self.epochs} epochs)")
            print("=" * 80)
            
            for epoch in range(1, self.epochs + 1):
                # Train
                loss = self._train_epoch(incidents, epoch)
                
                # Check gate saturation
                saturated, mean_gate, std_gate = self._check_gate_saturation(incidents)
                
                print(f"Epoch {epoch:2d}/{self.epochs} | Loss: {loss:.4f} | "
                      f"Gate: μ={mean_gate:.3f} σ={std_gate:.3f}", end="")
                
                if saturated:
                    print(f" ⚠️  SATURATED!")
                    print(f"\n❌ Gate saturation detected at epoch {epoch}. Stopping early.")
                    break
                else:
                    print()
                
                # Early metrics check every 5 epochs
                if epoch % 5 == 0:
                    metrics = self._compute_metrics(incidents)
                    print(f"   → Failed crossing: {metrics['threshold_crossing_rate']*100:.1f}% | "
                          f"Mean prob: {metrics['overall_mean_prob']:.4f}")
            
            # Step 7: Post-training metrics
            print(f"\n📊 POST-TRAINING METRICS")
            print("=" * 80)
            post_metrics = self._compute_metrics(incidents)
            for key, value in post_metrics.items():
                if isinstance(value, float):
                    change = post_metrics[key] - self.pre_metrics[key]
                    print(f"   {key}: {value:.4f} (Δ {change:+.4f})")
                else:
                    print(f"   {key}: {value}")
            
            # Step 8: Check success criteria
            print(f"\n✅ SUCCESS CRITERIA VALIDATION")
            print("=" * 80)
            success, failures = self._check_success_criteria(post_metrics)
            
            if success:
                print("✅ ALL CRITERIA PASSED!")
                print("   1. ✅ Failed nodes cross threshold")
                print("   2. ✅ Healthy nodes stay below threshold")
                print("   3. ✅ Node ranking preserved")
                print("   4. ✅ Probability range bounded")
                print("   5. ✅ Mean probability remains low")
                
                # Save retrained model
                if save_path:
                    self.predictor.save_model(save_path)
                    print(f"\n💾 Retrained model saved: {save_path}")
                
                return True
            
            else:
                print("❌ CRITERIA FAILED:")
                for failure in failures:
                    print(f"   {failure}")
                
                # Rollback
                print(f"\n🔄 ROLLING BACK to backup: {self.backup_path}")
                self.predictor.load_model(self.backup_path)
                print("✅ Rollback complete. Original model restored.")
                
                return False
        
        except Exception as e:
            print(f"\n❌ ERROR during retraining: {e}")
            if self.backup_path and os.path.exists(self.backup_path):
                print(f"🔄 Rolling back to: {self.backup_path}")
                self.predictor.load_model(self.backup_path)
                print("✅ Rollback complete")
            raise


def main():
    """
    Example usage:
    
    python retrain_gate.py
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Targeted Gate Retraining")
    parser.add_argument('--model', type=str, required=True, help='Path to pre-trained model')
    parser.add_argument('--incidents', type=str, required=True, help='Path to incidents JSON')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate (1e-4 or 5e-5)')
    parser.add_argument('--epochs', type=int, default=10, help='Epochs (5-15 max)')
    parser.add_argument('--pos-weight', type=float, default=5.0, help='BCELoss pos_weight')
    parser.add_argument('--focal', action='store_true', help='Use focal loss (OPTIONAL)')
    parser.add_argument('--focal-gamma', type=float, default=2.0, help='Focal gamma (≤2.0)')
    parser.add_argument('--focal-alpha', type=float, default=0.75, help='Focal alpha (≤0.75)')
    parser.add_argument('--train-output', action='store_true', help='Also train conv4')
    parser.add_argument('--save', type=str, default='models/gnn_gate_retrained.pt', 
                       help='Save path for retrained model')
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.lr > 1e-3:
        print(f"⚠️  WARNING: lr={args.lr} is too high. Recommended: 1e-4 or 5e-5")
    
    if args.epochs > 15:
        print(f"⚠️  WARNING: epochs={args.epochs} > 15. Risk of overtraining.")
    
    # Create retrainer
    retrainer = GateRetrainer(
        model_path=args.model,
        incidents_file=args.incidents,
        lr=args.lr,
        epochs=args.epochs,
        pos_weight=args.pos_weight,
        use_focal=args.focal,
        focal_gamma=args.focal_gamma,
        focal_alpha=args.focal_alpha,
        train_output_layer=args.train_output
    )
    
    # Execute retraining
    success = retrainer.retrain(save_path=args.save)
    
    if success:
        print("\n🎉 Gate retraining SUCCESSFUL!")
        print(f"   Model saved to: {args.save}")
    else:
        print("\n⚠️  Gate retraining FAILED and was rolled back.")
        print("   Try:")
        print("   - Collect more training incidents")
        print("   - Adjust learning rate (lower)")
        print("   - Reduce epochs")
        print("   - Enable focal loss if false negatives persist")


if __name__ == '__main__':
    main()
