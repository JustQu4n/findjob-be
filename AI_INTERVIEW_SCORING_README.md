# 🤖 AI Interview Scoring Implementation

## 📝 Tổng quan

Tính năng AI Interview Scoring sử dụng **Google Gemini 2.5 Flash** để tự động chấm điểm và đánh giá phỏng vấn của ứng viên dựa trên 5 tiêu chí chính.

## ✨ Tính năng chính

- ✅ **Tự động chấm điểm** - AI đánh giá câu trả lời phỏng vấn
- ✅ **5 tiêu chí đánh giá** - Technical, Logic, Experience, Clarity, Relevance
- ✅ **Recommendation system** - STRONG_FIT | POTENTIAL | NOT_FIT
- ✅ **Anti-bias design** - Không sử dụng PII trong đánh giá
- ✅ **Detailed feedback** - Feedback chi tiết cho từng câu hỏi
- ✅ **Audit trail** - Lưu lại model version và timestamp

## 🏗️ Architecture

```
┌─────────────────┐
│  Candidate      │
│  Interview      │ (status: submitted)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Interview      │
│  Scoring        │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Gemini AI      │────▶│  AI Evaluation   │
│  Service        │     │  Result          │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Database       │
                        │  interview_ai_  │
                        │  evaluations    │
                        └─────────────────┘
```

## 📁 Cấu trúc Code

```
src/
├── modules/
│   └── interview-scoring/
│       ├── dto/
│       │   ├── score-interview.dto.ts
│       │   ├── ai-evaluation-result.dto.ts
│       │   └── index.ts
│       ├── services/
│       │   ├── gemini-ai.service.ts
│       │   └── interview-scoring.service.ts
│       ├── interview-scoring.controller.ts
│       └── interview-scoring.module.ts
│
└── database/
    └── entities/
        └── interview-ai-evaluation/
            ├── interview-ai-evaluation.entity.ts
            └── index.ts
```

## 🚀 Quick Start

### 1️⃣ Cấu hình API Key

