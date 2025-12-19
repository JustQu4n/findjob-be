# AI Interview Scoring - Quick Start Guide

## 1. Cấu hình môi trường

### Thêm GEMINI_API_KEY vào file .env

```bash
# File: .env
GEMINI_API_KEY=AIzaSy...your-api-key-here
```

### Lấy API Key từ Google AI Studio

1. Truy cập: https://aistudio.google.com/app/apikey
2. Tạo API Key mới
3. Copy và paste vào .env

## 2. Chạy Migration

```powershell
# Chạy migration để tạo bảng interview_ai_evaluations
npm run migration:run
```

## 3. Khởi động server

```powershell
npm run start:dev
```

## 4. Test API

### 4.1. Đăng nhập Employer

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "employer@example.com",
  "password": "password123"
}
```

**Lưu access_token từ response**

### 4.2. Chấm điểm Interview

```http
POST http://localhost:3000/interview-scoring/score
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "candidateInterviewId": "uuid-of-submitted-interview"
}
```

**Response:**
```json
{
  "totalScore": 42,
  "recommendation": "STRONG_FIT",
  "criteria": {
    "technical": 9,
    "logic": 8,
    "experience": 9,
    "clarity": 8,
    "relevance": 8
  },
  "summary": "Candidate demonstrates strong technical knowledge...",
  "modelUsed": "gemini-2.5-flash",
  "createdAt": "2025-12-19T..."
}
```

### 4.3. Lấy kết quả đánh giá

```http
GET http://localhost:3000/interview-scoring/evaluation/{candidateInterviewId}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4.4. Lấy tất cả đánh giá của employer

```http
GET http://localhost:3000/interview-scoring/employer/evaluations
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 5. Điều kiện để chấm điểm

Interview phải đáp ứng các điều kiện sau:
- ✅ Status = `submitted`
- ✅ Có ít nhất 1 câu trả lời
- ✅ Candidate đã hoàn thành interview

## 6. Swagger Documentation

Sau khi start server, truy cập:
```
http://localhost:3000/api
```

Tìm section **"Interview Scoring"** để test trực tiếp.

## 7. Troubleshooting

### Lỗi: "GEMINI_API_KEY not found"
```bash
# Kiểm tra file .env có GEMINI_API_KEY chưa
cat .env | Select-String "GEMINI_API_KEY"
```

### Lỗi: "Candidate interview not found"
```bash
# Kiểm tra UUID có đúng không
# Truy vấn database:
SELECT * FROM candidate_interviews WHERE candidate_interview_id = 'your-uuid';
```

### Lỗi: "Interview must be submitted"
```bash
# Update status nếu cần:
UPDATE candidate_interviews 
SET status = 'submitted' 
WHERE candidate_interview_id = 'your-uuid';
```

### Lỗi: "No answers found"
```bash
# Kiểm tra answers:
SELECT * FROM interview_answers 
WHERE candidate_interview_id = 'your-uuid';
```

## 8. Database Schema

```sql
-- Kiểm tra bảng đã tạo chưa
SELECT * FROM interview_ai_evaluations LIMIT 5;

-- Xem structure
\d interview_ai_evaluations
```

## 9. Logs

```powershell
# Server sẽ log khi:
[InterviewScoringService] Starting AI scoring for candidate interview: {uuid}
[GeminiAiService] Sending prompt to Gemini AI for job: Backend Developer
[GeminiAiService] Received response from Gemini AI
[InterviewScoringService] AI scoring completed. Total score: 42, Recommendation: STRONG_FIT
[InterviewScoringService] AI evaluation saved successfully
```

## 10. Postman Collection

Import collection này vào Postman:

```json
{
  "info": {
    "name": "AI Interview Scoring",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Score Interview",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"candidateInterviewId\": \"{{candidate_interview_id}}\"}"
        },
        "url": {
          "raw": "{{base_url}}/interview-scoring/score",
          "host": ["{{base_url}}"],
          "path": ["interview-scoring", "score"]
        }
      }
    },
    {
      "name": "Get Evaluation",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{access_token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/interview-scoring/evaluation/{{candidate_interview_id}}",
          "host": ["{{base_url}}"],
          "path": ["interview-scoring", "evaluation", "{{candidate_interview_id}}"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "access_token",
      "value": ""
    },
    {
      "key": "candidate_interview_id",
      "value": ""
    }
  ]
}
```

## Next Steps

1. ✅ Test với real data
2. ✅ Monitor API usage của Gemini
3. ✅ Điều chỉnh prompt nếu cần
4. ✅ Thêm rate limiting nếu cần
5. ✅ Implement background job processing (optional)

## Model Information

- **Model:** gemini-2.5-flash-preview-0514
- **Pricing:** Free tier: 15 RPM, 1M tokens/minute
- **Response Time:** ~2-5 seconds
- **Output Format:** JSON structured
