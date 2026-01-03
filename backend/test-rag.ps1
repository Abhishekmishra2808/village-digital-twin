# Test RAG Endpoint

Write-Host "=== Testing RAG Feature ===" -ForegroundColor Cyan

# 1. Login to get token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@village.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Test RAG Query
Write-Host "`n2. Sending RAG query..." -ForegroundColor Yellow
$ragBody = @{
    question = "Are there any delays in Scheme S-123?"
    max_citations = 5
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $ragResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/rag-query" -Method POST -Body $ragBody -Headers $headers
    Write-Host "✅ RAG query successful!" -ForegroundColor Green
    Write-Host "`nAnswer:" -ForegroundColor Cyan
    Write-Host $ragResponse.answer -ForegroundColor White
    Write-Host "`nCitations:" -ForegroundColor Cyan
    $ragResponse.citations | ForEach-Object {
        Write-Host "  - [$($_.type)] $($_.snippet) (score: $($_.score))" -ForegroundColor Gray
    }
    Write-Host "`nTrace ID: $($ragResponse.trace_id)" -ForegroundColor Gray
    Write-Host "Cached: $($ragResponse.cached)" -ForegroundColor Gray
} catch {
    Write-Host "❌ RAG query failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
