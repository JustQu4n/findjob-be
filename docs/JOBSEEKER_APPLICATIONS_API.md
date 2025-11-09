# JobSeeker Applications API

API cho phép job seeker nộp đơn ứng tuyển và xem lịch sử ứng tuyển.

## Endpoints

### 1. Nộp đơn ứng tuyển
**POST** `/api/jobseeker/applications/submit`

**Authentication**: Required (JWT Token với role 'jobseeker')

**Request**:
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `job_post_id` (string, required): UUID của tin tuyển dụng
  - `cover_letter` (string, optional): Thư xin việc
  - `resume` (file, optional): File CV (PDF, DOC, DOCX)

**Response Success (201)**:
```json
{
  "message": "Nộp đơn ứng tuyển thành công",
  "data": {
    "application_id": "uuid",
    "job_post_id": "uuid",
    "job_seeker_id": "uuid",
    "status": "pending",
    "resume_url": "resumes/1234567890-resume.pdf",
    "cover_letter": "...",
    "applied_at": "2025-11-10T02:56:00.000Z",
    "jobPost": {
      "job_post_id": "uuid",
      "title": "Senior Developer",
      "company": {
        "company_id": "uuid",
        "company_name": "ABC Company"
      }
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: 
  - "Bạn đã ứng tuyển vào tin này rồi"
  - "File không hợp lệ. Chỉ chấp nhận file PDF, DOC, DOCX"
- `404 Not Found`: 
  - "Không tìm thấy thông tin người tìm việc"
  - "Không tìm thấy tin tuyển dụng"

---

### 2. Lấy lịch sử ứng tuyển
**GET** `/api/jobseeker/applications/history-applications/:job_seeker_id`

**Authentication**: Required (JWT Token với role 'jobseeker')

**Parameters**:
- `job_seeker_id` (path parameter): UUID của job seeker

**Response Success (200)**:
```json
{
  "data": [
    {
      "application_id": "uuid",
      "job_post_id": "uuid",
      "job_seeker_id": "uuid",
      "status": "pending",
      "resume_url": "resumes/1234567890-resume.pdf",
      "resume_download_url": "https://minio-presigned-url...",
      "cover_letter": "...",
      "applied_at": "2025-11-10T02:56:00.000Z",
      "jobPost": {
        "job_post_id": "uuid",
        "title": "Senior Developer",
        "location": "Hanoi",
        "salary_range": "1000-2000",
        "company": {
          "company_id": "uuid",
          "company_name": "ABC Company",
          "logo": "..."
        },
        "employer": {
          "employer_id": "uuid",
          "position": "HR Manager"
        },
        "category": {
          "category_id": "uuid",
          "name": "Technology",
          "slug": "technology"
        }
      }
    }
  ],
  "total": 5
}
```

**Error Responses**:
- `403 Forbidden`: "Bạn không có quyền xem lịch sử ứng tuyển này"
- `404 Not Found`: "Không tìm thấy thông tin người tìm việc"

---

## MinIO Configuration

Module sử dụng MinIO để lưu trữ file CV. Cấu hình trong `.env`:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=yourminiouser
MINIO_SECRET_KEY=yourminiopassword
MINIO_BUCKET_NAME=mybucket
```

## File Upload Restrictions

- **Allowed formats**: PDF, DOC, DOCX
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Storage location**: `resumes/` folder in MinIO bucket
- **File naming**: `{timestamp}-{original-filename}`
- **Download URL expiration**: 24 hours

## Database Schema Updates

Migration added two columns to `applications` table:
- `resume_url` VARCHAR(500) - Path to resume file in MinIO
- `cover_letter` TEXT - Cover letter content

## Features

✅ **File Upload**: Upload CV file (PDF, DOC, DOCX) to MinIO  
✅ **File Validation**: Check file type and MIME type  
✅ **Duplicate Prevention**: Cannot apply to same job post twice  
✅ **Presigned URLs**: Generate temporary download URLs for resumes  
✅ **Authorization**: Only job seeker can view their own application history  
✅ **Full Relations**: Load job post, company, employer, category data  

## Example cURL Requests

### Submit Application with File
```bash
curl -X POST http://localhost:3000/api/jobseeker/applications/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "job_post_id=uuid-here" \
  -F "cover_letter=I am interested in this position..." \
  -F "resume=@/path/to/resume.pdf"
```

### Submit Application without File
```bash
curl -X POST http://localhost:3000/api/jobseeker/applications/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_post_id": "uuid-here",
    "cover_letter": "I am interested in this position..."
  }'
```

### Get Application History
```bash
curl -X GET http://localhost:3000/api/jobseeker/applications/history-applications/job-seeker-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
