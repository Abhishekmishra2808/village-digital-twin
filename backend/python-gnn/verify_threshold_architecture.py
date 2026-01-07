"""
Verification Script: Threshold Architecture
Tests that thresholds are applied at inference time only
"""

import torch
import numpy as np
from model import ImpactPredictor
from pathlib import Path

def test_threshold_independence():
    """
    Test 1: Model outputs should be threshold-independent
    Probabilities should stay constant, only alerts should change
    """
    print("="*70)
    print("TEST 1: Threshold Independence")
    print("="*70)
    
    # Load model with absolute path
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(model_path=str(model_path))
    
    # Create test graph (4 nodes, 3 edges)
    x = torch.rand(4, 24)  # 4 nodes with 24 features
    edge_index = torch.tensor([[0, 1, 2], [1, 2, 3]], dtype=torch.long)
    edge_weight = torch.tensor([0.9, 0.85, 0.8], dtype=torch.float32)
    
    # Run predictions with different thresholds
    thresholds = [0.3, 0.5, 0.7]
    results = {}
    
    for threshold in thresholds:
        probs, alerts, risk = predictor.predict_with_threshold(
            x.numpy(), edge_index.numpy(), edge_weight.numpy(), threshold=threshold
        )
        results[threshold] = {
            'probabilities': probs,
            'alerts': alerts,
            'risk': risk
        }
        
        print(f"\nThreshold {threshold:.1f}:")
        print(f"  Risk Level: {risk}")
        print(f"  Alert Count: {alerts.sum():.0f}/{alerts.size}")
        print(f"  Avg Probability: {probs.mean():.4f}")
        print(f"  Max Probability: {probs.max():.4f}")
    
    # Verify probabilities are identical
    print("\n" + "="*70)
    print("VERIFICATION: Probabilities Constant Across Thresholds")
    print("="*70)
    
    prob_03 = results[0.3]['probabilities']
    prob_05 = results[0.5]['probabilities']
    prob_07 = results[0.7]['probabilities']
    
    match_05 = np.allclose(prob_03, prob_05, atol=1e-6)
    match_07 = np.allclose(prob_05, prob_07, atol=1e-6)
    
    print(f"✓ Probabilities(0.3) == Probabilities(0.5): {match_05}")
    print(f"✓ Probabilities(0.5) == Probabilities(0.7): {match_07}")
    
    if match_05 and match_07:
        print("\n🎉 SUCCESS: Model outputs are threshold-independent!")
    else:
        print("\n❌ FAILURE: Model outputs vary with threshold (architectural error!)")
    
    return match_05 and match_07


def test_threshold_effect():
    """
    Test 2: Alerts should respect threshold boundary
    Lower threshold = more alerts
    """
    print("\n\n" + "="*70)
    print("TEST 2: Threshold Effect on Alerts")
    print("="*70)
    
    # Load model with absolute path
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(model_path=str(model_path))
    
    # Create test graph
    x = torch.rand(4, 24)
    edge_index = torch.tensor([[0, 1, 2], [1, 2, 3]], dtype=torch.long)
    edge_weight = torch.tensor([0.9, 0.85, 0.8], dtype=torch.float32)
    
    # Run predictions
    thresholds = [0.3, 0.5, 0.7]
    alert_counts = []
    
    for threshold in thresholds:
        probs, alerts, risk = predictor.predict_with_threshold(
            x.numpy(), edge_index.numpy(), edge_weight.numpy(), threshold=threshold
        )
        alert_count = alerts.sum()
        alert_counts.append(alert_count)
        
        print(f"\nThreshold {threshold:.1f}:")
        print(f"  Total Alerts: {alert_count:.0f}/{alerts.size}")
        print(f"  Alert Rate: {(alert_count/alerts.size)*100:.1f}%")
        
        # Verify alerts match threshold
        correct_alerts = True
        for i in range(len(probs)):
            for j in range(probs.shape[1]):
                if alerts[i, j] == 1:
                    if probs[i, j] < threshold:
                        correct_alerts = False
                        print(f"  ❌ Alert at P={probs[i,j]:.3f} < threshold={threshold}")
                else:
                    if probs[i, j] >= threshold:
                        correct_alerts = False
                        print(f"  ❌ No alert at P={probs[i,j]:.3f} >= threshold={threshold}")
        
        if correct_alerts:
            print(f"  ✓ All alerts correctly placed")
    
    # Verify alert ordering
    print("\n" + "="*70)
    print("VERIFICATION: Alert Counts Decrease with Higher Threshold")
    print("="*70)
    
    print(f"Alert count at 0.3: {alert_counts[0]:.0f}")
    print(f"Alert count at 0.5: {alert_counts[1]:.0f}")
    print(f"Alert count at 0.7: {alert_counts[2]:.0f}")
    
    correct_ordering = (alert_counts[0] >= alert_counts[1] >= alert_counts[2])
    
    if correct_ordering:
        print("\n🎉 SUCCESS: Alert counts decrease monotonically!")
    else:
        print("\n❌ FAILURE: Alert counts not monotonic (threshold not working!)")
    
    return correct_ordering


