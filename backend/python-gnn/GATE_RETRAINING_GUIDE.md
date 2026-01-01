# Gate Retraining Guide

## 🎯 Purpose

Train the **gated status veto** to learn when a node's failure status should override neighborhood smoothing, without relearning topology or breaking calibration.

This is **targeted retraining**, not full model training.

## ✅ What Gets Trained

- `gate_network` (MLP that learns when status overrides neighborhood)
- `conv4` (optional: final output projection layer)

## ❌ What Stays Frozen

- `conv1` (feature extraction)
- `conv2` / `conv3` (message passing)
- `input_projection` (residual connections)
- `status_projection` (failure severity mapping)
- All BatchNorm layers

**If topology weights change, that's a failure.**

## 🚀 Quick Start

### Basic Usage

```bash
python retrain_gate.py \
  --model models/gnn_production_v1.pt \
  --incidents data/real_incidents.json \
  --lr 1e-4 \
  --epochs 10 \
  --save models/gnn_gate_retrained.pt
```

### With Focal Loss (for persistent false negatives)

```bash
python retrain_gate.py \
  --model models/gnn_production_v1.pt \
  --incidents data/real_incidents.json \
  --lr 5e-5 \
  --epochs 10 \
  --focal \
  --focal-gamma 2.0 \
  --focal-alpha 0.75 \
  --save models/gnn_gate_retrained.pt
```

### Train Output Layer Too

```bash
python retrain_gate.py \
  --model models/gnn_production_v1.pt \
  --incidents data/real_incidents.json \
  --lr 1e-4 \
  --epochs 10 \
  --train-output \
  --save models/gnn_gate_retrained.pt
```

## ⚙️ Configuration

| Parameter | Default | Recommended | Description |
|-----------|---------|-------------|-------------|
| `--lr` | 1e-4 | 1e-4 or 5e-5 | Learning rate (very small) |
| `--epochs` | 10 | 5-15 max | Training epochs |
| `--pos-weight` | 5.0 | 5.0 | BCE loss weight for failures |
| `--focal` | False | Optional | Use focal loss (only if needed) |
| `--focal-gamma` | 2.0 | ≤ 2.0 | Focal loss gamma |
| `--focal-alpha` | 0.75 | ≤ 0.75 | Focal loss alpha |
| `--train-output` | False | Optional | Also train conv4 layer |

## 📊 Success Criteria (ALL must pass)

The script automatically validates:

1. **Failed nodes cross threshold**: ≥50% of failed nodes have probability ≥ exp(-2.5) ≈ 0.082
2. **Healthy nodes stay low**: Mean probability < 0.05
3. **Overall mean low**: Mean probability across all nodes < 0.05
4. **Probability bounded**: Max probability < 0.9
5. **Ranking preserved**: Failed nodes have higher mean probability than healthy nodes

**If ANY criterion fails → automatic rollback.**

## 🔄 Automatic Rollback

The script:
1. Creates a backup before training
2. Trains the gate network
3. Validates against success criteria
4. **Automatically rolls back** if criteria fail

You always end up with a working model.

## 📂 Required Data Format

Incidents JSON file:

```json
{
  "incidents": [
    {
      "incident_id": "2024-08-12-pipe-burst",
      "date": "2024-08-12",
      "description": "Water main pipe burst",
      "nodes": [
        {
          "id": 0,
          "type": "Pipe",
          "capacity": 0.8,
          "level": 0.6,
          "flow": 0.5,
          "status": 0.0,  // 0.0 = FAILED, 1.0 = HEALTHY
          "criticality": 0.85,
          "population_served": 0.5,
          "economic_value": 0.3,
          "connectivity": 0.6,
          "maintenance_score": 0.8,
          "weather_risk": 0.2,
          "failure_history": 0.1,
          "reserved": 0.05,
          "impacted": 0.95  // Ground truth: 0-1 or -1 for unknown
        },
        ...
      ],
      "edges": [
        {"source": 0, "target": 1, "weight": 0.9},
        ...
      ]
    },
    ...
  ]
}
```

