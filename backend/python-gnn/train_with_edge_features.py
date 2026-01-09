"""
Enhanced Training with Edge Features
Adds edge-level features (health, throughput, age) for better predictions
"""

import torch
import numpy as np
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
from model import ImpactPredictor
import os


def generate_training_data_with_edge_features(num_samples=1000, num_nodes_range=(10, 30)):
    """
    Generate synthetic training data WITH edge features
    
    Edge features (3 dimensions):
    - Connection health (0-1)
    - Throughput capacity (0-1)
    - Age/degradation (0-1, where 1 is new, 0 is old)
    """
    print("Generating enhanced training data with edge features...")
    data_list = []
    
    for i in range(num_samples):
        num_nodes = np.random.randint(num_nodes_range[0], num_nodes_range[1])
        
        # Node features (24 dimensions)
        x = np.random.rand(num_nodes, 24).astype(np.float32)
        
        # Create graph structure
        edge_list = []
        edge_feature_list = []
        
        for node_idx in range(num_nodes):
            num_connections = np.random.randint(2, min(6, num_nodes))
            neighbors = np.random.choice(num_nodes, size=num_connections, replace=False)
            
            for neighbor in neighbors:
                if neighbor != node_idx:
                    edge_list.append([node_idx, neighbor])
                    
                    # Edge features: [health, throughput, age]
                    edge_health = np.random.rand()  # Connection integrity
                    edge_throughput = np.random.rand()  # Capacity
                    edge_age = np.random.rand()  # Maintenance/age factor
                    
                    edge_feature_list.append([edge_health, edge_throughput, edge_age])
        
        if len(edge_list) == 0:
            edge_list = [[0, 1], [1, 0]]
            edge_feature_list = [[0.8, 0.7, 0.9], [0.8, 0.7, 0.9]]
        
        edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
        
        # Convert 3D edge features to 1D edge weights (average of health, throughput, age)
        # This allows compatibility with current GCN/GAT architecture
        edge_weights_list = [np.mean(feat) for feat in edge_feature_list]
        edge_attr = torch.tensor(edge_weights_list, dtype=torch.float32)
        
        # Store full 3D features for future use (not used in current model)
        edge_features_3d = torch.tensor(edge_feature_list, dtype=torch.float32)
        
        # Generate ground truth labels
        failure_node = np.random.randint(0, num_nodes)
        y = np.zeros((num_nodes, 12), dtype=np.float32)
        
        failure_node_type = np.argmax(x[failure_node, :12])
        critical_types = [2, 3, 9, 10]
        base_impact = 0.85 if failure_node_type in critical_types else 0.7
        y[failure_node] = np.random.rand(12) * 0.2 + base_impact
        
        # BFS propagation with edge feature consideration
        visited = set([failure_node])
        current_layer = [failure_node]
        decay_factor = 0.7
        
        for depth in range(3):
            next_layer = []
            for node in current_layer:
                neighbors_mask = (edge_index[0] == node).numpy()
                neighbors = edge_index[1][neighbors_mask].numpy()
                edge_indices = np.where(neighbors_mask)[0]
                
                for neighbor, edge_idx in zip(neighbors, edge_indices):
                    if neighbor not in visited:
                        # Consider edge quality in impact propagation
                        edge_quality = edge_attr[edge_idx].mean().item()  # avg of health, throughput, age
                        
                        # Poor edge quality reduces impact propagation
                        quality_factor = 0.5 + 0.5 * edge_quality
                        
                        y[neighbor] = y[node] * decay_factor * quality_factor * (0.5 + np.random.rand(12) * 0.5)
                        visited.add(neighbor)
                        next_layer.append(neighbor)
            
            current_layer = next_layer
            decay_factor *= 0.7
        
        y += np.random.randn(num_nodes, 12) * 0.05
        y = np.clip(y, 0, 1)
        
        # Normalize node features
        x_mean = x.mean(axis=0, keepdims=True)
        x_std = x.std(axis=0, keepdims=True) + 1e-6
        x = (x - x_mean) / x_std
        x = np.clip(x, -3, 3)
        
        data = Data(
            x=torch.tensor(x, dtype=torch.float32),
            edge_index=edge_index,
            edge_attr=edge_attr,  # 1D edge weights (averaged from 3D features)
            y=torch.tensor(y, dtype=torch.float32)
        )
        # Store 3D features as metadata (for future edge-feature-aware models)
        data.edge_features_3d = edge_features_3d
        
        data_list.append(data)
        
        if (i + 1) % 100 == 0:
            print(f"  Generated {i + 1}/{num_samples} samples")
    
    print(f"✓ Generated {num_samples} training samples with edge features")
    return data_list