def test_probability_calibration():
    """
    Test 3: Probabilities should be in valid range [0, 1]
    """
    print("\n\n" + "="*70)
    print("TEST 3: Probability Calibration")
    print("="*70)
    
    # Load model with absolute path
    script_dir = Path(__file__).parent
    model_path = script_dir / "models" / "gnn_production_v1.pt"
    if not model_path.exists():
        model_path = script_dir / "models" / "gnn_model.pt"
    
    predictor = ImpactPredictor(model_path=str(model_path))
    
    # Create test graph
    x = torch.rand(4, 24)
    edge_index = torch.tensor([[0, 1, 2], [1, 2, 3]], dtype=torch.long)
    edge_weight = torch.tensor([0.9, 0.85, 0.8], dtype=torch.float32)
    
    # Run prediction
    probs, alerts, risk = predictor.predict_with_threshold(
        x.numpy(), edge_index.numpy(), edge_weight.numpy(), threshold=0.5
    )
    
    # Check calibration
    min_prob = probs.min()
    max_prob = probs.max()
    mean_prob = probs.mean()
    
    print(f"\nProbability Statistics:")
    print(f"  Min:  {min_prob:.4f}")
    print(f"  Max:  {max_prob:.4f}")
    print(f"  Mean: {mean_prob:.4f}")
    print(f"  Std:  {probs.std():.4f}")
    
    # Verify range
    valid_range = (min_prob >= 0) and (max_prob <= 1)
    
    print("\n" + "="*70)
    print("VERIFICATION: Probabilities in [0, 1]")
    print("="*70)
    
    if valid_range:
        print("🎉 SUCCESS: All probabilities in valid range [0, 1]!")
    else:
        print("❌ FAILURE: Probabilities outside [0, 1] (sigmoid not applied!)")
    
    return valid_range


def main():
    """Run all verification tests"""
    print("\n" + "🔬 THRESHOLD ARCHITECTURE VERIFICATION" + "\n")
    print("Testing inference-time threshold implementation...")
    print("This verifies that thresholds do NOT affect training.\n")
    
    # Run tests
    test1_pass = test_threshold_independence()
    test2_pass = test_threshold_effect()
    test3_pass = test_probability_calibration()
    
    # Summary
    print("\n\n" + "="*70)
    print("VERIFICATION SUMMARY")
    print("="*70)
    
    tests = [
        ("Threshold Independence", test1_pass),
        ("Threshold Effect on Alerts", test2_pass),
        ("Probability Calibration", test3_pass)
    ]
    
    for test_name, passed in tests:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status:12s} {test_name}")
    
    all_pass = all(p for _, p in tests)
    
    print("\n" + "="*70)
    if all_pass:
        print("🎉 ALL TESTS PASSED!")
        print("Threshold architecture is correctly implemented.")
        print("Thresholds are inference-time only (not training-time).")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Review threshold implementation in model.py")
    print("="*70)


if __name__ == "__main__":
    main()