Thêm vào file `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

Lấy API key tại: https://aistudio.google.com/app/apikey

### 2️⃣ Chạy Migration

```bash
npm run migration:run
```

### 3️⃣ Khởi động Server

```bash
npm run start:dev
```

### 4️⃣ Test API

```bash
# PowerShell
.\test-ai-scoring.ps1
```

Hoặc test qua Swagger: http://localhost:3000/api

## 🎯 API Endpoints

### POST `/interview-scoring/score`
Chấm điểm interview

**Request:**
```json
{
  "candidateInterviewId": "uuid-here"
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
  "summary": "Candidate shows strong technical knowledge...",
  "modelUsed": "gemini-2.5-flash",
  "createdAt": "2025-12-19T..."
}
```

### GET `/interview-scoring/evaluation/:candidateInterviewId`
Lấy kết quả đánh giá

### GET `/interview-scoring/employer/evaluations`
Lấy tất cả đánh giá của employer

## 📊 Scoring System

### Tiêu chí (0-10 points each)

| Criterion | Description |
|-----------|-------------|
| **Technical Accuracy** | Độ chính xác kỹ thuật |
| **Logical Thinking** | Tư duy logic |
| **Depth of Experience** | Độ sâu kinh nghiệm |
| **Clarity of Expression** | Độ rõ ràng diễn đạt |
| **Relevance to Job** | Mức độ phù hợp công việc |

### Recommendation

| Score | Level | Meaning |
|-------|-------|---------|
| 40-50 | **STRONG_FIT** | 🌟 Xuất sắc |
| 25-39 | **POTENTIAL** | 💪 Tốt, có tiềm năng |
| 0-24 | **NOT_FIT** | ❌ Chưa đáp ứng |

## 🔒 Anti-Bias Design

AI **KHÔNG** nhận được:
- ❌ Tên ứng viên
- ❌ Giới tính  
- ❌ Trường học
- ❌ Tuổi tác
- ❌ Ảnh đại diện

AI **CHỈ** nhận:
- ✅ Job Title
- ✅ Questions & Answers

## 🗄️ Database Schema

```sql
CREATE TABLE interview_ai_evaluations (
  evaluation_id UUID PRIMARY KEY,
  candidate_interview_id UUID REFERENCES candidate_interviews,
  total_score NUMERIC NOT NULL,
  recommendation VARCHAR(20) NOT NULL,
  criteria JSONB NOT NULL,
  ai_summary TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  detailed_feedback JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🧪 Testing

### Test qua PowerShell Script

```powershell
.\test-ai-scoring.ps1
```

### Test qua Postman

1. Import collection từ: `docs/AI_SCORING_POSTMAN.json`
2. Set variables:
   - `base_url`: http://localhost:3000
   - `access_token`: (from login)
   - `candidate_interview_id`: (valid UUID)

### Test qua Swagger

1. Truy cập: http://localhost:3000/api
2. Tìm section: **"Interview Scoring"**
3. Authorize với Bearer token
4. Test endpoints

## 📚 Documentation

| File | Description |
|------|-------------|
| [AI_INTERVIEW_SCORING.md](docs/AI_INTERVIEW_SCORING.md) | Chi tiết tính năng |
| [AI_SCORING_QUICKSTART.md](docs/AI_SCORING_QUICKSTART.md) | Hướng dẫn nhanh |
| [AI_SCORING_IMPLEMENTATION_SUMMARY.md](docs/AI_SCORING_IMPLEMENTATION_SUMMARY.md) | Tóm tắt implementation |

## ⚠️ Lưu ý

### Điều kiện để chấm điểm

- Interview status = `submitted`
- Có ít nhất 1 câu trả lời
- GEMINI_API_KEY được cấu hình

### Rate Limiting

- Free tier: 15 requests/minute
- Cân nhắc background job cho production

### Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `GEMINI_API_KEY not found` | Missing API key | Add to .env |
| `Interview not submitted` | Status ≠ submitted | Update status |
| `No answers found` | Empty answers | Add answers |
| `AI scoring failed` | API error | Check logs |

## 🔧 Troubleshooting

### 1. API Key không hoạt động

```bash
# Kiểm tra .env
cat .env | Select-String "GEMINI_API_KEY"

# Test API key
curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
```

### 2. Interview không được chấm

```sql
-- Check interview status
SELECT candidate_interview_id, status 
FROM candidate_interviews 
WHERE candidate_interview_id = 'your-uuid';

-- Check answers
SELECT COUNT(*) 
FROM interview_answers 
WHERE candidate_interview_id = 'your-uuid';
```

### 3. Migration lỗi

```bash
# Reset database (CAREFUL!)
npm run schema:drop
npm run migration:run

# Or run specific migration
npm run migration:run
```

## 🎓 Examples

### Example 1: Basic Scoring

```typescript
// POST /interview-scoring/score
{
  "candidateInterviewId": "123e4567-e89b-12d3-a456-426614174000"
}

// Response
{
  "totalScore": 38,
  "recommendation": "POTENTIAL",
  "criteria": {
    "technical": 8,
    "logic": 7,
    "experience": 7,
    "clarity": 8,
    "relevance": 8
  },
  "summary": "Good foundational knowledge with room for growth..."
}
```

### Example 2: Strong Candidate

```typescript
{
  "totalScore": 46,
  "recommendation": "STRONG_FIT",
  "criteria": {
    "technical": 10,
    "logic": 9,
    "experience": 9,
    "clarity": 9,
    "relevance": 9
  },
  "summary": "Exceptional candidate with deep expertise..."
}
```

## 🚀 Next Steps

1. ✅ Implement background job processing
2. ✅ Add manual score override
3. ✅ Create analytics dashboard
4. ✅ A/B test different prompts
5. ✅ Multi-language support

## 📞 Support

Nếu gặp vấn đề:

1. Check server logs
2. Verify .env configuration
3. Check database migration status
4. Review API documentation
5. Contact team

## 📄 License

Internal use only - Graduation Project

---

**Version:** 1.0.0  
**Last Updated:** December 19, 2025  
**Model:** Gemini 2.5 Flash  
**Status:** ✅ Production Ready
