"""
Causal Attribution for Topology-Driven GNNs
Answers: "Which upstream node/edge is CAUSING the Hospital's risk?"

Methods:
1. Node Perturbation: Remove/degrade each neighbor node
2. Edge Occlusion: Cut each connection to measure cascade breaking
3. Counterfactual: "What if we repair this node?"
"""

import torch
import numpy as np
from model import ImpactPredictor


def node_perturbation_analysis(predictor, x, edge_index, edge_attr, target_node_idx, target_node_name="Hospital"):
    """
    Node Perturbation: Remove each neighbor and measure impact change
    
    Answers: "Which upstream node is causing the target's risk?"
    """
    print("="*70)
    print(f"🔍 NODE PERTURBATION ANALYSIS")
    print(f"   Target: {target_node_name} (node {target_node_idx})")
    print("="*70 + "\n")
    
    # Baseline prediction
    baseline_pred = predictor.predict(x, edge_index, edge_attr)
    baseline_impact = baseline_pred[target_node_idx].mean()
    
    print(f"📊 BASELINE")
    print(f"   {target_node_name} Impact: {baseline_impact*100:.2f}%\n")
    
    # Find all neighbors of target node
    neighbors = []
    for i in range(edge_index.shape[1]):
        if edge_index[1, i] == target_node_idx:  # Incoming edge to target
            neighbor_idx = edge_index[0, i].item()
            neighbors.append(neighbor_idx)
    
    neighbors = list(set(neighbors))  # Remove duplicates
    
    if len(neighbors) == 0:
        print("⚠️  Target node has no incoming connections!")
        return []
    
    print(f"🔗 Found {len(neighbors)} upstream neighbors\n")
    print("="*70)
    print("PERTURBATION RESULTS: Removing each upstream node")
    print("="*70 + "\n")
    
    results = []
    
    for neighbor_idx in neighbors:
        # Perturb: Set neighbor to "failed" state
        x_perturbed = x.copy()
        x_perturbed[neighbor_idx, 15] = 0.0  # Status = failed
        x_perturbed[neighbor_idx, 13] = 0.0  # Level = empty
        x_perturbed[neighbor_idx, 14] = 0.0  # Flow = stopped
        
        # Predict with perturbation
        perturbed_pred = predictor.predict(x_perturbed, edge_index, edge_attr)
        perturbed_impact = perturbed_pred[target_node_idx].mean()
        
        # Calculate causal effect
        causal_effect = perturbed_impact - baseline_impact
        
        # Determine node type
        node_type_idx = np.argmax(x[neighbor_idx, :12])
        type_names = ["Road", "Building", "Power", "Tank", "Pump", "Pipe", 
                     "Sensor", "Cluster", "Bridge", "School", "Hospital", "Market"]
        node_type = type_names[node_type_idx]
        
        results.append({
            'neighbor_idx': neighbor_idx,
            'node_type': node_type,
            'baseline_impact': baseline_impact,
            'perturbed_impact': perturbed_impact,
            'causal_effect': causal_effect
        })
        
        # Display
        effect_symbol = "🔴" if causal_effect > 0.05 else "🟡" if causal_effect > 0.01 else "🟢"
        effect_direction = "⬆️ INCREASES" if causal_effect > 0.01 else "⬇️ DECREASES" if causal_effect < -0.01 else "→ NO CHANGE"
        
        print(f"{effect_symbol} Node {neighbor_idx} ({node_type})")
        print(f"   Baseline Impact: {baseline_impact*100:.2f}%")
        print(f"   After Failure:   {perturbed_impact*100:.2f}%")
        print(f"   Causal Effect:   {causal_effect*100:+.2f}%  {effect_direction}")
        print()
    
    # Sort by causal effect magnitude
    results.sort(key=lambda x: abs(x['causal_effect']), reverse=True)
    
    print("="*70)
    print("🎯 CAUSAL RANKING: Which node failures cause most risk?")
    print("="*70 + "\n")
    
    for rank, result in enumerate(results, 1):
        effect = result['causal_effect']
        severity = "🔴 CRITICAL" if abs(effect) > 0.1 else "🟡 MODERATE" if abs(effect) > 0.05 else "🟢 LOW"
        print(f"  {rank}. Node {result['neighbor_idx']} ({result['node_type']:10s}) → {effect*100:+6.2f}%  {severity}")
    
    print("\n" + "="*70)
    print("💡 INTERPRETATION")
    print("="*70)
    most_causal = results[0]
    print(f"  • Most causal node: Node {most_causal['neighbor_idx']} ({most_causal['node_type']})")
    print(f"  • Effect magnitude: {most_causal['causal_effect']*100:+.2f}%")
    
    if most_causal['causal_effect'] > 0.05:
        print(f"  → CONCLUSION: Node {most_causal['neighbor_idx']} CAUSES {target_node_name}'s risk")
        print(f"    Protecting/repairing this node would reduce {target_node_name} impact")
    else:
        print(f"  → CONCLUSION: No single upstream node dominates {target_node_name}'s risk")
        print(f"    Risk is distributed across the network")
    
    print()
    return results


