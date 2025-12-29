# AI Interview Scoring Feature

## Tổng quan

Tính năng AI chấm điểm phỏng vấn tự động sử dụng Google Gemini 2.5-flash để đánh giá câu trả lời của ứng viên dựa trên 5 tiêu chí chính.

## Kiến trúc

```
Interview Answers → Preprocessing → AI Service (Gemini) → Evaluation Result → Database
```

## Setup

### 1. Environment Variables

Thêm vào file `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Database Migration

Chạy migration để tạo bảng `interview_ai_evaluations`:

```bash
npm run migration:generate -- src/database/migrations/CreateInterviewAiEvaluationTable
npm run migration:run
```

### 3. Cài đặt dependencies

Package `@google/generative-ai` đã được cài đặt sẵn trong package.json.

## API Endpoints

### 1. Chấm điểm interview

**POST** `/interview-scoring/score`

**Authorization:** Bearer Token (Employer hoặc Admin)

**Body:**
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
  "summary": "Candidate shows strong backend knowledge...",
  "detailedFeedback": [...],
  "modelUsed": "gemini-2.5-flash",
  "createdAt": "2025-12-19T10:30:00Z"
}
```

### 2. Lấy kết quả đánh giá

**GET** `/interview-scoring/evaluation/:candidateInterviewId`

**Authorization:** Bearer Token (Employer hoặc Admin)

**Response:** Tương tự endpoint POST /score

### 3. Lấy tất cả đánh giá của employer

**GET** `/interview-scoring/employer/evaluations`

**Authorization:** Bearer Token (Employer hoặc Admin)

**Response:** Array of evaluation results

## Tiêu chí chấm điểm

Mỗi interview được đánh giá theo 5 dimensions (thang điểm 0-10):

| Dimension | Mô tả |
|-----------|-------|
| **Technical Accuracy** | Độ chính xác và chuyên môn của câu trả lời |
| **Logical Thinking** | Tư duy logic và cấu trúc lập luận |
| **Depth of Experience** | Độ sâu kinh nghiệm thực tế |
| **Clarity of Expression** | Độ rõ ràng trong diễn đạt |
| **Relevance to Job** | Mức độ liên quan đến vị trí tuyển dụng |

**Tổng điểm:** 0-50

## Recommendation Levels

| Điểm | Recommendation | Ý nghĩa |
|------|----------------|---------|
| 40-50 | STRONG_FIT | Ứng viên xuất sắc, rất phù hợp |
| 25-39 | POTENTIAL | Ứng viên tốt, có tiềm năng |
| 0-24 | NOT_FIT | Không đáp ứng yêu cầu |

## Anti-Bias Design

Để tránh thiên kiến, AI **KHÔNG** nhận được các thông tin sau:
- Tên ứng viên
- Giới tính
- Trường học
- Tuổi
- Ảnh đại diện

Chỉ gửi:
- Job Title
- Questions & Answers

## Database Schema

```sql
CREATE TABLE interview_ai_evaluations (
  evaluation_id UUID PRIMARY KEY,
  candidate_interview_id UUID REFERENCES candidate_interviews(candidate_interview_id),
  total_score NUMERIC NOT NULL,
  recommendation VARCHAR(20) NOT NULL,
  criteria JSONB NOT NULL,
  ai_summary TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  detailed_feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Workflow Usage

1. **Candidate hoàn thành interview:**
   - Status thay đổi từ `in_progress` → `submitted`

2. **Employer trigger AI scoring:**
   ```bash
   POST /interview-scoring/score
   {
     "candidateInterviewId": "abc-123"
   }
   ```

3. **System xử lý:**
   - Lấy tất cả câu hỏi và câu trả lời
   - Build prompt cho Gemini AI
   - Nhận kết quả từ AI
   - Lưu vào database
   - Update `total_score` trong `candidate_interviews`

4. **Employer xem kết quả:**
   ```bash
   GET /interview-scoring/evaluation/abc-123
   ```

## Error Handling

| Error | Message |
|-------|---------|
| Interview not found | `Candidate interview not found` |
| Interview not submitted | `Interview must be submitted before scoring` |
| No answers found | `No answers found for this interview` |
| AI service error | `AI scoring failed: [error message]` |
| Evaluation already exists | Returns existing evaluation |

## Best Practices

### 1. Retry Logic
Nếu AI service lỗi, có thể retry request.

### 2. Manual Override
HR/Employer có thể điều chỉnh điểm AI nếu cần (tính năng có thể mở rộng).

### 3. Audit Trail
Tất cả evaluation được lưu với `model_used` để tracking khi model thay đổi.

### 4. Caching
Nếu đã có evaluation cho một interview, trả về kết quả cũ thay vì chấm lại.

## Testing

### Postman Collection

1. **Đăng nhập Employer:**
```
POST /auth/login
Body: { "email": "employer@example.com", "password": "password123" }
```

2. **Chấm điểm Interview:**
```
POST /interview-scoring/score
Headers: { "Authorization": "Bearer <token>" }
Body: { "candidateInterviewId": "uuid" }
```

3. **Kiểm tra kết quả:**
```
GET /interview-scoring/evaluation/:candidateInterviewId
Headers: { "Authorization": "Bearer <token>" }
```

## Code Structure

```
src/modules/interview-scoring/
├── dto/
│   ├── score-interview.dto.ts
│   ├── ai-evaluation-result.dto.ts
│   └── index.ts
├── services/
│   ├── gemini-ai.service.ts
│   └── interview-scoring.service.ts
├── interview-scoring.controller.ts
└── interview-scoring.module.ts

src/database/entities/interview-ai-evaluation/
├── interview-ai-evaluation.entity.ts
└── index.ts
```

## Future Enhancements

1. **Background Job Processing:** Sử dụng Queue (Bull/BullMQ) để chấm điểm không đồng bộ
2. **Hybrid Scoring:** Kết hợp AI score + HR manual score
3. **Custom Rubric:** Cho phép employer tùy chỉnh tiêu chí chấm điểm
4. **Question-level Scoring:** Chi tiết điểm từng câu hỏi
5. **Comparison View:** So sánh nhiều ứng viên cùng lúc

## Lưu ý kỹ thuật

- Model: `gemini-2.5-flash-preview-0514`
- Max tokens: Auto (Gemini handles)
- Temperature: Default
- JSON mode: Required for structured output
- Timeout: 30s (có thể config)

## Support

Nếu gặp lỗi hoặc cần hỗ trợ, kiểm tra:
1. GEMINI_API_KEY có đúng không
2. Candidate interview đã submit chưa
3. Interview có câu trả lời không
4. Logs trong console
