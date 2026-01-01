"""Quick GNN functionality test"""

from simulation_engine import SimulationEngine
from model import ImpactPredictor
import numpy as np

print('='*60)
print('Testing GNN Simulation Engine')
print('='*60 + '\n')

# Initialize predictor and engine
print('Loading model...')
predictor = ImpactPredictor('models/gnn_production_v1.pt')
engine = SimulationEngine(predictor)
print('✓ Engine initialized\n')

# Create simple test graph: Tank -> Pump -> Pipe -> Hospital
print('Building test network: Tank → Pump → Pipe → Hospital')
x = np.array([
    [0,0,0,1,0,0,0,0,0,0,0,0, 0.8, 0.9, 0.7, 0.85, 0.9, 0.5, 0.3, 0.6, 0.8, 0.2, 0.1, 0.05],  # Tank
    [0,0,0,0,1,0,0,0,0,0,0,0, 0.7, 0.8, 0.9, 0.9, 0.75, 0.4, 0.2, 0.5, 0.7, 0.3, 0.15, 0.1],   # Pump
    [0,0,0,0,0,1,0,0,0,0,0,0, 0.5, 0.6, 0.7, 0.85, 0.6, 0.3, 0.15, 0.4, 0.5, 0.4, 0.2, 0.15],  # Pipe
    [0,0,0,0,0,0,0,0,0,0,1,0, 0.9, 0.95, 0.5, 0.99, 0.95, 0.9, 0.8, 0.7, 0.9, 0.1, 0.05, 0.02], # Hospital
], dtype=np.float32)

edge_index = np.array([[0,1,1,2,2,3], [1,0,2,1,3,2]], dtype=np.int64)
edge_weight = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8], dtype=np.float32)
node_names = ['Main-Tank', 'Pump-A', 'Main-Pipe', 'Hospital']

print('✓ Network created (4 nodes, 6 edges)\n')

# Simulate pump failure
print('Scenario: Pump-A failure (supply disruption)')
print('-'*60)

from simulation_engine import FailureMode

result = engine.run_simulation(
    x=x,
    edge_index=edge_index,
    edge_weight=edge_weight,
    failed_nodes=[1],  # Pump-A
    node_names=node_names,
    failure_mode=FailureMode.SUPPLY_CUT,
    pessimistic_mode=True
)

# Extract results
summary = result['summary']
nodes = result['nodes']

print(f'\nSimulation Summary:')
print(f'  Failed node: {summary["failed_names"][0]}')
print(f'  Failure mode: {summary["failure_mode"]}')
print(f'  Affected nodes: {summary["affected_count"]}/{summary["total_nodes"]}')
print(f'  Max delta: {summary["max_delta"]:.3f}')
print(f'  Mean delta: {summary["mean_delta"]:.3f}')

# Show deltas for each node
print('\nNode-by-node Impact (sorted by delta):')
print(f'{"Node":<15} {"Delta":>8} {"Interpretation"}')
print('-'*70)

for node_result in nodes[:4]:  # Show top 4
    name = node_result['node_name']
    delta = node_result['delta']
    interp = node_result['interpretation']
    insight = str(interp.insight)[:45] if hasattr(interp, 'insight') else 'No impact'
    
    print(f'{name:<15} {delta:>8.3f}  {insight}')

print('\n✅ GNN Simulation Test Complete!')
print(f'   Model parameters: {sum(p.numel() for p in predictor.model.parameters()):,}')
print(f'   Device: {predictor.device}')
