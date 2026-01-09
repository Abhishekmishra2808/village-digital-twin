"""
FastAPI server for GNN inference
Provides REST API for the Node.js backend to call
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import uvicorn
from model import ImpactPredictor
import os


app = FastAPI(title="Infrastructure GNN API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
predictor = None
MODEL_PATH = "models/gnn_model.pt"


class NodeFeature(BaseModel):
    id: str
    features: List[float]  # 24-dimensional feature vector


class Edge(BaseModel):
    source: int  # Node index
    target: int  # Node index
    weight: Optional[float] = 1.0


class PredictionRequest(BaseModel):
    nodes: List[NodeFeature]
    edges: List[Edge]
    failure_node_id: Optional[str] = None


class ImpactPrediction(BaseModel):
    node_id: str
    probability: float
    severity: float
    time_to_impact: float
    water_impact: float
    power_impact: float
    road_impact: float
    building_impact: float
    population_affected: float
    economic_loss: float
    recovery_time: float
    priority: float
    confidence: float


class PredictionResponse(BaseModel):
    predictions: List[ImpactPrediction]
    model_trained: bool
    device: str


@app.on_event("startup")
async def load_model():
    """Load the trained model on startup"""
    global predictor
    
    if os.path.exists(MODEL_PATH):
        print(f"Loading trained model from {MODEL_PATH}...")
        predictor = ImpactPredictor(model_path=MODEL_PATH)
        print(f"✓ Model loaded successfully on {predictor.device}")
    else:
        print(f"⚠ No trained model found at {MODEL_PATH}")
        print("  Using untrained model. Run train.py first for better predictions.")
        predictor = ImpactPredictor()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "model_loaded": predictor is not None,
        "model_trained": os.path.exists(MODEL_PATH),
        "device": str(predictor.device) if predictor else "unknown"
    }


@app.get("/status")
async def status():
    """Get model status"""
    return {
        "model_loaded": predictor is not None,
        "model_trained": os.path.exists(MODEL_PATH),
        "device": str(predictor.device) if predictor else "unknown",
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH)
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_impact(request: PredictionRequest):
    """
    Predict infrastructure impact using the trained GNN
    
    Request body:
    {
        "nodes": [
            {"id": "tank-1", "features": [24 float values]},
            {"id": "pump-2", "features": [24 float values]},
            ...
        ],
        "edges": [
            {"source": 0, "target": 1, "weight": 0.8},
            {"source": 1, "target": 2, "weight": 0.6},
            ...
        ],
        "failure_node_id": "tank-1"  // optional
    }
    """
    if predictor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Extract node features
        node_features = np.array([node.features for node in request.nodes], dtype=np.float32)
        
        # Validate feature dimensions
        if node_features.shape[1] != 24:
            raise HTTPException(
                status_code=400, 
                detail=f"Expected 24 features per node, got {node_features.shape[1]}"
            )
        
        # Build edge index
        edge_list = [[edge.source, edge.target] for edge in request.edges]
        if len(edge_list) == 0:
            # If no edges, create minimal connectivity
            edge_list = [[0, 0]]
        
        edge_index = np.array(edge_list, dtype=np.int64).T
        
        # Edge weights
        edge_weights = np.array([edge.weight for edge in request.edges], dtype=np.float32)
        if len(edge_weights) == 0:
            edge_weights = None
        
        # Run prediction
        predictions = predictor.predict(node_features, edge_index, edge_weights)
        
        # Format response
        impact_predictions = []
        for i, node in enumerate(request.nodes):
            pred = predictions[i]
            impact_predictions.append(ImpactPrediction(
                node_id=node.id,
                probability=float(pred[0]),
                severity=float(pred[1]),
                time_to_impact=float(pred[2]),
                water_impact=float(pred[3]),
                power_impact=float(pred[4]),
                road_impact=float(pred[5]),
                building_impact=float(pred[6]),
                population_affected=float(pred[7]),
                economic_loss=float(pred[8]),
                recovery_time=float(pred[9]),
                priority=float(pred[10]),
                confidence=float(pred[11])
            ))
        
        return PredictionResponse(
            predictions=impact_predictions,
            model_trained=os.path.exists(MODEL_PATH),
            device=str(predictor.device)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/train-trigger")
async def trigger_training():
    """
    Trigger model retraining (for future enhancements)
    """
    return {
        "message": "Training not implemented in API. Run train.py script directly.",
        "command": "python train.py"
    }


if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
