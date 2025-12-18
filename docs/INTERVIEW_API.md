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

### 1. Lấy danh sách Applications có Interview (Cho trang "Applications with Interviews")
```http
GET /jobseeker/applications/with-interviews
Authorization: Bearer {token}
Role: jobseeker

Response: Application[]
[
  {
    "application_id": "uuid",
    "job_post_id": "uuid",
    "status": "pending",
    "applied_at": "...",
    "jobPost": {
      "job_post_id": "uuid",
      "title": "Backend Developer",
      "company": {...}
    },
    "interview": {
      "interview_id": "uuid",
      "title": "Backend Interview",
      "description": "...",
      "total_time_minutes": 30,
      "deadline": "2025-12-31T23:59:59Z",
      "status": "active"
    },
    "candidateInterview": {
      "candidate_interview_id": "uuid",
      "status": "assigned",
      "assigned_at": "...",
      "deadline_at": "...",
      "started_at": null,
      "completed_at": null
    } | null
  }
]
```
**Nghiệp vụ**: 
- Hiển thị tất cả applications có interview
- Nếu `candidateInterview` null → chưa accept, hiện nút "Bắt đầu ngay"
- Nếu có `candidateInterview` → đã accept, hiện trạng thái và deadline

### 2. Apply Job (Kiểm tra Interview)
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

### 3. Xem thông tin Interview (Preview - trước khi accept)
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

### 4. Accept Interview (Self-Assign)
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

### 5. Lấy danh sách Interview của mình
```http
GET /jobseeker/interviews
Authorization: Bearer {token}
Role: jobseeker

Response: CandidateInterview[]
```

### 6. Lấy lịch sử Interview đã làm (với điểm và feedback)
```http
GET /jobseeker/interviews/history
Authorization: Bearer {token}
Role: jobseeker

Response:
[
  {
    "candidate_interview_id": "uuid",
    "interview": {
      "interview_id": "uuid",
      "title": "Backend Interview",
      "description": "..."
    },
    "jobPost": {
      "job_post_id": "uuid",
      "title": "Backend Developer",
      "company": {...}
    },
    "status": "submitted",
    "assigned_at": "...",
    "started_at": "...",
    "completed_at": "...",
    "deadline_at": "...",
    "total_score": 85,
    "max_score": 100,
    "percentage": "85.00",
    "result": "pass",
    "answers": [
      {
        "question_id": "uuid",
        "question_text": "Mô tả kiến trúc microservices",
        "answer_text": "Microservices là...",
        "score": 8.5,
        "max_score": 10,
        "feedback": "Câu trả lời tốt, chi tiết",
        "graded_at": "...",
        "elapsed_seconds": 120
      },
      ...
    ]
  },
  ...
]
```
**Nghiệp vụ**: Hiển thị lịch sử các bài interview đã làm, bao gồm điểm số, feedback từ employer

### 7. Xem chi tiết bài Interview được gán
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

### 8. Bắt đầu làm bài
```http
POST /jobseeker/interviews/:candidateInterviewId/start
Authorization: Bearer {token}
Role: jobseeker

Response: CandidateInterview (status = in_progress, started_at = now)
```

### 9. Submit câu trả lời
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

### 10. Xem câu trả lời của mình
```http
GET /jobseeker/interviews/:candidateInterviewId/answers
Authorization: Bearer {token}
Role: jobseeker

Response: InterviewAnswer[]
```

### 11. Gửi Reminder về Deadline (System/Cron endpoint)
```http
POST /jobseeker/interviews/send-reminders

Response:
{
  "sent": 5
}
```
**Nghiệp vụ**: 
- Endpoint này có thể được gọi bởi cron job hoặc scheduler
- Tự động tìm các interview có deadline trong vòng 24 giờ
- Gửi notification và email nhắc nhở user hoàn thành bài interview

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
3a. Click "Bắt đầu ngay" → `POST /jobseeker/interviews/:id/accept`
3b. Click "Làm sau" → User có thể vào trang Applications để xem lại
4. Tạo `CandidateInterview` (status = assigned, deadline_at = calculated)
5. Gửi notification và email xác nhận

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

### Flow 5: "Làm sau" - Xem lại Interview từ trang Applications
1. User click "Làm sau" sau khi apply
2. User vào trang Applications: `GET /jobseeker/applications/with-interviews`
3. Hiển thị danh sách applications có interview
4. Nếu chưa accept (candidateInterview = null) → hiện nút "Bắt đầu ngay"
5. Nếu đã accept → hiện trạng thái (assigned/in_progress) và deadline
6. Click "Bắt đầu" → Accept interview như bình thường