def edge_occlusion_analysis(predictor, x, edge_index, edge_attr, target_node_idx, target_node_name="Hospital"):
    """
    Edge Occlusion: Remove each incoming edge to measure cascade breaking
    
    Answers: "Which connection is transmitting the risk?"
    """
    print("="*70)
    print(f"✂️  EDGE OCCLUSION ANALYSIS")
    print(f"   Target: {target_node_name} (node {target_node_idx})")
    print("="*70 + "\n")
    
    # Baseline prediction
    baseline_pred = predictor.predict(x, edge_index, edge_attr)
    baseline_impact = baseline_pred[target_node_idx].mean()
    
    print(f"📊 BASELINE")
    print(f"   {target_node_name} Impact: {baseline_impact*100:.2f}%")
    print(f"   Total edges: {edge_index.shape[1]}\n")
    
    # Find all incoming edges to target
    incoming_edges = []
    for i in range(edge_index.shape[1]):
        if edge_index[1, i] == target_node_idx:
            incoming_edges.append(i)
    
    if len(incoming_edges) == 0:
        print("⚠️  Target node has no incoming edges!")
        return []
    
    print(f"🔗 Found {len(incoming_edges)} incoming edges\n")
    print("="*70)
    print("OCCLUSION RESULTS: Cutting each incoming edge")
    print("="*70 + "\n")
    
    results = []
    
    for edge_idx in incoming_edges:
        source_idx = edge_index[0, edge_idx].item()
        target_idx = edge_index[1, edge_idx].item()
        
        # Occlude: Remove this edge
        edge_mask = np.ones(edge_index.shape[1], dtype=bool)
        edge_mask[edge_idx] = False
        
        edge_index_occluded = edge_index[:, edge_mask]
        edge_attr_occluded = edge_attr[edge_mask]
        
        # Predict without this edge
        occluded_pred = predictor.predict(x, edge_index_occluded, edge_attr_occluded)
        occluded_impact = occluded_pred[target_node_idx].mean()
        
        # Calculate causal effect (negative = edge was transmitting risk)
        causal_effect = occluded_impact - baseline_impact
        
        # Get source node type
        node_type_idx = np.argmax(x[source_idx, :12])
        type_names = ["Road", "Building", "Power", "Tank", "Pump", "Pipe", 
                     "Sensor", "Cluster", "Bridge", "School", "Hospital", "Market"]
        source_type = type_names[node_type_idx]
        
        edge_weight = edge_attr[edge_idx]
        
        results.append({
            'edge_idx': edge_idx,
            'source_idx': source_idx,
            'source_type': source_type,
            'edge_weight': edge_weight,
            'baseline_impact': baseline_impact,
            'occluded_impact': occluded_impact,
            'causal_effect': causal_effect
        })
        
        # Display
        if causal_effect < -0.05:
            effect_symbol = "🔴"
            interpretation = "CRITICAL CASCADE PATH"
        elif causal_effect < -0.01:
            effect_symbol = "🟡"
            interpretation = "Moderate cascade path"
        else:
            effect_symbol = "🟢"
            interpretation = "Low impact connection"
        
        print(f"{effect_symbol} Edge {edge_idx}: Node {source_idx} ({source_type}) → {target_node_name}")
        print(f"   Edge Weight: {edge_weight:.3f}")
        print(f"   Impact after cutting edge: {occluded_impact*100:.2f}%")
        print(f"   Causal Effect: {causal_effect*100:+.2f}%  ({interpretation})")
        print()
    
    # Sort by causal effect (most negative = most critical)
    results.sort(key=lambda x: x['causal_effect'])
    
    print("="*70)
    print("🎯 EDGE RANKING: Which connections transmit most risk?")
    print("="*70 + "\n")
    
    for rank, result in enumerate(results, 1):
        effect = result['causal_effect']
        severity = "🔴 CASCADE PATH" if effect < -0.05 else "🟡 MODERATE" if effect < -0.01 else "🟢 LOW"
        print(f"  {rank}. Edge {result['edge_idx']} (from {result['source_type']:10s}) → {effect*100:+6.2f}%  {severity}")
    
    print("\n" + "="*70)
    print("💡 INTERPRETATION")
    print("="*70)
    
    most_critical = results[0]
    if most_critical['causal_effect'] < -0.05:
        print(f"  • Critical cascade path: Edge {most_critical['edge_idx']} from Node {most_critical['source_idx']}")
        print(f"  • Effect: Cutting this edge reduces {target_node_name} risk by {-most_critical['causal_effect']*100:.2f}%")
        print(f"  → CONCLUSION: This connection is TRANSMITTING the cascade")
        print(f"    Installing isolation valves here would protect {target_node_name}")
    else:
        print(f"  • No single edge dominates cascade transmission")
        print(f"  → CONCLUSION: Risk propagates through multiple paths")
        print(f"    Network-wide interventions needed")
    
    print()
    return results


