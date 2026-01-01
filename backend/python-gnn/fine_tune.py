"""
Fine-Tuning Engine for GNN Transfer Learning
Bridge between synthetic physics and real village incidents
"""

import torch
import torch.nn as nn
from model import ImpactPredictor
from incident_loader import InfrastructureIncidentLoader, load_real_incidents
import numpy as np
from typing import Optional


def fine_tune_on_real_data(
    synthetic_model_path: str,
    incidents_file: str,
    epochs: int = 20,
    lr: float = 1e-4,
    pos_weight_value: float = 5.0,
    freeze_early_layers: bool = True,
    save_path: str = "models/gnn_production_v1.pt"
):
    """
    Fine-tune pre-trained synthetic GNN on real incident data.
    
    This is TRUE TRANSFER LEARNING:
    1. Load synthetic model (general infrastructure physics)
    2. Freeze early layers (preserve structural knowledge)
    3. Fine-tune upper layers on real incidents (village-specific behavior)
    4. Handle class imbalance (real failures are sparse)
    5. Handle missing labels (not all nodes have known outcomes)
    
    Args:
        synthetic_model_path: Path to pre-trained synthetic model (.pt file)
        incidents_file: Path to real incidents JSON file
        epochs: Number of fine-tuning epochs (default: 20, much less than synthetic training)
        lr: Learning rate (1e-4, 10x smaller than synthetic training)
        pos_weight_value: Weight for positive class (5.0 = care 5x more about failures)
        freeze_early_layers: If True, freeze conv1 (type understanding)
        save_path: Where to save production model
    
    Returns:
        ImpactPredictor: Fine-tuned model
    """
    
    print("=" * 70)
    print("🚀 FINE-TUNING ENGINE: Synthetic → Real Transfer Learning")
    print("=" * 70)
    
    # 1. Load pre-trained synthetic model
    print(f"\n📦 Loading synthetic model from {synthetic_model_path}...")
    try:
        predictor = ImpactPredictor(model_path=synthetic_model_path)
        model = predictor.model
        device = predictor.device
        print(f"✓ Model loaded successfully on {device}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None
    
    # 2. Freeze early layers (preserve structural knowledge)
    if freeze_early_layers:
        print("\n🔒 Freezing Layer 1 (conv1) - preserving infrastructure type knowledge...")
        frozen_params = 0
        total_params = 0
        
        for name, param in model.named_parameters():
            total_params += param.numel()
            if 'conv1' in name:
                param.requires_grad = False
                frozen_params += param.numel()
        
        trainable_params = total_params - frozen_params
        print(f"   Total parameters: {total_params:,}")
        print(f"   Frozen (conv1): {frozen_params:,} ({frozen_params/total_params*100:.1f}%)")
        print(f"   Trainable: {trainable_params:,} ({trainable_params/total_params*100:.1f}%)")
    
    # 3. Create optimizer with SMALL learning rate
    print(f"\n⚙️  Setting up optimizer (lr={lr:.6f}, {10}x smaller than synthetic training)...")
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=lr
    )
    
    # 4. Loss function with class imbalance handling
    print(f"\n⚖️  Configuring loss (pos_weight={pos_weight_value:.1f}x for failure detection)...")
    pos_weight = torch.tensor([pos_weight_value], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight, reduction='none')
    
    # 5. Load real incidents
    print(f"\n📂 Loading real incidents from {incidents_file}...")
    try:
        real_incidents = load_real_incidents(incidents_file)
        if len(real_incidents) == 0:
            print("❌ No valid incidents found. Cannot fine-tune.")
            return None
        print(f"✓ Loaded {len(real_incidents)} incidents")
        
        # Statistics
        total_nodes = sum(data.x.shape[0] for data in real_incidents)
        known_labels = sum((data.y > -1).sum().item() for data in real_incidents)
        total_labels = sum(data.y.numel() for data in real_incidents)
        
        print(f"   Total nodes: {total_nodes}")
        print(f"   Known labels: {known_labels:,} / {total_labels:,} ({known_labels/total_labels*100:.1f}%)")
        
    except Exception as e:
        print(f"❌ Error loading incidents: {e}")
        return None
    
    # 6. Fine-tuning loop
    print("\n" + "=" * 70)
    print("🔥 Starting Fine-Tuning...")
    print("=" * 70)
    
    best_loss = float('inf')
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        batches = 0
        total_masked_elements = 0
        
        for data in real_incidents:
            data = data.to(device)
            optimizer.zero_grad()
            
            # Forward pass (RAW LOGITS - model already returns logits)
            logits = model(data.x, data.edge_index, data.edge_attr)
            
            # CRITICAL: Mask unknown labels (y == -1)
            mask = data.y > -1
            num_known = mask.sum().item()
            
            if num_known == 0:
                # No known labels in this incident, skip
                continue
            
            # Compute loss ONLY on known labels
            loss_all = criterion(logits, data.y)
            loss_masked = loss_all[mask].mean()
            
            # Backward pass
            loss_masked.backward()
            
            # Gradient clipping for stability
            torch.nn.utils.clip_grad_norm_(
                filter(lambda p: p.requires_grad, model.parameters()),
                max_norm=1.0
            )
            
            optimizer.step()
            
            total_loss += loss_masked.item()
            total_masked_elements += num_known
            batches += 1
        
        avg_loss = total_loss / max(batches, 1)
        
        # Track best model
        if avg_loss < best_loss:
            best_loss = avg_loss
            best_epoch = epoch + 1
        
        # Print progress
        print(f"Epoch {epoch+1:02d}/{epochs} | "
              f"Loss: {avg_loss:.4f} | "
              f"Known Labels: {total_masked_elements:,} | "
              f"{'🌟 BEST' if avg_loss == best_loss else ''}")
    
    print("\n" + "=" * 70)
    print(f"✅ Fine-tuning complete!")
    print(f"   Best Loss: {best_loss:.4f} (Epoch {best_epoch})")
    print("=" * 70)
    
    # 7. Save production model
    print(f"\n💾 Saving production model to {save_path}...")
    try:
        predictor.save_model(save_path)
        print(f"✓ Production model saved successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not save model: {e}")
    
    return predictor


