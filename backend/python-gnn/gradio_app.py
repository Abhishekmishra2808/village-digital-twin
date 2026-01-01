"""
Gradio Interactive Interface for GNN Infrastructure Impact Prediction
Allows testing the model with custom infrastructure scenarios
Includes Delta-Inference Simulation with Pessimistic Mode
"""

import gradio as gr
import numpy as np
import torch
from model import ImpactPredictor
from simulation_engine import SimulationEngine, FailureMode
import json
import os
from pathlib import Path

# Get script directory for reliable paths
SCRIPT_DIR = Path(__file__).parent
MODEL_DIR = SCRIPT_DIR / "models"

# Load model (use production fine-tuned model if available)
print("Loading GNN model...")
production_model = MODEL_DIR / "gnn_production_v1.pt"
base_model = MODEL_DIR / "gnn_model.pt"

if production_model.exists():
    model_path = str(production_model)
elif base_model.exists():
    model_path = str(base_model)
else:
    raise FileNotFoundError(f"No model found in {MODEL_DIR}")

print(f"Using model: {model_path}")
# Initialize with temperature=0.5 (crisis mode) and status_veto_weight=1.5
predictor = ImpactPredictor(
    model_path=model_path, 
    temperature=0.5,  # Sharper predictions
    status_veto_weight=1.5  # Status veto enabled
)
print("✓ Model loaded successfully")
print("  🌡️ Temperature: 0.5 (crisis mode)")
print("  ⚙️ Status veto: 1.5 (architecture enhanced)\n")

# Initialize simulation engine
simulation_engine = SimulationEngine(predictor)
print("✓ Simulation Engine initialized")
print("  🔬 Delta-inference enabled")
print("  🔴 Pessimistic mode available\n")

# Node type mapping
NODE_TYPES = {
    "Road": 0, "Building": 1, "Power": 2, "Tank": 3, "Pump": 4, "Pipe": 5,
    "Sensor": 6, "Cluster": 7, "Bridge": 8, "School": 9, "Hospital": 10, "Market": 11
}

OUTPUT_LABELS = [
    "Impact Probability", "Severity", "Time to Impact", "Water Impact",
    "Power Impact", "Road Impact", "Building Impact", "Population Affected",
    "Economic Loss", "Recovery Time", "Priority", "Confidence"
]


def create_node_features(node_type, capacity, level, flow, status, criticality, 
                        population, economic_value, connectivity, maintenance):
    """Convert UI inputs to 24-dimensional node feature vector"""
    # One-hot encode type (12 dimensions)
    type_encoding = [0] * 12
    type_idx = NODE_TYPES[node_type]
    type_encoding[type_idx] = 1
    
    # Operational features (12 dimensions)
    features = type_encoding + [
        capacity, level, flow, status, criticality,
        population, economic_value, connectivity,
        maintenance, 0.1, 0.1, 0.0  # weather_risk, failure_history, reserved
    ]
    
    return features