def counterfactual_analysis(predictor, x, edge_index, edge_attr, target_node_idx, failed_node_idx, 
                            target_node_name="Hospital", failed_node_name="Tank"):
    """
    Counterfactual: "What if we repair the failed node?"
    
    Answers: "How much would fixing X reduce the target's risk?"
    """
    print("="*70)
    print(f"🔄 COUNTERFACTUAL ANALYSIS")
    print(f"   Target: {target_node_name} (node {target_node_idx})")
    print(f"   Failed: {failed_node_name} (node {failed_node_idx})")
    print("="*70 + "\n")
    
    # Current state (with failure)
    current_pred = predictor.predict(x, edge_index, edge_attr)
    current_impact = current_pred[target_node_idx].mean()
    
    print(f"📊 CURRENT STATE (with {failed_node_name} failure)")
    print(f"   {target_node_name} Impact: {current_impact*100:.2f}%\n")
    
    # Counterfactual: Repair the failed node
    x_repaired = x.copy()
    x_repaired[failed_node_idx, 15] = 0.9  # Status = healthy
    x_repaired[failed_node_idx, 13] = 0.8  # Level = good
    x_repaired[failed_node_idx, 14] = 0.7  # Flow = normal
    
    repaired_pred = predictor.predict(x_repaired, edge_index, edge_attr)
    repaired_impact = repaired_pred[target_node_idx].mean()
    
    benefit = current_impact - repaired_impact
    
    print(f"🔄 COUNTERFACTUAL (if we repair {failed_node_name})")
    print(f"   {target_node_name} Impact: {repaired_impact*100:.2f}%")
    print(f"   Risk Reduction: {benefit*100:.2f}%\n")
    
    print("="*70)
    print("💡 INTERPRETATION")
    print("="*70)
    
    if benefit > 0.1:
        print(f"  🔴 CRITICAL: Repairing {failed_node_name} reduces {target_node_name} risk by {benefit*100:.2f}%")
        print(f"     → HIGH PRIORITY repair target")
    elif benefit > 0.05:
        print(f"  🟡 MODERATE: Repairing {failed_node_name} reduces {target_node_name} risk by {benefit*100:.2f}%")
        print(f"     → Consider repair if resources available")
    else:
        print(f"  🟢 LOW: Repairing {failed_node_name} reduces {target_node_name} risk by only {benefit*100:.2f}%")
        print(f"     → Not the root cause, look elsewhere")
    
    print()
    return {
        'current_impact': current_impact,
        'repaired_impact': repaired_impact,
        'benefit': benefit
    }