def evaluate_fine_tuning(
    synthetic_model_path: str,
    fine_tuned_model_path: str,
    test_incidents_file: str
):
    """
    Compare synthetic vs fine-tuned model on test incidents.
    
    Args:
        synthetic_model_path: Path to original synthetic model
        fine_tuned_model_path: Path to fine-tuned model
        test_incidents_file: Path to test incidents JSON
        
    Returns:
        Dict with comparison metrics
    """
    print("\n" + "=" * 70)
    print("📊 EVALUATION: Synthetic vs Fine-Tuned")
    print("=" * 70)
    
    # Load both models
    print("\n📦 Loading models...")
    synthetic = ImpactPredictor(model_path=synthetic_model_path)
    fine_tuned = ImpactPredictor(model_path=fine_tuned_model_path)
    device = synthetic.device
    
    # Load test data
    print(f"📂 Loading test incidents from {test_incidents_file}...")
    test_incidents = load_real_incidents(test_incidents_file)
    
    if len(test_incidents) == 0:
        print("❌ No test incidents found")
        return None
    
    print(f"✓ Loaded {len(test_incidents)} test incidents\n")
    
    # Evaluate both models
    synthetic.model.eval()
    fine_tuned.model.eval()
    
    results = []
    
    with torch.no_grad():
        for i, data in enumerate(test_incidents):
            data = data.to(device)
            
            # Get predictions
            synthetic_logits = synthetic.model(data.x, data.edge_index, data.edge_attr)
            fine_tuned_logits = fine_tuned.model(data.x, data.edge_index, data.edge_attr)
            
            # Convert to probabilities
            synthetic_probs = torch.sigmoid(synthetic_logits)
            fine_tuned_probs = torch.sigmoid(fine_tuned_logits)
            
            # Get ground truth (only where known)
            mask = data.y > -1
            
            if mask.sum() == 0:
                continue
            
            # Compute MAE on known labels
            synthetic_mae = (synthetic_probs[mask] - data.y[mask]).abs().mean().item()
            fine_tuned_mae = (fine_tuned_probs[mask] - data.y[mask]).abs().mean().item()
            
            improvement = ((synthetic_mae - fine_tuned_mae) / synthetic_mae * 100)
            
            results.append({
                'incident_id': data.incident_id,
                'date': data.date,
                'synthetic_mae': synthetic_mae,
                'fine_tuned_mae': fine_tuned_mae,
                'improvement_pct': improvement,
                'known_labels': mask.sum().item()
            })
            
            # Print incident results
            status = "✅ BETTER" if fine_tuned_mae < synthetic_mae else "❌ WORSE"
            print(f"Incident {i+1}: {data.incident_id}")
            print(f"  Synthetic MAE:   {synthetic_mae:.4f}")
            print(f"  Fine-tuned MAE:  {fine_tuned_mae:.4f}")
            print(f"  Improvement:     {improvement:+.1f}% {status}\n")
    
    # Overall statistics
    if len(results) > 0:
        avg_synthetic = np.mean([r['synthetic_mae'] for r in results])
        avg_fine_tuned = np.mean([r['fine_tuned_mae'] for r in results])
        avg_improvement = ((avg_synthetic - avg_fine_tuned) / avg_synthetic * 100)
        
        better_count = sum(1 for r in results if r['improvement_pct'] > 0)
        
        print("=" * 70)
        print("📈 OVERALL RESULTS")
        print("=" * 70)
        print(f"Average Synthetic MAE:   {avg_synthetic:.4f}")
        print(f"Average Fine-tuned MAE:  {avg_fine_tuned:.4f}")
        print(f"Average Improvement:     {avg_improvement:+.1f}%")
        print(f"Better on:               {better_count}/{len(results)} incidents ({better_count/len(results)*100:.1f}%)")
        print("=" * 70)
        
        return {
            'results': results,
            'avg_synthetic_mae': avg_synthetic,
            'avg_fine_tuned_mae': avg_fine_tuned,
            'avg_improvement_pct': avg_improvement,
            'better_count': better_count,
            'total_incidents': len(results)
        }
    
    return None