def predict_impact(
    # Node 1
    node1_type, node1_capacity, node1_level, node1_flow, node1_status,
    node1_criticality, node1_population, node1_economic, node1_connectivity, node1_maintenance,
    # Node 2
    node2_type, node2_capacity, node2_level, node2_flow, node2_status,
    node2_criticality, node2_population, node2_economic, node2_connectivity, node2_maintenance,
    # Node 3
    node3_type, node3_capacity, node3_level, node3_flow, node3_status,
    node3_criticality, node3_population, node3_economic, node3_connectivity, node3_maintenance,
    # Node 4
    node4_type, node4_capacity, node4_level, node4_flow, node4_status,
    node4_criticality, node4_population, node4_economic, node4_connectivity, node4_maintenance,
    # Edges and Threshold
    edge_connections, edge_weights_str, alert_threshold
):
    """Run GNN prediction on custom infrastructure"""
    
    try:
        # Build node features
        node_features = []
        
        # Node 1
        node_features.append(create_node_features(
            node1_type, node1_capacity, node1_level, node1_flow, node1_status,
            node1_criticality, node1_population, node1_economic, node1_connectivity, node1_maintenance
        ))
        
        # Node 2
        node_features.append(create_node_features(
            node2_type, node2_capacity, node2_level, node2_flow, node2_status,
            node2_criticality, node2_population, node2_economic, node2_connectivity, node2_maintenance
        ))
        
        # Node 3
        node_features.append(create_node_features(
            node3_type, node3_capacity, node3_level, node3_flow, node3_status,
            node3_criticality, node3_population, node3_economic, node3_connectivity, node3_maintenance
        ))
        
        # Node 4
        node_features.append(create_node_features(
            node4_type, node4_capacity, node4_level, node4_flow, node4_status,
            node4_criticality, node4_population, node4_economic, node4_connectivity, node4_maintenance
        ))
        
        node_features = np.array(node_features, dtype=np.float32)
        
        # Parse edge connections (format: "0,1;1,2;2,3")
        edge_list = []
        for edge_str in edge_connections.split(';'):
            edge_str = edge_str.strip()
            if edge_str:
                parts = edge_str.split(',')
                if len(parts) == 2:
                    edge_list.append([int(parts[0]), int(parts[1])])
        
        if len(edge_list) == 0:
            return "❌ Error: No valid edges defined. Use format: 0,1;1,2;2,3", "", ""
        
        edge_index = np.array(edge_list, dtype=np.int64).T
        
        # Parse edge weights
        edge_weights = []
        for w in edge_weights_str.split(','):
            w = w.strip()
            if w:
                edge_weights.append(float(w))
        
        if len(edge_weights) != len(edge_list):
            edge_weights = [0.8] * len(edge_list)  # Default weights
        
        edge_weights = np.array(edge_weights, dtype=np.float32)
        
        # Run prediction with inference-time threshold
        probabilities, alerts, risk_level = predictor.predict_with_threshold(
            node_features, edge_index, edge_weights, threshold=alert_threshold
        )
        
        # Format results
        result_text = "🔮 GNN PREDICTIONS\n" + "="*60 + "\n\n"
        result_text += f"⚙️ Alert Threshold: {alert_threshold:.2f} | {risk_level}\n\n"
        
        node_names = [
            f"{node1_type}-1", f"{node2_type}-2", 
            f"{node3_type}-3", f"{node4_type}-4"
        ]
        
        # Summary table
        result_text += "IMPACT SUMMARY\n" + "-"*60 + "\n"
        result_text += f"{'Node':<15} {'Probability':<15} {'Alert':<10} {'Priority':<12}\n"
        result_text += "-"*60 + "\n"
        
        for i, name in enumerate(node_names):
            prob = probabilities[i, 0]
            alert_status = "🔴 YES" if alerts[i, 0] else "🟢 NO"
            pri = probabilities[i, 10]
            
            # Status icon based on probability
            if prob >= 0.7:
                status_icon = "🔴"
            elif prob >= 0.5:
                status_icon = "🟠"
            elif prob >= 0.3:
                status_icon = "🟡"
            else:
                status_icon = "🟢"
            
            result_text += f"{status_icon} {name:<12} {prob*100:6.2f}%        {alert_status:<10} {pri*100:6.2f}%\n"
        
        # Detailed breakdown
        result_text += "\n\nDETAILED PREDICTIONS (Probabilities)\n" + "="*60 + "\n"
        
        for i, name in enumerate(node_names):
            result_text += f"\n📍 {name}\n" + "-"*40 + "\n"
            for j, label in enumerate(OUTPUT_LABELS):
                value = probabilities[i, j]
                alert_flag = "⚠️" if alerts[i, j] else "  "
                result_text += f"{alert_flag} {label:20s}: {value*100:6.2f}%\n"
        
        # Critical nodes (based on probability, not threshold)
        avg_impacts = probabilities.mean(axis=1)
        critical_nodes_idx = [i for i, impact in enumerate(avg_impacts) if impact > alert_threshold]
        
        result_text += "\n\n⚠️  CRITICAL NODES (Above Threshold)\n" + "-"*60 + "\n"
        if critical_nodes_idx:
            for idx in critical_nodes_idx:
                result_text += f"  🔴 {node_names[idx]}: {avg_impacts[idx]*100:.2f}% avg probability\n"
        else:
            result_text += f"  ✅ No nodes above threshold ({alert_threshold*100:.0f}%)\n"
        
        # Graph visualization info
        graph_info = f"📊 Network Structure:\n"
        graph_info += f"  Nodes: {len(node_features)}\n"
        graph_info += f"  Edges: {len(edge_list)}\n"
        graph_info += f"  Connections:\n"
        for i, (src, dst) in enumerate(edge_list):
            graph_info += f"    {node_names[src]} → {node_names[dst]} (weight: {edge_weights[i]:.2f})\n"
        
        # Model info
        model_info = f"🤖 Model Information:\n"
        model_info += f"  Architecture: 4-layer GNN (GCN + GAT)\n"
        model_info += f"  Parameters: 41,996\n"
        model_info += f"  Training: Synthetic + Transfer Learning\n"
        model_info += f"  Fine-tuning Accuracy: 58% (+10% improvement)\n"
        model_info += f"  Threshold: {alert_threshold:.2f} (inference-time only)\n"
        model_info += f"  Device: {predictor.device}\n\n"
        model_info += f"  📊 Threshold Settings:\n"
        model_info += f"    - Current: {alert_threshold:.2f}\n"
        model_info += f"    - Optimal (empirical): 0.50\n"
        model_info += f"    - Note: Threshold is decision boundary,\n"
        model_info += f"            NOT a training parameter\n"
        
        return result_text, graph_info, model_info
        
    except Exception as e:
        return f"❌ Error: {str(e)}", "", ""