def run_full_causal_analysis():
    """
    Complete causal attribution suite
    """
    print("\n" + "="*70)
    print("🧪 COMPLETE CAUSAL ATTRIBUTION ANALYSIS")
    print("   For Topology-Driven GNNs")
    print("="*70 + "\n")
    
    # Load model
    print("Loading trained model...")
    predictor = ImpactPredictor(model_path="models/gnn_model.pt")
    print(f"✓ Model loaded on {predictor.device}\n")
    
    # Create test infrastructure: Tank FAILED → Pump → Pipe → Hospital
    node_features = np.array([
        # Tank - FAILED
        [0,0,0,1,0,0,0,0,0,0,0,0, 0.8, 0.1, 0.0, 0.0, 0.85, 0.5, 0.3, 0.6, 0.8, 0.2, 0.1, 0.05],
        # Pump - Healthy
        [0,0,0,0,1,0,0,0,0,0,0,0, 0.7, 0.8, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7, 0.3, 0.15, 0.1],
        # Pipe - Healthy
        [0,0,0,0,0,1,0,0,0,0,0,0, 0.5, 0.6, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5, 0.4, 0.2, 0.15],
        # Hospital - TARGET
        [0,0,0,0,0,0,0,0,0,0,1,0, 0.9, 0.95, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9, 0.1, 0.05, 0.02],
    ], dtype=np.float32)
    
    edge_index = np.array([
        [0, 1],  # Tank → Pump
        [1, 0],  # Pump → Tank (bidirectional)
        [1, 2],  # Pump → Pipe
        [2, 1],  # Pipe → Pump
        [2, 3],  # Pipe → Hospital
        [3, 2],  # Hospital → Pipe
    ], dtype=np.int64).T
    
    edge_weights = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8], dtype=np.float32)
    
    print("Test Scenario:")
    print("  Nodes: Tank (FAILED), Pump, Pipe, Hospital")
    print("  Network: Tank → Pump → Pipe → Hospital")
    print("  Question: Why is Hospital at risk?\n")
    
    # 1. Node Perturbation
    node_results = node_perturbation_analysis(
        predictor, node_features, edge_index, edge_weights, 
        target_node_idx=3, target_node_name="Hospital"
    )
    
    # 2. Edge Occlusion
    edge_results = edge_occlusion_analysis(
        predictor, node_features, edge_index, edge_weights,
        target_node_idx=3, target_node_name="Hospital"
    )
    
    # 3. Counterfactual
    counterfactual_results = counterfactual_analysis(
        predictor, node_features, edge_index, edge_weights,
        target_node_idx=3, failed_node_idx=0,
        target_node_name="Hospital", failed_node_name="Tank"
    )
    
    print("="*70)
    print("✅ CAUSAL ATTRIBUTION COMPLETE")
    print("="*70)
    print("\nThis analysis reveals:")
    print("  1. Which upstream nodes CAUSE the target's risk")
    print("  2. Which edges TRANSMIT the cascade")
    print("  3. What interventions would REDUCE the risk")
    print("\n→ Use these insights for Digital Twin decision-making!")
    
    return node_results, edge_results, counterfactual_results


if __name__ == "__main__":
    run_full_causal_analysis()
