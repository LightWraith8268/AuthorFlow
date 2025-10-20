# Simple API Test Script
$baseUrl = "http://localhost:3001/api"
$timestamp = (Get-Date).ToFileTime()

Write-Host "Testing AuthorFlow API..." -ForegroundColor Cyan

# 1. Health
Write-Host "`n1. Health Check"
$health = Invoke-RestMethod "$baseUrl/health"
Write-Host "   ✓ Status: $($health.status)" -ForegroundColor Green

# 2. Signup
Write-Host "`n2. Signup"
$signup = Invoke-RestMethod "$baseUrl/auth/signup" -Method Post -Body (@{
    email = "test$timestamp@example.com"
    password = "Password123!"
    username = "testuser$timestamp"
} | ConvertTo-Json) -ContentType "application/json"
Write-Host "   ✓ User created: $($signup.user.id)" -ForegroundColor Green

# 3. Login
Write-Host "`n3. Login"
$login = Invoke-RestMethod "$baseUrl/auth/login" -Method Post -Body (@{
    email = "test$timestamp@example.com"
    password = "Password123!"
} | ConvertTo-Json) -ContentType "application/json"
$token = $login.session.access_token
Write-Host "   ✓ Token received" -ForegroundColor Green

# 4. Create Project
Write-Host "`n4. Create Project"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$project = Invoke-RestMethod "$baseUrl/projects" -Method Post -Headers $headers -Body (@{
    title = "My Novel"
    type = "novel"
    description = "Test novel"
} | ConvertTo-Json)
$projectId = $project.data.id
Write-Host "   ✓ Project created: $($project.data.title)" -ForegroundColor Green

# 5. Update Project
Write-Host "`n5. Update Project"
$updated = Invoke-RestMethod "$baseUrl/projects/$projectId" -Method Patch -Headers $headers -Body (@{
    content = "Chapter 1. Once upon a time..."
    status = "in_progress"
} | ConvertTo-Json)
Write-Host "   ✓ Word count: $($updated.data.word_count)" -ForegroundColor Green

# 6. Publish
Write-Host "`n6. Publish Project"
$published = Invoke-RestMethod "$baseUrl/projects/$projectId/publish" -Method Post -Headers $headers
Write-Host "   ✓ Published: $($published.data.is_published)" -ForegroundColor Green

# 7. Get All
Write-Host "`n7. Get All Projects"
$all = Invoke-RestMethod "$baseUrl/projects" -Headers $headers
Write-Host "   ✓ Found $($all.data.Count) project(s)" -ForegroundColor Green

# 8. Delete
Write-Host "`n8. Delete Project"
Invoke-RestMethod "$baseUrl/projects/$projectId" -Method Delete -Headers $headers | Out-Null
Write-Host "   ✓ Project deleted" -ForegroundColor Green

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
