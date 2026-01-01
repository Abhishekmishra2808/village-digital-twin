"""
Test the trained GNN model directly without the API
"""

import numpy as np
from model import ImpactPredictor

def test_gnn():
    print("="*60)
    print("Testing Trained GNN Model")
    print("="*60 + "\n")
    
    # Load the trained model
    print("Loading trained model...")
    predictor = ImpactPredictor(model_path="models/gnn_model.pt")
    print(f"✓ Model loaded on {predictor.device}\n")
    
    # Create a sample infrastructure graph (5 nodes)
    print("Creating test infrastructure graph...")
    
    # Node features (24 dimensions each):
    # [type_one_hot(12), capacity, level, flow, status, criticality, pop_served, econ_value, connectivity, maintenance, weather_risk, failure_history]
    node_features = np.array([
        # Tank (type=3): High capacity, 70% level, critical
        [0,0,0,1,0,0,0,0,0,0,0,0, 0.8, 0.7, 0.6, 0.9, 0.85, 0.5, 0.3, 0.6, 0.8, 0.2, 0.1, 0.05],
        # Pump (type=4): Connected to tank, operational
        [0,0,0,0,1,0,0,0,0,0,0,0, 0.7, 0.8, 0.9, 0.95, 0.75, 0.4, 0.2, 0.5, 0.7, 0.3, 0.15, 0.1],
        # Pipe (type=5): Distribution pipe
        [0,0,0,0,0,1,0,0,0,0,0,0, 0.5, 0.6, 0.7, 0.85, 0.6, 0.3, 0.15, 0.4, 0.5, 0.4, 0.2, 0.15],
        # Hospital (type=10): Critical infrastructure
        [0,0,0,0,0,0,0,0,0,0,1,0, 0.9, 0.95, 0.5, 0.99, 0.95, 0.9, 0.8, 0.7, 0.9, 0.1, 0.05, 0.02],
        # Consumer Cluster (type=7): Residential area
        [0,0,0,0,0,0,0,1,0,0,0,0, 0.6, 0.5, 0.4, 0.8, 0.7, 0.6, 0.4, 0.5, 0.6, 0.3, 0.25, 0.1],
    ], dtype=np.float32)
    
    # Edge connections: [source, target] pairs
    # Tank → Pump → Pipe → Hospital
    #                   → Cluster
    edge_index = np.array([
        [0, 1],  # Tank → Pump
        [1, 0],  # Pump → Tank (bidirectional)
        [1, 2],  # Pump → Pipe
        [2, 1],  # Pipe → Pump
        [2, 3],  # Pipe → Hospital
        [3, 2],  # Hospital → Pipe
        [2, 4],  # Pipe → Cluster
        [4, 2],  # Cluster → Pipe
    ], dtype=np.int64).T  # Transpose for PyTorch Geometric format
    
    # Edge weights (connection strengths)
    edge_weights = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.75, 0.75], dtype=np.float32)
    
    print(f"  Nodes: {len(node_features)}")
    print(f"  Edges: {edge_index.shape[1]}")
    print(f"  Node types: Tank, Pump, Pipe, Hospital, Cluster\n")
    
    # Run prediction
    print("Running GNN inference...")
    predictions = predictor.predict(node_features, edge_index, edge_weights)
    print(f"✓ Prediction complete\n")
    
    # Display results
    print("="*60)
    print("IMPACT PREDICTIONS")
    print("="*60 + "\n")
    
    node_names = ["Tank-1", "Pump-1", "Pipe-1", "Hospital-1", "Cluster-1"]
    output_labels = [
        "Probability", "Severity", "Time to Impact", "Water Impact",
        "Power Impact", "Road Impact", "Building Impact", "Population Affected",
        "Economic Loss", "Recovery Time", "Priority", "Confidence"
    ]
    
    for i, name in enumerate(node_names):
        print(f"📍 {name}:")
        pred = predictions[i]
        
        # Show key metrics
        print(f"   ├─ Impact Probability: {pred[0]*100:.1f}%")
        print(f"   ├─ Severity Score:     {pred[1]*100:.1f}%")
        print(f"   ├─ Time to Impact:     {pred[2]*24:.1f} hours")
        print(f"   ├─ Water Impact:       {pred[3]*100:.1f}%")
        print(f"   ├─ Population at Risk: {pred[7]*100:.1f}%")
        print(f"   ├─ Economic Loss:      {pred[8]*100:.1f}%")
        print(f"   └─ Priority Score:     {pred[10]*100:.1f}%")
        print()
    
    # Summary
    print("="*60)
    print("SUMMARY")
    print("="*60)
    
    # Find most affected node
    avg_impact = predictions.mean(axis=1)
    most_affected = node_names[np.argmax(avg_impact)]
    print(f"  Most Affected Node: {most_affected}")
    print(f"  Average Impact:     {avg_impact.max()*100:.1f}%")
    
    # Find critical nodes (impact > 15%)
    critical_mask = avg_impact > 0.15
    critical_nodes = [n for n, c in zip(node_names, critical_mask) if c]
    print(f"  Critical Nodes:     {', '.join(critical_nodes) if critical_nodes else 'None'}")
    
    print("\n✅ GNN Model Test Complete!")
    print(f"   Model uses {sum(p.numel() for p in predictor.model.parameters()):,} learnable parameters")
    print(f"   Running on: {predictor.device}")


if __name__ == "__main__":
    test_gnn()
