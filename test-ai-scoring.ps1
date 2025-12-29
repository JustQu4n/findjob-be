# AI Interview Scoring - Test Script
# Prerequisites: Server must be running, and you need a valid candidate_interview_id

$BASE_URL = "http://localhost:3000"
$EMPLOYER_EMAIL = "employer@example.com"
$EMPLOYER_PASSWORD = "password123"

Write-Host "=== AI Interview Scoring Test Script ===" -ForegroundColor Cyan
Write-Host ""

# 1. Login
Write-Host "Step 1: Logging in as employer..." -ForegroundColor Yellow
$loginBody = @{
    email = $EMPLOYER_EMAIL
    password = $EMPLOYER_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $ACCESS_TOKEN = $loginResponse.access_token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($ACCESS_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Get candidate interview ID (you need to replace this with actual ID)
Write-Host "Step 2: Enter Candidate Interview ID" -ForegroundColor Yellow
$CANDIDATE_INTERVIEW_ID = Read-Host "Enter candidate_interview_id (or press Enter to use test ID)"

if ([string]::IsNullOrEmpty($CANDIDATE_INTERVIEW_ID)) {
    Write-Host "⚠ No ID provided. Please update this script with a valid ID." -ForegroundColor Red
    Write-Host ""
    Write-Host "To find a valid candidate_interview_id, run this SQL query:" -ForegroundColor Cyan
    Write-Host "SELECT candidate_interview_id, status FROM candidate_interviews WHERE status = 'submitted' LIMIT 5;" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# 3. Trigger AI Scoring
Write-Host "Step 3: Triggering AI scoring..." -ForegroundColor Yellow
$scoreBody = @{
    candidateInterviewId = $CANDIDATE_INTERVIEW_ID
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $ACCESS_TOKEN"
    }
    
    Write-Host "Sending request to: POST $BASE_URL/interview-scoring/score" -ForegroundColor Gray
    
    $scoreResponse = Invoke-RestMethod -Uri "$BASE_URL/interview-scoring/score" `
        -Method POST `
        -Headers $headers `
        -Body $scoreBody `
        -ContentType "application/json"
    
    Write-Host "✓ AI Scoring completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== RESULTS ===" -ForegroundColor Cyan
    Write-Host "Total Score: $($scoreResponse.totalScore)/50" -ForegroundColor White
    Write-Host "Recommendation: $($scoreResponse.recommendation)" -ForegroundColor White
    Write-Host ""
    Write-Host "Criteria Breakdown:" -ForegroundColor Yellow
    Write-Host "  Technical:   $($scoreResponse.criteria.technical)/10" -ForegroundColor White
    Write-Host "  Logic:       $($scoreResponse.criteria.logic)/10" -ForegroundColor White
    Write-Host "  Experience:  $($scoreResponse.criteria.experience)/10" -ForegroundColor White
    Write-Host "  Clarity:     $($scoreResponse.criteria.clarity)/10" -ForegroundColor White
    Write-Host "  Relevance:   $($scoreResponse.criteria.relevance)/10" -ForegroundColor White
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Yellow
    Write-Host $scoreResponse.summary -ForegroundColor White
    Write-Host ""
    Write-Host "Model Used: $($scoreResponse.modelUsed)" -ForegroundColor Gray
    Write-Host "Created At: $($scoreResponse.createdAt)" -ForegroundColor Gray
    
} catch {
    Write-Host "✗ AI Scoring failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "Possible reasons:" -ForegroundColor Yellow
            Write-Host "  - Interview ID does not exist" -ForegroundColor White
            Write-Host "  - Interview was deleted" -ForegroundColor White
        } elseif ($statusCode -eq 400) {
            Write-Host "Possible reasons:" -ForegroundColor Yellow
            Write-Host "  - Interview status is not 'submitted'" -ForegroundColor White
            Write-Host "  - No answers found for this interview" -ForegroundColor White
        } elseif ($statusCode -eq 401) {
            Write-Host "Possible reasons:" -ForegroundColor Yellow
            Write-Host "  - Access token expired or invalid" -ForegroundColor White
        } elseif ($statusCode -eq 500) {
            Write-Host "Possible reasons:" -ForegroundColor Yellow
            Write-Host "  - GEMINI_API_KEY not configured" -ForegroundColor White
            Write-Host "  - AI service error" -ForegroundColor White
        }
    }
    
    exit 1
}

Write-Host ""

# 4. Retrieve Evaluation
Write-Host "Step 4: Retrieving saved evaluation..." -ForegroundColor Yellow

try {
    $evalResponse = Invoke-RestMethod -Uri "$BASE_URL/interview-scoring/evaluation/$CANDIDATE_INTERVIEW_ID" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Evaluation retrieved successfully!" -ForegroundColor Green
    Write-Host "Verification: Total Score = $($evalResponse.totalScore)" -ForegroundColor White
    
} catch {
    Write-Host "✗ Failed to retrieve evaluation: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Swagger UI at: $BASE_URL/api" -ForegroundColor White
Write-Host "2. Try scoring another interview" -ForegroundColor White
Write-Host "3. View all evaluations: GET $BASE_URL/interview-scoring/employer/evaluations" -ForegroundColor White
