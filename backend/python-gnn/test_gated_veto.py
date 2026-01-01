"""
Test Gated Status Veto Skip Connection

This test validates that the learned gate allows failed nodes to override
neighborhood smoothing without breaking calibration or ranking.
"""

import torch
import numpy as np
from model import ImpactPredictor
from pathlib import Path


def test_gated_veto_failed_node_detection():
    """Test that gated veto helps detect failed nodes in healthy neighborhoods"""
    print("="*70)
    print("TEST: Gated Status Veto - Failed Node Detection")
    print("="*70)
    
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    # Test with different veto strengths
    veto_weights = [0.0, 1.5, 2.5, 4.0]
    
    print("\n📊 Scenario: 1 FAILED node + 5 HEALTHY neighbors (strong topology)")
    print("   Goal: Failed node should be detected despite healthy context\n")
    
    for alpha in veto_weights:
        predictor = ImpactPredictor(
            model_path=str(model_path),
            temperature=0.5,  # Crisis mode
            status_veto_weight=alpha
        )
        
        # Scenario: Failed critical tank surrounded by healthy infrastructure
        x = torch.tensor([
            # Node 0: FAILED TANK (status=0.0) - SHOULD TRIGGER ALERT
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,  # Type: Tank (critical)
             0.0,  # status = 0.0 (FAILED!)
             0.1, 0.0,  # level, flow = empty, no flow
             0.95,  # criticality = very high
             0.9, 0.8, 0.7,  # serves large population, high economic value
             0.8, 0.9,  # high connectivity, good maintenance history
             0.1, 0.1, 0.0],
            
            # Nodes 1-5: All HEALTHY (status=0.9)
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
             0.9, 0.8, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7, 0.8, 0.1, 0.1, 0.0],
            
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
             0.9, 0.6, 0.7, 0.6, 0.3, 0.15, 0.4, 0.5, 0.6, 0.1, 0.1, 0.0],
            
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
             0.9, 0.85, 0.95, 0.8, 0.5, 0.3, 0.6, 0.7, 0.85, 0.1, 0.1, 0.0],
            
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
             0.9, 0.7, 0.8, 0.65, 0.35, 0.2, 0.45, 0.55, 0.7, 0.1, 0.1, 0.0],
            
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
             0.9, 0.9, 0.85, 0.7, 0.45, 0.25, 0.55, 0.65, 0.75, 0.1, 0.1, 0.0],
        ], dtype=torch.float32)
        
        # Dense connectivity: failed tank feeds all downstream nodes
        edge_index = torch.tensor([
            [0, 0, 0, 0, 0, 1, 2, 3, 4],  # From
            [1, 2, 3, 4, 5, 0, 0, 0, 0]   # To
        ], dtype=torch.long)
        
        edge_weight = torch.tensor([0.9, 0.9, 0.85, 0.85, 0.8, 0.9, 0.9, 0.85, 0.85], dtype=torch.float32)
        
        # Predict
        probs, alerts, risk = predictor.predict_with_threshold(
            x.numpy(), edge_index.numpy(), edge_weight.numpy(), threshold=0.5
        )
        
        failed_prob = probs[0, 0]  # Node 0 impact probability
        healthy_avg = probs[1:, 0].mean()  # Average of healthy nodes
        
        detected = "✅ DETECTED" if failed_prob > 0.5 else "❌ MISSED"
        contamination = "⚠️ CONTAMINATED" if healthy_avg > 0.3 else "✓ Clean"
        
        print(f"α = {alpha:.1f}  │  Failed: {failed_prob:.3f} {detected}  │  Healthy: {healthy_avg:.3f} {contamination}  │  Risk: {risk}")
    
    print("\n✅ Expected behavior:")
    print("   α=0.0: Failed node diluted by neighborhood (missed)")
    print("   α≥2.5: Failed node crosses threshold (detected)")
    print("   Healthy nodes remain low (no false positives)")


