I. Mục tiêu nghiệp vụ AI Interview Scoring
Vấn đề thực tế

HR không đủ thời gian đọc hàng trăm bài tự luận

Đánh giá thủ công thiếu nhất quán

CV tốt ≠ năng lực thật

AI giải quyết

Tự động chấm điểm – xếp hạng

Đánh giá logic – chuyên môn – kinh nghiệm

Gợi ý quyết định cho HR (không thay thế hoàn toàn)

II. Nguyên tắc thiết kế AI (RẤT QUAN TRỌNG)
Nguyên tắc	Giải thích
AI là trợ lý	HR là người quyết định
Chấm theo rubric	Tránh cảm tính
Có explain	HR phải hiểu vì sao AI chấm
Không lộ prompt	Bảo mật
III. KIẾN TRÚC TỔNG THỂ AI SCORING
Interview Answers
      ↓
Preprocessing
      ↓
Prompt Builder
      ↓
LLM (OpenAI / Gemini)
      ↓
AI Evaluation Result
      ↓
Store DB
      ↓
Employer Dashboard

IV. NGHIỆP VỤ CHI TIẾT – AI CHẤM ĐIỂM
1. Trigger AI chấm điểm
1.1 Khi nào AI chạy?
Thời điểm	Ghi chú
Khi submit Interview	Phổ biến nhất
Background job	Không block user
Manual re-score	HR yêu cầu
1.2 Điều kiện chạy AI

Interview status = SUBMITTED

Có đầy đủ answers

Template còn hiệu lực

2. Input cho AI (CỰC KỲ QUAN TRỌNG)
2.1 Dữ liệu gửi vào AI
{
  "jobTitle": "Backend Developer",
  "questions": [
    {
      "question": "Thiết kế REST API an toàn",
      "answer": "Em sẽ dùng JWT, refresh token..."
    }
  ]
}

2.2 Tuyệt đối KHÔNG gửi

Tên ứng viên

Giới tính

Trường học

👉 Giảm bias

3. Tiêu chí chấm điểm (Scoring Rubric)
3.1 Các dimensions chấm điểm
Dimension	Điểm
Technical Accuracy	0–10
Logical Thinking	0–10
Depth of Experience	0–10
Clarity of Expression	0–10
Relevance to Job	0–10

👉 Tổng: 0–50

3.2 Mapping sang mức đánh giá
Điểm	Nhận xét
40–50	Rất mạnh
30–39	Phù hợp
20–29	Trung bình
<20	Không phù hợp
4. Prompt Design (TRỌNG TÂM)
4.1 Prompt chuẩn (LLM-agnostic)
You are a senior technical interviewer.

Evaluate the following interview answers for a Backend Developer position.

For each answer:
- Score from 0 to 10 for:
  1. Technical accuracy
  2. Logical thinking
  3. Practical experience
  4. Clarity of expression
  5. Relevance to the job

Then provide:
- Short explanation for each score
- Overall evaluation summary
- Final recommendation: STRONG_FIT | POTENTIAL | NOT_FIT

Return result in JSON format.

4.2 JSON Output BẮT BUỘC
{
  "totalScore": 42,
  "finalRecommendation": "STRONG_FIT",
  "criteria": {
    "technical": 9,
    "logic": 8,
    "experience": 9,
    "clarity": 8,
    "relevance": 8
  },
  "summary": "Candidate shows strong backend knowledge..."
}


👉 Dễ parse – dễ lưu DB – dễ hiển thị

5. AI Evaluation Entity (DB)
TABLE interview_ai_evaluations (
  id UUID PK,
  interview_session_id UUID,
  total_score FLOAT,
  recommendation VARCHAR(20),
  criteria JSONB,
  ai_summary TEXT,
  model_used VARCHAR(50),
  created_at TIMESTAMP
)

6. Hybrid Scoring (AI + HR) ⭐⭐⭐
6.1 HR chỉnh điểm
AI Score: 42
HR Adjusted Score: 45
Reason: Strong real-world examples

6.2 Final Score
final_score = (ai_score * 0.7) + (hr_score * 0.3)

7. Anti-hallucination & Quality Control
Cách	Mô tả
Context job	Gửi yêu cầu job
JSON schema	Bắt format
Max tokens	Tránh lan man
Retry logic	Nếu JSON lỗi
8. Employer Dashboard – AI Result
8.1 UI gợi ý
AI Score: 42/50 ⭐⭐⭐⭐☆
Recommendation: STRONG FIT

✔ Strong backend fundamentals
✔ Clear explanation
✘ Lacking scaling examples

9. Audit & Explainability (RẤT QUAN TRỌNG)

HR có thể:

Xem từng câu:

Question

Answer

AI comment

Re-score nếu cần

👉 Tránh “AI phán là xong”

V. Edge Cases & Risk Handling
Case	Xử lý
Answer quá ngắn	Auto low clarity
Copy-paste	Detect similarity
AI lỗi	Fallback manual
Model thay đổi	Lưu model_used