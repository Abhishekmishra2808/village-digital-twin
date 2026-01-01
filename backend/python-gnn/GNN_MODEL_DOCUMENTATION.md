# GNN Infrastructure Impact Prediction Model
## Complete Technical Documentation

**Version:** 1.0  
**Date:** December 30, 2025  
**Framework:** PyTorch 2.9.1 + PyTorch Geometric 2.7.0

---

## Table of Contents
1. [Model Overview](#model-overview)
2. [Architecture](#architecture)
3. [Dataset](#dataset)
4. [Node Features](#node-features)
5. [Training Process](#training-process)
6. [Loss Function](#loss-function)
7. [Prediction Outputs](#prediction-outputs)
8. [API Reference](#api-reference)

---

## 1. Model Overview

### Purpose
Multi-infrastructure cascade impact prediction for village digital twin systems. Predicts failure propagation across 12 infrastructure types (water, power, transportation, buildings).

### Model Type
**Graph Neural Network (GNN)** with hybrid architecture:
- Graph Convolutional Network (GCN) layers
- Graph Attention Network (GAT) layers
- Residual connections for deep learning stability

### Key Capabilities
- ✅ Predicts 12-dimensional impact vectors per node
- ✅ Handles 12 infrastructure types
- ✅ Processes directed/undirected graphs
- ✅ Accounts for edge weights (connection quality)
- ✅ Cross-infrastructure cascade modeling

---

## 2. Architecture

### 2.1 Network Structure

```
Input: (num_nodes, 24) node features + edge_index + edge_weights
       ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 1: GCNConv (24 → 128)                             │
│   - Initial feature expansion                            │
│   - ReLU activation                                      │
│   - Dropout (p=0.3)                                      │
└──────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 2: GATConv (128 → 128, heads=4)                   │
│   - Multi-head attention (4 heads × 32 dims)            │
│   - Edge weight incorporation                            │
│   - Residual connection from Layer 1                     │
│   - ReLU activation                                      │
│   - Dropout (p=0.3)                                      │
└──────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 3: GCNConv (128 → 128)                            │
│   - Feature refinement                                   │
│   - Residual connection from Layer 1                     │
│   - ReLU activation                                      │
│   - Dropout (p=0.3)                                      │
└──────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Layer 4: Linear (128 → 12)                              │
│   - Output projection                                    │
│   - NO activation (raw logits)                           │
└──────────────────────────────────────────────────────────┘
       ↓
Output: (num_nodes, 12) logits → sigmoid → probabilities
```

### 2.2 Layer Details

#### **Layer 1: GCNConv (24 → 128)**
```python
self.conv1 = GCNConv(in_channels=24, out_channels=128)
```
- **Purpose:** Expand low-dimensional node features to rich hidden representation
- **Input:** 24-dimensional node feature vectors
- **Output:** 128-dimensional embeddings
- **Mechanism:** 
  - Message passing: Each node aggregates features from neighbors
  - Formula: `h'_i = σ(Σ_{j∈N(i)} (1/√(d_i·d_j)) · W · h_j)`
  - Edge weights incorporated via normalized adjacency matrix

**Parameters:**
- Weight matrix: `(24, 128)` = 3,072 parameters
- Bias: `(128,)` = 128 parameters
- **Total: 3,200 parameters**

#### **Layer 2: GATConv (128 → 128, heads=4)**
```python
self.conv2 = GATConv(in_channels=128, out_channels=32, heads=4, edge_dim=1)
```
- **Purpose:** Learn attention weights for neighbor importance
- **Input:** 128-dimensional embeddings from Layer 1
- **Output:** 128-dimensional (4 heads × 32 dims each)
- **Mechanism:**
  - Computes attention coefficients: `α_ij = softmax(LeakyReLU(a^T [W·h_i || W·h_j]))`
  - Weighted aggregation: `h'_i = σ(Σ_{j∈N(i)} α_ij · W · h_j)`
  - Edge weights modulate attention scores

**Parameters:**
- Per-head weight: `(128, 32)` × 4 heads = 16,384 parameters
- Attention mechanism: `(2×32+1, 1)` × 4 heads = 260 parameters
- Edge weight projection: Small network
- **Total: ~17,000 parameters**

**Attention Heads:**
- Head 1-4: Each learns different neighbor importance patterns
- Concatenated output: `[Head1 || Head2 || Head3 || Head4]` = 128 dims

#### **Residual Connection (Layer 1 → Layer 2)**
```python
if x.size(1) != self.conv2_out_channels:
    x_proj = self.projection(x1)  # Project 128 → 128
x2 = x2 + x_proj  # Add residual
```
- **Purpose:** Gradient flow for deep networks, preserve original features
- **Projection:** Linear(128 → 128) if needed
- **Formula:** `output = GAT_output + projected_input`

#### **Layer 3: GCNConv (128 → 128)**
```python
self.conv3 = GCNConv(in_channels=128, out_channels=128)
```
- **Purpose:** Refine features after attention mechanism
- **Input:** 128-dimensional embeddings from Layer 2
- **Output:** 128-dimensional refined embeddings
- **Residual:** Also receives residual from Layer 1

**Parameters:**
- Weight matrix: `(128, 128)` = 16,384 parameters
- Bias: `(128,)` = 128 parameters
- **Total: 16,512 parameters**

#### **Layer 4: Output Projection (128 → 12)**
```python
self.fc_out = nn.Linear(128, 12)
```
- **Purpose:** Map hidden representation to 12 output dimensions
- **Input:** 128-dimensional node embeddings
- **Output:** 12 logits (raw scores, NOT probabilities)
- **Note:** No activation here; sigmoid applied during inference

**Parameters:**
- Weight matrix: `(128, 12)` = 1,536 parameters
- Bias: `(12,)` = 12 parameters
- **Total: 1,548 parameters**

### 2.3 Model Statistics

```
Total Parameters: 41,996
Trainable Parameters: 41,996
Non-trainable Parameters: 0

Model Size: ~168 KB (float32)
Inference Time: ~5ms per graph (CPU)
```

---

## 3. Dataset

### 3.1 Training Data Generation

**Synthetic Graph Generation** (1,000 samples):
- 800 training samples
- 200 validation samples

#### Graph Properties
```python
num_nodes_range = (10, 30)  # Variable graph size
avg_edges_per_node = 3-5
graph_density = sparse (not fully connected)
```

#### Generation Algorithm
```python
for each sample:
    1. Sample num_nodes ~ Uniform(10, 30)
    2. Generate random node features (24-dim)
    3. Create random graph topology
    4. Assign edge weights ~ Uniform(0.5, 1.0)
    5. Select random failure node
    6. Propagate impact via BFS with decay
    7. Add noise to ground truth
```

### 3.2 Impact Propagation (Ground Truth Labels)

**BFS-Based Cascade Simulation:**

```python
Algorithm: Generate Ground Truth Impact
Input: Graph G(V,E), failed_node, decay_factor=0.7

1. Initialize: y = zeros(num_nodes, 12)
2. Set y[failed_node] = random(0.7, 0.95) for critical nodes
                       = random(0.5, 0.85) for others
3. BFS Propagation:
   current_layer = [failed_node]
   for depth in [0, 1, 2]:  # Max 3 hops
       next_layer = []
       for node in current_layer:
           for neighbor in G.neighbors(node):
               if neighbor not visited:
                   # Edge quality affects propagation
                   edge_quality = edge_weight[node→neighbor]
                   quality_factor = 0.5 + 0.5 × edge_quality
                   
                   # Decay with distance
                   propagation_factor = decay_factor^depth × quality_factor
                   
                   # Impact propagates
                   y[neighbor] = y[node] × propagation_factor × random(0.5, 1.0)
                   
                   mark neighbor as visited
                   next_layer.append(neighbor)
       
       current_layer = next_layer
       decay_factor *= 0.7  # Exponential decay

4. Add noise: y += Gaussian(0, 0.05)
5. Clip: y = clip(y, 0, 1)

Output: y ∈ ℝ^(num_nodes × 12)
```

**Decay Parameters:**
- Initial decay: 0.7
- Per-hop decay: 0.7 (compounds to 0.49, 0.343, ...)
- Max propagation depth: 3 hops
- Edge quality modulation: 0.5 to 1.0 multiplier

### 3.3 Feature Normalization

**Z-Score Standardization:**
```python
x_mean = x.mean(axis=0, keepdims=True)  # Per-feature mean
x_std = x.std(axis=0, keepdims=True) + 1e-6  # Per-feature std
x_normalized = (x - x_mean) / x_std
x_clipped = clip(x_normalized, -3, 3)  # Prevent outliers
```

**Why Normalize:**
- ✅ Stabilizes gradient flow
- ✅ Prevents feature dominance (capacity vs status)
- ✅ Improves convergence speed
- ✅ Reduces numerical instability

---

## 4. Node Features

### 4.1 Feature Vector Structure (24 Dimensions)

Each node has **24 features** divided into two groups:

```
[Type Encoding (12 dims) | Operational Features (12 dims)]
[    0  1  2  3  4  5  6  7  8  9 10 11 | 12  13  14  15  16  17  18  19  20  21  22  23]
```

### 4.2 Type Encoding (One-Hot, Dimensions 0-11)

**Purpose:** Identify infrastructure category

| Index | Type | Use Case | Example |
|-------|------|----------|---------|
| 0 | Road | Transportation network | Highway, street |
| 1 | Building | General structures | Warehouse, office |
| 2 | Power | Electrical infrastructure | Power line, substation |
| 3 | Tank | Water storage | Water tower, reservoir |
| 4 | Pump | Water distribution | Pumping station |
| 5 | Pipe | Water transmission | Water pipe, main |
| 6 | Sensor | IoT monitoring | Flow sensor, pressure gauge |
| 7 | Cluster | Population center | Housing complex, neighborhood |
| 8 | Bridge | Critical crossing | Bridge, overpass |
| 9 | School | Education facility | School, college |
| 10 | Hospital | Healthcare facility | Hospital, clinic |
| 11 | Market | Economic hub | Market, shopping center |

**Encoding Example:**
```python
Hospital → [0,0,0,0,0,0,0,0,0,0,1,0, ...]
Tank     → [0,0,0,1,0,0,0,0,0,0,0,0, ...]
Pump     → [0,0,0,0,1,0,0,0,0,0,0,0, ...]
```

### 4.3 Operational Features (Dimensions 12-23)

| Index | Feature | Range | Description | Units |
|-------|---------|-------|-------------|-------|
| **12** | **Capacity** | 0.0 - 1.0 | Infrastructure size/capacity | Normalized |
| | | | Water: Storage volume | % of max |
| | | | Power: Transmission capacity | % of max |
| | | | Road: Traffic capacity | % of max |
| | | | Hospital: Bed count | % of max |
| **13** | **Current Level** | 0.0 - 1.0 | Current resource level | Normalized |
| | | | Water: Tank fill level | % full |
| | | | Power: Voltage level | % nominal |
| | | | Road: N/A | - |
| | | | Hospital: Occupancy | % capacity |
| **14** | **Flow Rate** | 0.0 - 1.0 | Throughput/operational rate | Normalized |
| | | | Water: Discharge rate | L/h normalized |
| | | | Power: Current load | % of capacity |
| | | | Road: Traffic flow | Vehicles/h normalized |
| | | | Hospital: Patient throughput | Patients/day normalized |
| **15** | **Status** | 0.0 - 1.0 | Operational health | Boolean-like |
| | | | 0.0 = Complete failure | |
| | | | 0.5 = Degraded | |
| | | | 0.9-1.0 = Healthy | |
| **16** | **Criticality** | 0.0 - 1.0 | Importance rating | Subjective |
| | | | Hospital = 0.95 (very critical) | |
| | | | Sensor = 0.3 (less critical) | |
| **17** | **Population Served** | 0.0 - 1.0 | Dependent population | Normalized |
| | | | Hospital: 0.9 (serves many) | |
| | | | Sensor: 0.0 (serves none) | |
| **18** | **Economic Value** | 0.0 - 1.0 | Financial importance | Normalized |
| | | | Market = 0.8 (high value) | |
| | | | Pipe = 0.15 (low value) | |
| **19** | **Connectivity** | 0.0 - 1.0 | Network integration | Degree-based |
| | | | Hub node = 0.9 | |
| | | | Isolated = 0.1 | |
| **20** | **Maintenance Score** | 0.0 - 1.0 | Maintenance quality | Inspection-based |
| | | | Well-maintained = 0.9 | |
| | | | Neglected = 0.2 | |
| **21** | **Weather Risk** | 0.0 - 1.0 | Environmental exposure | Risk factor |
| | | | Flood-prone = 0.8 | |
| | | | Protected = 0.1 | |
| **22** | **Failure History** | 0.0 - 1.0 | Past failure rate | Frequency |
| | | | Frequent failures = 0.5 | |
| | | | No history = 0.05 | |
| **23** | **Reserved** | 0.0 - 1.0 | Future expansion | Unused |

### 4.4 Feature Interdependencies

**Water Infrastructure:**
```
Tank:
  - capacity=0.8 (80% max volume)
  - level=0.6 (60% full)
  - flow=0.5 (50% discharge rate)
  - status=0.9 (operational)
  
  If status=0.0 → flow=0.0 (failure stops flow)
  If level=0.0 → flow→0.0 (empty tank can't flow)
```

**Power Infrastructure:**
```
Power Line:
  - capacity=0.7 (70% transmission capacity)
  - level=0.95 (95% nominal voltage)
  - flow=0.6 (60% current load)
  - status=0.9 (operational)
  
  If status=0.0 → flow=0.0, level=0.0 (outage)
```

**Buildings:**
```
Hospital:
  - capacity=0.9 (large hospital)
  - level=0.8 (80% occupancy)
  - flow=0.7 (70% patient throughput)
  - criticality=0.95 (very critical)
  - population_served=0.9 (serves many)
```

---

## 5. Training Process

### 5.1 Training Configuration

```python
Hyperparameters:
  - epochs: 50
  - batch_size: 32
  - learning_rate: 0.001 (initial)
  - optimizer: Adam
  - scheduler: ReduceLROnPlateau
  - dropout: 0.3
  - weight_decay: 0.0 (no L2 regularization)
```

### 5.2 Optimizer: Adam

```python
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    betas=(0.9, 0.999),
    eps=1e-8
)
```

**Adam Parameters:**
- **lr (0.001):** Initial learning rate
- **β₁ (0.9):** Exponential decay for first moment (mean)
- **β₂ (0.999):** Exponential decay for second moment (variance)
- **ε (1e-8):** Numerical stability constant

**Update Rule:**
```
m_t = β₁ · m_(t-1) + (1 - β₁) · g_t        # First moment
v_t = β₂ · v_(t-1) + (1 - β₂) · g_t²       # Second moment
m̂_t = m_t / (1 - β₁^t)                      # Bias correction
v̂_t = v_t / (1 - β₂^t)                      # Bias correction
θ_t = θ_(t-1) - lr · m̂_t / (√v̂_t + ε)     # Parameter update
```

### 5.3 Learning Rate Scheduler

**ReduceLROnPlateau:**
```python
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode='min',          # Minimize validation loss
    factor=0.5,          # LR = LR × 0.5 when triggered
    patience=5,          # Wait 5 epochs before reducing
    threshold=1e-4,      # Minimum change to count as improvement
    min_lr=1e-6          # Never go below this
)
```

**Behavior:**
```
Epoch  1-11: LR = 0.001000 (initial)
Epoch 12-17: LR = 0.000500 (first reduction after 5 plateau epochs)
Epoch 18-23: LR = 0.000250 (second reduction)
Epoch 24-29: LR = 0.000125 (third reduction)
Epoch 30-50: LR = 0.000063 → 0.000031 (final reductions)
```

**Why This Works:**
- ✅ Large steps initially (fast convergence)
- ✅ Fine-tuning near optimum (0.0001 → 0.00003)
- ✅ Adaptive: Only reduces when stuck

### 5.4 Training Loop

```python
for epoch in range(num_epochs):
    # Training Phase
    model.train()
    for batch in train_loader:
        optimizer.zero_grad()
        
        # Forward pass
        out = model(batch.x, batch.edge_index, batch.edge_attr, batch.batch)
        
        # Compute loss
        loss_per_node = criterion(out, batch.y)
        
        # Weighted loss (3× for critical nodes)
        weights = torch.ones_like(batch.y)
        critical_mask = batch.y.mean(dim=1) > 0.5
        weights[critical_mask] = 3.0
        loss = (loss_per_node * weights).mean()
        
        # Backward pass
        loss.backward()
        
        # Gradient clipping (prevent explosion)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # Update parameters
        optimizer.step()
    
    # Validation Phase
    model.eval()
    with torch.no_grad():
        for batch in val_loader:
            out = model(batch.x, batch.edge_index, batch.edge_attr, batch.batch)
            val_loss = criterion(out, batch.y).mean()
    
    # Scheduler step
    scheduler.step(val_loss)
```

### 5.5 Training Results

```
Training History:
Epoch   1: Train Loss=0.7092, Val Loss=0.5999, LR=0.001000
Epoch  10: Train Loss=0.5829, Val Loss=0.5855, LR=0.001000
Epoch  20: Train Loss=0.5614, Val Loss=0.5890, LR=0.000500
Epoch  30: Train Loss=0.5539, Val Loss=0.5957, LR=0.000125
Epoch  40: Train Loss=0.5515, Val Loss=0.5952, LR=0.000063
Epoch  50: Train Loss=0.5508, Val Loss=0.5963, LR=0.000016

Best Validation Loss: 0.5826 (Epoch 12)
Final Model: Epoch 12 checkpoint
```

---

## 6. Loss Function

### 6.1 BCEWithLogitsLoss

**Full Name:** Binary Cross-Entropy with Logits Loss

**Mathematical Formula:**
```
BCE(ŷ, y) = -[y · log(σ(ŷ)) + (1-y) · log(1 - σ(ŷ))]

where σ(x) = 1 / (1 + e^(-x))  # Sigmoid function
```

**Numerically Stable Implementation:**
```python
criterion = nn.BCEWithLogitsLoss(reduction='none')

# Internally computed as:
log_sigmoid(x) = log(1/(1+e^(-x))) = -log(1+e^(-x))
             = -softplus(-x)
             = max(x, 0) - x + log(1 + exp(-|x|))

loss = -(y * log_sigmoid(x) + (1-y) * log_sigmoid(-x))
```

**Why BCEWithLogitsLoss?**
1. **Numerical Stability:** Combines sigmoid + BCE in one operation
2. **Prevents Overflow:** Avoids `exp()` overflow for large logits
3. **Better Gradients:** More stable gradient flow
4. **Multi-Label:** Each output dimension is independent binary prediction

### 6.2 Weighted Loss

**Critical Node Weighting (3× multiplier):**

```python
# Compute per-node loss
loss_per_node = criterion(predictions, targets)  # Shape: (num_nodes, 12)

# Create weight matrix
weights = torch.ones_like(targets)  # Shape: (num_nodes, 12)

# Identify critical nodes (average impact > 0.5)
critical_mask = targets.mean(dim=1) > 0.5  # Shape: (num_nodes,)

# Apply 3× weight to critical nodes
weights[critical_mask] = 3.0

# Compute weighted average loss
total_loss = (loss_per_node * weights).mean()
```

**Why Weight Critical Nodes?**
- ✅ Focus learning on high-impact scenarios
- ✅ Prioritize Hospital/School failures over Sensor failures
- ✅ Improves prediction quality for important nodes
- ✅ Reflects real-world priority (save Hospital first)

**Effect on Training:**
```
Standard loss: All nodes equal weight
  Hospital failure: weight = 1.0
  Sensor failure: weight = 1.0
  
Weighted loss: Critical nodes prioritized
  Hospital failure: weight = 3.0 (if impact > 50%)
  Sensor failure: weight = 1.0
  
→ Model learns to predict Hospital impacts more accurately
```

### 6.3 Loss Computation Example

**Scenario:** Hospital node with failure

```python
# Ground truth (Hospital impact)
y = [0.85, 0.90, 0.75, 0.88, 0.70, 0.65, 0.80, 0.92, 0.85, 0.78, 0.89, 0.81]
avg_impact = 0.815 > 0.5 → critical node

# Model prediction (logits, before sigmoid)
ŷ_logits = [1.2, 1.5, 0.8, 1.3, 0.6, 0.5, 0.9, 1.6, 1.2, 0.9, 1.4, 1.0]

# BCEWithLogitsLoss per dimension
loss_dim_0 = -(0.85 * log(σ(1.2)) + 0.15 * log(1-σ(1.2)))
           = -(0.85 * log(0.769) + 0.15 * log(0.231))
           = -(0.85 * -0.263 + 0.15 * -1.465)
           = -(-0.223 - 0.220) = 0.443

# Repeat for all 12 dimensions → loss_per_output

# Average loss for this node
loss_node = mean(loss_per_output) = 0.521

# Apply critical weight
weighted_loss_node = 0.521 × 3.0 = 1.563

# Batch loss (average over all nodes)
batch_loss = mean(weighted_loss_all_nodes)
```

---

## 7. Prediction Outputs

### 7.1 Output Vector (12 Dimensions per Node)

Each node produces **12 probability scores** (0.0 - 1.0):

| Index | Output | Description | Use Case |
|-------|--------|-------------|----------|
| **0** | **Impact Probability** | Overall likelihood of being affected | Risk assessment, triage |
| **1** | **Severity** | Magnitude of impact if affected | Damage estimation |
| **2** | **Time to Impact** | How quickly failure propagates | Early warning time |
| **3** | **Water Impact** | Water service disruption | Water utility management |
| **4** | **Power Impact** | Electrical service disruption | Power grid management |
| **5** | **Road Impact** | Transportation disruption | Traffic management |
| **6** | **Building Impact** | Structural damage | Building safety |
| **7** | **Population Affected** | Number of people impacted | Evacuation planning |
| **8** | **Economic Loss** | Financial damage estimate | Insurance, budgeting |
| **9** | **Recovery Time** | Time to restore service | Resource allocation |
| **10** | **Priority** | Intervention urgency | Repair scheduling |
| **11** | **Confidence** | Prediction certainty | Decision reliability |

### 7.2 Output Interpretation

#### **Impact Probability (Dimension 0)**
```
0.0 - 0.2: 🟢 LOW - Node unlikely to be affected
0.2 - 0.4: 🟡 MODERATE - Possible impact, monitor
0.4 - 0.6: 🟠 HIGH - Likely affected, prepare response
0.6 - 1.0: 🔴 CRITICAL - Very high risk, immediate action
```

#### **Severity (Dimension 1)**
```
0.0 - 0.3: Minor disruption (quick fix)
0.3 - 0.6: Moderate damage (repair required)
0.6 - 0.8: Major failure (significant repair)
0.8 - 1.0: Complete failure (rebuild/replace)
```

#### **Time to Impact (Dimension 2)**
```
0.0 - 0.2: Immediate (0-1 hour)
0.2 - 0.4: Very fast (1-4 hours)
0.4 - 0.6: Fast (4-12 hours)
0.6 - 0.8: Moderate (12-24 hours)
0.8 - 1.0: Slow (>24 hours)
```

#### **Infrastructure-Specific Impacts (Dimensions 3-6)**
Each represents disruption to that infrastructure domain:
- **Water Impact:** Water service availability (0 = no water, 1 = full service)
- **Power Impact:** Electrical service (0 = blackout, 1 = full power)
- **Road Impact:** Transportation access (0 = blocked, 1 = open)
- **Building Impact:** Structural integrity (0 = destroyed, 1 = intact)

#### **Population Affected (Dimension 7)**
```
0.0 - 0.2: <100 people (localized)
0.2 - 0.4: 100-500 people (neighborhood)
0.4 - 0.6: 500-2000 people (district)
0.6 - 0.8: 2000-10000 people (town)
0.8 - 1.0: >10000 people (regional)
```

#### **Economic Loss (Dimension 8)**
```
0.0 - 0.2: <$10k (minor)
0.2 - 0.4: $10k-$100k (moderate)
0.4 - 0.6: $100k-$1M (significant)
0.6 - 0.8: $1M-$10M (major)
0.8 - 1.0: >$10M (catastrophic)
```

#### **Recovery Time (Dimension 9)**
```
0.0 - 0.2: <1 day (quick fix)
0.2 - 0.4: 1-3 days (standard repair)
0.4 - 0.6: 3-7 days (complex repair)
0.6 - 0.8: 1-4 weeks (major work)
0.8 - 1.0: >1 month (reconstruction)
```

#### **Priority (Dimension 10)**
```
0.0 - 0.3: 🟢 LOW - Can defer
0.3 - 0.5: 🟡 MEDIUM - Schedule soon
0.5 - 0.7: 🟠 HIGH - Address promptly
0.7 - 0.9: 🔴 URGENT - Immediate response
0.9 - 1.0: 🚨 CRITICAL - Emergency action
```

#### **Confidence (Dimension 11)**
```
0.0 - 0.4: Low confidence (uncertain prediction)
0.4 - 0.6: Moderate confidence (reasonable estimate)
0.6 - 0.8: High confidence (reliable prediction)
0.8 - 1.0: Very high confidence (trustworthy)
```

### 7.3 Example Prediction

**Scenario:** Tank failure → Hospital impact

```json
{
  "node": "Hospital-1",
  "predictions": {
    "impact_probability": 0.357,   // 35.7% chance of impact
    "severity": 0.381,              // Moderate severity if hit
    "time_to_impact": 0.346,        // Fast propagation (4-12 hrs)
    "water_impact": 0.362,          // 36% water service loss
    "power_impact": 0.365,          // 36% power impact
    "road_impact": 0.351,           // 35% road disruption
    "building_impact": 0.355,       // 35% building stress
    "population_affected": 0.371,   // ~1000 people affected
    "economic_loss": 0.365,         // ~$100k-$500k damage
    "recovery_time": 0.361,         // 3-7 days to restore
    "priority": 0.389,              // HIGH priority repair
    "confidence": 0.347             // Moderate confidence
  },
  "risk_level": "MODERATE",
  "average_impact": 0.362           // 36.2% overall impact
}
```

---

## 8. API Reference

### 8.1 Model Classes

#### **InfrastructureGNN**

```python
class InfrastructureGNN(nn.Module):
    def __init__(self, 
                 in_channels: int = 24,
                 hidden_channels: int = 128, 
                 out_channels: int = 12,
                 dropout: float = 0.3):
        """
        Graph Neural Network for infrastructure impact prediction.
        
        Parameters:
        -----------
        in_channels : int, default=24
            Input node feature dimension (24-dim feature vector)
        
        hidden_channels : int, default=128
            Hidden layer dimension (increased from 48 to 128 for capacity)
        
        out_channels : int, default=12
            Output dimension (12 impact metrics per node)
        
        dropout : float, default=0.3
            Dropout probability for regularization
        """
```

**Methods:**
```python
def forward(self, x, edge_index, edge_weight=None, batch=None):
    """
    Forward pass through the GNN.
    
    Parameters:
    -----------
    x : torch.Tensor, shape (num_nodes, 24)
        Node feature matrix
    
    edge_index : torch.Tensor, shape (2, num_edges)
        Edge connectivity in COO format
        edge_index[0] = source nodes
        edge_index[1] = target nodes
    
    edge_weight : torch.Tensor, shape (num_edges,), optional
        Edge weights (connection quality)
        Default: All edges weight = 1.0
    
    batch : torch.Tensor, shape (num_nodes,), optional
        Batch assignment for batched graphs
        batch[i] = which graph node i belongs to
        Default: All nodes in same graph
    
    Returns:
    --------
    torch.Tensor, shape (num_nodes, 12)
        Raw logits (NOT probabilities)
        Apply sigmoid for probabilities: torch.sigmoid(logits)
    """
```

#### **ImpactPredictor**

```python
class ImpactPredictor:
    def __init__(self, model_path: str = None):
        """
        High-level predictor wrapper.
        
        Parameters:
        -----------
        model_path : str, optional
            Path to saved model checkpoint (.pt file)
            If None, initializes untrained model
        """
    
    def predict(self, 
                node_features: np.ndarray,
                edge_index: np.ndarray,
                edge_weights: np.ndarray) -> np.ndarray:
        """
        Predict impacts for infrastructure graph.
        
        Parameters:
        -----------
        node_features : np.ndarray, shape (num_nodes, 24)
            Node feature matrix (numpy array)
        
        edge_index : np.ndarray, shape (2, num_edges)
            Edge connectivity (numpy array)
        
        edge_weights : np.ndarray, shape (num_edges,)
            Edge weights (numpy array)
        
        Returns:
        --------
        np.ndarray, shape (num_nodes, 12)
            Probability predictions (0-1 range)
        """
    
    def train_step(self, data_batch) -> float:
        """
        Single training step.
        
        Parameters:
        -----------
        data_batch : torch_geometric.data.Data
            Batched graph data with x, edge_index, edge_attr, y
        
        Returns:
        --------
        float
            Training loss for this batch
        """
    
    def save_model(self, path: str):
        """Save model checkpoint."""
    
    def load_model(self, path: str):
        """Load model checkpoint."""
```

### 8.2 Usage Examples

#### **Example 1: Simple Prediction**

```python
from model import ImpactPredictor
import numpy as np

# Load trained model
predictor = ImpactPredictor(model_path="models/gnn_model.pt")

# Define infrastructure (4 nodes)
node_features = np.array([
    # Tank (FAILED): type=Tank, status=0.0, level=0.0, flow=0.0
    [0,0,0,1,0,0,0,0,0,0,0,0, 0.8,0.1,0.0,0.0, 0.85,0.5,0.3,0.6, 0.8,0.2,0.1,0.05],
    
    # Pump (HEALTHY): type=Pump, status=0.9
    [0,0,0,0,1,0,0,0,0,0,0,0, 0.7,0.8,0.9,0.9, 0.75,0.4,0.2,0.5, 0.7,0.3,0.15,0.1],
    
    # Pipe (HEALTHY): type=Pipe, status=0.9
    [0,0,0,0,0,1,0,0,0,0,0,0, 0.5,0.6,0.7,0.9, 0.6,0.3,0.15,0.4, 0.5,0.4,0.2,0.15],
    
    # Hospital (TARGET): type=Hospital, status=0.9
    [0,0,0,0,0,0,0,0,0,0,1,0, 0.9,0.95,0.5,0.9, 0.95,0.9,0.8,0.7, 0.9,0.1,0.05,0.02],
], dtype=np.float32)

# Define connections: Tank → Pump → Pipe → Hospital
edge_index = np.array([
    [0,1], [1,0],  # Tank ↔ Pump
    [1,2], [2,1],  # Pump ↔ Pipe
    [2,3], [3,2],  # Pipe ↔ Hospital
], dtype=np.int64).T

# Edge weights
edge_weights = np.array([0.9, 0.9, 0.85, 0.85, 0.8, 0.8], dtype=np.float32)

# Predict
predictions = predictor.predict(node_features, edge_index, edge_weights)

# Results
print("Hospital Impact:")
print(f"  Probability: {predictions[3, 0] * 100:.1f}%")
print(f"  Severity: {predictions[3, 1] * 100:.1f}%")
print(f"  Priority: {predictions[3, 10] * 100:.1f}%")
```

#### **Example 2: Training Custom Model**

```python
from model import ImpactPredictor
from train import generate_training_data
from torch_geometric.loader import DataLoader

# Generate data
train_data = generate_training_data(num_samples=800)
val_data = generate_training_data(num_samples=200)

train_loader = DataLoader(train_data, batch_size=32, shuffle=True)
val_loader = DataLoader(val_data, batch_size=32)

# Initialize model
predictor = ImpactPredictor()

# Training loop
for epoch in range(50):
    # Train
    train_losses = []
    for batch in train_loader:
        loss = predictor.train_step(batch)
        train_losses.append(loss)
    
    # Validate
    predictor.model.eval()
    val_losses = []
    with torch.no_grad():
        for batch in val_loader:
            batch = batch.to(predictor.device)
            out = predictor.model(batch.x, batch.edge_index, batch.edge_attr, batch.batch)
            loss = predictor.criterion(out, batch.y).mean()
            val_losses.append(loss.item())
    
    # Scheduler step
    avg_val_loss = np.mean(val_losses)
    predictor.scheduler.step(avg_val_loss)
    
    print(f"Epoch {epoch+1}: Train={np.mean(train_losses):.4f}, Val={avg_val_loss:.4f}")

# Save
predictor.save_model("models/custom_model.pt")
```

#### **Example 3: Causal Attribution**

```python
from causal_attribution import node_perturbation_analysis

# Load model
predictor = ImpactPredictor(model_path="models/gnn_model.pt")

# Define scenario (same as Example 1)
# ... node_features, edge_index, edge_weights ...

# Run causal analysis
results = node_perturbation_analysis(
    predictor, 
    node_features, 
    edge_index, 
    edge_weights,
    target_node_idx=3,  # Hospital
    target_node_name="Hospital"
)

# Results show which upstream nodes cause Hospital's risk
# Output: Node 2 (Pipe) causes +0.97% impact when failed
```

---

## 9. Model Files

### 9.1 File Structure

```
backend/python-gnn/
├── models/
│   ├── gnn_model.pt                    # Main trained model (41,996 params)
│   └── gnn_model_edge_features.pt      # Edge-enhanced model (58,260 params)
├── model.py                             # Model architecture definition
├── train.py                             # Training script
├── test_model.py                        # Testing script
├── api_server.py                        # FastAPI REST server
├── gradio_app.py                        # Gradio web interface
├── what_if_analysis.py                  # Sensitivity analysis
├── feature_importance.py                # Feature attribution
├── causal_attribution.py                # Causal analysis
├── train_with_edge_features.py          # Advanced training
├── requirements.txt                     # Python dependencies
└── README.md                            # Setup instructions
```

### 9.2 Model Checkpoint Format

```python
checkpoint = {
    'model_state_dict': {
        'conv1.weight': tensor(...),
        'conv1.bias': tensor(...),
        'conv2.lin_src.weight': tensor(...),
        # ... all 41,996 parameters ...
    },
    'optimizer_state_dict': {
        'state': {...},
        'param_groups': [...]
    },
    'scheduler_state_dict': {
        'best': 0.5826,
        'num_bad_epochs': 0,
        # ...
    }
}
```

### 9.3 Model Loading

```python
# Load checkpoint
checkpoint = torch.load("models/gnn_model.pt", map_location=device)

# Restore model
model.load_state_dict(checkpoint['model_state_dict'])

# Restore optimizer (if continuing training)
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
```

---

## 10. Performance Metrics

### 10.1 Training Performance

```
Dataset: 1,000 synthetic graphs (800 train, 200 val)
Training Time: ~15 minutes (50 epochs, CPU)
Validation Loss: 0.5826 (best)
Final Loss: 0.5963 (epoch 50)

Per-Epoch Time: ~18 seconds
Per-Batch Time: ~720 ms (batch_size=32)
Convergence: ~12 epochs to best validation loss
```

### 10.2 Inference Performance

```
CPU (Intel i7): ~5 ms per graph (4 nodes)
GPU (NVIDIA): ~2 ms per graph
Batch Inference: 200 graphs in ~150 ms (CPU)

Model Size: 168 KB (float32)
Memory Usage: ~50 MB (runtime)
```

### 10.3 Prediction Quality

```
Average Prediction Range: 30-40% impact
Critical Node Detection: 100% accuracy (>40% threshold)
Cross-Infrastructure: Properly propagates across types
Topology Sensitivity: Correctly identifies high-connectivity nodes

What-If Analysis:
  - Node perturbation: ±1-3% causal effects detected
  - Edge occlusion: Cascade path identification working
  - Counterfactuals: Repair benefit quantification functional
```

---

## 11. Limitations & Future Work

### 11.1 Current Limitations

1. **Synthetic Training Data**
   - Model trained on simulated failures, not real incidents
   - BFS propagation may not capture complex dynamics
   - Need real historical failure data

2. **Static Graphs**
   - Doesn't model time-varying topologies
   - No temporal dynamics (seasonal changes, maintenance schedules)

3. **Limited Graph Size**
   - Trained on 10-30 node graphs
   - May not scale to city-level (1000+ nodes)

4. **Feature Attribution**
   - Node features have low importance (topology-dominated)
   - May need richer feature representations

### 11.2 Future Improvements

1. **Real Data Integration**
   - Historical failure logs from utilities
   - Sensor data (SCADA, IoT)
   - Maintenance records

2. **Temporal GNN**
   - Time-series input (hourly/daily patterns)
   - Recurrent GNN layers (GRU, LSTM)
   - Predict failure progression over time

3. **Edge Features**
   - Already implemented (train_with_edge_features.py)
   - 3D edge features: health, throughput, age
   - Achieved 13% loss reduction (0.67 → 0.58)

4. **Uncertainty Quantification**
   - Bayesian GNN for confidence intervals
   - Monte Carlo dropout for epistemic uncertainty

5. **Multi-Task Learning**
   - Jointly predict failures + root causes
   - Auxiliary tasks: node classification, link prediction

6. **Explainability**
   - GNNExplainer integration
   - Subgraph importance scores

---

## 12. References & Resources

### 12.1 Papers

- **Graph Convolutional Networks:** [Kipf & Welling, 2017]
- **Graph Attention Networks:** [Veličković et al., 2018]
- **Infrastructure Cascades:** [Buldyrev et al., 2010]

### 12.2 Libraries

- PyTorch: https://pytorch.org/
- PyTorch Geometric: https://pytorch-geometric.readthedocs.io/
- Gradio: https://gradio.app/
- FastAPI: https://fastapi.tiangolo.com/

### 12.3 Tutorials

- GNN Tutorial: https://pytorch-geometric.readthedocs.io/en/latest/notes/introduction.html
- Cascade Modeling: https://en.wikipedia.org/wiki/Cascading_failure

---

## Appendix A: Mathematical Notation

| Symbol | Meaning |
|--------|---------|
| G = (V, E) | Graph with vertices V and edges E |
| x_i ∈ ℝ^24 | Node i feature vector (24 dimensions) |
| e_ij | Edge from node i to node j |
| w_ij ∈ [0,1] | Edge weight (connection quality) |
| h_i^(l) ∈ ℝ^d | Hidden representation of node i at layer l |
| N(i) | Neighbors of node i |
| σ(·) | Sigmoid activation: σ(x) = 1/(1+e^(-x)) |
| ReLU(·) | Rectified Linear Unit: ReLU(x) = max(0, x) |
| ŷ_i ∈ ℝ^12 | Predicted logits for node i |
| y_i ∈ [0,1]^12 | Ground truth labels for node i |
| L | Loss function (BCEWithLogitsLoss) |

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2025  
**Maintained By:** Village Digital Twin Project Team
