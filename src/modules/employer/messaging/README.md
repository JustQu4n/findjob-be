# Employer Messaging API

## Mô tả
Module này cho phép nhà tuyển dụng gửi email đến ứng viên (user) thông qua API.

## Endpoint

### Gửi email đến user
**POST** `/employer/messaging/send-email`

#### Authentication
Yêu cầu Bearer token với role `employer`

#### Request Body
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "subject": "Thông báo về vị trí tuyển dụng",
  "message": "Xin chào, chúng tôi muốn mời bạn tham gia phỏng vấn cho vị trí...",
  "jobPostId": "123e4567-e89b-12d3-a456-426614174000" // Optional
}
```

#### Request Fields
- `userId` (string, required): UUID của user nhận email
- `subject` (string, required): Tiêu đề email (tối đa 200 ký tự)
- `message` (string, required): Nội dung email
- `jobPostId` (string, optional): UUID của job post liên quan (nếu có)

#### Response Success (201)
```json
{
  "message": "Gửi email thành công"
}
```

#### Response Errors
- **400 Bad Request**: Dữ liệu không hợp lệ hoặc email chưa được xác thực
- **401 Unauthorized**: Chưa xác thực
- **403 Forbidden**: Không có quyền truy cập (không phải employer hoặc job post không thuộc về employer)
- **404 Not Found**: Không tìm thấy user, employer, hoặc job post

## Validation
- `userId`: Phải là UUID hợp lệ
- `subject`: Không được để trống, tối đa 200 ký tự
- `message`: Không được để trống
- `jobPostId`: Phải là UUID hợp lệ (nếu có)

## Security
- Chỉ employer đã đăng nhập mới có thể gửi email
- Nếu có `jobPostId`, system sẽ kiểm tra job post có thuộc về employer này không
- Email chỉ được gửi đến user có email đã xác thực

## Email Template
Email được gửi đi sẽ bao gồm:
- Thông tin người gửi (employer name)
- Thông tin công ty
- Tiêu đề (subject)
- Nội dung tin nhắn
- Thông tin về job post (nếu có)
- Branding của CareerVibe

## Ví dụ sử dụng

### Gửi email về một vị trí tuyển dụng cụ thể
```bash
curl -X POST http://localhost:3000/employer/messaging/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subject": "Mời phỏng vấn vị trí Senior Developer",
    "message": "Chào bạn,\n\nChúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia phỏng vấn cho vị trí Senior Developer.\n\nVui lòng liên hệ lại để sắp xếp lịch phỏng vấn.",
    "jobPostId": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

### Gửi email chung không liên quan đến job post cụ thể
```bash
curl -X POST http://localhost:3000/employer/messaging/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "subject": "Cảm ơn bạn đã quan tâm đến công ty chúng tôi",
    "message": "Xin chào,\n\nCảm ơn bạn đã gửi hồ sơ ứng tuyển. Chúng tôi sẽ xem xét và liên hệ lại trong thời gian sớm nhất."
  }'
```

## Notes
- Email được gửi bất đồng bộ thông qua EmailService
- System sử dụng template HTML đẹp mắt với branding của CareerVibe
- Nội dung message hỗ trợ xuống dòng (line breaks được preserve trong email)
