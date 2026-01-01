# Example: Quick test of gate retraining
# Run this after you have real_incidents.json ready

# Step 1: Activate virtual environment first (REQUIRED)
& D:/dsa/village-digital-twin/backend/python-gnn/venv/Scripts/Activate.ps1

# Step 2: Basic retraining (conservative)
# Note: In PowerShell, use backtick ` for line continuation, NOT backslash \
python retrain_gate.py `
  --model models/gnn_production_v1.pt `
  --incidents data/real_incidents.json `
  --lr 1e-4 `
  --epochs 10 `
  --pos-weight 5.0 `
  --save models/gnn_gate_retrained.pt

# If false negatives persist, try focal loss
# python retrain_gate.py `
#   --model models/gnn_production_v1.pt `
#   --incidents data/real_incidents.json `
#   --lr 5e-5 `
#   --epochs 10 `
#   --focal `
#   --focal-gamma 2.0 `
#   --focal-alpha 0.75 `
#   --save models/gnn_gate_retrained_focal.pt

# Also train output layer (more aggressive)
# python retrain_gate.py `
#   --model models/gnn_production_v1.pt `
#   --incidents data/real_incidents.json `
#   --lr 1e-4 `
#   --epochs 12 `
#   --train-output `
#   --save models/gnn_gate_retrained_full.pt