def test_ranking_stability():
    """Test that gated veto preserves node ranking"""
    print("\n\n" + "="*70)
    print("TEST: Ranking Stability")
    print("="*70)
    
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(
        model_path=str(model_path),
        temperature=0.5,
        status_veto_weight=2.5
    )
    
    print("\n📊 Scenario: 3 nodes with different failure severities")
    print("   Goal: Ranking should match failure severity\n")
    
    # Three nodes: completely failed, partially degraded, healthy
    x = torch.tensor([
        # Node 0: Completely failed (status=0.0)
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
         0.0, 0.1, 0.0, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.1, 0.1, 0.0],
        
        # Node 1: Partially degraded (status=0.4)
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
         0.4, 0.5, 0.3, 0.7, 0.5, 0.3, 0.4, 0.6, 0.7, 0.1, 0.1, 0.0],
        
        # Node 2: Healthy (status=0.9)
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
         0.9, 0.8, 0.9, 0.6, 0.3, 0.15, 0.3, 0.5, 0.6, 0.1, 0.1, 0.0],
    ], dtype=torch.float32)
    
    edge_index = torch.tensor([[0, 1], [1, 2]], dtype=torch.long)
    edge_weight = torch.tensor([0.9, 0.85], dtype=torch.float32)
    
    probs, _, _ = predictor.predict_with_threshold(
        x.numpy(), edge_index.numpy(), edge_weight.numpy(), threshold=0.5
    )
    
    print(f"Node 0 (Failed, status=0.0):     P = {probs[0, 0]:.4f}")
    print(f"Node 1 (Degraded, status=0.4):   P = {probs[1, 0]:.4f}")
    print(f"Node 2 (Healthy, status=0.9):    P = {probs[2, 0]:.4f}")
    
    # Check ranking
    ranking_correct = (probs[0, 0] > probs[1, 0] > probs[2, 0])
    
    if ranking_correct:
        print("\n✅ Ranking preserved: Failed > Degraded > Healthy")
    else:
        print("\n⚠️ Ranking unstable - may need calibration")


def test_gate_behavior():
    """Test that gate learns context-dependent trust in status"""
    print("\n\n" + "="*70)
    print("TEST: Gate Network Behavior")
    print("="*70)
    
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(
        model_path=str(model_path),
        temperature=0.5,
        status_veto_weight=2.5
    )
    
    print("\n📊 Checking gate activation pattern...")
    print("   Goal: Gate should modulate veto strength based on context\n")
    
    # Two nodes to avoid batch norm error
    x = torch.tensor([
        # Node 0: Failed
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
         0.0, 0.1, 0.0, 0.95, 0.9, 0.8, 0.7, 0.8, 0.9, 0.1, 0.1, 0.0],
        # Node 1: Healthy
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
         0.9, 0.8, 0.9, 0.7, 0.4, 0.2, 0.5, 0.6, 0.7, 0.1, 0.1, 0.0],
    ], dtype=torch.float32)
    
    edge_index = torch.tensor([[0, 1], [1, 0]], dtype=torch.long)
    
    # Forward pass to check gate values
    predictor.model.eval()  # Set to eval mode to avoid batch norm issues
    with torch.no_grad():
        x_dev = x.to(predictor.device)
        edge_index_dev = edge_index.to(predictor.device)
        
        # Get intermediate representations
        x1 = predictor.model.conv1(x_dev, edge_index_dev)
        x1 = predictor.model.bn1(x1)
        x1 = torch.relu(x1)
        
        x_input_proj = predictor.model.input_projection(x_dev)
        x2 = predictor.model.conv2(x1, edge_index_dev)
        x2 = predictor.model.bn2(x2)
        x2 = torch.relu(x2)
        x2 = x2 + x_input_proj
        
        x3 = predictor.model.conv3(x2, edge_index_dev)
        x3 = predictor.model.bn3(x3)
        x3 = torch.relu(x3)
        x3 = x3 + x1
        
        # Compute gate
        gate = predictor.model.gate_network(x3)
        
    gate_values = gate.cpu().numpy()[0]
    
    print(f"Gate activations (per output dimension):")
    dims = ["Impact", "Severity", "Time", "Water", "Power", "Road", "Building", 
            "Population", "Economic", "Recovery", "Priority", "Confidence"]
    
    for i, (dim, val) in enumerate(zip(dims, gate_values)):
        bar = "█" * int(val * 20)
        print(f"  {dim:12s}: {val:.3f} {bar}")
    
    avg_gate = gate_values.mean()
    print(f"\n  Average gate: {avg_gate:.3f}")
    
    if avg_gate > 0.3:
        print("  ✅ Gate is active (trusts status signal)")
    else:
        print("  ⚠️ Gate is conservative (needs retraining)")


