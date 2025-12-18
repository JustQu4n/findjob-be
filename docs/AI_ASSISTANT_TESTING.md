# Testing AI Assistant Module

## Bước 1: Cấu hình API Key

1. Lấy API key miễn phí tại: https://makersuite.google.com/app/apikey hoặc https://aistudio.google.com/app/apikey
2. Mở file `.env` và thay thế `YOUR_GEMINI_API_KEY_HERE` bằng API key thực:

```env
GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

3. Khởi động lại server:
```bash
npm run start:dev
```

## Bước 2: Test Status Endpoint

Kiểm tra xem AI Assistant đã được cấu hình chưa:

```bash
curl http://localhost:5000/api/ai-assistant/status
```

**Expected Response:**
```json
{
  "configured": true,
  "message": "AI Assistant is ready"
}
```

## Bước 3: Test Suggestions Endpoint

Lấy danh sách câu hỏi gợi ý:

```bash
curl http://localhost:5000/api/ai-assistant/suggestions
```

**Expected Response:**
```json
{
  "suggestions": [
    "Làm thế nào để tạo hồ sơ xin việc ấn tượng?",
    "Tôi nên chuẩn bị gì cho một buổi phỏng vấn?",
    "Các kỹ năng nào đang được tìm kiếm nhiều hiện nay?",
    "Làm sao để theo dõi các công việc tôi đã ứng tuyển?",
    "Tôi muốn đăng tin tuyển dụng, cần làm gì?",
    "Hệ thống có những tính năng gì?"
  ]
}
```

## Bước 4: Test Chat Endpoint

### Sử dụng PowerShell (Windows):

```powershell
# Test câu hỏi về hệ thống
$body = @{ 
    message = 'Hệ thống có những tính năng gì?' 
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json'

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

```powershell
# Test câu hỏi về tìm việc
$body = @{ 
    message = 'Tôi muốn tìm việc lập trình viên, cần chuẩn bị gì?' 
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json' | 
    Select-Object -ExpandProperty Content
```

```powershell
# Test với model cụ thể
$body = @{ 
    message = 'Top 5 kỹ năng quan trọng cho developer?'
    model = 'gemini-pro'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json' | 
    Select-Object -ExpandProperty Content
```

### Sử dụng cURL (Linux/Mac hoặc Git Bash):

```bash
# Test câu hỏi về hệ thống
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hệ thống có những tính năng gì?"}'
```

```bash
# Test câu hỏi về đăng tin
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Làm sao để đăng tin tuyển dụng?"}'
```

```bash
# Test câu hỏi về profile
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Làm thế nào để tạo hồ sơ xin việc ấn tượng?"}'
```

### Sử dụng Postman hoặc Thunder Client:

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/ai-assistant/chat`
- Headers: 
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "message": "Tôi muốn tìm việc frontend developer, cần kỹ năng gì?",
  "model": "gemini-1.5-flash"
}
```

**Expected Response:**
```json
{
  "response": "Để trở thành một frontend developer, bạn cần các kỹ năng sau:\n\n1. **HTML/CSS**: ...",
  "model": "gemini-1.5-flash",
  "tokensUsed": 250,
  "timestamp": "2024-03-20T10:30:00.000Z"
}
```

## Các Test Case Khác

### Test Case 1: Câu hỏi về Job Seeker

```json
{
  "message": "Tôi là sinh viên mới ra trường, cần làm gì để tìm việc?"
}
```

### Test Case 2: Câu hỏi về Employer

```json
{
  "message": "Tôi là nhà tuyển dụng, làm sao để tìm ứng viên phù hợp?"
}
```

### Test Case 3: Câu hỏi về kỹ năng

```json
{
  "message": "Kỹ năng nào đang hot trong lĩnh vực IT hiện nay?"
}
```

### Test Case 4: Câu hỏi về CV

```json
{
  "message": "Làm sao để viết CV ấn tượng cho vị trí developer?"
}
```

### Test Case 5: Câu hỏi về phỏng vấn

```json
{
  "message": "Các câu hỏi phỏng vấn phổ biến cho frontend developer?"
}
```

### Test Case 6: Câu hỏi về ứng tuyển

```json
{
  "message": "Sau khi ứng tuyển, tôi cần làm gì?"
}
```

## Kiểm tra Error Handling

### Test 1: Không có API Key

Để trống `GEMINI_API_KEY` trong `.env` và khởi động lại server.

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.",
  "error": "Bad Request"
}
```

### Test 2: API Key không hợp lệ

Đặt `GEMINI_API_KEY=invalid_key` trong `.env` và khởi động lại server.

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid Gemini API Key. Please check your GEMINI_API_KEY in .env file. Get a free key at: https://makersuite.google.com/app/apikey",
  "error": "Bad Request"
}
```

