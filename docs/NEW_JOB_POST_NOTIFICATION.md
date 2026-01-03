# Thông Báo Bài Viết Mới Cho Followers

## Tổng Quan

Tính năng này cho phép người dùng nhận thông báo tự động khi công ty mà họ đang theo dõi đăng tin tuyển dụng mới.

## Luồng Hoạt Động

### 1. User Follow Company
- User (job seeker) có thể follow một công ty thông qua API có sẵn:
  - Endpoint: `POST /users/companies/:companyId/follow`
  - Service: `CompanyService.followCompany()`
  - Entity: `FollowedCompany`

### 2. Employer Đăng Tin Tuyển Dụng Mới
Khi employer tạo job post mới:
1. Job post được lưu vào database
2. Hệ thống tự động tìm tất cả users đã follow công ty đó
3. Gửi thông báo realtime + lưu vào database cho từng follower

### 3. User Nhận Thông Báo
- Thông báo được lưu vào database (`notifications` table)
- Thông báo realtime được gửi qua WebSocket (nếu user đang online)
- User có thể xem danh sách thông báo qua API

## Cấu Trúc Code

### 1. Module Configuration
**File:** [src/modules/employer/job-post/job-post.module.ts](../src/modules/employer/job-post/job-post.module.ts)

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, Employer, Skill, JobPostSkill, FollowedCompany]),
    NotificationsModule, // Import để sử dụng NotificationsService
  ],
  // ...
})
```

### 2. Service Implementation
**File:** [src/modules/employer/job-post/job-post.service.ts](../src/modules/employer/job-post/job-post.service.ts)

#### Constructor Dependencies
```typescript
constructor(
  @InjectRepository(JobPost)
  private jobPostRepository: Repository<JobPost>,
  @InjectRepository(FollowedCompany)
  private followedCompanyRepository: Repository<FollowedCompany>,
  private notificationsService: NotificationsService,
) {}
```

#### Trong method `create()`
Sau khi job post được tạo thành công:
```typescript
// Gửi thông báo cho tất cả users đã follow công ty này
await this.notifyFollowersAboutNewJobPost(
  employer.company_id,
  employer.company?.name || 'Công ty',
  savedJobPost.title,
  savedJobPost.job_post_id,
);
```

#### Private Method `notifyFollowersAboutNewJobPost()`
```typescript
private async notifyFollowersAboutNewJobPost(
  companyId: string,
  companyName: string,
  jobTitle: string,
  jobPostId: string,
) {
  // 1. Lấy tất cả followers của công ty
  const followers = await this.followedCompanyRepository.find({
    where: { company_id: companyId },
    relations: ['jobSeeker'],
  });

  // 2. Gửi thông báo cho từng follower
  const notificationPromises = followers.map(async (follower) => {
    if (follower.jobSeeker?.user_id) {
      await this.notificationsService.sendToUser(
        follower.jobSeeker.user_id,
        {
          type: 'new_job_post',
          message: `${companyName} vừa đăng tin tuyển dụng mới: ${jobTitle}`,
          metadata: {
            company_id: companyId,
            company_name: companyName,
            job_post_id: jobPostId,
            job_title: jobTitle,
          },
        },
      );
    }
  });

  await Promise.all(notificationPromises);
}
```

## Database Schema

### Bảng `followed_companies`
```sql
CREATE TABLE followed_companies (
  followed_company_id UUID PRIMARY KEY,
  job_seeker_id UUID NOT NULL,
  company_id UUID NOT NULL,
  followed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (job_seeker_id) REFERENCES job_seekers(job_seeker_id),
  FOREIGN KEY (company_id) REFERENCES companies(company_id)
);
```

### Bảng `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## API Endpoints

### Follow Company
```http
POST /users/companies/:companyId/follow
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Theo dõi công ty thành công",
  "data": {
    "followed_company_id": "uuid",
    "job_seeker_id": "uuid",
    "company_id": "uuid",
    "followed_at": "2026-01-03T10:00:00.000Z"
  }
}
```

### Unfollow Company
```http
DELETE /users/companies/:companyId/unfollow
Authorization: Bearer <token>
```

