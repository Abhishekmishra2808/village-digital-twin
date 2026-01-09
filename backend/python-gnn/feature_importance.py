"""
Feature Importance Analysis using Integrated Gradients
Identifies which of the 24 input features drive the predictions
"""

import torch
import numpy as np
from model import ImpactPredictor

try:
    from captum.attr import IntegratedGradients
    HAS_CAPTUM = True
except (ImportError, Exception) as e:
    print(f"Captum import failed: {e}")
    HAS_CAPTUM = False

# Feature names for the 24-dimensional input
FEATURE_NAMES = [
    # Type encoding (0-11)
    "Type:Road", "Type:Building", "Type:Power", "Type:Tank", "Type:Pump", "Type:Pipe",
    "Type:Sensor", "Type:Cluster", "Type:Bridge", "Type:School", "Type:Hospital", "Type:Market",
    # Infrastructure features (12-23)
    "Capacity", "Current_Level", "Flow_Rate", "Status", "Criticality", 
    "Population_Served", "Economic_Value", "Connectivity", 
    "Maintenance_Score", "Weather_Risk", "Failure_History", "Reserved"
]


def analyze_feature_importance():
    """
    Use Integrated Gradients to find which features matter most
    """
    print("="*60)
    print("🧩 FEATURE IMPORTANCE ANALYSIS")
    print("="*60 + "\n")
    
    # Load trained model
    print("Loading trained model...")
    predictor = ImpactPredictor(model_path="models/gnn_model.pt")
    predictor.model.eval()
    print(f"✓ Model loaded on {predictor.device}\n")
    
    # Create test infrastructure
    print("Creating test scenario: Hospital water supply failure...")
    
    node_features = np.array([
        # Tank - FAILED
        [0,0,0,1,0,0,0,0,0,0,0,0, 0.8, 0.1, 0.0, 0.0, 0.85, 0.5, 0.3, 0.6, 0.8, 0.2, 0.1, 0.05],
        # Pump
        [0,0,0,0,1,0,0,0,0,0,0,0, 0.7, 0.8, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7, 0.3, 0.15, 0.1],
        # Pipe
        [0,0,0,0,0,1,0,0,0,0,0,0, 0.5, 0.6, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5, 0.4, 0.2, 0.15],
        # Hospital - TARGET
        [0,0,0,0,0,0,0,0,0,0,1,0, 0.9, 0.95, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9, 0.1, 0.05, 0.02],
    ], dtype=np.float32)
    
    edge_index = np.array([[0,1], [1,0], [1,2], [2,1], [2,3], [3,2]], dtype=np.int64).T
    edge_weights = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8], dtype=np.float32)
    
    # Convert to tensors
    x = torch.tensor(node_features, dtype=torch.float32, requires_grad=True).to(predictor.device)
    edge_idx = torch.tensor(edge_index, dtype=torch.long).to(predictor.device)
    edge_w = torch.tensor(edge_weights, dtype=torch.float32).to(predictor.device)
    
    print(f"  Nodes: 4 (Tank [FAILED], Pump, Pipe, Hospital)")
    print(f"  Target: Hospital (node 3)")
    print(f"  Question: Which features drive Hospital impact prediction?\n")
    
    # Define scalar targets
    TARGET_NODE_IDX = 3  # Hospital
    TARGET_OUTPUT_DIM = 0  # Impact Probability (first output dimension)
    STATUS_FEATURE_IDX = 15  # Status feature position
    
    # Define forward function for Integrated Gradients - MUST RETURN SCALAR
    # Note: Captum expects shape (1,) not shape () for scalars
    def forward_func(node_features_batch):
        """
        Wrapper for model forward pass - returns SINGLE SCALAR per batch item
        Answers: "What is the impact probability for Hospital?"
        """
        # Handle both single and batched inputs
        if node_features_batch.dim() == 2:
            # Single graph: (num_nodes, num_features)
            logits = predictor.model(node_features_batch, edge_idx, edge_w)
            probs = torch.sigmoid(logits)
            # Return as (1,) tensor not () scalar for Captum compatibility
            return probs[TARGET_NODE_IDX:TARGET_NODE_IDX+1, TARGET_OUTPUT_DIM]
        else:
            # Batched graphs: (batch_size, num_nodes, num_features)
            # IG passes interpolated inputs this way
            batch_size = node_features_batch.shape[0]
            outputs = []
            for i in range(batch_size):
                logits = predictor.model(node_features_batch[i], edge_idx, edge_w)
                probs = torch.sigmoid(logits)
                outputs.append(probs[TARGET_NODE_IDX, TARGET_OUTPUT_DIM])
            return torch.stack(outputs)
    
    # Sanity check: Verify forward function returns scalar
    test_out = forward_func(x)
    is_scalar = (test_out.dim() == 0 or (test_out.dim() == 1 and test_out.shape[0] == 1))
    out_val = test_out.item() if test_out.dim() == 0 else test_out[0].item()
    print(f"Sanity check - forward function output: {out_val:.4f} (scalar: {is_scalar})")
    
    if not is_scalar:
        print("❌ ERROR: Forward function must return a scalar!")
        return None, None
    
    # Baseline: Zero baseline (no information state)
    # This answers: "What features contribute to the prediction?"
    baseline = torch.zeros_like(x)
    
    print(f"Baseline: Zero features (no information state)")
    baseline_out = forward_func(baseline)
    baseline_val = baseline_out.item() if baseline_out.dim() == 0 else baseline_out[0].item()
    print(f"  Baseline prediction: {baseline_val:.4f}")
    print(f"  Current prediction: {out_val:.4f}")
    print(f"  Delta: {out_val - baseline_val:.4f}\n")
    
    # Initialize Integrated Gradients
    print("Running Integrated Gradients attribution...")
    ig = IntegratedGradients(forward_func)
    
    # Run integrated gradients
    attributions = ig.attribute(
        inputs=x,
        baselines=baseline,
        n_steps=50
    )
    
    # Extract attributions for all nodes (shape: num_nodes × num_features)
    attributions_np = attributions.cpu().detach().numpy()
    
    # Focus on hospital node
    hospital_attrs = attributions_np[TARGET_NODE_IDX]
    
    print("✓ Attribution complete")
    print(f"  Attribution shape: {attributions_np.shape} (nodes × features)")
    print(f"  Target output value: {out_val:.4f}")
    print(f"  Attribution sum: {hospital_attrs.sum():.6f}")
    print(f"  Attribution abs sum: {np.abs(hospital_attrs).sum():.6f}")
    print()
    
    # Rank features by importance
    print("="*60)
    print(f"🎯 TOP FEATURES DRIVING HOSPITAL IMPACT PROBABILITY")
    print("="*60 + "\n")
    
    # Calculate absolute importance
    feature_importance = np.abs(hospital_attrs)
    raw_importance = hospital_attrs  # Keep sign for positive/negative contributions
    
    # Sort by importance
    sorted_indices = np.argsort(feature_importance)[::-1]
    
    # Display top 10
    print("Rank | Feature Name              | Attribution | Effect      | Current Value")
    print("-" * 80)
    
    max_importance = feature_importance.max()
    if max_importance < 1e-4:
        print("\n⚠️  WARNING: All attributions are extremely small!")
        print(f"  Max attribution: {max_importance:.6f}")
        print(f"  Sum of attributions: {raw_importance.sum():.6f}")
        print("\nPossible causes:")
        print("  1. Model relies heavily on graph structure (edges), not node features")
        print("  2. Features are normalized/standardized during training")
        print("  3. Baseline is inappropriate for this model")
        print("\n  💡 This suggests the GNN learns from CONNECTIVITY patterns")
        print("     more than individual node attributes.")
        print("\n")
    
    for rank, idx in enumerate(sorted_indices[:10], 1):
        feat_name = FEATURE_NAMES[idx]
        raw_attr = raw_importance[idx]
        abs_attr = feature_importance[idx]
        current_val = node_features[TARGET_NODE_IDX, idx]
        
        # Determine effect
        if raw_attr > 0.0001:
            effect = "⬆️ INCREASES RISK"
        elif raw_attr < -0.0001:
            effect = "⬇️ REDUCES RISK"
        else:
            effect = "→ NEUTRAL"
        
        # Importance bar (only for display)
        if max_importance > 1e-6:
            bar_len = int(abs_attr * 30 / max(max_importance, 1e-6))
            bar = "█" * min(bar_len, 30)
        else:
            bar = ""
        
        print(f"{rank:2d}   | {feat_name:25s} | {raw_attr:+.6f} {bar:15s} | {effect:15s} | {current_val:.2f}")
    
    print()
    
    # Insights
    print("="*60)
    print("💡 INSIGHTS")
    print("="*60)
    
    top_feature = FEATURE_NAMES[sorted_indices[0]]
    top_attr = raw_importance[sorted_indices[0]]
    print(f"  • Most important feature: {top_feature}")
    print(f"  • Attribution: {top_attr:+.4f}")
    
    # Check if type encoding matters
    type_importance = feature_importance[:12].sum()
    operational_importance = feature_importance[12:].sum()
    
    print(f"\n  • Node Type encoding impact: {type_importance:.4f}")
    print(f"  • Operational features impact: {operational_importance:.4f}")
    
    if type_importance > operational_importance * 0.1:
        print(f"  → Model considers node type important (Type = {type_importance/operational_importance:.1%} of operational)")
    else:
        print(f"  → Model relies primarily on operational features")
    
    # Check critical operational features
    critical_features = ["Status", "Current_Level", "Criticality", "Population_Served"]
    print(f"\n  🔑 Critical Operational Features:")
    for feat in critical_features:
        idx = FEATURE_NAMES.index(feat)
        attr = raw_importance[idx]
        abs_attr = feature_importance[idx]
        rank = list(sorted_indices).index(idx) + 1
        effect = "⬆️" if attr > 0.01 else "⬇️" if attr < -0.01 else "→"
        print(f"     {effect} {feat:20s}: Rank #{rank:2d}, Attribution: {attr:+.4f}")
    
    print("\n✅ Feature Importance Analysis Complete!")
    
    return feature_importance, FEATURE_NAMES


if __name__ == "__main__":
    if not HAS_CAPTUM:
        print("\n⚠️  Error: 'captum' library not installed")
        print("Install with: pip install captum")
        print("Then re-run this script.")
    else:
        try:
            importance, names = analyze_feature_importance()
        except Exception as e:
            print(f"\n⚠️  Error during analysis: {e}")
            import traceback
            print("\nFull traceback:")
            traceback.print_exc()
