# Setup script for Windows PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Real GNN Setup for Infrastructure Impact" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not found. Please install Python 3.8+!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python found" -ForegroundColor Green
Write-Host ""

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
Write-Host "✓ Virtual environment created" -ForegroundColor Green
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
Write-Host "✓ Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
Write-Host "✓ Pip upgraded" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Train model
Write-Host "Training GNN model..." -ForegroundColor Yellow
Write-Host "This will take a few minutes..." -ForegroundColor Yellow
python train.py
Write-Host "✓ Model trained" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the API server:" -ForegroundColor Yellow
Write-Host "  python api_server.py" -ForegroundColor White
Write-Host ""
Write-Host "The API will be available at:" -ForegroundColor Yellow
Write-Host "  http://localhost:8001" -ForegroundColor White
Write-Host ""
