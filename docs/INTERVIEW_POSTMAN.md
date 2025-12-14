# Hướng dẫn test API Interview bằng Postman

Tệp này chứa mẫu request để test các API quản lý interview (employer) và quản lý đáp án ứng viên.

Chuẩn bị môi trường Postman:
- Tạo Environment với 2 biến:
  - `base_url` = `http://localhost:3000` (hoặc URL server của bạn)
  - `bearerToken` = `<JWT_TOKEN>` (token của user có role `employer` hoặc `jobseeker`)

Header chung cho các request có auth:
- `Authorization: Bearer {{bearerToken}}`
- `Content-Type: application/json`

1) Tạo câu hỏi (Employer)
- Method: POST
- URL: `{{base_url}}/employer/interviews/:interviewId/questions`
- Body (raw JSON):
```
{
  "question_text": "Hãy mô tả dự án gần nhất của bạn",
  "time_limit_seconds": 600,
  "max_score": 10
}
```

2) Liệt kê câu hỏi (Employer)
- Method: GET
- URL: `{{base_url}}/employer/interviews/:interviewId/questions`

3) Xem 1 câu hỏi
- Method: GET
- URL: `{{base_url}}/employer/interviews/:interviewId/questions/:questionId`

4) Cập nhật câu hỏi
- Method: PATCH
- URL: `{{base_url}}/employer/interviews/:interviewId/questions/:questionId`
- Body (raw JSON):
```
{
  "question_text": "Cập nhật nội dung câu hỏi",
  "max_score": 15
}
```

5) Xóa câu hỏi
- Method: DELETE
- URL: `{{base_url}}/employer/interviews/:interviewId/questions/:questionId`

6) Liệt kê assignments (candidate_interviews) cho một interview
- Method: GET
- URL: `{{base_url}}/employer/interviews/:interviewId/candidates`

7) Liệt kê câu trả lời của một candidate interview
- Method: GET
- URL: `{{base_url}}/employer/interviews/:interviewId/candidates/:candidateInterviewId/answers`

8) Xem 1 câu trả lời
- Method: GET
- URL: `{{base_url}}/employer/interviews/:interviewId/candidates/:candidateInterviewId/answers/:answerId`

9) Chấm điểm / phản hồi câu trả lời
- Method: PATCH
- URL: `{{base_url}}/employer/interviews/:interviewId/candidates/:candidateInterviewId/answers/:answerId/grade`
- Body (raw JSON):
```
{
  "score": 8,
  "feedback": "Trả lời rõ ràng, nêu chi tiết công nghệ sử dụng"
}
```

Ghi chú và mẹo:
- Đảm bảo token trong `bearerToken` thuộc user có role tương ứng (`employer` để gọi API quản lý).
- Nếu server trả lỗi 401/403: kiểm tra token và role; kiểm tra `JwtAuthGuard` và `RolesGuard` trong project.
- Nếu bảng chưa tồn tại, chạy migration trước:
```
npm run migration:run
```
- Ví dụ curl (tạo câu hỏi):
```
curl -X POST "{{base_url}}/employer/interviews/<INTERVIEW_ID>/questions" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question_text":"Ví dụ","max_score":5}'
```

Muốn tôi xuất sẵn 1 Postman Collection (.json) chứa các request này không? Tôi có thể tạo và thêm vào repo.
