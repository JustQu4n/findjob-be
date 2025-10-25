# 🏗️ Kiến trúc Hệ thống Authentication - CareerVibe

## 📊 Tổng quan Công nghệ

### Core Technologies Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **NestJS** | 11.x | Backend Framework |
| **TypeScript** | 5.x | Programming Language |
| **PostgreSQL** | 15.x | Database |
| **TypeORM** | 0.3.x | ORM |
| **JWT** | - | Token-based Authentication |
| **Passport** | - | Authentication Middleware |
| **Bcrypt** | - | Password Hashing |
| **Nodemailer** | - | Email Service |

---

## 🔐 Authentication Packages

### 1. **@nestjs/jwt** 
- **Chức năng**: JWT token generation và validation
- **Sử dụng**: Tạo access token và refresh token

### 2. **@nestjs/passport**
- **Chức năng**: Integration Passport.js với NestJS
- **Sử dụng**: Middleware authentication

### 3. **passport-jwt**
- **Chức năng**: JWT authentication strategy
- **Sử dụng**: Validate JWT tokens trong requests

### 4. **passport-local**
- **Chức năng**: Local authentication strategy
- **Sử dụng**: Authenticate với username/password

### 5. **bcrypt**
- **Chức năng**: Password hashing
- **Sử dụng**: Hash password trước khi lưu DB, compare khi login
- **Security**: Salt rounds = 10

### 6. **@nestjs-modules/mailer**
- **Chức năng**: Email service integration
- **Sử dụng**: Gửi email verification, password reset

### 7. **nodemailer**
- **Chức năng**: Email transport
- **Sử dụng**: SMTP client để gửi emails
- **Cấu hình**: Gmail SMTP (smtp.gmail.com:587)

### 8. **uuid**
- **Chức năng**: Generate unique tokens
- **Sử dụng**: Email verification token, password reset token

### 9. **class-validator & class-transformer**
- **Chức năng**: DTO validation
- **Sử dụng**: Validate input data

---

## 🎯 Luồng hoạt động (Flows)

### 1️⃣ Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    participant Email
    
    User->>API: POST /auth/register
    API->>API: Validate DTO
    API->>DB: Check email exists
    alt Email exists
        DB-->>API: User found
        API-->>User: 409 Conflict
    else New email
        API->>API: Hash password (bcrypt)
        API->>API: Generate verification token (UUID)
        API->>DB: Create User + Role Profile
        API->>Email: Send verification email
        Email-->>User: Email with verification link
        API-->>User: 201 Created
    end
```

**Chi tiết:**
1. User gửi thông tin đăng ký
2. Validate dữ liệu đầu vào (DTO)
3. Kiểm tra email đã tồn tại chưa
4. Hash password với bcrypt (salt rounds: 10)
5. Tạo email verification token (UUID v4)
6. Lưu user vào database
7. Tạo profile theo role (JobSeeker/Employer/Admin)
8. Gửi email xác thực
9. Trả về response cho client

---

### 2️⃣ Email Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant Email
    participant API
    participant DB
    
    Email->>User: Verification email with token
    User->>User: Click verification link
    User->>API: POST /auth/verify-email
    API->>DB: Find user by token
    alt Token valid
        API->>DB: Update is_email_verified = true
        API->>DB: Clear verification token
        API->>Email: Send welcome email
        API-->>User: 200 Success
    else Token invalid/expired
        API-->>User: 400 Bad Request
    end
```

**Chi tiết:**
1. User nhận email và click vào link verification
2. Frontend gửi token đến API
3. Tìm user theo token
4. Kiểm tra token có hợp lệ và chưa hết hạn (24h)
5. Cập nhật `is_email_verified = true`
6. Xóa token khỏi database
7. Gửi welcome email
8. User có thể đăng nhập

---

### 3️⃣ Login Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    participant JWT
    
    User->>API: POST /auth/login
    API->>DB: Find user by email
    alt User not found
        API-->>User: 401 Unauthorized
    else User found
        API->>API: Compare password (bcrypt)
        alt Password incorrect
            API-->>User: 401 Unauthorized
        else Password correct
            API->>API: Check email_verified
            alt Not verified
                API-->>User: 401 Email not verified
            else Verified
                API->>API: Check account status
                alt Account inactive
                    API-->>User: 401 Account locked
                else Account active
                    API->>JWT: Generate access token (15m)
                    API->>JWT: Generate refresh token (7d)
                    API->>DB: Save refresh token
                    API-->>User: 200 + tokens + user info
                end
            end
        end
    end
