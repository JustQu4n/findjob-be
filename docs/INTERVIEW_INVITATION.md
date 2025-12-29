# Interview Invitation Feature - Documentation

## Tổng quan

Tính năng mời ứng viên tham gia phỏng vấn cho phép employer gửi lời mời trực tiếp đến candidate thông qua email, không cần ứng viên phải apply vào job post trước. Ứng viên sẽ nhận được notification và email chứa link trực tiếp đến bài phỏng vấn.


### 2. API Endpoints

#### Employer API

##### POST `/employer/interviews/:interviewId/invite-candidate`
Mời candidate vào interview bằng email.

**Headers:**
```
Authorization: Bearer <employer_jwt_token>
```

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "message": "Chúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia phỏng vấn." // optional
}
```

**Response (200 OK):**
```json
{
  "message": "Candidate invited successfully",
  "candidateInterview": {
    "candidate_interview_id": "uuid",
    "interview_id": "uuid",
    "candidate_id": "uuid",
    "invitation_email": "candidate@example.com",
    "assigned_at": "2024-12-19T10:30:00Z",
    "deadline_at": "2024-12-26T10:30:00Z",
    "status": "assigned"
  },
  "candidate": {
    "user_id": "uuid",
    "full_name": "Nguyễn Văn A",
    "email": "candidate@example.com",
    "avatar_url": "https://..."
  }
}
```

**Error Responses:**
- `404 Not Found`: User with email not found hoặc Interview not found
- `400 Bad Request`: User đã được mời hoặc đã apply vào interview này
- `403 Forbidden`: Employer không sở hữu interview này

#### Job Seeker API

##### GET `/jobseeker/interviews`
Lấy danh sách tất cả interview assignments (cả apply và được mời).

**Response Fields Addition:**
```json
{
  "candidate_interview_id": "uuid",
  "interview": {...},
  "isDirectInvitation": true,  // true nếu được mời trực tiếp
  "invitationEmail": "candidate@example.com",  // email được dùng để mời
  "application": null,  // null nếu là direct invitation
  "jobPost": null,  // null nếu là direct invitation
  "company": null,  // null nếu là direct invitation
  ...
}
```

##### GET `/jobseeker/interviews/history`
Lấy lịch sử interview đã hoàn thành.

**Response Fields Addition:**
- `isDirectInvitation`: boolean
- `invitationEmail`: string | null

### 3. Notification System

#### Notification Type
```typescript
type: 'interview_invitation'
```

#### Notification Payload
```json
{
  "type": "interview_invitation",
  "message": "You have been invited to take the interview: [Interview Title]",
  "metadata": {
    "interview_id": "uuid",
    "interview_title": "Senior Backend Developer Interview",
    "candidate_interview_id": "uuid",
    "deadline_at": "2024-12-26T10:30:00Z",
    "custom_message": "Message from employer..."
  }
}
```

### 4. Email Template

#### Email Subject
```
Lời mời tham gia phỏng vấn: [Interview Title]
```

#### Email Content
- Header với icon và title
- Thông tin chi tiết về interview (tiêu đề, mô tả, deadline)
- Custom message từ employer (nếu có)
- Button CTA "Tham gia phỏng vấn ngay"
- Link trực tiếp đến interview
- Lưu ý và hướng dẫn

#### Email Template Method
```typescript
EmailService.sendInterviewInvitationEmail(
  email: string,
  name: string,
  interviewTitle: string,
  interviewDescription: string,
  candidateInterviewId: string,
  deadline: Date | null,
  customMessage?: string
)
```

## Workflow

### 1. Employer Flow
1. Employer tạo interview
2. Employer tìm candidate phù hợp (có thể từ database hoặc resume pool)
3. Employer gửi invitation qua endpoint POST `/employer/interviews/:interviewId/invite-candidate`
4. System kiểm tra:
   - Email có tồn tại trong hệ thống không
   - Candidate đã được mời hoặc apply chưa
   - Employer có quyền với interview này không
5. Tạo `CandidateInterview` record với `application_id = null`
6. Gửi notification real-time
7. Gửi email với link trực tiếp

### 2. Candidate Flow
1. Candidate nhận notification trong app
2. Candidate nhận email với link
3. Click vào link hoặc notification → redirect đến interview page
4. Xem thông tin interview và accept/start
5. Làm bài interview như bình thường
6. Submit answers
7. Employer review và grade

## Frontend Integration

### Interview Link Format
```
${FRONTEND_URL}/interviews/${candidateInterviewId}
```

### UI Changes Required

#### Job Seeker Dashboard
- Hiển thị badge "Direct Invitation" cho interview được mời trực tiếp
- Không hiển thị job post info nếu `isDirectInvitation === true`
- Hiển thị "Invited by email" thay vì "Applied to [Job Title]"

#### Interview Detail Page
- Kiểm tra `isDirectInvitation` để hiển thị UI phù hợp
- Không cần require application_id để start interview

### Example Frontend Code
```typescript
// Check if interview is direct invitation
if (interview.isDirectInvitation) {
  return (
    <Badge color="purple">
      <MailIcon /> Direct Invitation
    </Badge>
  );
} else {
  return (
    <Badge color="blue">
      <BriefcaseIcon /> Applied to {interview.jobPost?.title}
    </Badge>
  );
}
```

## Testing

### Test Cases

#### 1. Employer Invite Candidate - Success
```bash
POST /employer/interviews/:interviewId/invite-candidate
Body: { "email": "candidate@test.com" }
Expected: 200 OK with candidateInterview data
```

#### 2. Employer Invite Non-Existent User
```bash
POST /employer/interviews/:interviewId/invite-candidate
Body: { "email": "notfound@test.com" }
Expected: 404 Not Found
```

#### 3. Employer Invite Already Invited Candidate
```bash
POST /employer/interviews/:interviewId/invite-candidate
Body: { "email": "already-invited@test.com" }
Expected: 400 Bad Request
```

#### 4. Candidate Views Invited Interview
```bash
GET /jobseeker/interviews/:candidateInterviewId
Expected: 200 OK with interview details, isDirectInvitation = true
```

#### 5. Candidate Starts and Submits Invited Interview
```bash
POST /jobseeker/interviews/:id/start
POST /jobseeker/interviews/:id/submit
Expected: Both succeed without application_id requirement
```

### Manual Testing Steps

1. **Setup:**
   - Tạo employer account
   - Tạo job seeker account với email cụ thể
   - Tạo interview

2. **Invite:**
   - Login as employer
   - Send invitation với email của job seeker
   - Verify notification được tạo
   - Verify email được gửi

3. **Accept & Complete:**
   - Login as job seeker
   - Check notifications
   - Click vào interview link
   - Start interview
   - Submit answers

4. **Review:**
   - Login as employer
   - View candidates list
   - Grade answers
   - Check candidate info shows invitation method

## Environment Variables

Cần có trong `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

