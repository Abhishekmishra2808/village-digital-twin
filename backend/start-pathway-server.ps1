# Pathway Document Extractor Startup Script
# Run this to start the Python API server for enhanced document extraction

Write-Host "`n🚀 Starting Pathway Document Extraction Server" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# Navigate to the backend directory
$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendDir

$gnnDir = Join-Path $backendDir "python-gnn"

if (-not (Test-Path $gnnDir)) {
    Write-Host "❌ Directory not found: $gnnDir" -ForegroundColor Red
    exit 1
}

# Check if Python is available
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Python found: $($python.Source)" -ForegroundColor Green

# Install requirements if needed
$reqFile = Join-Path $gnnDir "requirements-pathway.txt"
if (Test-Path $reqFile) {
    Write-Host "📥 Checking dependencies..." -ForegroundColor Yellow
    pip install -q -r $reqFile 2>$null
}

# Set environment variables
$env:PATHWAY_EXTRACTOR_PORT = "8080"
Write-Host "`n📍 Server will start on: http://localhost:8080" -ForegroundColor Cyan

# Change to python-gnn directory and start the server
Set-Location $gnnDir
Write-Host "`n🔄 Starting Pathway API Server..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor DarkGray

python pathway_api_server.py