def test_no_probability_explosion():
    """Test that gated veto doesn't cause probability collapse or explosion"""
    print("\n\n" + "="*70)
    print("TEST: Probability Calibration")
    print("="*70)
    
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(
        model_path=str(model_path),
        temperature=0.5,
        status_veto_weight=2.5
    )
    
    print("\n📊 Testing probability range across 100 random graphs...")
    
    all_probs = []
    
    for _ in range(100):
        # Random graph
        num_nodes = np.random.randint(3, 10)
        x = torch.rand(num_nodes, 24)
        
        # Random edges
        edge_list = []
        for i in range(num_nodes):
            for j in range(num_nodes):
                if i != j and np.random.rand() > 0.5:
                    edge_list.append([i, j])
        
        if len(edge_list) == 0:
            edge_list = [[0, 1]]  # At least one edge
        
        edge_index = torch.tensor(edge_list, dtype=torch.long).T
        edge_weight = torch.rand(edge_index.shape[1])
        
        probs, _, _ = predictor.predict_with_threshold(
            x.numpy(), edge_index.numpy(), edge_weight.numpy()
        )
        
        all_probs.extend(probs.flatten())
    
    all_probs = np.array(all_probs)
    
    print(f"\n  Min probability:  {all_probs.min():.4f}")
    print(f"  Max probability:  {all_probs.max():.4f}")
    print(f"  Mean probability: {all_probs.mean():.4f}")
    print(f"  Std probability:  {all_probs.std():.4f}")
    
    # Check for pathological behavior
    collapsed = (all_probs.max() - all_probs.min()) < 0.1
    exploded = (all_probs > 0.99).sum() / len(all_probs) > 0.5
    
    if collapsed:
        print("\n  ⚠️ Probabilities collapsed (low variance)")
    elif exploded:
        print("\n  ⚠️ Probabilities exploded (too many near 1.0)")
    else:
        print("\n  ✅ Probabilities well-calibrated (healthy range)")


def main():
    print("\n" + "🔬 GATED STATUS VETO VALIDATION" + "\n")
    print("Testing learned gate that allows failed nodes to override")
    print("neighborhood smoothing without breaking calibration.\n")
    
    test_gated_veto_failed_node_detection()
    test_ranking_stability()
    test_gate_behavior()
    test_no_probability_explosion()
    
    print("\n\n" + "="*70)
    print("🎉 GATED STATUS VETO TESTS COMPLETE")
    print("="*70)
    
    print("\n📋 Architecture Summary:")
    print("   • Gate Network: 3-layer MLP (128→64→12) with sigmoid")
    print("   • Failure Flag: Binary (1 if status<0.5, else 0)")
    print("   • Veto Formula: α * failure_flag * gate(embedding) * signal")
    print("   • Default α: 2.5 (configurable)")
    
    print("\n🚀 Next Steps:")
    print("   1. ✅ Architecture implemented with learned gate")
    print("   2. ⚠️  Gate initialized randomly (needs retraining)")
    print("   3. 📊 Use temperature=0.5 for immediate improvement")
    print("   4. 🔥 Retrain with focal loss to learn optimal gate")
    
    print("\n⚙️ Hyperparameters:")
    print("   • status_veto_weight (α): 0.0–4.0 (default: 2.5)")
    print("   • temperature: 0.3–2.0 (default: 0.5)")
    print("   • use_focal_loss: True for retraining")
    
    print("="*70)


if __name__ == "__main__":
    main()
