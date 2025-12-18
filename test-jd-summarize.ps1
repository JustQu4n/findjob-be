# PowerShell script to test Job Description Summarization API

$BASE_URL = "http://localhost:5000/api"

Write-Host "=== JD Summarization API Test ===" -ForegroundColor Green

# Step 1: Login to get JWT token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "jobseeker1@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit
}

# Step 2: Test Vietnamese JD
Write-Host "`n2. Testing Vietnamese Job Description..." -ForegroundColor Yellow
$vietnameseJD = @{
    jobDescription = @"
Công ty ABC tuyển dụng Backend Developer

Mô tả công việc:
- Phát triển và bảo trì các API RESTful cho hệ thống tuyển dụng
- Làm việc với Node.js, TypeScript, NestJS framework
- Thiết kế và tối ưu hóa database với PostgreSQL
- Implement authentication và authorization
- Tối ưu hóa performance và security của hệ thống
- Code review và mentor junior developers

Yêu cầu:
- Tốt nghiệp Đại học chuyên ngành CNTT hoặc tương đương
- 2+ năm kinh nghiệm Backend Development
- Thành thạo Node.js, TypeScript
- Kinh nghiệm với NestJS framework
- Kinh nghiệm với PostgreSQL, Redis
- Hiểu biết về microservices architecture
- Kinh nghiệm với Docker, Kubernetes là lợi thế
- Kỹ năng làm việc nhóm tốt
- Có khả năng đọc hiểu tài liệu tiếng Anh

Quyền lợi:
- Lương: 20-30 triệu VND (có thể thương lượng tùy năng lực)
- Làm việc hybrid: 3 ngày văn phòng, 2 ngày WFH
- Bảo hiểm đầy đủ theo luật lao động
- Review lương 2 lần/năm
- Thưởng tháng 13, thưởng dự án
- Team building, du lịch hàng năm
- Môi trường trẻ, năng động, nhiều cơ hội thăng tiến
- Trang thiết bị làm việc hiện đại (Macbook Pro)
- Miễn phí bữa trưa, snack, trà cafe

Địa điểm làm việc: Quận 1, TP.HCM
Thời gian làm việc: 9:00 - 18:00, thứ 2 - thứ 6
"@
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $vnResponse = Invoke-RestMethod -Uri "$BASE_URL/ai-assistant/summarize-jd" -Method Post -Body $vietnameseJD -Headers $headers
    Write-Host "✓ Vietnamese JD summarized successfully" -ForegroundColor Green
    Write-Host "Detected Language: $($vnResponse.detectedLanguage)" -ForegroundColor Cyan
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host $vnResponse.summary -ForegroundColor White
    Write-Host "`nKey Points:" -ForegroundColor Cyan
    Write-Host "Position: $($vnResponse.keyPoints.position)" -ForegroundColor White
    Write-Host "Experience: $($vnResponse.keyPoints.experience)" -ForegroundColor White
    Write-Host "Skills: $($vnResponse.keyPoints.skills -join ', ')" -ForegroundColor White
    Write-Host "Requirements Count: $($vnResponse.keyPoints.requirements.Count)" -ForegroundColor White
    Write-Host "Benefits Count: $($vnResponse.keyPoints.benefits.Count)" -ForegroundColor White
} catch {
    Write-Host "✗ Vietnamese JD test failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Step 3: Test English JD
Write-Host "`n3. Testing English Job Description..." -ForegroundColor Yellow
$englishJD = @{
    jobDescription = @"
Senior Frontend Developer - React/Next.js

About the Company:
We are a fast-growing tech startup building innovative solutions for the job recruitment industry. Our platform connects thousands of job seekers with top employers.

About the Role:
We are seeking an experienced Senior Frontend Developer to join our engineering team. You will be responsible for building modern, responsive web applications that provide exceptional user experiences.

Key Responsibilities:
- Develop and maintain web applications using React and Next.js
- Collaborate with designers to implement pixel-perfect UIs
- Optimize applications for maximum speed and scalability
- Write clean, maintainable code following best practices
- Implement responsive designs that work across all devices
- Participate in code reviews and mentor junior developers
- Work closely with backend team to integrate APIs
- Contribute to technical documentation
- Stay up-to-date with emerging frontend technologies

Requirements:
- Bachelor's degree in Computer Science or equivalent
- 3+ years of professional experience with React
- Strong proficiency in TypeScript and modern JavaScript (ES6+)
- Hands-on experience with Next.js framework
- Experience with state management (Redux, Zustand, or Context API)
- Understanding of responsive design and CSS-in-JS solutions
- Experience with RESTful APIs and GraphQL
- Familiarity with Git and modern development workflows
- Excellent problem-solving and debugging skills
- Strong communication skills in English
- Experience with testing frameworks (Jest, React Testing Library)

Nice to Have:
- Experience with Tailwind CSS or Material-UI
- Knowledge of performance optimization techniques
- Experience with CI/CD pipelines
- Contributions to open-source projects
- Experience working in Agile/Scrum environment

What We Offer:
- Competitive salary: $3,000 - $5,000 per month (negotiable based on experience)
- Remote-first culture with flexible working hours
- Professional development budget for courses and conferences
- Comprehensive health insurance
- Annual company retreat
- Modern tech stack and cutting-edge tools
- Opportunity to work on challenging projects
- Collaborative and supportive team environment
- Career growth opportunities

Location: Remote (Vietnam timezone preferred)
Working Hours: Flexible (core hours 10:00 AM - 4:00 PM)
Start Date: Immediate
"@
} | ConvertTo-Json

try {
    $enResponse = Invoke-RestMethod -Uri "$BASE_URL/ai-assistant/summarize-jd" -Method Post -Body $englishJD -Headers $headers
    Write-Host "✓ English JD summarized successfully" -ForegroundColor Green
    Write-Host "Detected Language: $($enResponse.detectedLanguage)" -ForegroundColor Cyan
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host $enResponse.summary -ForegroundColor White
    Write-Host "`nKey Points:" -ForegroundColor Cyan
    Write-Host "Position: $($enResponse.keyPoints.position)" -ForegroundColor White
    Write-Host "Experience: $($enResponse.keyPoints.experience)" -ForegroundColor White
    Write-Host "Skills: $($enResponse.keyPoints.skills -join ', ')" -ForegroundColor White
    Write-Host "Requirements Count: $($enResponse.keyPoints.requirements.Count)" -ForegroundColor White
    Write-Host "Benefits Count: $($enResponse.keyPoints.benefits.Count)" -ForegroundColor White
} catch {
    Write-Host "✗ English JD test failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Step 4: Test without authentication
Write-Host "`n4. Testing without authentication (should fail)..." -ForegroundColor Yellow
try {
    $noAuthResponse = Invoke-RestMethod -Uri "$BASE_URL/ai-assistant/summarize-jd" -Method Post -Body $vietnameseJD -ContentType "application/json"
    Write-Host "✗ Test failed: Should require authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly requires authentication (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Step 5: Test with empty JD
Write-Host "`n5. Testing with empty job description..." -ForegroundColor Yellow
$emptyJD = @{
    jobDescription = ""
} | ConvertTo-Json

try {
    $emptyResponse = Invoke-RestMethod -Uri "$BASE_URL/ai-assistant/summarize-jd" -Method Post -Body $emptyJD -Headers $headers
    Write-Host "✗ Test failed: Should reject empty JD" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Correctly rejects empty JD (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "? Got error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "`nNote: Make sure your backend server is running on $BASE_URL" -ForegroundColor Gray
Write-Host "Note: Login credentials used: jobseeker1@example.com / password123" -ForegroundColor Gray
Write-Host "Note: Update credentials if needed" -ForegroundColor Gray
