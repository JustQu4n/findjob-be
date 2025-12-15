# API Documentation - Interview Feature

## Tổng quan

Hệ thống Interview cho phép:
- **Employer**: Tạo bài interview, gán cho JobPost, quản lý câu hỏi, chấm điểm, xem thống kê
- **JobSeeker**: Xem thông tin interview, chấp nhận tham gia, làm bài, submit câu trả lời

---

## 🔵 EMPLOYER ENDPOINTS

### 1. Tạo Interview Template
```http
POST /employer/interviews
Authorization: Bearer {token}
Role: employer

Body:
{
  "title": "Backend Developer Interview",
  "description": "Đánh giá kỹ năng backend",
  "job_post_id": "uuid", // optional
  "status": "draft", // draft | active | inactive
  "total_time_minutes": 30,
  "deadline": "2025-12-31T23:59:59Z" // ISO timestamp
}

Response: Interview object
```

### 2. Lấy danh sách Interview của Employer
```http
GET /employer/interviews
Authorization: Bearer {token}
Role: employer

Response: Interview[]
```

### 3. Xem chi tiết Interview (có questions & assignments)
```http
GET /employer/interviews/:interviewId
Authorization: Bearer {token}
Role: employer

Response:
{
  "interview": {...},
  "questions": [...],
  "assignments": [...]
}
```

### 4. Cập nhật Interview
```http
PATCH /employer/interviews/:interviewId
Authorization: Bearer {token}
Role: employer

Body:
{
  "title": "Updated title",
  "status": "active",
  "total_time_minutes": 45
}
```

### 5. Xóa Interview
```http
DELETE /employer/interviews/:interviewId
Authorization: Bearer {token}
Role: employer
```

### 6. Gán Interview cho JobPost
```http
POST /employer/interviews/:interviewId/attach-jobpost
Authorization: Bearer {token}
Role: employer

Body:
{
  "job_post_id": "uuid"
}

Response:
{
  "message": "Interview attached to job post successfully",
  "interview": {...}
}
```

### 7. Gỡ Interview khỏi JobPost
```http
POST /employer/interviews/:interviewId/detach-jobpost
Authorization: Bearer {token}
Role: employer

Response:
{
  "message": "Interview detached from job post successfully",
  "interview": {...}
}
```

### 8. Thống kê kết quả Interview
```http
GET /employer/interviews/:interviewId/statistics
Authorization: Bearer {token}
Role: employer

Response:
{
  "total": 10,
  "assigned": 2,
  "in_progress": 3,
  "submitted": 4,
  "timeout": 1,
  "average_score": 75.5,
  "candidates": [
    {
      "candidate_interview_id": "uuid",
      "candidate_name": "Nguyễn Văn A",
      "status": "submitted",
      "total_score": 85,
      "assigned_at": "...",
      "started_at": "...",
      "completed_at": "..."
    },
    ...
  ]
}
```

### 9. Tạo câu hỏi cho Interview
```http
POST /employer/interviews/:interviewId/questions
Authorization: Bearer {token}
Role: employer

Body:
{
  "question_text": "Mô tả kiến trúc microservices",
  "time_limit_seconds": 180,
  "order_index": 1,
  "max_score": 10
}
```

### 10. Lấy danh sách câu hỏi
```http
GET /employer/interviews/:interviewId/questions
Authorization: Bearer {token}
Role: employer

Response: InterviewQuestion[]
```

### 11. Cập nhật câu hỏi
```http
PATCH /employer/interviews/:interviewId/questions/:questionId
Authorization: Bearer {token}
Role: employer

Body:
{
  "question_text": "Updated question",
  "time_limit_seconds": 240,
  "order_index": 2
}
```

### 12. Xóa câu hỏi
```http
DELETE /employer/interviews/:interviewId/questions/:questionId
Authorization: Bearer {token}
Role: employer
```

### 13. Gán ứng viên vào Interview (Manual Assignment)
```http
POST /employer/interviews/:interviewId/assign
Authorization: Bearer {token}
Role: employer

Body:
{
  "application_id": "uuid",
  "candidate_id": "uuid" // optional
}

Response: CandidateInterview object
```

### 14. Xem danh sách ứng viên đã làm Interview
```http
GET /employer/interviews/:interviewId/candidates
Authorization: Bearer {token}
Role: employer

Response: CandidateInterview[] (with candidate info)
```

### 15. Xem câu trả lời của ứng viên
```http
GET /employer/interviews/:interviewId/candidates/:candidateInterviewId/answers
Authorization: Bearer {token}
Role: employer

Response: InterviewAnswer[]
```

### 16. Chấm điểm câu trả lời
```http
PATCH /employer/interviews/:interviewId/candidates/:candidateInterviewId/answers/:answerId/grade
Authorization: Bearer {token}
Role: employer

Body:
{
  "score": 8.5,
  "feedback": "Câu trả lời tốt, chi tiết"
}

Response: Updated InterviewAnswer
```