```

**Chi tiết:**
1. User gửi email + password
2. Tìm user trong database
3. So sánh password với bcrypt.compare()
4. Kiểm tra email đã verify chưa
5. Kiểm tra trạng thái tài khoản (ACTIVE)
6. Generate JWT tokens:
   - Access token: 15 phút
   - Refresh token: 7 ngày
7. Lưu refresh token vào database
8. Trả về tokens + user info

---

### 4️⃣ JWT Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Guard
    participant Strategy
    participant DB
    
    Client->>API: Request with Authorization header
    API->>Guard: JwtAuthGuard
    Guard->>Strategy: JwtStrategy.validate()
    Strategy->>Strategy: Decode JWT token
    Strategy->>DB: Find user by ID from token
    alt User not found
        Strategy-->>Guard: Unauthorized
        Guard-->>Client: 401 Unauthorized
    else User found
        Strategy->>Strategy: Check email_verified
        Strategy->>Strategy: Check account status
        alt Checks pass
            Strategy-->>Guard: Return user object
            Guard-->>API: Attach user to request
            API->>API: Execute route handler
            API-->>Client: Response
        else Checks fail
            Strategy-->>Guard: Unauthorized
            Guard-->>Client: 401 Unauthorized
        end
    end
```

**Chi tiết:**
1. Client gửi request với `Authorization: Bearer {token}`
2. JwtAuthGuard intercept request
3. JwtStrategy decode và validate token
4. Extract user ID từ token payload
5. Tìm user trong database
6. Kiểm tra email verified và account status
7. Attach user object vào request
8. Route handler có thể access user qua `@GetUser()` decorator

---

### 5️⃣ Refresh Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant JWT
    
    Client->>API: POST /auth/refresh {refreshToken}
    API->>JWT: Verify refresh token
    alt Token invalid
        API-->>Client: 401 Unauthorized
    else Token valid
        API->>DB: Find user + compare token
        alt Token mismatch
            API-->>Client: 401 Unauthorized
        else Token match
            API->>JWT: Generate new access token
            API->>JWT: Generate new refresh token
            API->>DB: Update refresh token
            API-->>Client: 200 + new tokens
        end
    end
```

**Chi tiết:**
1. Client gửi refresh token (khi access token hết hạn)
2. Verify refresh token signature
3. Tìm user và compare refresh token trong DB
4. Generate tokens mới
5. Update refresh token trong database (token rotation)
6. Trả về tokens mới

---

### 6️⃣ Forgot Password Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    participant Email
    
    User->>API: POST /auth/forgot-password
    API->>DB: Find user by email
    alt User exists
        API->>API: Generate reset token (UUID)
        API->>DB: Save token + expiry (1h)
        API->>Email: Send reset password email
        Email-->>User: Email with reset link
    end
    API-->>User: 200 Success (generic message)
```

**Chi tiết:**
1. User nhập email
2. Tìm user (không tiết lộ user có tồn tại hay không)
3. Generate password reset token (UUID)
4. Set expiry time: 1 giờ
5. Lưu token vào database
6. Gửi email với reset link
7. Trả về generic message (bảo mật)

---

### 7️⃣ Reset Password Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    
    User->>API: POST /auth/reset-password
    API->>DB: Find user by reset token
    alt Token not found
        API-->>User: 400 Invalid token
    else Token found
        API->>API: Check token expiry
        alt Token expired
            API-->>User: 400 Token expired
        else Token valid
            API->>API: Hash new password
            API->>DB: Update password
            API->>DB: Clear reset token
            API->>DB: Clear all refresh tokens
            API-->>User: 200 Success
        end
    end
