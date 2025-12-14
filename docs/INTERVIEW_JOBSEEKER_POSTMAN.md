# Hướng dẫn test API (Jobseeker) — Interview

File này mô tả các request Postman để ứng viên (role `jobseeker`) tương tác với hệ thống interview: xem assignment, bắt đầu, nộp đáp án và xem đáp án đã nộp.

Chuẩn bị môi trường Postman:
- Tạo Environment với biến `base_url` (ví dụ `http://localhost:3000`) và `bearerToken` (JWT của jobseeker).

Header chung:
- `Authorization: Bearer {{bearerToken}}`
- `Content-Type: application/json`

1) Danh sách assignments của ứng viên
- Method: GET
- URL: `{{base_url}}/users/interviews`
- Response: mảng `candidate_interviews` assigned cho user.

2) Xem assignment và câu hỏi
- Method: GET
- URL: `{{base_url}}/users/interviews/:id`
- Thay `:id` = `candidate_interview_id`
- Response: object chứa `candidateInterview` và `questions` (array)

3) Bắt đầu assignment
- Method: POST
- URL: `{{base_url}}/users/interviews/:id/start`
- Body: none
- Hành động: set `started_at`, status -> `in_progress`

4) Nộp đáp án (submit)
- Method: POST
- URL: `{{base_url}}/users/interviews/:id/submit`
- Body (JSON):
```
{
  "answers": [
    { "question_id": "<question_uuid>", "answer_text": "Nội dung trả lời...", "elapsed_seconds": 120 },
    { "question_id": "<question_uuid_2>", "answer_text": "Code / mô tả...", "elapsed_seconds": 240 }
  ]
}
```
- Hành động: tạo/ cập nhật `interview_answers`, set `completed_at`, status -> `submitted`.

5) Xem các đáp án đã nộp (ứng viên)
- Method: GET
- URL: `{{base_url}}/users/interviews/:id/answers`
- Trả về danh sách `interview_answers` cho `candidate_interview_id` tương ứng.

Ví dụ curl (submit):
```
curl -X POST "{{base_url}}/users/interviews/<CANDIDATE_INTERVIEW_ID>/submit" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_id":"<Q_ID>","answer_text":"Ví dụ trả lời","elapsed_seconds":90}]}'
```

Ghi chú:
- Nếu nhận lỗi 403: kiểm tra token và role, đảm bảo token thuộc user `jobseeker`.
- Nếu nhận lỗi 404: confirm `candidate_interview_id` tồn tại và thuộc user.
- Đảm bảo server đã chạy và migration đã được apply (nếu cần):
```
npm run migration:run
npm run start:dev
```

Muốn tôi xuất file Postman Collection (.json) chứa sẵn các request này không? Tôi có thể thêm vào repo.
