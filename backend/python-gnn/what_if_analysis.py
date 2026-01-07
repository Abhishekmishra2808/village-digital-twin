"""
Sensitivity Analysis & What-If Scenario Testing
Demonstrates how the GNN responds to individual node failures
"""

import numpy as np
from model import ImpactPredictor

# Optional visualization imports
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    HAS_VISUALIZATION = True
except ImportError:
    HAS_VISUALIZATION = False

def run_what_if_analysis():
    """
    Test: What happens if we manually fail each node one at a time?
    Shows which nodes cause the most widespread impact.
    """
    print("="*60)
    print("🚦 SENSITIVITY ANALYSIS - What-If Scenarios")
    print("="*60 + "\n")
    
    # Load trained model
    print("Loading trained model...")
    predictor = ImpactPredictor(model_path="models/gnn_model.pt")
    print(f"✓ Model loaded on {predictor.device}\n")
    
    # Create a healthy infrastructure graph
    print("Creating baseline healthy infrastructure...")
    node_names = ["Tank-1", "Pump-1", "Pipe-1", "Hospital-1", "Cluster-1"]
    num_nodes = len(node_names)
    
    # Baseline: All nodes healthy (high status = 0.9)
    baseline_features = np.array([
        # Tank (type=3): Healthy
        [0,0,0,1,0,0,0,0,0,0,0,0, 0.8, 0.9, 0.6, 0.9, 0.85, 0.5, 0.3, 0.6, 0.8, 0.2, 0.1, 0.05],
        # Pump (type=4): Healthy
        [0,0,0,0,1,0,0,0,0,0,0,0, 0.7, 0.9, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7, 0.3, 0.15, 0.1],
        # Pipe (type=5): Healthy
        [0,0,0,0,0,1,0,0,0,0,0,0, 0.5, 0.9, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5, 0.4, 0.2, 0.15],
        # Hospital (type=10): Healthy
        [0,0,0,0,0,0,0,0,0,0,1,0, 0.9, 0.9, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9, 0.1, 0.05, 0.02],
        # Cluster (type=7): Healthy
        [0,0,0,0,0,0,0,1,0,0,0,0, 0.6, 0.9, 0.4, 0.9, 0.7, 0.6, 0.4, 0.5, 0.6, 0.3, 0.25, 0.1],
    ], dtype=np.float32)
    
    # Graph structure
    edge_index = np.array([
        [0, 1], [1, 0],
        [1, 2], [2, 1],
        [2, 3], [3, 2],
        [2, 4], [4, 2],
    ], dtype=np.int64).T
    edge_weights = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.75, 0.75], dtype=np.float32)
    
    print(f"  Nodes: {num_nodes}")
    print(f"  All nodes healthy (status = 0.9)")
    print(f"  Network: Tank → Pump → Pipe → [Hospital, Cluster]\n")
    
    # Baseline prediction (all healthy)
    print("📊 BASELINE: All nodes healthy")
    baseline_pred = predictor.predict(baseline_features, edge_index, edge_weights)
    baseline_avg = baseline_pred.mean(axis=1)
    
    for i, name in enumerate(node_names):
        print(f"  {name}: Avg Impact = {baseline_avg[i]*100:.1f}%")
    print()
    
    # What-If: Fail each node one at a time
    print("🔥 WHAT-IF SCENARIOS: Failing each node individually\n")
    
    failure_scenarios = []
    
    for fail_idx in range(num_nodes):
        print(f"Scenario {fail_idx+1}: {node_names[fail_idx]} FAILS")
        print("-" * 50)
        
        # Copy baseline and fail one node
        scenario_features = baseline_features.copy()
        
        # Set failed node status to 0 (indices 12-15 are capacity/level/flow/status)
        scenario_features[fail_idx, 15] = 0.0  # Status = FAILED
        scenario_features[fail_idx, 13] = 0.1  # Level drops to 10%
        scenario_features[fail_idx, 14] = 0.0  # Flow stops
        
        # Predict impact
        scenario_pred = predictor.predict(scenario_features, edge_index, edge_weights)
        scenario_avg = scenario_pred.mean(axis=1)
        
        # Calculate delta from baseline
        impact_delta = scenario_avg - baseline_avg
        
        # Store results
        failure_scenarios.append({
            'failed_node': node_names[fail_idx],
            'predictions': scenario_avg,
            'deltas': impact_delta
        })
        
        # Display results
        print(f"  Failed: {node_names[fail_idx]}")
        print(f"  Impact on other nodes:")
        for i, name in enumerate(node_names):
            if i == fail_idx:
                print(f"    ❌ {name}: {scenario_avg[i]*100:.1f}% (FAILED NODE)")
            else:
                delta = impact_delta[i]
                arrow = "⬆️" if delta > 0.05 else "→" if delta > -0.05 else "⬇️"
                print(f"    {arrow} {name}: {scenario_avg[i]*100:.1f}% (Δ{delta*100:+.1f}%)")
        
        print(f"  Total cascade impact: {impact_delta.sum()*100:.1f}%")
        print()
    
    # Summary: Which node failure causes most damage?
    print("="*60)
    print("🎯 IMPACT RANKING: Which failure is most dangerous?")
    print("="*60 + "\n")
    
    total_impacts = [(s['failed_node'], s['deltas'].sum()) for s in failure_scenarios]
    total_impacts.sort(key=lambda x: x[1], reverse=True)
    
    for rank, (node, impact) in enumerate(total_impacts, 1):
        severity = "🔴 CRITICAL" if impact > 0.5 else "🟡 HIGH" if impact > 0.3 else "🟢 MODERATE"
        print(f"  {rank}. {node:15s} → Total Impact: {impact*100:5.1f}%  {severity}")
    
    print("\n" + "="*60)
    print("💡 INSIGHTS")
    print("="*60)
    most_critical = total_impacts[0][0]
    least_critical = total_impacts[-1][0]
    print(f"  • Most critical node: {most_critical}")
    print(f"  • Least critical node: {least_critical}")
    print(f"  • Impact ratio: {total_impacts[0][1]/total_impacts[-1][1]:.1f}x difference")
    print("\n✅ Sensitivity Analysis Complete!")
    
    return failure_scenarios


if __name__ == "__main__":
    scenarios = run_what_if_analysis()
