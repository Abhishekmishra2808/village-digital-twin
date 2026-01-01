"""
Test Delta-Inference Simulation Engine with Semantic Interpretation

Demonstrates how the GNN models physics (what changes)
and the simulation layer adds semantics (what it MEANS).

KEY INSIGHT: Negative deltas are NOT errors.
They mean load relief, which may or may not be a problem depending on context.
"""

import numpy as np
import torch
from simulation_engine import create_simulation_engine, FailureMode
from incident_loader import load_real_incidents

def test_simulation():
    """Test simulation engine on real incidents"""
    
    print("=" * 80)
    print("🎯 DELTA-INFERENCE SIMULATION TEST")
    print("=" * 80)
    
    # Load model
    print("\n📦 Loading model...")
    engine = create_simulation_engine('models/gnn_production_v1.pt')
    print("✓ Model loaded")
    
    # Load real incident data
    print("\n📂 Loading real incident data...")
    incidents = load_real_incidents('data/real_incidents.json')
    
    if len(incidents) == 0:
        print("❌ No incidents found")
        return
    
    print(f"✓ Loaded {len(incidents)} incidents")
    
    # Test on first incident
    incident = incidents[0]
    x = incident.x.numpy()
    edge_index = incident.edge_index.numpy()
    
    num_nodes = x.shape[0]
    
    # Create node names (use types)
    node_names = []
    type_map = {0: 'Road', 1: 'Building', 2: 'Power', 3: 'Tank', 
                4: 'Pump', 5: 'Pipe', 6: 'Sensor', 7: 'Cluster',
                8: 'Bridge', 9: 'School', 10: 'Hospital', 11: 'Market'}
    
    for i in range(num_nodes):
        type_idx = np.argmax(x[i, :12])
        node_type = type_map.get(type_idx, 'Unknown')
        node_names.append(f"{node_type}_{i}")
    
    # Find a node that's currently healthy (status > 0.5)
    healthy_nodes = [i for i in range(num_nodes) if x[i, 12] > 0.5]
    
    if len(healthy_nodes) == 0:
        print("⚠️  No healthy nodes to simulate")
        return
    
    test_node = healthy_nodes[0]
    
    print(f"\n🧪 TESTING ALL FAILURE MODES")
    print(f"   Target: {node_names[test_node]} (Node {test_node})")
    print(f"   Original status: {x[test_node, 12]:.2f}")
    print("=" * 80)
    
    failure_modes = [
        (FailureMode.SUPPLY_CUT, "Supply Cut / Break"),
        (FailureMode.DEMAND_LOSS, "Demand Loss / Closure"),
        (FailureMode.CONTAMINATION, "Contamination")
    ]
    
    for mode, mode_name in failure_modes:
        print(f"\n{'='*80}")
        print(f"📋 FAILURE MODE: {mode_name}")
        print(f"{'='*80}")
        
        # Run simulation
        report = engine.run_simulation(x, edge_index, test_node, node_names, failure_mode=mode)
        
        # Display summary
        print("\n📊 SIMULATION RESULTS")
        print("=" * 80)
        for line in report['summary']:
            print(line)
        
        # Show interpremoji']} {n['name']} (Node {n['node_id']}):")
        print(f"   Baseline:         {n['baseline']:.4f}")
        print(f"   Simulated:        {n['simulated']:.4f}")
        print(f"   Raw Δ:            {n['raw_delta']:+.4f}")
        print(f"   Risk Level:       {n['risk_level']}")
        print(f"   Message:          {n['message']}")
        if n.get('interpretation'):
            print(f"   Interpretation:   {n['interpretation']}")
    
    print("\n" + "="*80)
    print("✅ SIMULATION COMPLETE")
    print("="*80)
    print("\n🧠 KEY INSIGHTS:")
    print("   1. GNN models PHYSICS (what changes)")
    print("   2. Simulation layer adds SEMANTICS (what it means)")
    print("   3. Negative Δ ≠ error (can mean load relief)")
    print("   4. Interpretation depends on failure mode")
    print("   5. This is a simulation engine, not a classifier")


def test_semantic_interpretation():
    """Demonstrate how same delta has different meanings in different contexts"""
    print("\n\n" + "="*80)
    print("🧪 SEMANTIC INTERPRETATION TEST")
    print("="*80)
    print("\nDemonstrating: Same Δ, different meanings based on failure mode\n")
    
    # Load model
    engine = create_simulation_engine('models/gnn_production_v1.pt')
    
    # Simple 3-node graph: Source → Hub → Consumer
    x = np.array([
        # Node 0: Source (Tank) - WE'LL FAIL THIS
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
         1.0, 0.8, 0.7, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.1, 0.1, 0.0],
        
        # Node 1: Hub (Pump)
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
         0.9, 0.7, 0.8, 0.7, 0.5, 0.3, 0.5, 0.6, 0.7, 0.1, 0.1, 0.0],
        
        # Node 2: Consumer (Hospital)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
         0.9, 0.6, 0.5, 0.8, 0.9, 0.8, 0.7, 0.5, 0.6, 0.1, 0.1, 0.0]
    ], dtype=np.float32)
    
    edge_index = np.array([[0, 1], [1, 2]], dtype=np.int64)
    node_names = ['Tank', 'Pump', 'Hospital']
    
    # Test different failure modes
    print("Scenario: Tank (Source) Fails")
    print("-" * 80)
    
    modes_to_test = [
        (FailureMode.SUPPLY_CUT, "Supply Cut"),
        (FailureMode.CONTAMINATION, "Contamination"),
        (FailureMode.DEMAND_LOSS, "Demand Loss")
    ]
    
    for mode, mode_name in modes_to_test:
        report = engine.run_simulation(x, edge_index, 0, node_names, failure_mode=mode)
        
        print(f"\n{mode_name.upper()}:")
        # Show pump interpretation
        pump = next(n for n in report['nodes'] if n['node_id'] == 1)
        print(f"  Pump: {pump['emoji']} {pump['risk_level']}")
        print(f"  Delta: {pump['raw_delta']:+.4f}")
        print(f"  Interpretation: {pump['interpretation']}")
        
    print("\n" + "="*80)
    print("🎓 LESSON: Same physics, different operational meaning!")
    print("="*80)
    print(f"   Critical nodes: {len(cascade['critical_nodes'])}")
    
    if cascade['immediate_impact']:
        print("\n   Immediate impact on:")
        for n in cascade['immediate_impact']:
            print(f"      - {n['name']}: Δ{n['amplified_delta']:+.2f}")
    
    print("\n✅ SIMULATION COMPLETE")
    print("=" * 80)
    print("\n🧠 KEY INSIGHT:")
    print("   Delta-inference measures RELATIVE CHANGE, not absolute values.")
    print("   This cancels out over-smoothing and calibration issues.")
    print("   You now have an actionable 'what-if' tool for admins!")


if __name__ == '__main__':
    test_simulation()