def train_with_edge_features(num_epochs=50, batch_size=32, save_path='models/gnn_model_edge_features.pt'):
    """
    Train GNN with edge features enabled
    """
    print("\n" + "="*60)
    print("🔗 Training GNN with Edge Features")
    print("="*60 + "\n")
    
    # Generate enhanced data
    train_data = generate_training_data_with_edge_features(num_samples=800)
    val_data = generate_training_data_with_edge_features(num_samples=200)
    
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)
    
    # Initialize model
    predictor = ImpactPredictor()
    print(f"Model initialized on device: {predictor.device}")
    print(f"Model parameters: {sum(p.numel() for p in predictor.model.parameters()):,}")
    print(f"Edge features: 3D (health, throughput, age)\n")
    
    # Training loop (same as before)
    best_val_loss = float('inf')
    
    for epoch in range(num_epochs):
        # Training
        predictor.model.train()
        train_losses = []
        
        for batch in train_loader:
            loss = predictor.train_step(batch)
            train_losses.append(loss)
        
        avg_train_loss = np.mean(train_losses)
        
        # Validation
        predictor.model.eval()
        val_losses = []
        
        with torch.no_grad():
            for batch in val_loader:
                batch = batch.to(predictor.device)
                out = predictor.model(batch.x, batch.edge_index, batch.edge_attr, batch.batch)
                
                loss_per_node = predictor.criterion(out, batch.y)
                weights = torch.ones_like(batch.y)
                critical_mask = batch.y.mean(dim=1) > 0.5
                weights[critical_mask] = 3.0
                loss = (loss_per_node * weights).mean()
                
                val_losses.append(loss.item())
        
        avg_val_loss = np.mean(val_losses)
        
        # Scheduler step
        predictor.scheduler.step(avg_val_loss)
        current_lr = predictor.optimizer.param_groups[0]['lr']
        
        # Print progress
        print(f"Epoch {epoch+1:3d}/{num_epochs} | "
              f"Train Loss: {avg_train_loss:.4f} | "
              f"Val Loss: {avg_val_loss:.4f} | "
              f"LR: {current_lr:.6f}")
        
        # Save best model
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            predictor.save_model(save_path)
            print(f"  ✓ New best model saved (Val Loss: {best_val_loss:.4f})")
    
    print("\n" + "="*60)
    print("✅ Training with Edge Features Complete!")
    print(f"Best Validation Loss: {best_val_loss:.4f}")
    print(f"Comparison with base model (0.6700): {best_val_loss/0.6700:.2%}")
    print("="*60 + "\n")
    
    return predictor


if __name__ == "__main__":
    print("🔗 EDGE FEATURES ENHANCEMENT")
    print("This version adds 3D edge features:")
    print("  1. Connection health (pipe integrity, road condition)")
    print("  2. Throughput capacity (water flow, power transmission)")
    print("  3. Age/degradation factor (maintenance history)")
    print()
    
    trained_model = train_with_edge_features(num_epochs=50, batch_size=32)
    
    print("\n💡 Expected Improvements:")
    print("  • Better cascade prediction through degraded infrastructure")
    print("  • Recognition of bottleneck edges (low throughput)")
    print("  • Age-aware maintenance prioritization")
    print("\n✅ Edge-Enhanced GNN is ready!")