**Minimum requirements:**
- At least 5 incidents
- At least 10 labeled nodes (impacted ≥ 0)
- At least 1 failed node (status < 0.5)

## 🚫 What NOT to Do

❌ **Do NOT retrain entire GNN** - This script prevents that  
❌ **Do NOT increase α to "force" detection** - α stays at 2.5  
❌ **Do NOT hardcode probability boosts** - Gate learns naturally  
❌ **Do NOT bake alert thresholds into training** - Threshold is inference-time  
❌ **Do NOT overuse focal loss** - Use only if BCE fails  
❌ **Do NOT collapse likelihood + alert logic** - They stay separate  
❌ **Do NOT remove temperature scaling** - Model preserves calibration  
❌ **Do NOT retrain with <5 incidents** - Too little data  

## 🧠 Mental Model

> "Teach the gate when to speak, not the model what to believe."

The gate learns **priority**, not physics.

## 📈 Monitoring Training

Watch for:

```
Epoch  5/10 | Loss: 0.3245 | Gate: μ=0.423 σ=0.187
   → Failed crossing: 67.3% | Mean prob: 0.032
```

- **Loss**: Should decrease steadily
- **Gate μ (mean)**: Should stay between 0.1 and 0.9 (avoid saturation)
- **Gate σ (std)**: Should be > 0.1 (gate is learning context)
- **Failed crossing**: Should increase (more failed nodes detected)
- **Mean prob**: Should stay low (< 0.05)

### Early Stop Conditions

Training stops early if:
- Gate saturates (μ < 0.1 or μ > 0.9)
- Epochs completed

## 🎯 Example Output

### Successful Run

```
🎯 TARGETED GATE RETRAINING
================================================================================

📦 Loading pre-trained model: models/gnn_production_v1.pt
✓ Model loaded successfully on cuda

🔒 FREEZING LAYERS (preserving topology knowledge)...

✅ Trainable parameters (2):
   - gate_network.0.weight
   - gate_network.2.weight

❌ Frozen parameters (16):
   - conv1.weight
   - conv2.weight
   ...

📊 Parameter Summary:
   Total: 125,432
   Trainable: 8,320 (6.6%)
   Frozen: 117,112 (93.4%)

✅ Layer freeze verification passed

📂 Loading incidents: data/real_incidents.json
✓ Loaded 12 incidents
   Total nodes: 247
   Labeled nodes: 189
   Failed nodes: 23
   Healthy nodes: 166

📊 PRE-TRAINING METRICS (Baseline)
================================================================================
   failed_mean_prob: 0.0423
   healthy_mean_prob: 0.0187
   overall_mean_prob: 0.0234
   max_prob: 0.1876
   threshold_crossing_rate: 0.3478

🚀 TRAINING (10 epochs)
================================================================================
Epoch  1/10 | Loss: 0.4521 | Gate: μ=0.512 σ=0.234
Epoch  2/10 | Loss: 0.3876 | Gate: μ=0.534 σ=0.241
Epoch  3/10 | Loss: 0.3421 | Gate: μ=0.547 σ=0.238
Epoch  4/10 | Loss: 0.3156 | Gate: μ=0.558 σ=0.232
Epoch  5/10 | Loss: 0.2987 | Gate: μ=0.564 σ=0.227
   → Failed crossing: 56.5% | Mean prob: 0.0289
Epoch  6/10 | Loss: 0.2834 | Gate: μ=0.571 σ=0.223
Epoch  7/10 | Loss: 0.2712 | Gate: μ=0.576 σ=0.219
Epoch  8/10 | Loss: 0.2623 | Gate: μ=0.580 σ=0.216
Epoch  9/10 | Loss: 0.2547 | Gate: μ=0.583 σ=0.213
Epoch 10/10 | Loss: 0.2489 | Gate: μ=0.586 σ=0.211
   → Failed crossing: 65.2% | Mean prob: 0.0312

📊 POST-TRAINING METRICS
================================================================================
   failed_mean_prob: 0.0876 (Δ +0.0453)
   healthy_mean_prob: 0.0198 (Δ +0.0011)
   overall_mean_prob: 0.0312 (Δ +0.0078)
   max_prob: 0.2341 (Δ +0.0465)
   threshold_crossing_rate: 0.6522 (Δ +0.3044)

✅ SUCCESS CRITERIA VALIDATION
================================================================================
✅ ALL CRITERIA PASSED!
   1. ✅ Failed nodes cross threshold
   2. ✅ Healthy nodes stay below threshold
   3. ✅ Node ranking preserved
   4. ✅ Probability range bounded
   5. ✅ Mean probability remains low

💾 Retrained model saved: models/gnn_gate_retrained.pt

🎉 Gate retraining SUCCESSFUL!
```