def load_preset_scenario(scenario_name):
    """Load predefined test scenarios"""
    scenarios = {
        "Tank Failure → Hospital": {
            "nodes": [
                ("Tank", 0.8, 0.1, 0.0, 0.0, 0.85, 0.5, 0.3, 0.6, 0.8),  # Failed tank
                ("Pump", 0.7, 0.8, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7),  # Healthy
                ("Pipe", 0.5, 0.6, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5),  # Healthy
                ("Hospital", 0.9, 0.95, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9),  # Target
            ],
            "edges": "0,1;1,0;1,2;2,1;2,3;3,2",
            "weights": "0.9,0.9,0.85,0.85,0.8,0.8"
        },
        "All Healthy": {
            "nodes": [
                ("Tank", 0.8, 0.9, 0.6, 0.9, 0.85, 0.5, 0.3, 0.6, 0.8),
                ("Pump", 0.7, 0.9, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7),
                ("Pipe", 0.5, 0.9, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5),
                ("Hospital", 0.9, 0.9, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9),
            ],
            "edges": "0,1;1,0;1,2;2,1;2,3;3,2",
            "weights": "0.9,0.9,0.85,0.85,0.8,0.8"
        },
        "Pump Failure": {
            "nodes": [
                ("Tank", 0.8, 0.9, 0.6, 0.9, 0.85, 0.5, 0.3, 0.6, 0.8),
                ("Pump", 0.7, 0.1, 0.0, 0.0, 0.75, 0.4, 0.2, 0.5, 0.7),  # Failed
                ("Pipe", 0.5, 0.6, 0.7, 0.9, 0.6, 0.3, 0.15, 0.4, 0.5),
                ("Hospital", 0.9, 0.95, 0.5, 0.9, 0.95, 0.9, 0.8, 0.7, 0.9),
            ],
            "edges": "0,1;1,0;1,2;2,1;2,3;3,2",
            "weights": "0.9,0.9,0.85,0.85,0.8,0.8"
        }
    }
    
    return scenarios.get(scenario_name, scenarios["Tank Failure → Hospital"])