### Test 3: Message rỗng

```json
{
  "message": ""
}
```

**Expected Response:** Validation error (do class-validator)

## Performance Testing

### Test Response Time

```powershell
Measure-Command {
    $body = @{ message = 'Hệ thống có những tính năng gì?' } | ConvertTo-Json
    Invoke-WebRequest -Uri 'http://localhost:5000/api/ai-assistant/chat' `
        -Method POST -Body $body -ContentType 'application/json'
}
```

**Expected:** < 3 seconds cho model `gemini-1.5-flash`

## Integration Testing

Tạo file `test-ai-assistant.ps1` để test tự động:

```powershell
# File: test-ai-assistant.ps1

Write-Host "=== Testing AI Assistant Module ===" -ForegroundColor Green

# Test 1: Status
Write-Host "`n[1] Testing Status Endpoint..." -ForegroundColor Yellow
$status = Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/status'
Write-Host "Status: $($status.message)" -ForegroundColor Cyan

# Test 2: Suggestions
Write-Host "`n[2] Testing Suggestions Endpoint..." -ForegroundColor Yellow
$suggestions = Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/suggestions'
Write-Host "Suggestions count: $($suggestions.suggestions.Count)" -ForegroundColor Cyan

# Test 3: Chat
Write-Host "`n[3] Testing Chat Endpoint..." -ForegroundColor Yellow
$body = @{ message = 'Hệ thống có những tính năng gì?' } | ConvertTo-Json

try {
    $chatResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/chat' `
        -Method POST -Body $body -ContentType 'application/json'
    
    Write-Host "Response received: $($chatResponse.response.Substring(0, 100))..." -ForegroundColor Cyan
    Write-Host "Model: $($chatResponse.model)" -ForegroundColor Cyan
    Write-Host "Tokens: $($chatResponse.tokensUsed)" -ForegroundColor Cyan
    
    Write-Host "`n=== All Tests Passed ===" -ForegroundColor Green
} catch {
    Write-Host "Chat test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you have set valid GEMINI_API_KEY in .env file" -ForegroundColor Yellow
}
```

Chạy test:

```powershell
.\test-ai-assistant.ps1
```

## Troubleshooting

### Problem: "API Key not configured"
**Solution:** Kiểm tra file `.env` và đảm bảo `GEMINI_API_KEY` đã được set đúng.

### Problem: "Model not found"
**Solution:** Sử dụng model name đúng: `gemini-1.5-flash` hoặc `gemini-pro`

### Problem: Response chậm
**Solution:** Sử dụng model `gemini-1.5-flash` thay vì `gemini-pro` để tăng tốc độ.

### Problem: Rate limit exceeded
**Solution:** Gemini free tier có giới hạn requests/phút. Đợi một chút và thử lại.

## Next Steps

1. ✅ Module đã hoạt động
2. 🔄 Thêm API key thực vào `.env`
3. 🧪 Chạy các test cases
4. 📊 Monitor usage và performance
5. 🚀 Deploy và sử dụng trong production