### Flow 6: Xem lịch sử Interview đã làm
1. User vào trang "Lịch sử Interview": `GET /jobseeker/interviews/history`
2. Hiển thị danh sách các bài đã làm (status = submitted/timeout)
3. Mỗi bài hiển thị:
   - Tên interview và công ty
   - Điểm tổng và phần trăm
   - Kết quả (pass/fail)
   - Chi tiết từng câu hỏi với điểm và feedback từ employer
   - Thời gian làm bài

### Flow 7: Nhắc nhở Deadline
1. Hệ thống chạy cron job (mỗi 6 giờ): `POST /jobseeker/interviews/send-reminders`
2. Tìm các interview có deadline trong vòng 24 giờ
3. Gửi notification in-app và email cho từng user
4. Email chứa thông tin: tên bài, deadline, thời gian còn lại

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
- [x] "Làm sau" feature: GET /jobseeker/applications/with-interviews
- [x] Lịch sử interview: GET /jobseeker/interviews/history (với điểm và feedback)
- [x] Gửi notification và email khi accept interview
- [x] Nhắc nhở deadline: POST /jobseeker/interviews/send-reminders
- [x] Notification types: INTERVIEW_ASSIGNED, INTERVIEW_REMINDER

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
  <Button onClick={handleDoLater}>Làm sau</Button>
</Modal>

// Nếu click "Làm sau":
function handleDoLater() {
  closeModal();
  // User có thể vào trang Applications để xem lại
  navigate('/applications');
}
```

### Trang Applications với Interview
```javascript
// GET /jobseeker/applications/with-interviews
const applicationsWithInterviews = [
  {
    application_id: "...",
    jobPost: { title: "Backend Developer", company: {...} },
    interview: { interview_id: "...", title: "Backend Interview", deadline: "..." },
    candidateInterview: null // chưa accept
  },
  {
    application_id: "...",
    jobPost: { title: "Frontend Developer", company: {...} },
    interview: { interview_id: "...", title: "Frontend Interview", deadline: "..." },
    candidateInterview: { status: "assigned", deadline_at: "..." } // đã accept
  }
];

// UI:
<ApplicationList>
  {applicationsWithInterviews.map(app => (
    <ApplicationCard>
      <JobTitle>{app.jobPost.title}</JobTitle>
      <InterviewBadge>{app.interview.title}</InterviewBadge>
      
      {!app.candidateInterview ? (
        <Button onClick={() => acceptInterview(app.interview.interview_id, app.application_id)}>
          Bắt đầu ngay
        </Button>
      ) : (
        <div>
          <StatusBadge status={app.candidateInterview.status} />
          <Deadline>Hạn: {app.candidateInterview.deadline_at}</Deadline>
          {app.candidateInterview.status === 'assigned' && (
            <Button onClick={() => startInterview(app.candidateInterview.candidate_interview_id)}>
              Bắt đầu làm bài
            </Button>
          )}
        </div>
      )}
    </ApplicationCard>
  ))}
</ApplicationList>
```

### Trang Lịch sử Interview
```javascript
// GET /jobseeker/interviews/history
const history = await fetch('/jobseeker/interviews/history');

<InterviewHistory>
  {history.map(item => (
    <InterviewCard>
      <InterviewTitle>{item.interview.title}</InterviewTitle>
      <JobInfo>{item.jobPost.title} - {item.jobPost.company.name}</JobInfo>
      
      <ScoreDisplay>
        <Score>{item.total_score} / {item.max_score}</Score>
        <Percentage>{item.percentage}%</Percentage>
        <Result status={item.result}>{item.result}</Result>
      </ScoreDisplay>
      
      <Dates>
        <div>Bắt đầu: {item.started_at}</div>
        <div>Hoàn thành: {item.completed_at}</div>
      </Dates>
      
      <AnswersList>
        {item.answers.map(ans => (
          <AnswerItem>
            <Question>{ans.question_text}</Question>
            <YourAnswer>{ans.answer_text}</YourAnswer>
            <Score>{ans.score} / {ans.max_score}</Score>
            {ans.feedback && <Feedback>{ans.feedback}</Feedback>}
            <Time>{ans.elapsed_seconds}s</Time>
          </AnswerItem>
        ))}
      </AnswersList>
    </InterviewCard>
  ))}
</InterviewHistory>
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
