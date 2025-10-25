# Hệ thống Authentication - CareerVibe

## 📚 Tổng quan

Hệ thống authentication hoàn chỉnh cho CareerVibe với các tính năng:

### ✨ Tính năng chính

1. **Đăng ký tài khoản** (Register)
   - Hỗ trợ 3 loại user: Admin, Employer, Job Seeker
   - Validation dữ liệu đầu vào
   - Hash password với bcrypt
   - Tự động tạo profile theo role
   - Gửi email xác thực

2. **Xác thực Email** (Email Verification)
   - Token xác thực có thời hạn 24h
   - Gửi lại email xác thực
   - Email template đẹp mắt

3. **Đăng nhập** (Login)
   - Xác thực email + password
   - Kiểm tra email đã verify
   - Kiểm tra trạng thái tài khoản
   - Trả về JWT tokens (access + refresh)

4. **Quản lý Tokens**
   - Access Token: 15 phút
   - Refresh Token: 7 ngày
   - Refresh token rotation

5. **Quên mật khẩu** (Forgot Password)
   - Gửi email reset password
   - Token có thời hạn 1 giờ
   - Đặt lại mật khẩu an toàn

6. **Phân quyền** (Authorization)
   - Role-based access control
   - Guards & Decorators
   - JWT Strategy

## 🔧 Công nghệ sử dụng

```json
{
  "@nestjs/jwt": "^11.0.1",
  "@nestjs/passport": "^11.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "passport-local": "^1.0.0",
  "bcrypt": "^5.1.1",
  "@nestjs-modules/mailer": "^2.0.2",
  "nodemailer": "^6.9.15",
  "uuid": "^10.0.0"
}
```

## 📁 Cấu trúc Files

```
src/modules/auth/
├── dto/
│   ├── register.dto.ts           # DTO đăng ký
│   ├── login.dto.ts              # DTO đăng nhập
│   ├── verify-email.dto.ts       # DTO xác thực email
│   ├── forgot-password.dto.ts    # DTO quên mật khẩu
│   ├── reset-password.dto.ts     # DTO đặt lại mật khẩu
│   ├── refresh-token.dto.ts      # DTO refresh token
│   └── index.ts
├── strategies/
│   ├── jwt.strategy.ts           # JWT access token strategy
│   ├── jwt-refresh.strategy.ts   # JWT refresh token strategy
│   └── local.strategy.ts         # Local (email/password) strategy
├── auth.controller.ts            # API endpoints
├── auth.service.ts               # Business logic
├── auth.module.ts                # Module configuration
└── email.service.ts              # Email service

src/common/
├── guards/
│   ├── jwt-auth.guard.ts         # JWT authentication guard
│   ├── jwt-refresh-auth.guard.ts # Refresh token guard
│   ├── local-auth.guard.ts       # Local auth guard
│   └── roles.guard.ts            # Role-based guard
└── decorators/
    ├── roles.decorator.ts        # @Roles() decorator
    ├── get-user.decorator.ts     # @GetUser() decorator
    └── public.decorator.ts       # @Public() decorator
```

## 🔐 Environment Variables

Thêm các biến sau vào file `.env`:

```env
# JWT
JWT_SECRET=careervibe-secret-key-2024-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=careervibe-refresh-secret-2024-change-this-in-production
JWT_REFRESH_EXPIRATION=7d

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@careervibe.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 📧 Cấu hình Gmail

1. Bật xác thực 2 bước cho Gmail
2. Tạo App Password:
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other" (đặt tên: CareerVibe)
   - Copy password và dán vào `MAIL_PASSWORD`

## 🚀 API Endpoints

### 1. Đăng ký tài khoản

```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "Password@123",
  "phone": "0123456789",
  "role": "job_seeker"  // admin | employer | job_seeker
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "user_id": 1,
    "email": "nguyenvana@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "job_seeker"
  }
}
```

### 2. Xác thực Email

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "uuid-token-from-email"
}
```

### 3. Gửi lại Email xác thực

```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "nguyenvana@example.com"
}
```

### 4. Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "user_id": 1,
    "email": "nguyenvana@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "roles": ["job_seeker"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Đăng xuất

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### 7. Quên mật khẩu

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "nguyenvana@example.com"
}
```

### 8. Đặt lại mật khẩu

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "uuid-token-from-email",
  "newPassword": "NewPassword@123"
}
```

### 9. Lấy thông tin user hiện tại

```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

## 🛡️ Sử dụng Guards & Decorators

### Bảo vệ Route với JWT

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/database/entities/user/user.entity';

@Controller('profile')
@UseGuards(JwtAuthGuard)  // Require authentication cho toàn controller
export class ProfileController {
  @Get()
  getProfile(@GetUser() user: User) {
    return user;
  }
}
```

### Phân quyền theo Role

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin')  // Chỉ admin mới access được
  getDashboard() {
    return { message: 'Admin Dashboard' };
  }
}
```

### Public Routes (không cần authentication)

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()  // Route này không cần đăng nhập
  @Get('info')
  getInfo() {
    return { message: 'Public information' };
  }
}
```

## 📊 Database Schema Updates

Các trường được thêm vào `users` table:

```typescript
is_email_verified: boolean              // Trạng thái xác thực email
email_verification_token: string        // Token xác thực email
email_verification_token_expires: Date  // Thời hạn token
password_reset_token: string            // Token reset password
password_reset_token_expires: Date      // Thời hạn reset token
refresh_token: string                   // JWT refresh token
```

## 🔄 Flow Diagram

### Registration Flow
```
User → Register → Create User → Generate Token → Send Email
                                                      ↓
User → Check Email → Click Link → Verify Token → Activate Account
```

### Login Flow
```
User → Login → Validate Credentials → Check Email Verified
                                              ↓
                                    Generate JWT Tokens → Return to Client
```

### Password Reset Flow
```
User → Forgot Password → Generate Reset Token → Send Email
                                                      ↓
User → Check Email → Click Link → Reset Password → Clear Token
```

## 🧪 Testing

### Test đăng ký

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Password@123",
    "role": "job_seeker"
  }'
```

### Test đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

## 🔒 Security Best Practices

1. **Password Policy**
   - Tối thiểu 8 ký tự
   - Bắt buộc: chữ hoa, chữ thường, số, ký tự đặc biệt

2. **Token Security**
   - Access token: thời hạn ngắn (15 phút)
   - Refresh token: lưu trong database, có thể revoke
   - Token rotation khi refresh

3. **Email Verification**
   - Bắt buộc verify email trước khi login
   - Token có thời hạn 24h

4. **Rate Limiting** (Khuyến nghị thêm)
   - Giới hạn số lần login thất bại
   - Throttle API requests

5. **HTTPS**
   - Bắt buộc sử dụng HTTPS trong production
   - Secure cookies cho refresh token

## 🚨 Error Handling

Hệ thống trả về các HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication failed
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource

## 📝 Validation Rules

### Register
- `full_name`: Required, string
- `email`: Required, valid email format
- `password`: Min 8 chars, complex pattern
- `phone`: Optional, 10-11 digits
- `role`: Required, enum [admin, employer, job_seeker]

### Login
- `email`: Required, valid email
- `password`: Required

## 🎨 Email Templates

Hệ thống sử dụng HTML email templates với:
- Responsive design
- Brand colors (CareerVibe)
- Clear call-to-action buttons
- Security warnings

## 🔄 Migration

Chạy migration để cập nhật database:

```bash
npm run migration:run
```

## 📚 Resources

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)

---

**Developed with ❤️ for CareerVibe**