def run_simulation(
    failed_node_idx: int,
    failure_mode_str: str,
    pessimistic_mode: bool
):
    """
    Run delta-inference simulation with semantic interpretation.
    
    This is the "What-If" simulator that shows causal impact propagation.
    """
    try:
        # Create test graph: Tank → Pump → Pipe → Hospital (all healthy baseline)
        x = np.array([
            # Tank (source) - healthy
            [0,0,0,1,0,0,0,0,0,0,0,0, 0.9, 0.8, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.1, 0.1, 0.0],
            # Pump - healthy
            [0,0,0,0,1,0,0,0,0,0,0,0, 0.9, 0.7, 0.8, 0.8, 0.6, 0.4, 0.5, 0.7, 0.8, 0.1, 0.1, 0.0],
            # Pipe - healthy
            [0,0,0,0,0,1,0,0,0,0,0,0, 0.9, 0.6, 0.7, 0.7, 0.4, 0.3, 0.4, 0.5, 0.6, 0.1, 0.1, 0.0],
            # Hospital (critical consumer) - healthy
            [0,0,0,0,0,0,1,0,0,0,0,0, 0.9, 0.9, 0.5, 0.95, 0.9, 0.8, 0.9, 0.9, 0.95, 0.1, 0.1, 0.0],
        ], dtype=np.float32)
        
        edge_index = np.array([[0,1,2,1,2,3], [1,2,3,0,1,2]], dtype=np.int64)
        edge_weight = np.array([0.9, 0.85, 0.8, 0.9, 0.85, 0.8], dtype=np.float32)
        node_names = ["Tank_Main", "Pump_Station", "Pipe_A", "Hospital"]
        
        # Map failure mode string to enum
        failure_mode_map = {
            "None (Raw Physics)": FailureMode.NONE,
            "Demand Loss (Consumer Failure)": FailureMode.DEMAND_LOSS,
            "Supply Cut (Source Failure)": FailureMode.SUPPLY_CUT,
            "Contamination (Quality Issue)": FailureMode.CONTAMINATION,
            "Control Failure (Sensor/Valve)": FailureMode.CONTROL_FAILURE
        }
        failure_mode = failure_mode_map.get(failure_mode_str, FailureMode.NONE)
        
        # Run simulation
        result = simulation_engine.run_simulation(
            x, edge_index, edge_weight,
            failed_nodes=[failed_node_idx],
            node_names=node_names,
            failure_mode=failure_mode,
            pessimistic_mode=pessimistic_mode
        )
        
        # Format output
        mode_label = "🔴 PESSIMISTIC (High-Alert)" if pessimistic_mode else "🔵 STANDARD (Conservative)"
        
        output = f"{'='*60}\n"
        output += f"🔬 DELTA-INFERENCE SIMULATION RESULTS\n"
        output += f"{'='*60}\n\n"
        
        output += f"📊 Mode: {mode_label}\n"
        output += f"🎯 Failed Node: {node_names[failed_node_idx]}\n"
        output += f"📋 Failure Type: {failure_mode_str}\n"
        output += f"📈 Affected Nodes: {result['summary']['affected_count']}\n"
        output += f"📉 Max Delta: {result['summary']['max_delta']:.4f}\n"
        
        if pessimistic_mode and result['summary']['max_pessimistic_delta']:
            output += f"⚠️  Max Amplified: {result['summary']['max_pessimistic_delta']:.4f}\n"
        
        output += f"\n{'-'*60}\n"
        output += f"{'Node':<15} {'Raw Δ':>10} {'Amplified':>10} {'Alert':>10} {'Risk Type':<20}\n"
        output += f"{'-'*60}\n"
        
        for node in result["nodes"]:
            interp = node["interpretation"]
            
            if node["is_failed_source"]:
                output += f"⚫ {node['node_name']:<12} {'SOURCE':>10} {'---':>10} {'CRITICAL':>10} FAILURE_SOURCE\n"
            else:
                # Alert icon
                alert_icon = {
                    "critical": "🔴",
                    "high": "🟠",
                    "elevated": "🟡",
                    "normal": "🟢"
                }.get(interp.alert_level, "⚪")
                
                raw_delta = f"{node['delta']:+.4f}"
                amp_delta = f"{interp.pessimistic_delta:+.4f}" if pessimistic_mode else "---"
                
                output += f"{alert_icon} {node['node_name']:<12} {raw_delta:>10} {amp_delta:>10} {interp.alert_level.upper():>10} {interp.risk_type:<20}\n"
        
        output += f"\n{'-'*60}\n"
        output += f"SEMANTIC INTERPRETATIONS\n"
        output += f"{'-'*60}\n\n"
        
        for node in result["nodes"]:
            interp = node["interpretation"]
            if not node["is_failed_source"] and abs(node["delta"]) > 0.005:
                output += f"{interp.ui_icon} {interp.explanation}\n"
                output += f"   Confidence: {interp.confidence:.0%} ({interp.confidence_label})\n\n"
        
        output += f"\n{'='*60}\n"
        output += f"📋 SUMMARY\n"
        output += f"{'='*60}\n"
        output += f"{result['summary']['interpretation_summary']}\n"
        
        # Admin guide
        guide = f"\n{'='*60}\n"
        guide += "📖 HOW TO READ THIS SIMULATION\n"
        guide += f"{'='*60}\n\n"
        
        if pessimistic_mode:
            guide += "🔴 PESSIMISTIC MODE ACTIVE\n"
            guide += "   Formula: amplified = (Δ^0.5) × 2.0 × topology_weight\n\n"
            guide += "   • Even SMALL real risks are amplified to be visible\n"
            guide += "   • Relief signals (negative Δ) are suppressed\n"
            guide += "   • This shows WORST-CASE scenario for crisis planning\n\n"
            guide += "   Alert Levels:\n"
            guide += "   🔴 CRITICAL (≥0.8): Immediate attention required\n"
            guide += "   🟠 HIGH (≥0.5): Significant risk detected\n"
            guide += "   🟡 ELEVATED (≥0.2): Potential concern\n"
            guide += "   🟢 NORMAL (<0.2): Within acceptable range\n"
        else:
            guide += "🔵 STANDARD MODE ACTIVE\n"
            guide += "   Shows raw physics-based delta values\n\n"
            guide += "   • Positive Δ: Risk INCREASE (potential failure propagation)\n"
            guide += "   • Negative Δ: Risk DECREASE (load relief/isolation)\n"
            guide += "   • This shows REALISTIC impact for monitoring\n"
        
        return output, guide
        
    except Exception as e:
        return f"❌ Error: {str(e)}", ""


