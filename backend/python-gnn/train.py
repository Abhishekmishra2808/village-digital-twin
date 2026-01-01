"""
Training script for the Infrastructure GNN
Generates synthetic training data and trains the model
"""

import torch
import numpy as np
from torch_geometric.data import Data, DataLoader
from sklearn.preprocessing import StandardScaler
from model import ImpactPredictor
import os


def generate_training_data(num_samples=1000, num_nodes_range=(10, 30)):
    """
    Generate synthetic training data for infrastructure impact prediction
    
    Returns:
        List of PyTorch Geometric Data objects
    """
    print("Generating synthetic training data...")
    data_list = []
    
    for i in range(num_samples):
        # Random number of nodes (infrastructure components)
        num_nodes = np.random.randint(num_nodes_range[0], num_nodes_range[1])
        
        # Random node features (24 dimensions)
        # Features: [type_encoding(12), capacity(1), status(1), criticality(1), 
        #            connectivity(1), maintenance(1), weather_risk(1), failure_history(1), custom(5)]
        x = np.random.rand(num_nodes, 24).astype(np.float32)
        
        # Create a random graph structure (edges)
        # More realistic: each node connects to 2-5 neighbors
        edge_list = []
        for node_idx in range(num_nodes):
            num_connections = np.random.randint(2, min(6, num_nodes))
            neighbors = np.random.choice(num_nodes, size=num_connections, replace=False)
            for neighbor in neighbors:
                if neighbor != node_idx:
                    edge_list.append([node_idx, neighbor])
        
        if len(edge_list) == 0:
            # Ensure at least one edge
            edge_list = [[0, 1], [1, 0]]
        
        edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
        
        # Edge weights (connection strength)
        edge_attr = torch.rand(edge_index.size(1), 1)
        
        # Generate ground truth labels (impact predictions)
        # Simulate: pick a random failure node and propagate impact
        failure_node = np.random.randint(0, num_nodes)
        
        # Initialize impact scores (12 dimensions per node)
        # [probability, severity, time_to_impact, water_impact, power_impact, road_impact,
        #  building_impact, population_affected, economic_loss, recovery_time, priority, confidence]
        y = np.zeros((num_nodes, 12), dtype=np.float32)
        
        # Failure node has maximum impact
        # Critical infrastructure types (hospital, power, tank) have higher base impact
        failure_node_type = np.argmax(x[failure_node, :12])  # Get node type
        critical_types = [2, 3, 9, 10]  # power, tank, hospital indices
        base_impact = 0.85 if failure_node_type in critical_types else 0.7
        y[failure_node] = np.random.rand(12) * 0.2 + base_impact  # High impact (0.7-1.0)
        
        # Propagate impact to connected nodes (BFS-style)
        visited = set([failure_node])
        current_layer = [failure_node]
        decay_factor = 0.7
        
        for depth in range(3):  # Propagate up to 3 hops
            next_layer = []
            for node in current_layer:
                # Find neighbors
                neighbors_mask = (edge_index[0] == node).numpy()
                neighbors = edge_index[1][neighbors_mask].numpy()
                
                for neighbor in neighbors:
                    if neighbor not in visited:
                        # Impact decays with distance
                        y[neighbor] = y[node] * decay_factor * (0.5 + np.random.rand(12) * 0.5)
                        visited.add(neighbor)
                        next_layer.append(neighbor)
            
            current_layer = next_layer
            decay_factor *= 0.7  # Exponential decay
        
        # Add some noise
        y += np.random.randn(num_nodes, 12) * 0.05
        y = np.clip(y, 0, 1)  # Ensure values are in [0, 1]
        
        # Normalize node features for better gradient flow
        # Keep features in 0-1 range but standardize distribution
        x_mean = x.mean(axis=0, keepdims=True)
        x_std = x.std(axis=0, keepdims=True) + 1e-6
        x = (x - x_mean) / x_std
        x = np.clip(x, -3, 3)  # Clip extreme values
        
        # Create PyTorch Geometric Data object
        data = Data(
            x=torch.tensor(x, dtype=torch.float32),
            edge_index=edge_index,
            edge_attr=edge_attr,
            y=torch.tensor(y, dtype=torch.float32)
        )
        
        data_list.append(data)
        
        if (i + 1) % 100 == 0:
            print(f"  Generated {i + 1}/{num_samples} samples")
    
    print(f"✓ Generated {num_samples} training samples")
    return data_list


def train_model(num_epochs=50, batch_size=32, save_path='models/gnn_model.pt'):
    """
    Train the GNN model
    """
    print("\n" + "="*60)
    print("Training Real GNN for Infrastructure Impact Prediction")
    print("="*60 + "\n")
    
    # Generate training data
    train_data = generate_training_data(num_samples=800)
    val_data = generate_training_data(num_samples=200)
    
    # Create data loaders
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)
    
    # Initialize model
    predictor = ImpactPredictor()
    print(f"Model initialized on device: {predictor.device}")
    print(f"Model parameters: {sum(p.numel() for p in predictor.model.parameters()):,}\n")
    
    # Training loop
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
                
                # Compute weighted validation loss
                loss_per_node = predictor.criterion(out, batch.y)
                weights = torch.ones_like(batch.y)
                critical_mask = batch.y.mean(dim=1) > 0.5
                weights[critical_mask] = 3.0
                loss = (loss_per_node * weights).mean()
                
                val_losses.append(loss.item())
        
        avg_val_loss = np.mean(val_losses)
        
        # Update learning rate based on validation loss
        predictor.scheduler.step(avg_val_loss)
        
        # Get current learning rate
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
    print("Training Complete!")
    print(f"Best Validation Loss: {best_val_loss:.4f}")
    print(f"Model saved to: {save_path}")
    print("="*60 + "\n")
    
    return predictor


if __name__ == "__main__":
    # Train the model
    trained_model = train_model(num_epochs=50, batch_size=32)
    
    # Test prediction
    print("\nTesting prediction on a sample graph...")
    
    # Create a test graph
    num_nodes = 15
    x = np.random.rand(num_nodes, 24).astype(np.float32)
    edge_index = []
    for i in range(num_nodes - 1):
        edge_index.append([i, i+1])
        edge_index.append([i+1, i])
    edge_index = np.array(edge_index).T
    
    # Predict
    predictions = trained_model.predict(x, edge_index)
    
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {predictions.shape}")
    print(f"Sample predictions for first 3 nodes:")
    print(predictions[:3])
    print("\n✓ Model is ready for inference!")