---

## 🟢 JOBSEEKER ENDPOINTS

### 1. Apply Job (Kiểm tra Interview)
```http
POST /jobseeker/applications
Authorization: Bearer {token}
Role: jobseeker

Body:
{
  "job_post_id": "uuid",
  "cover_letter": "...",
  "resume_url": "..."
}

Response:
{
  "message": "Nộp đơn ứng tuyển thành công",
  "data": Application,
  "interview": {
    "interview_id": "uuid",
    "title": "Backend Interview",
    "description": "...",
    "total_time_minutes": 30,
    "has_interview": true
  } | null
}
```
**Nghiệp vụ**: Nếu `interview` không null → Frontend hiển thị popup mời làm bài

### 2. Xem thông tin Interview (Preview - trước khi accept)
```http
GET /jobseeker/interviews/preview/:interviewId
Authorization: Bearer {token}
Role: jobseeker

Response:
{
  "interview_id": "uuid",
  "title": "Backend Interview",
  "description": "Đánh giá kỹ năng backend",
  "total_time_minutes": 30,
  "deadline": "2025-12-31T23:59:59Z",
  "status": "active",
  "question_count": 5
}
```

### 3. Accept Interview (Self-Assign)
```http
POST /jobseeker/interviews/:interviewId/accept
Authorization: Bearer {token}
Role: jobseeker

Body:
{
  "application_id": "uuid"
}

Response: CandidateInterview
{
  "candidate_interview_id": "uuid",
  "interview_id": "uuid",
  "application_id": "uuid",
  "candidate_id": "uuid",
  "status": "assigned",
  "assigned_at": "...",
  "deadline_at": "..."
}
```

### 4. Lấy danh sách Interview của mình
```http
GET /jobseeker/interviews
Authorization: Bearer {token}
Role: jobseeker

Response: CandidateInterview[]
```

### 5. Xem chi tiết bài Interview được gán
```http
GET /jobseeker/interviews/:candidateInterviewId
Authorization: Bearer {token}
Role: jobseeker

Response:
{
  "candidateInterview": {
    "candidate_interview_id": "uuid",
    "status": "assigned",
    "started_at": null,
    "completed_at": null,
    "deadline_at": "..."
  },
  "questions": [
    {
      "question_id": "uuid",
      "question_text": "...",
      "time_limit_seconds": 180,
      "order_index": 1,
      "max_score": 10
    },
    ...
  ]
}
```
**Nghiệp vụ**: Frontend hiển thị từng câu 1, có countdown per question

### 6. Bắt đầu làm bài
```http
POST /jobseeker/interviews/:candidateInterviewId/start
Authorization: Bearer {token}
Role: jobseeker

Response: CandidateInterview (status = in_progress, started_at = now)
```

### 7. Submit câu trả lời
```http
POST /jobseeker/interviews/:candidateInterviewId/submit
Authorization: Bearer {token}
Role: jobseeker

Body:
{
  "answers": [
    {
      "question_id": "uuid",
      "answer_text": "Microservices là...",
      "elapsed_seconds": 120
    },
    ...
  ]
}

Response: { "ok": true }
```
**Nghiệp vụ**: Status đổi thành `submitted`, completed_at = now

### 8. Xem câu trả lời của mình
```http
GET /jobseeker/interviews/:candidateInterviewId/answers
Authorization: Bearer {token}
Role: jobseeker

Response: InterviewAnswer[]
```

---

## 📊 Database Schema

### interviews
| Column | Type | Description |
|--------|------|-------------|
| interview_id | uuid | PK |
| job_post_id | uuid | FK (nullable) |
| employer_id | uuid | FK |
| title | text | Tên bài interview |
| description | text | Mô tả |
| status | varchar(32) | draft/active/inactive |
| total_time_minutes | int | Tổng thời gian (phút) |
| deadline | timestamp | Hạn chót làm bài |
| created_at | timestamp | |
| updated_at | timestamp | |

### interview_questions
| Column | Type | Description |
|--------|------|-------------|
| question_id | uuid | PK |
| interview_id | uuid | FK |
| question_text | text | Nội dung câu hỏi |
| time_limit_seconds | int | Thời gian trả lời (giây) |
| order_index | int | Thứ tự câu (1,2,3...) |
| max_score | numeric | Điểm tối đa |
| created_at | timestamp | |
| updated_at | timestamp | |

