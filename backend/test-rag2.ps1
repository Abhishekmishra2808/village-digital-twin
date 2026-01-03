# Test RAG with different queries

Write-Host "=== Testing RAG Feature (Multiple Queries) ===" -ForegroundColor Cyan

# Login
$loginBody = @{
    email = "admin@village.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✅ Logged in" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Query 1: Water issues
Write-Host "`n=== Query 1: Water Issues ===" -ForegroundColor Yellow
$query1 = @{
    question = "What water problems are reported in Zone B?"
    max_citations = 3
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:3001/api/rag-query" -Method POST -Body $query1 -Headers $headers
Write-Host "Answer: $($response1.answer)" -ForegroundColor White
Write-Host "Citations: $($response1.citations.Count)" -ForegroundColor Gray
Write-Host "Cached: $($response1.cached)" -ForegroundColor Gray
Write-Host "Trace ID: $($response1.trace_id)" -ForegroundColor DarkGray

# Query 2: Same question (should be cached)
Write-Host "`n=== Query 2: Water Issues (Repeat - Should be Cached) ===" -ForegroundColor Yellow
Start-Sleep -Seconds 1
$response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/rag-query" -Method POST -Body $query1 -Headers $headers
Write-Host "Answer: $($response2.answer)" -ForegroundColor White
Write-Host "Citations: $($response2.citations.Count)" -ForegroundColor Gray
Write-Host "Cached: $($response2.cached) ✅" -ForegroundColor Green
Write-Host "Trace ID: $($response2.trace_id)" -ForegroundColor DarkGray

# Query 3: Road issues
Write-Host "`n=== Query 3: Road Infrastructure ===" -ForegroundColor Yellow
$query3 = @{
    question = "Tell me about road infrastructure problems"
    max_citations = 5
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "http://localhost:3001/api/rag-query" -Method POST -Body $query3 -Headers $headers
Write-Host "Answer: $($response3.answer)" -ForegroundColor White
Write-Host "Citations: $($response3.citations.Count)" -ForegroundColor Gray
Write-Host "Cached: $($response3.cached)" -ForegroundColor Gray
Write-Host "Trace ID: $($response3.trace_id)" -ForegroundColor DarkGray

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
