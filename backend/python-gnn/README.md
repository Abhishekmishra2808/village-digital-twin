# Real Graph Neural Network for Infrastructure Impact Prediction

This is a **real GNN** using PyTorch Geometric with actual neural network layers, training, and learned parameters.

## 🎯 Delta-Inference Simulation (Recommended Approach)

For **admin "what-if" analysis**, use the **Delta-Inference Simulation Engine** instead of retraining:

```python
from simulation_engine import create_simulation_engine

# Load model and run counterfactual simulation
engine = create_simulation_engine('models/gnn_production_v1.pt')
report = engine.run_simulation(x, edge_index, failed_node_id=5)

# See what CHANGES when you force a node to fail
print(report['summary'])
# Output: "Hospital fails → Pump severely affected (Δ-0.64)"
```

**Why Delta-Inference?**
- ✅ Measures **relative change**, not absolute probabilities
- ✅ Cancels out over-smoothing and calibration issues
- ✅ Provides **actionable causality**: "This breaks → That affected"
- ✅ No retraining needed
- ✅ Professional standard for digital twins

**[See Complete Guide →](DELTA_INFERENCE_GUIDE.md)**

## Architecture

**4-Layer Deep GNN with Residual Connections:**
- **Layer 1 (24→48)**: GCN for feature expansion
- **Layer 2 (48→48)**: Graph Attention Network (3 heads) + residual from projected input
- **Layer 3 (48→48)**: GCN + residual from Layer 1
- **Layer 4 (48→12)**: Output projection with sigmoid activation

**Features:**
- ✅ Real neural network with learnable weights
- ✅ Graph Convolutional layers (GCN)
- ✅ Multi-head Graph Attention (GAT)
- ✅ Residual connections for deep learning
- ✅ Batch normalization and dropout
- ✅ Training with backpropagation
- ✅ Model persistence (save/load)

## Installation

### 1. Install Python Dependencies

```powershell
cd D:\dsa\village-digital-twin\backend\python-gnn

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Train the Model

```powershell
python train.py
```

This will:
- Generate 1000 synthetic training samples
- Train the GNN for 50 epochs
- Save the best model to `models/gnn_model.pt`
- Print training progress

**Expected output:**
```
============================================================
Training Real GNN for Infrastructure Impact Prediction
============================================================

Generating synthetic training data...
  Generated 100/800 samples
  ...
✓ Generated 800 training samples

Model initialized on device: cuda (or cpu)
Model parameters: 15,732

Epoch   1/50 | Train Loss: 0.3421 | Val Loss: 0.2987
  ✓ New best model saved (Val Loss: 0.2987)
Epoch   2/50 | Train Loss: 0.2654 | Val Loss: 0.2543
  ✓ New best model saved (Val Loss: 0.2543)
...
```

### 3. Start the API Server

```powershell
python api_server.py
```

The API will run on **http://localhost:8001**

## API Usage

### Health Check
```bash
curl http://localhost:8001/
```

### Status
```bash
curl http://localhost:8001/status
```

### Predict Impact

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [
      {"id": "tank-1", "features": [1, 0, 0, ...24 values]},
      {"id": "pump-2", "features": [0, 1, 0, ...24 values]}
    ],
    "edges": [
      {"source": 0, "target": 1, "weight": 0.8}
    ]
  }'
```

## Integration with Node.js Backend

Update your `backend/utils/gnnImpactService.js` to call the Python API:

