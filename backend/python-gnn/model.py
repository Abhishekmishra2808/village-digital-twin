"""
Real Graph Neural Network for Infrastructure Impact Prediction
Uses PyTorch Geometric with actual learnable parameters
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, GATConv, global_mean_pool
from torch_geometric.data import Data, Batch
from torch_geometric.utils import add_self_loops


class FocalLoss(nn.Module):
    """Focal Loss for addressing class imbalance and hard examples"""
    def __init__(self, alpha=0.75, gamma=2.0, pos_weight=None):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.pos_weight = pos_weight
    
    def forward(self, logits, targets):
        bce = F.binary_cross_entropy_with_logits(
            logits, targets, reduction='none', pos_weight=self.pos_weight
        )
        pt = torch.exp(-bce)  # Probability of correct class
        focal_loss = self.alpha * (1 - pt) ** self.gamma * bce
        return focal_loss.mean()


class InfrastructureGNN(nn.Module):
    """
    Real GNN with 4 layers and residual connections
    Architecture:
    - Layer 1 (24→128): Feature expansion with GCN
    - Layer 2 (128→128): Graph Attention + residual from padded input
    - Layer 3 (128→128): GCN + residual from Layer 1
    - Layer 4 (128→12): Output projection
    """
    
    def __init__(self, input_dim=24, hidden_dim=128, output_dim=12, dropout=0.2, status_veto_weight=2.5):
        super(InfrastructureGNN, self).__init__()
        
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        
        # Gated Status Veto: Learned gate controls when status overrides neighborhood
        self.status_veto_weight = status_veto_weight
        
        # Gate network: learns when to trust status signal
        # Takes node embedding and outputs per-dimension gating coefficients
        self.gate_network = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, output_dim),
            nn.Sigmoid()  # Gate values in [0, 1]
        )
        
        # Status signal projector: maps failure severity to impact dimensions
        self.status_projection = nn.Linear(1, output_dim)
        
        # Layer 1: Feature expansion (GCN)
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.bn1 = nn.BatchNorm1d(hidden_dim)
        
        # Layer 2: Graph Attention with multi-head (4 heads for 128 dims)
        self.conv2 = GATConv(hidden_dim, hidden_dim // 4, heads=4, concat=True, dropout=dropout)
        self.bn2 = nn.BatchNorm1d(hidden_dim)
        
        # Layer 3: Another GCN layer
        self.conv3 = GCNConv(hidden_dim, hidden_dim)
        self.bn3 = nn.BatchNorm1d(hidden_dim)
        
        # Layer 4: Output projection
        self.conv4 = GCNConv(hidden_dim, output_dim)
        
        # Projection layer to pad input (24→48) for residual connection
        self.input_projection = nn.Linear(input_dim, hidden_dim)
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, edge_index, edge_weight=None, batch=None):
        """
        Forward pass through the GNN
        
        Args:
            x: Node features [num_nodes, input_dim]
            edge_index: Edge indices [2, num_edges]
            edge_weight: Optional edge weights [num_edges]
            batch: Batch assignment for graph batching
            
        Returns:
            Node-level predictions [num_nodes, output_dim]
        """
        # Add self-loops to handle disconnected nodes
        edge_index, edge_weight = add_self_loops(edge_index, edge_weight, num_nodes=x.size(0))
        
        # Store input for residual connection
        x_input = x
        
        # LAYER 1: Feature expansion (24→48)
        x1 = self.conv1(x, edge_index, edge_weight)
        x1 = self.bn1(x1)
        x1 = F.relu(x1)
        x1 = self.dropout(x1)
        
        # LAYER 2: Graph Attention + residual from padded input (48→48)
        # Project input to match dimensions
        x_input_proj = self.input_projection(x_input)
        x2 = self.conv2(x1, edge_index)
        x2 = self.bn2(x2)
        x2 = F.relu(x2)
        x2 = x2 + x_input_proj  # Residual connection
        x2 = self.dropout(x2)
        
        # LAYER 3: GCN + residual from Layer 1 (48→48)
        x3 = self.conv3(x2, edge_index, edge_weight)
        x3 = self.bn3(x3)
        x3 = F.relu(x3)
        x3 = x3 + x1  # Residual connection from Layer 1
        x3 = self.dropout(x3)
        
        # LAYER 4: Output projection (48→12)
        x_out = self.conv4(x3, edge_index, edge_weight)
        
        # GATED STATUS VETO: Learned skip connection for failure override
        # Architecture: final_logits = gnn_logits + α * failure_flag * gate(embedding) * signal
        
        # Step 1: Extract status feature (index 12 after one-hot type encoding)
        # status = 0.0 (FAILED) or 1.0 (HEALTHY)
        status_feature = x[:, 12:13]  # [num_nodes, 1]
        
        # Step 2: Compute failure flag (binary: 1 = failed, 0 = healthy)
        # This ensures veto only activates for failed nodes
        failure_flag = (status_feature < 0.5).float()  # 1.0 if status < 0.5, else 0.0
        
        # Step 3: Compute learned gate from final node embedding
        # Gate decides HOW MUCH to trust the status signal per output dimension
        # gate ∈ [0, 1]^12 - learned contextual trust in status
        gate = self.gate_network(x3)  # [num_nodes, 12]
        
        # Step 4: Project failure severity to impact space
        # Converts scalar "degree of failure" to 12-dim impact vector
        failure_severity = 1.0 - status_feature  # 1.0 = complete failure, 0.0 = healthy
        status_signal = self.status_projection(failure_severity)  # [num_nodes, 12]
        
        # Step 5: Apply gated veto
        # Only activates for failed nodes (failure_flag=1)
        # Gate modulates strength per dimension based on learned context
        # Alpha scales overall veto strength
        status_contribution = self.status_veto_weight * failure_flag * gate * status_signal
        
        # Step 6: Combine GNN reasoning with gated status veto
        # "I don't care how healthy the neighborhood is — THIS node is FAILED."
        # But only when the gate agrees (learned from data)
        x_out = x_out + status_contribution
        
        # Return raw logits (sigmoid will be applied by BCEWithLogitsLoss or at inference)
        return x_out


class ImpactPredictor:
    """
    Wrapper class for training and inference
    """
    
    def __init__(self, model_path=None, learning_rate=0.001, device=None, 
                 use_focal_loss=False, temperature=1.0, status_veto_weight=2.5):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = device
        
        # Temperature scaling for sharper/softer predictions
        self.temperature = temperature
            
        self.model = InfrastructureGNN(status_veto_weight=status_veto_weight).to(self.device)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate, weight_decay=5e-4)
        
        # Learning rate scheduler - reduces LR when validation loss plateaus
        self.scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=5
        )
        
        # Loss function selection
        if use_focal_loss:
            self.criterion = FocalLoss(alpha=0.75, gamma=2.0, pos_weight=torch.tensor([5.0]))
        else:
            # BCEWithLogitsLoss - more numerically stable than BCELoss + sigmoid
            self.criterion = nn.BCEWithLogitsLoss(reduction='none')  # Manual weighting
        
        if model_path:
            self.load_model(model_path)
    
    def train_step(self, data_batch):
        """Single training step with weighted loss"""
        self.model.train()
        self.optimizer.zero_grad()
        
        # Move data to device
        data_batch = data_batch.to(self.device)
        
        # Forward pass
        out = self.model(data_batch.x, data_batch.edge_index, data_batch.edge_attr, data_batch.batch)
        
        # Compute loss with weighting for critical failures
        loss_per_node = self.criterion(out, data_batch.y)
        
        # Weight critical nodes (avg impact > 0.5) 3x more
        weights = torch.ones_like(data_batch.y)
        critical_mask = data_batch.y.mean(dim=1) > 0.5
        weights[critical_mask] = 3.0
        
        # Apply weights and compute final loss
        weighted_loss = (loss_per_node * weights).mean()
        
        # Backward pass
        weighted_loss.backward()
        self.optimizer.step()
        
        return weighted_loss.item()
    
    def predict(self, x, edge_index, edge_weight=None):
        """
        Predict impact for a single graph (returns probabilities).
        
        Args:
            x: Node features [num_nodes, 24]
            edge_index: Edge connections [2, num_edges]
            edge_weight: Edge weights [num_edges]
            
        Returns:
            Impact probabilities [num_nodes, 12] (values 0.0-1.0)
        """
        self.model.eval()
        
        # Convert to tensors if needed
        if not isinstance(x, torch.Tensor):
            x = torch.tensor(x, dtype=torch.float32)
        if not isinstance(edge_index, torch.Tensor):
            edge_index = torch.tensor(edge_index, dtype=torch.long)
        if edge_weight is not None and not isinstance(edge_weight, torch.Tensor):
            edge_weight = torch.tensor(edge_weight, dtype=torch.float32)
        
        x = x.to(self.device)
        edge_index = edge_index.to(self.device)
        if edge_weight is not None:
            edge_weight = edge_weight.to(self.device)
        
        with torch.no_grad():
            logits = self.model(x, edge_index, edge_weight)
            
            # Apply temperature scaling (T < 1.0 = sharper, T > 1.0 = softer)
            calibrated_logits = logits / self.temperature
            
            # Apply sigmoid to get probabilities (0-1 range)
            probabilities = torch.sigmoid(calibrated_logits)
        
        return probabilities.cpu().numpy()
    
    def predict_with_threshold(self, x, edge_index, edge_weight=None, threshold=0.5):
        """
        Predict impact with inference-time threshold (decision boundary).
        
        ⚠️ CRITICAL: Threshold is applied ONLY at inference, not training!
        The model outputs objective probabilities. The threshold determines
        how we INTERPRET those probabilities for alerts/decisions.
        
        Args:
            x: Node features [num_nodes, 24]
            edge_index: Edge connections [2, num_edges]
            edge_weight: Edge weights [num_edges]
            threshold: Decision boundary (default: 0.5)
                      - Lower (0.3): More sensitive, more alerts
                      - Higher (0.7): Less sensitive, fewer alerts
            
        Returns:
            probabilities: [num_nodes, 12] - Raw probability scores (0-1)
            alerts: [num_nodes, 12] - Boolean alerts (>= threshold)
            risk_level: str - Overall risk assessment
        """
        # Get raw probabilities
        probabilities = self.predict(x, edge_index, edge_weight)
        
        # Apply threshold (inference-time decision boundary)
        alerts = (probabilities >= threshold).astype(int)
        
        # Compute overall risk level based on impact probability (dimension 0)
        impact_probs = probabilities[:, 0]
        max_impact = impact_probs.max()
        
        if max_impact >= 0.7:
            risk_level = "🔴 CRITICAL"
        elif max_impact >= 0.5:
            risk_level = "🟠 HIGH"
        elif max_impact >= 0.3:
            risk_level = "🟡 MODERATE"
        else:
            risk_level = "🟢 LOW"
        
        return probabilities, alerts, risk_level
    
    def set_temperature(self, temperature):
        """
        Adjust temperature scaling for inference.
        
        Args:
            temperature: float
                - T = 1.0: Default (no scaling)
                - T = 0.5: Sharper predictions (crisis mode)
                - T = 0.3: Emergency mode (very sharp)
                - T = 2.0: Softer predictions (conservative)
        """
        self.temperature = temperature
        print(f"🌡️ Temperature set to {temperature:.2f}")
        if temperature < 0.5:
            print("⚠️ Emergency mode: Very sharp predictions")
        elif temperature < 1.0:
            print("🔥 Crisis mode: Sharper predictions")
        elif temperature > 1.0:
            print("❄️ Conservative mode: Softer predictions")
    
    def save_model(self, path):
        """Save model checkpoint"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
        }, path)
        print(f"Model saved to {path}")
    
    def load_model(self, path):
        """Load model checkpoint (handles legacy models without status_veto)"""
        checkpoint = torch.load(path, map_location=self.device)
        
        # Try to load state dict, handling missing keys gracefully
        legacy_mode = False
        try:
            self.model.load_state_dict(checkpoint['model_state_dict'], strict=True)
        except RuntimeError as e:
            error_str = str(e)
            if "status_projection" in error_str or "gate_network" in error_str:
                # Legacy model without gated status veto - load with strict=False
                print("⚠️  Loading legacy model (no gated veto). Loading non-strict...")
                self.model.load_state_dict(checkpoint['model_state_dict'], strict=False)
                print("✅ Loaded legacy model. Gated status veto initialized randomly.")
                print("   ⚠️  WARNING: Gate network needs retraining to be effective!")
                legacy_mode = True
            else:
                raise e
        
        # Skip optimizer/scheduler loading for legacy models (parameter mismatch)
        if not legacy_mode:
            try:
                self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
                if 'scheduler_state_dict' in checkpoint:
                    self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
            except (ValueError, KeyError) as e:
                print(f"⚠️  Skipping optimizer state (parameter mismatch): {e}")
        
        print(f"Model loaded from {path}")