if __name__ == "__main__":
    import sys
    
    # Example usage
    print("\n" + "=" * 70)
    print("GNN FINE-TUNING ENGINE")
    print("=" * 70)
    print("\nUsage:")
    print("  python fine_tune.py <mode> [args]")
    print("\nModes:")
    print("  train   - Fine-tune on real incidents")
    print("  eval    - Evaluate synthetic vs fine-tuned")
    print("\nExamples:")
    print("  python fine_tune.py train")
    print("  python fine_tune.py eval")
    print("=" * 70)
    
    if len(sys.argv) < 2:
        mode = "train"  # Default
    else:
        mode = sys.argv[1]
    
    if mode == "train":
        # Fine-tune on real data
        fine_tune_on_real_data(
            synthetic_model_path="models/gnn_model.pt",
            incidents_file="data/real_incidents.json",
            epochs=20,
            lr=1e-4,
            pos_weight_value=5.0,
            freeze_early_layers=True,
            save_path="models/gnn_production_v1.pt"
        )
    
    elif mode == "eval":
        # Evaluate both models
        evaluate_fine_tuning(
            synthetic_model_path="models/gnn_model.pt",
            fine_tuned_model_path="models/gnn_production_v1.pt",
            test_incidents_file="data/test_incidents.json"
        )
    
    else:
        print(f"\n❌ Unknown mode: {mode}")
        print("   Valid modes: train, eval")