```javascript
// Add this method to GNNImpactService class
async predictWithRealGNN(failedNodeId, failureType, failureSeverity) {
  try {
    // Prepare data for Python GNN
    const nodes = Array.from(this.graph.nodes.values()).map(node => ({
      id: node.id,
      features: node.embedding
    }));
    
    const edges = [];
    for (const [sourceId, edgeList] of this.graph.edges) {
      const sourceIdx = this.graph.nodeIndex.get(sourceId);
      for (const edge of edgeList) {
        const targetIdx = this.graph.nodeIndex.get(edge.target);
        edges.push({
          source: sourceIdx,
          target: targetIdx,
          weight: edge.weight
        });
      }
    }
    
    // Call Python GNN API
    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes,
        edges,
        failure_node_id: failedNodeId
      })
    });
    
    const result = await response.json();
    return result.predictions;
    
  } catch (error) {
    console.error('Real GNN prediction failed:', error);
    // Fallback to heuristic method
    return this.predictImpact(this.graph, failedNodeId, failureType, failureSeverity);
  }
}
```

## Training & Retraining

### Initial Training (Synthetic Data)

**Full model training** on synthetic physics-based data:

```powershell
python train.py
```

- **Training Data**: 800 synthetic infrastructure graphs
- **Validation Data**: 200 synthetic graphs
- Learns topology, message passing, and general infrastructure physics

### Targeted Gate Retraining (Real Data)

**Gate-only retraining** on real incident data:

```powershell
python retrain_gate.py \
  --model models/gnn_production_v1.pt \
  --incidents data/real_incidents.json \
  --lr 1e-4 \
  --epochs 10 \
  --save models/gnn_gate_retrained.pt
```

**What this does:**
- ✅ Trains only the gate network (learns when status overrides neighborhood)
- ❌ Freezes all message-passing layers (preserves topology knowledge)
- ✅ Automatic validation against 5 success criteria
- ✅ Automatic rollback if criteria fail

**See detailed documentation:**
- [GATE_RETRAINING_GUIDE.md](GATE_RETRAINING_GUIDE.md) - Complete usage guide
- [GATE_RETRAINING_IMPLEMENTATION.md](GATE_RETRAINING_IMPLEMENTATION.md) - Technical details

**When to use:**
- After collecting ≥5 real incidents with labeled outcomes
- When failed nodes aren't crossing alert thresholds
- To adapt gate behavior to village-specific failure patterns

**When NOT to use:**
- For initial model training (use `train.py` instead)
- With <5 incidents or <10 labeled nodes
- If model already meets detection criteria

## Model Training Details
- **Batch Size**: 32
- **Epochs**: 50
- **Optimizer**: Adam (lr=0.001, weight_decay=5e-4)
- **Loss Function**: Binary Cross-Entropy
- **Device**: Automatically uses CUDA if available, otherwise CPU

## Comparison: Heuristic vs Real GNN

| Feature | Heuristic (Old) | Real GNN (New) |
|---------|-----------------|----------------|
| Neural Network | ❌ No | ✅ Yes |
| Learnable Parameters | ❌ No | ✅ Yes (15,732) |
| Training Required | ❌ No | ✅ Yes |
| Backpropagation | ❌ No | ✅ Yes |
| Graph Convolutions | ❌ Simulated | ✅ Real (GCN) |
| Attention Mechanism | ❌ Manual | ✅ Real (GAT) |
| Improves with Data | ❌ No | ✅ Yes |
| Deep Learning | ❌ No | ✅ Yes (4 layers) |

## Future Enhancements

1. **Real Training Data**: Replace synthetic data with historical failure logs
2. **Online Learning**: Continuously update model with new incidents
3. **Model Ensemble**: Combine multiple GNN architectures
4. **Temporal GNN**: Add time-series prediction
5. **Explainable AI**: Add SHAP/attention visualization
6. **Hyperparameter Tuning**: Optimize architecture and training

## Troubleshooting

### CUDA Out of Memory
Reduce batch size in `train.py`:
```python
train_model(num_epochs=50, batch_size=16)
```

### Slow Training
Normal on CPU. Consider:
- Using Google Colab with free GPU
- Reducing number of epochs
- Using smaller graphs

### Import Errors
Ensure torch-geometric is installed correctly:
```powershell
pip install torch-geometric torch-scatter torch-sparse -f https://data.pyg.org/whl/torch-2.1.0+cpu.html
```
