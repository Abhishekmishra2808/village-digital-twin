"""
Real Incident Data Loader for Fine-Tuning
Loads historical infrastructure failures from JSON/CSV files
"""

import torch
import numpy as np
import json
from torch_geometric.data import Data
from typing import List, Dict, Optional


class InfrastructureIncidentLoader:
    """
    Loads real-world infrastructure incidents for fine-tuning.
    
    Expected JSON Format:
    {
        "incident_id": "2024-08-12-pipe-burst",
        "date": "2024-08-12",
        "description": "Water main pipe burst near hospital",
        "nodes": [
            {
                "id": 0,
                "type": "Tank",
                "capacity": 0.8,
                "level": 0.6,
                "flow": 0.5,
                "status": 0.9,
                "criticality": 0.85,
                "population_served": 0.5,
                "economic_value": 0.3,
                "connectivity": 0.6,
                "maintenance_score": 0.8,
                "weather_risk": 0.2,
                "failure_history": 0.1,
                "reserved": 0.05,
                "impacted": 0.15  # Ground truth (0-1 or -1 for unknown)
            },
            ...
        ],
        "edges": [
            {"source": 0, "target": 1, "weight": 0.9},
            {"source": 1, "target": 2, "weight": 0.85},
            ...
        ]
    }
    """
    
    # Infrastructure type mapping
    INFRASTRUCTURE_TYPES = {
        'Road': 0, 'Building': 1, 'Power': 2, 'Tank': 3,
        'Pump': 4, 'Pipe': 5, 'Sensor': 6, 'Cluster': 7,
        'Bridge': 8, 'School': 9, 'Hospital': 10, 'Market': 11
    }
    
    def __init__(self, incidents_file: str):
        """
        Initialize loader with path to incidents JSON file.
        
        Args:
            incidents_file: Path to JSON file containing incident data
        """
        self.incidents_file = incidents_file
        self.incidents = []
        self._load_incidents()
    
    def _load_incidents(self):
        """Load incidents from JSON file"""
        try:
            with open(self.incidents_file, 'r') as f:
                data = json.load(f)
                
            if isinstance(data, list):
                self.incidents = data
            elif isinstance(data, dict) and 'incidents' in data:
                self.incidents = data['incidents']
            else:
                self.incidents = [data]  # Single incident
                
            print(f"✓ Loaded {len(self.incidents)} incidents from {self.incidents_file}")
        except FileNotFoundError:
            print(f"⚠ Incidents file not found: {self.incidents_file}")
            self.incidents = []
        except json.JSONDecodeError as e:
            print(f"⚠ JSON parsing error: {e}")
            self.incidents = []
    
    def _create_node_features(self, node: Dict) -> np.ndarray:
        """
        Convert node dictionary to 24-dimensional feature vector.
        
        Format: [type_encoding (12) | operational_features (12)]
        """
        # One-hot encoding for infrastructure type
        node_type = node.get('type', 'Building')
        type_idx = self.INFRASTRUCTURE_TYPES.get(node_type, 1)  # Default to Building
        type_encoding = np.zeros(12, dtype=np.float32)
        type_encoding[type_idx] = 1.0
        
        # Operational features (12 dimensions)
        operational_features = np.array([
            node.get('capacity', 0.5),
            node.get('level', 0.5),
            node.get('flow', 0.5),
            node.get('status', 0.9),
            node.get('criticality', 0.5),
            node.get('population_served', 0.3),
            node.get('economic_value', 0.3),
            node.get('connectivity', 0.5),
            node.get('maintenance_score', 0.7),
            node.get('weather_risk', 0.2),
            node.get('failure_history', 0.1),
            node.get('reserved', 0.0),
        ], dtype=np.float32)
        
        # Concatenate type + operational
        features = np.concatenate([type_encoding, operational_features])
        return features
    
    def _create_ground_truth(self, node: Dict) -> np.ndarray:
        """
        Create 12-dimensional ground truth label for node.
        
        If 'impacted' is present:
            - Use as probability for dimension 0
            - Fill other dimensions with scaled values or -1 for unknown
        
        If 'impacted' is -1 or missing:
            - Return all -1 (masked during training)
        """
        impacted = node.get('impacted', -1.0)
        
        # If unknown, return all -1 (will be masked)
        if impacted < 0:
            return np.full(12, -1.0, dtype=np.float32)
        
        # If known, create full 12-dim label
        # For real incidents, we often only know "impacted or not"
        # So we replicate the impact probability across all dimensions
        # (or use specific values if available)
        
        labels = np.array([
            impacted,  # Impact probability
            node.get('severity', impacted * 0.8),  # Severity
            node.get('time_to_impact', impacted * 0.6),  # Time
            node.get('water_impact', impacted * 0.9),  # Water
            node.get('power_impact', impacted * 0.7),  # Power
            node.get('road_impact', impacted * 0.5),  # Road
            node.get('building_impact', impacted * 0.6),  # Building
            node.get('population_affected', impacted * 0.8),  # Population
            node.get('economic_loss', impacted * 0.7),  # Economic
            node.get('recovery_time', impacted * 0.75),  # Recovery
            node.get('priority', impacted * 0.85),  # Priority
            node.get('confidence', 0.7 if impacted > 0 else 0.8),  # Confidence
        ], dtype=np.float32)
        
        return labels
    
    def _normalize_features(self, x: torch.Tensor) -> torch.Tensor:
        """
        Normalize operational features (dimensions 12-23).
        Type encoding (0-11) remains unchanged.
        """
        # Only normalize operational features
        operational = x[:, 12:]
        mean = operational.mean(dim=0, keepdim=True)
        std = operational.std(dim=0, keepdim=True) + 1e-6
        operational_norm = (operational - mean) / std
        operational_norm = torch.clamp(operational_norm, -3, 3)
        
        # Combine type encoding + normalized operational
        x_norm = torch.cat([x[:, :12], operational_norm], dim=1)
        return x_norm
    
    def convert_to_pytorch_data(self, incident: Dict) -> Optional[Data]:
        """
        Convert incident dictionary to PyTorch Geometric Data object.
        
        Args:
            incident: Incident dictionary with nodes and edges
            
        Returns:
            torch_geometric.data.Data object or None if invalid
        """
        try:
            nodes = incident.get('nodes', [])
            edges = incident.get('edges', [])
            
            if len(nodes) == 0:
                print(f"⚠ Skipping incident {incident.get('incident_id')}: No nodes")
                return None
            
            # Create node feature matrix
            node_features = []
            ground_truth = []
            
            for node in nodes:
                features = self._create_node_features(node)
                labels = self._create_ground_truth(node)
                node_features.append(features)
                ground_truth.append(labels)
            
            x = torch.tensor(np.array(node_features), dtype=torch.float32)
            y = torch.tensor(np.array(ground_truth), dtype=torch.float32)
            
            # Normalize features
            x = self._normalize_features(x)
            
            # Create edge index
            if len(edges) > 0:
                edge_list = []
                edge_weights = []
                
                for edge in edges:
                    src = edge.get('source', edge.get('src'))
                    dst = edge.get('target', edge.get('dst'))
                    weight = edge.get('weight', 1.0)
                    
                    # Add bidirectional edges
                    edge_list.append([src, dst])
                    edge_list.append([dst, src])
                    edge_weights.extend([weight, weight])
                
                edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
                edge_attr = torch.tensor(edge_weights, dtype=torch.float32)
            else:
                # No edges - create self-loops
                num_nodes = len(nodes)
                edge_index = torch.tensor([[i, i] for i in range(num_nodes)], dtype=torch.long).t()
                edge_attr = torch.ones(num_nodes, dtype=torch.float32)
            
            # Create PyTorch Geometric Data object
            data = Data(
                x=x,
                edge_index=edge_index,
                edge_attr=edge_attr,
                y=y,
                incident_id=incident.get('incident_id', 'unknown'),
                date=incident.get('date', 'unknown'),
            )
            
            return data
            
        except Exception as e:
            print(f"⚠ Error converting incident {incident.get('incident_id')}: {e}")
            return None
    
    def __len__(self):
        """Return number of incidents"""
        return len(self.incidents)
    
    def __iter__(self):
        """Iterate over incidents as PyTorch Geometric Data objects"""
        for incident in self.incidents:
            data = self.convert_to_pytorch_data(incident)
            if data is not None:
                yield data
    
    def get_all_data(self) -> List[Data]:
        """Get all incidents as list of Data objects"""
        return [data for data in self]


def load_real_incidents(incidents_file: str) -> List[Data]:
    """
    Convenience function to load incidents.
    
    Args:
        incidents_file: Path to JSON file with incidents
        
    Returns:
        List of torch_geometric.data.Data objects
    """
    loader = InfrastructureIncidentLoader(incidents_file)
    return loader.get_all_data()


if __name__ == "__main__":
    # Test loader
    loader = InfrastructureIncidentLoader("data/real_incidents.json")
    print(f"\n📊 Loaded {len(loader)} incidents")
    
    for i, data in enumerate(loader):
        print(f"\nIncident {i+1}: {data.incident_id}")
        print(f"  Nodes: {data.x.shape[0]}")
        print(f"  Edges: {data.edge_index.shape[1]}")
        print(f"  Known labels: {(data.y > -1).sum().item()} / {data.y.numel()}")
        
        if i >= 2:  # Show first 3
            break