### Failed Run (Automatic Rollback)

```
📊 POST-TRAINING METRICS
================================================================================
   failed_mean_prob: 0.0823 (Δ +0.0400)
   healthy_mean_prob: 0.0567 (Δ +0.0380)  ⚠️ Too high
   ...

❌ CRITERIA FAILED:
   ❌ Healthy nodes too high: mean=0.0567 (need <0.05)

🔄 ROLLING BACK to backup: models/backups/gate_backup_20250131_143022.pt
✅ Rollback complete. Original model restored.

⚠️  Gate retraining FAILED and was rolled back.
   Try:
   - Collect more training incidents
   - Adjust learning rate (lower)
   - Reduce epochs
```

## 🔧 Troubleshooting

### "Gate saturation detected"

**Problem**: Gate values all near 0 or 1.  
**Solution**: Lower learning rate (try 5e-5 instead of 1e-4).

### "Failed nodes don't cross threshold"

**Problem**: Gate isn't learning to boost failed nodes.  
**Solution**: 
1. Check training data has failed nodes (status < 0.5)
2. Try focal loss: `--focal --focal-gamma 2.0`
3. Increase epochs to 15

### "Healthy nodes too high"

**Problem**: Gate is too aggressive, boosting everything.  
**Solution**:
1. Lower learning rate
2. Reduce epochs
3. Don't use focal loss

### "Too few labeled nodes"

**Problem**: Need more training data.  
**Solution**: Collect at least 5 real incidents with ≥10 labeled nodes total.

## 📝 Integration

After successful retraining, update your production inference:

```python
from model import ImpactPredictor

# Load retrained model
predictor = ImpactPredictor(model_path='models/gnn_gate_retrained.pt')

# Use as normal
probs = predictor.predict(node_features, edge_index)
```

The API is unchanged. The gate now has learned context.

## 🔍 Verifying Results

Compare before/after on test incidents:

```python
from model import ImpactPredictor

# Load both models
old_model = ImpactPredictor(model_path='models/gnn_production_v1.pt')
new_model = ImpactPredictor(model_path='models/gnn_gate_retrained.pt')

# Test on incident
old_probs = old_model.predict(x, edge_index)
new_probs = new_model.predict(x, edge_index)

# Compare failed node detection
failed_mask = x[:, 12] < 0.5
print(f"Old model - Failed mean: {old_probs[failed_mask, 0].mean():.4f}")
print(f"New model - Failed mean: {new_probs[failed_mask, 0].mean():.4f}")
```

You should see:
- Higher probabilities for failed nodes
- Similar or lower probabilities for healthy nodes
- Better threshold crossing rate

---

## 🎓 Background: Why Targeted Retraining?

The GNN was pre-trained on synthetic physics-based data to learn:
1. **Topology**: How infrastructure connects
2. **Message passing**: How failures propagate
3. **Node types**: Different infrastructure behaviors

These are general patterns that should **not change**.

The **gate network** is the only component that needs to learn from real data:
- When should status override neighborhood?
- Which dimensions are most affected by failure?
- How much to boost failed nodes?

By freezing topology layers and training only the gate, we get the best of both worlds:
- ✅ Preserve general infrastructure knowledge
- ✅ Adapt to village-specific failure patterns
- ✅ Maintain calibration
- ✅ Avoid overtraining

---

**Remember**: Teach the gate when to speak, not the model what to believe. The gate learns priority, not physics.