# Build Gradio interface
with gr.Blocks(title="GNN Infrastructure Impact Predictor", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🏗️ GNN Infrastructure Impact Predictor
    ### Interactive Digital Twin for Village Infrastructure
    
    Test the trained Graph Neural Network with custom infrastructure scenarios.
    Configure nodes, define connections, and predict cascade impacts in real-time.
    
    **NEW: 🔬 What-If Simulator** - Delta-inference simulation with semantic interpretation!
    """)
    
    with gr.Tabs():
        # ========== TAB 1: PREDICTION ==========
        with gr.TabItem("🔮 Prediction"):
            with gr.Row():
                with gr.Column(scale=2):
                    gr.Markdown("## 🏗️ Infrastructure Configuration")
            
            # Preset scenarios
            with gr.Row():
                preset_dropdown = gr.Dropdown(
                    choices=["Tank Failure → Hospital", "All Healthy", "Pump Failure"],
                    value="Tank Failure → Hospital",
                    label="Load Preset Scenario"
                )
                load_btn = gr.Button("Load Preset", variant="secondary")
            
            # Node 1
            with gr.Group():
                gr.Markdown("### Node 1")
                with gr.Row():
                    node1_type = gr.Dropdown(choices=list(NODE_TYPES.keys()), value="Tank", label="Type")
                    node1_status = gr.Slider(0, 1, value=0.0, label="Status (0=Failed, 1=Healthy)")
                with gr.Row():
                    node1_capacity = gr.Slider(0, 1, value=0.8, label="Capacity")
                    node1_level = gr.Slider(0, 1, value=0.1, label="Current Level")
                    node1_flow = gr.Slider(0, 1, value=0.0, label="Flow Rate")
                with gr.Row():
                    node1_criticality = gr.Slider(0, 1, value=0.85, label="Criticality")
                    node1_population = gr.Slider(0, 1, value=0.5, label="Population Served")
                    node1_economic = gr.Slider(0, 1, value=0.3, label="Economic Value")
                with gr.Row():
                    node1_connectivity = gr.Slider(0, 1, value=0.6, label="Connectivity")
                    node1_maintenance = gr.Slider(0, 1, value=0.8, label="Maintenance Score")
            
            # Node 2
            with gr.Group():
                gr.Markdown("### Node 2")
                with gr.Row():
                    node2_type = gr.Dropdown(choices=list(NODE_TYPES.keys()), value="Pump", label="Type")
                    node2_status = gr.Slider(0, 1, value=0.9, label="Status")
                with gr.Row():
                    node2_capacity = gr.Slider(0, 1, value=0.7, label="Capacity")
                    node2_level = gr.Slider(0, 1, value=0.8, label="Current Level")
                    node2_flow = gr.Slider(0, 1, value=0.9, label="Flow Rate")
                with gr.Row():
                    node2_criticality = gr.Slider(0, 1, value=0.75, label="Criticality")
                    node2_population = gr.Slider(0, 1, value=0.4, label="Population Served")
                    node2_economic = gr.Slider(0, 1, value=0.2, label="Economic Value")
                with gr.Row():
                    node2_connectivity = gr.Slider(0, 1, value=0.5, label="Connectivity")
                    node2_maintenance = gr.Slider(0, 1, value=0.7, label="Maintenance Score")
            
            # Node 3
            with gr.Group():
                gr.Markdown("### Node 3")
                with gr.Row():
                    node3_type = gr.Dropdown(choices=list(NODE_TYPES.keys()), value="Pipe", label="Type")
                    node3_status = gr.Slider(0, 1, value=0.9, label="Status")
                with gr.Row():
                    node3_capacity = gr.Slider(0, 1, value=0.5, label="Capacity")
                    node3_level = gr.Slider(0, 1, value=0.6, label="Current Level")
                    node3_flow = gr.Slider(0, 1, value=0.7, label="Flow Rate")
                with gr.Row():
                    node3_criticality = gr.Slider(0, 1, value=0.6, label="Criticality")
                    node3_population = gr.Slider(0, 1, value=0.3, label="Population Served")
                    node3_economic = gr.Slider(0, 1, value=0.15, label="Economic Value")
                with gr.Row():
                    node3_connectivity = gr.Slider(0, 1, value=0.4, label="Connectivity")
                    node3_maintenance = gr.Slider(0, 1, value=0.5, label="Maintenance Score")
            
            # Node 4
            with gr.Group():
                gr.Markdown("### Node 4")
                with gr.Row():
                    node4_type = gr.Dropdown(choices=list(NODE_TYPES.keys()), value="Hospital", label="Type")
                    node4_status = gr.Slider(0, 1, value=0.9, label="Status")
                with gr.Row():
                    node4_capacity = gr.Slider(0, 1, value=0.9, label="Capacity")
                    node4_level = gr.Slider(0, 1, value=0.95, label="Current Level")
                    node4_flow = gr.Slider(0, 1, value=0.5, label="Flow Rate")
                with gr.Row():
                    node4_criticality = gr.Slider(0, 1, value=0.95, label="Criticality")
                    node4_population = gr.Slider(0, 1, value=0.9, label="Population Served")
                    node4_economic = gr.Slider(0, 1, value=0.8, label="Economic Value")
                with gr.Row():
                    node4_connectivity = gr.Slider(0, 1, value=0.7, label="Connectivity")
                    node4_maintenance = gr.Slider(0, 1, value=0.9, label="Maintenance Score")
            
            # Network topology
            gr.Markdown("### 🔗 Network Topology")
            edge_connections = gr.Textbox(
                value="0,1;1,0;1,2;2,1;2,3;3,2",
                label="Edge Connections",
                info="Format: source,target;source,target (e.g., 0,1;1,2;2,3)"
            )
            edge_weights = gr.Textbox(
                value="0.9,0.9,0.85,0.85,0.8,0.8",
                label="Edge Weights",
                info="Comma-separated weights (same order as edges)"
            )
            
            # Inference-time threshold control
            gr.Markdown("### ⚙️ Alert Threshold (Inference-Time)")
            alert_threshold = gr.Slider(
                0.1, 0.9, value=0.5, step=0.05,
                label="Alert Threshold",
                info="🟢 <0.3 Low | 🟡 0.3-0.5 Moderate | 🟠 0.5-0.7 High | 🔴 ≥0.7 Critical"
            )
            gr.Markdown("""
            **💡 Threshold Guide:**
            - **0.3**: High sensitivity (more alerts, catch early warnings)
            - **0.5**: Balanced (recommended, validated empirically)
            - **0.7**: Low sensitivity (fewer alerts, high-confidence only)
            
            ⚠️ **Note**: Threshold does NOT affect training. Model outputs objective probabilities (0-1). 
            Threshold only determines when to trigger alerts.
            """)
            
            predict_btn = gr.Button("🔮 Predict Impact", variant="primary", size="lg")
        
        with gr.Column(scale=3):
            gr.Markdown("## 📊 Prediction Results")
            
            with gr.Tab("Predictions"):
                output_text = gr.Textbox(
                    label="Impact Analysis",
                    lines=30,
                    max_lines=50
                )
            
            with gr.Tab("Network Info"):
                graph_info = gr.Textbox(
                    label="Graph Structure",
                    lines=15
                )
            
            with gr.Tab("Model Info"):
                model_info = gr.Textbox(
                    label="Model Details",
                    lines=10
                )
        
        # ========== TAB 2: WHAT-IF SIMULATOR ==========
        with gr.TabItem("🔬 What-If Simulator"):
            gr.Markdown("""
            ## 🔬 Delta-Inference What-If Simulator
            
            **"God Mode"** - Force any node to fail and measure the exact causal echo through the network.
            
            This simulator uses **delta-inference**: comparing baseline (all healthy) vs counterfactual (forced failure)
            to show how failures propagate through infrastructure topology.
            
            ### Key Insight
            - **GNN models physics** (what changes)
            - **Simulation layer adds semantics** (why it matters)
            - **Pessimistic mode amplifies risks** (worst-case for crisis planning)
            """)
            
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("### ⚙️ Simulation Settings")
                    
                    sim_failed_node = gr.Dropdown(
                        choices=[
                            ("0: Tank_Main (Source)", 0),
                            ("1: Pump_Station", 1),
                            ("2: Pipe_A", 2),
                            ("3: Hospital (Critical Consumer)", 3)
                        ],
                        value=0,
                        label="🎯 Force Failure On",
                        info="Select which node to simulate failure"
                    )
                    
                    sim_failure_mode = gr.Dropdown(
                        choices=[
                            "None (Raw Physics)",
                            "Demand Loss (Consumer Failure)",
                            "Supply Cut (Source Failure)",
                            "Contamination (Quality Issue)",
                            "Control Failure (Sensor/Valve)"
                        ],
                        value="Supply Cut (Source Failure)",
                        label="📋 Failure Mode",
                        info="Context for semantic interpretation"
                    )
                    
                    sim_pessimistic = gr.Checkbox(
                        value=False,
                        label="🔴 Pessimistic Mode (High-Alert)",
                        info="Amplify risks for worst-case crisis planning"
                    )
                    
                    gr.Markdown("""
                    ---
                    ### 📊 Test Network
                    ```
                    Tank_Main → Pump_Station → Pipe_A → Hospital
                        (0)          (1)         (2)       (3)
                    ```
                    All nodes start **HEALTHY** (status=0.9).
                    Simulation forces selected node to **FAIL** (status=0.0).
                    """)
                    
                    sim_btn = gr.Button("🔬 Run Simulation", variant="primary", size="lg")
                
                with gr.Column(scale=2):
                    gr.Markdown("### 📊 Simulation Results")
                    
                    sim_output = gr.Textbox(
                        label="Delta-Inference Results",
                        lines=25,
                        max_lines=40
                    )
                    
                    sim_guide = gr.Textbox(
                        label="Interpretation Guide",
                        lines=15
                    )
            
            gr.Markdown("""
            ---
            ### 🎓 Understanding Delta-Inference
            
            | Concept | Meaning |
            |---------|---------|
            | **Baseline** | Prediction with all nodes healthy |
            | **Counterfactual** | Prediction after forcing node failure |
            | **Delta (Δ)** | Counterfactual - Baseline = Causal impact |
            | **Positive Δ** | Risk INCREASE (failure propagation) |
            | **Negative Δ** | Risk DECREASE (load relief/isolation) |
            
            ### 🔴 Pessimistic Mode Formula
            ```
            amplified = (Δ ^ 0.5) × 2.0 × topology_weight
            ```
            - Small risks become visible: Δ=0.01 → 0.20 (ELEVATED)
            - Large risks amplified: Δ=0.10 → 0.63 (HIGH)
            - Relief signals suppressed: Δ=-0.05 → -0.005 (quiet)
            """)
            
            # Connect simulation button
            sim_btn.click(
                fn=run_simulation,
                inputs=[sim_failed_node, sim_failure_mode, sim_pessimistic],
                outputs=[sim_output, sim_guide]
            )
    
    gr.Markdown("""
    ---
    ### 📖 How to Use
    1. **Configure Nodes**: Set infrastructure type, status (0=failed, 1=healthy), and operational parameters
    2. **Define Network**: Specify connections between nodes (0-indexed) and edge weights
    3. **Predict**: Click "Predict Impact" to run GNN analysis
    4. **Interpret**: Review impact probabilities, severities, and critical nodes
    
    ### 🎯 Quick Test Scenarios
    - **Tank Failure → Hospital**: See how upstream water tank failure propagates
    - **All Healthy**: Baseline with all infrastructure operational
    - **Pump Failure**: Critical pump failure impact on network
    
    ### 🔬 NEW: What-If Simulator
    - Use the **What-If Simulator** tab for delta-inference analysis
    - Enable **Pessimistic Mode** for worst-case crisis planning
    """)
    
    # Connect predict button
    predict_btn.click(
        fn=predict_impact,
        inputs=[
            node1_type, node1_capacity, node1_level, node1_flow, node1_status,
            node1_criticality, node1_population, node1_economic, node1_connectivity, node1_maintenance,
            node2_type, node2_capacity, node2_level, node2_flow, node2_status,
            node2_criticality, node2_population, node2_economic, node2_connectivity, node2_maintenance,
            node3_type, node3_capacity, node3_level, node3_flow, node3_status,
            node3_criticality, node3_population, node3_economic, node3_connectivity, node3_maintenance,
            node4_type, node4_capacity, node4_level, node4_flow, node4_status,
            node4_criticality, node4_population, node4_economic, node4_connectivity, node4_maintenance,
            edge_connections, edge_weights, alert_threshold
        ],
        outputs=[output_text, graph_info, model_info]
    )


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7875,
        share=False,
        show_error=True
    )