Được sử dụng để tạo link trong email và notification.

## Security Considerations

1. **Email Validation:** System chỉ gửi invitation đến email đã đăng ký
2. **Authorization:** Chỉ employer sở hữu interview mới có thể invite
3. **Duplicate Prevention:** Không cho phép invite candidate đã được mời hoặc đã apply
4. **Access Control:** Candidate chỉ có thể access interview của mình

## Performance Considerations

1. **Async Operations:** Notification và Email được gửi async, không block response
2. **Error Handling:** Lỗi khi gửi notification/email chỉ log warning, không fail request
3. **Database Indexes:** Cần index trên `candidate_interviews(candidate_id, interview_id)`

## Future Enhancements

1. **Bulk Invitation:** Cho phép mời nhiều candidate cùng lúc
2. **Template Messages:** Employer có thể lưu template message để reuse
3. **Invitation Status:** Track xem candidate đã đọc email/notification chưa
4. **Reminder System:** Tự động gửi reminder trước deadline
5. **Invitation Analytics:** Thống kê acceptance rate, completion rate

## Troubleshooting

### Issue: Email không được gửi
- Kiểm tra SMTP config trong EmailModule
- Check logs để xem error message
- Verify email service credentials

### Issue: Notification không hiển thị
- Kiểm tra WebSocket connection
- Verify NotificationsGateway đang chạy
- Check user_id đúng chưa

### Issue: Candidate không thể start interview
- Verify `application_id` nullable trong database
- Check authorization logic không require application
- Ensure migration đã chạy

## Related Files

### Backend
- `src/database/entities/candidate-interview/candidate-interview.entity.ts`
- `src/modules/employer/interviews/interviews.service.ts`
- `src/modules/employer/interviews/interviews.controller.ts`
- `src/modules/employer/interviews/dto/invite-candidate.dto.ts`
- `src/modules/users/interview/interview.service.ts`
- `src/modules/email/email.service.ts`
- `src/database/migrations/1734589200000-UpdateCandidateInterviewsForInvitation.ts`

### Frontend (To be implemented)
- `pages/employer/interviews/[id].tsx` - Add invite form
- `pages/jobseeker/interviews/[id].tsx` - Handle direct invitation
- `components/InterviewCard.tsx` - Show invitation badge
- `services/interviewAPI.ts` - Add inviteCandidate method

## API Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/employer/interviews/:interviewId/invite-candidate` | POST | Employer | Mời candidate bằng email |
| `/jobseeker/interviews` | GET | Job Seeker | List tất cả interviews (có flag isDirectInvitation) |
| `/jobseeker/interviews/history` | GET | Job Seeker | Interview history (có flag isDirectInvitation) |
| `/jobseeker/interviews/:id` | GET | Job Seeker | Interview details |
| `/jobseeker/interviews/:id/start` | POST | Job Seeker | Start interview |
| `/jobseeker/interviews/:id/submit` | POST | Job Seeker | Submit answers |

---

**Created:** December 19, 2024  
**Version:** 1.0.0  
**Author:** AI Development Team