### candidate_interviews
| Column | Type | Description |
|--------|------|-------------|
| candidate_interview_id | uuid | PK |
| interview_id | uuid | FK |
| application_id | uuid | FK |
| candidate_id | uuid | FK (user_id) |
| assigned_by | uuid | FK (user_id) |
| assigned_at | timestamp | |
| started_at | timestamp | |
| completed_at | timestamp | |
| deadline_at | timestamp | Hạn chót (assigned_at + interview.deadline) |
| status | varchar(32) | assigned/in_progress/submitted/timeout |
| total_score | numeric | Tổng điểm |
| result | varchar(32) | pending/pass/fail |
| metadata | jsonb | |
| created_at | timestamp | |
| updated_at | timestamp | |

### interview_answers
| Column | Type | Description |
|--------|------|-------------|
| interview_answer_id | uuid | PK |
| candidate_interview_id | uuid | FK |
| question_id | uuid | FK |
| answer_text | text | Câu trả lời |
| elapsed_seconds | int | Thời gian trả lời |
| score | numeric | Điểm |
| graded_by | uuid | FK (user_id) |
| graded_at | timestamp | |
| feedback | text | Nhận xét của HR |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 🎯 Flow nghiệp vụ

### Flow 1: Employer tạo Interview cho JobPost
1. Employer tạo Interview template (status = draft)
2. Thêm câu hỏi (order_index: 1, 2, 3...)
3. Gắn Interview vào JobPost: `POST /employer/interviews/:id/attach-jobpost`
4. Đổi status thành `active`

### Flow 2: JobSeeker Apply & Accept Interview
1. JobSeeker apply job → API trả về `interview` object (nếu có)
2. Frontend hiển thị popup: "Bạn có muốn làm bài Interview?"
3. Click "Bắt đầu ngay" → `POST /jobseeker/interviews/:id/accept`
4. Tạo `CandidateInterview` (status = assigned, deadline_at = calculated)

### Flow 3: JobSeeker làm bài
1. Vào danh sách interview: `GET /jobseeker/interviews`
2. Chọn 1 bài → `GET /jobseeker/interviews/:candidateInterviewId`
3. Click Start → `POST /jobseeker/interviews/:id/start` (status = in_progress)
4. Frontend hiển thị từng câu hỏi (1 câu/lúc)
   - Countdown per question (time_limit_seconds)
   - Auto-submit khi hết giờ
5. Submit toàn bộ → `POST /jobseeker/interviews/:id/submit`

### Flow 4: Employer xem kết quả & chấm điểm
1. Xem thống kê: `GET /employer/interviews/:id/statistics`
2. Xem danh sách ứng viên: `GET /employer/interviews/:id/candidates`
3. Xem câu trả lời: `GET /employer/interviews/:id/candidates/:ciId/answers`
4. Chấm điểm: `PATCH /employer/interviews/:id/candidates/:ciId/answers/:answerId/grade`

---

## ✅ Tính năng đã hoàn thành

- [x] Entity Interview: total_time_minutes, deadline, status (draft/active/inactive)
- [x] Entity InterviewQuestion: order_index, time_limit_seconds
- [x] Entity CandidateInterview: deadline_at, status (assigned/in_progress/submitted/timeout)
- [x] Application API trả về interview info khi apply
- [x] Employer attach/detach interview to jobpost
- [x] JobSeeker self-assign (accept interview)
- [x] JobSeeker preview interview trước khi accept
- [x] JobSeeker start interview → status = in_progress
- [x] JobSeeker submit answers
- [x] Employer statistics dashboard
- [x] Employer grade answers
- [x] Timeout detection (getAssignment kiểm tra deadline_at)

---

## 📝 Frontend Implementation Notes

### Popup sau khi Apply
```javascript
// Response từ POST /jobseeker/applications
{
  "interview": {
    "interview_id": "abc123",
    "title": "Backend Interview",
    "total_time_minutes": 30,
    "has_interview": true
  }
}

// Hiển thị modal:
<Modal>
  🎯 Nhà tuyển dụng yêu cầu làm bài Interview
  ⏱ Thời gian: 30 phút
  📄 Số câu hỏi: {call preview API}
  
  <Button onClick={acceptInterview}>Bắt đầu ngay</Button>
  <Button>Làm sau</Button>
</Modal>
```

### Làm bài Interview
```javascript
// 1. Get questions
const { questions } = await GET('/jobseeker/interviews/:ciId')

// 2. Start interview
await POST('/jobseeker/interviews/:ciId/start')

// 3. Display questions one by one
questions.forEach((q, idx) => {
  // Hiển thị câu idx
  // Countdown: q.time_limit_seconds
  // Không cho quay lại câu trước
  // Auto-submit khi hết giờ
})

// 4. Submit all
await POST('/jobseeker/interviews/:ciId/submit', {
  answers: [{ question_id, answer_text, elapsed_seconds }, ...]
})
```

---

## 🚀 Cần chạy migration
```bash
npm run migration:run
# Hoặc nếu dùng TypeORM CLI:
npm run typeorm migration:run
```

Migration file: `1734400000000-AddInterviewEnhancements.ts`