```

**Chi tiết:**
1. User gửi reset token + password mới
2. Tìm user theo token
3. Kiểm tra token chưa hết hạn (1h)
4. Hash password mới
5. Cập nhật password
6. Xóa reset token
7. Invalidate tất cả refresh tokens (force logout all devices)

---

## 🛡️ Security Layers

### Layer 1: Input Validation
- **class-validator**: Validate DTO
- **class-transformer**: Transform và sanitize data

### Layer 2: Password Security
- **bcrypt**: Hash với salt rounds = 10
- **Password policy**: Min 8 chars, complex pattern

### Layer 3: Token Security
- **JWT**: Signed tokens với secret key
- **Short-lived access tokens**: 15 phút
- **Refresh token rotation**: Mới mỗi lần refresh

### Layer 4: Email Verification
- **Mandatory verification**: Bắt buộc verify email
- **Time-limited tokens**: 24h cho verification, 1h cho reset

### Layer 5: Guards & Strategies
- **JwtAuthGuard**: Protect routes
- **RolesGuard**: Role-based access control
- **Passport Strategies**: Multiple authentication methods

---

## 📧 Email Service Architecture

### Email Types

1. **Verification Email**
   - Trigger: Sau khi đăng ký
   - Token expiry: 24 giờ
   - Template: HTML với button CTA

2. **Welcome Email**
   - Trigger: Sau khi verify email thành công
   - Content: Hướng dẫn sử dụng theo role

3. **Password Reset Email**
   - Trigger: Forgot password request
   - Token expiry: 1 giờ
   - Template: Warning-style email

### Email Configuration

```typescript
Transport: SMTP
Host: smtp.gmail.com
Port: 587
Secure: false (STARTTLS)
Auth: App-specific password
```

---

## 🗄️ Database Schema

### Users Table (Extended)

```sql
users
├── user_id (PK)
├── email (UNIQUE)
├── password_hash
├── full_name
├── phone
├── status (ENUM: ACTIVE, INACTIVE, BANNED)
├── is_email_verified (BOOLEAN)
├── email_verification_token (VARCHAR, NULLABLE)
├── email_verification_token_expires (TIMESTAMP, NULLABLE)
├── password_reset_token (VARCHAR, NULLABLE)
├── password_reset_token_expires (TIMESTAMP, NULLABLE)
├── refresh_token (VARCHAR, NULLABLE)
├── created_at
└── updated_at
```

### Relationships

```
User 1:1 JobSeeker
User 1:1 Employer
User 1:1 Admin
User N:M Roles (through user_roles)
```

---

## 🎭 Role-Based Access Control (RBAC)

### Roles

1. **Admin**
   - Full system access
   - User management
   - System configuration

2. **Employer**
   - Post jobs
   - View applications
   - Company profile management

3. **Job Seeker**
   - Search jobs
   - Apply to jobs
   - Profile management

### Implementation

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'employer')
@Get('dashboard')
getDashboard() {
  // Only admin and employer can access
}
```

---

## 🔄 Token Management

### Access Token Payload

```json
{
  "sub": 123,              // User ID
  "email": "user@example.com",
  "roles": ["job_seeker"],
  "iat": 1234567890,       // Issued at
  "exp": 1234568790        // Expires (15m later)
}
```

### Refresh Token Payload

```json
{
  "sub": 123,
  "email": "user@example.com",
  "roles": ["job_seeker"],
  "iat": 1234567890,
  "exp": 1235172690        // Expires (7d later)
}
```

---

## 📝 Validation Rules

### Password Complexity

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
```

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Email Format

```regex
Standard email validation via class-validator
```

### Phone Format (Optional)

```regex
^[0-9]{10,11}$
```

---

## 🚀 Performance Considerations

1. **Password Hashing**: bcrypt với salt rounds = 10 (balance security vs performance)
2. **Database Queries**: Index trên email, tokens
3. **Token Verification**: In-memory validation (no DB hit)
4. **Email Sending**: Async/background jobs (khuyến nghị thêm queue)

---

## 🔮 Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS OTP
   - Authenticator apps (TOTP)

2. **Social Login**
   - Google OAuth
   - Facebook Login
   - LinkedIn

3. **Rate Limiting**
   - Login attempts
   - Password reset requests
   - Email resend

4. **Session Management**
   - Active sessions tracking
   - Device management
   - Force logout all devices

5. **Audit Logs**
   - Login history
   - Password changes
   - Failed attempts

---

**Tài liệu này mô tả đầy đủ kiến trúc authentication system của CareerVibe**