### Get Notifications
```http
GET /notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "new_job_post",
      "message": "FPT Software vừa đăng tin tuyển dụng mới: Senior NodeJS Developer",
      "metadata": {
        "company_id": "uuid",
        "company_name": "FPT Software",
        "job_post_id": "uuid",
        "job_title": "Senior NodeJS Developer"
      },
      "is_read": false,
      "created_at": "2026-01-03T10:05:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### Mark Notification as Read
```http
PATCH /notifications/:notificationId/read
Authorization: Bearer <token>
```

## Notification Metadata Structure

```typescript
{
  company_id: string;      // UUID của công ty
  company_name: string;    // Tên công ty
  job_post_id: string;     // UUID của job post
  job_title: string;       // Tiêu đề job post
}
```

## WebSocket Events

### Subscribe to Notifications
Khi user connect, tự động join room theo user_id:
```javascript
// Client-side
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Hiển thị notification trong UI
});
```

### Notification Event Payload
```typescript
{
  id: string;
  user_id: string;
  type: 'new_job_post';
  message: string;
  metadata: {
    company_id: string;
    company_name: string;
    job_post_id: string;
    job_title: string;
  };
  is_read: boolean;
  created_at: Date;
}
```

## Error Handling

Method `notifyFollowersAboutNewJobPost()` được wrap trong try-catch để:
- Không làm fail quá trình tạo job post nếu notification service lỗi
- Log error để debug
- Đảm bảo job post vẫn được tạo thành công

```typescript
try {
  // Send notifications
} catch (error) {
  console.error('Error notifying followers about new job post:', error);
  // Không throw error - job post vẫn được tạo thành công
}
```

## Testing

### 1. Test Follow Company
```bash
# Follow company
curl -X POST http://localhost:3000/users/companies/{companyId}/follow \
  -H "Authorization: Bearer <job_seeker_token>"
```

### 2. Test Create Job Post
```bash
# Create job post (với employer token)
curl -X POST http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer <employer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "description": "Looking for experienced backend developer",
    "location": "Hà Nội",
    "salary_range": "20-30M"
  }'
```

### 3. Test Get Notifications
```bash
# Get notifications (với job seeker token)
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer <job_seeker_token>"
```

## Performance Considerations

### Parallel Notification Sending
Sử dụng `Promise.all()` để gửi notifications song song:
```typescript
const notificationPromises = followers.map(async (follower) => {
  await this.notificationsService.sendToUser(...);
});
await Promise.all(notificationPromises);
```

### Scalability
- Nếu công ty có nhiều followers (>1000), cân nhắc:
  - Dùng queue (Bull, RabbitMQ) để xử lý async
  - Batch notifications
  - Rate limiting

## Frontend Integration

### React Example
```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function NotificationComponent() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });
    
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Show toast/popup
      showToast(notification.message);
    });
    
    return () => socket.disconnect();
  }, []);
  
  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## Future Enhancements

1. **Notification Preferences**
   - Cho phép user chọn loại thông báo muốn nhận
   - Email notifications
   - Push notifications

2. **Notification Grouping**
   - Group multiple job posts từ cùng 1 company
   - "FPT Software đã đăng 3 tin tuyển dụng mới"

3. **Smart Notifications**
   - Chỉ thông báo job posts phù hợp với profile của user
   - Filter theo skills, location, salary range

4. **Notification Statistics**
   - Track notification open rate
   - Track job post click-through rate

## Troubleshooting

### Notifications không được gửi
- Kiểm tra `NotificationsModule` đã được import trong `JobPostModule`
- Kiểm tra `NotificationsService` được inject đúng
- Kiểm tra database connection
- Xem logs trong console

### WebSocket không hoạt động
- Kiểm tra CORS configuration
- Kiểm tra WebSocket connection
- Verify JWT token trong auth middleware

### Duplicate notifications
- Kiểm tra method `create()` không bị gọi nhiều lần
- Verify database constraints

## Related Files

- [job-post.module.ts](../src/modules/employer/job-post/job-post.module.ts)
- [job-post.service.ts](../src/modules/employer/job-post/job-post.service.ts)
- [notifications.service.ts](../src/modules/notifications/notifications.service.ts)
- [company.service.ts](../src/modules/users/company/company.service.ts)
- [followed-company.entity.ts](../src/database/entities/followed-company/followed-company.entity.ts)
- [notification.entity.ts](../src/database/entities/notification/notification.entity.ts)
