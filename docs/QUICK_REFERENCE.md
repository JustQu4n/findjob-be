# ⚡ Quick Reference - CareerVibe Authentication

## 📦 Packages Đã Cài

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt @nestjs-modules/mailer nodemailer handlebars uuid @types/bcrypt @types/passport-jwt @types/passport-local @types/nodemailer
```

## 🗂️ Files Đã Tạo

### DTOs (src/modules/auth/dto/)
- ✅ register.dto.ts
- ✅ login.dto.ts
- ✅ verify-email.dto.ts
- ✅ forgot-password.dto.ts
- ✅ reset-password.dto.ts
- ✅ refresh-token.dto.ts
- ✅ index.ts

### Strategies (src/modules/auth/strategies/)
- ✅ jwt.strategy.ts
- ✅ jwt-refresh.strategy.ts
- ✅ local.strategy.ts

### Guards (src/common/guards/)
- ✅ jwt-auth.guard.ts
- ✅ jwt-refresh-auth.guard.ts
- ✅ local-auth.guard.ts
- ✅ roles.guard.ts

### Decorators (src/common/decorators/)
- ✅ roles.decorator.ts
- ✅ get-user.decorator.ts
- ✅ public.decorator.ts

### Services & Controllers
- ✅ auth.service.ts (Full implementation)
- ✅ auth.controller.ts (All endpoints)
- ✅ email.service.ts (Email templates)
- ✅ auth.module.ts (Module configuration)

### Database
- ✅ User entity updated (thêm auth fields)
- ✅ Migration generated

### Documentation
- ✅ docs/AUTHENTICATION.md
- ✅ docs/AUTH_ARCHITECTURE.md
- ✅ README.md (Updated)
- ✅ .env.example

## 🚀 Các Bước Tiếp Theo

### 1. Cấu hình Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Chỉnh sửa các giá trị:
# - JWT_SECRET và JWT_REFRESH_SECRET
# - MAIL_USER và MAIL_PASSWORD (Gmail App Password)
# - FRONTEND_URL
```

### 2. Chạy Migration

```bash
# Start Docker
docker-compose up -d

# Run migration
npm run migration:run
```

### 3. Start Application

```bash
npm run start:dev
```

## 🧪 Test API

### 1. Register
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

### 2. Verify Email
```bash
# Check email inbox và lấy token
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-from-email"}'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

### 4. Get Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔑 Key Concepts

### User Roles
- `admin` - Full system access
- `employer` - Post jobs, view applications
- `job_seeker` - Apply for jobs

### Token Lifetime
- Access Token: **15 minutes**
- Refresh Token: **7 days**
- Email Verification Token: **24 hours**
- Password Reset Token: **1 hour**

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

## 🛡️ How to Use Guards

### Protect Single Route
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@GetUser() user: User) {
  return user;
}
```

### Protect Entire Controller
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  // All routes require JWT auth
}
```

### Role-based Access
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'employer')
@Get('dashboard')
getDashboard() {
  // Only admin and employer
}
```

### Public Route (No Auth)
```typescript
@Public()
@Get('public-info')
getPublicInfo() {
  // Anyone can access
}
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy to `MAIL_PASSWORD` in `.env`

### Email Types Sent
1. **Verification Email** - After registration
2. **Welcome Email** - After email verified
3. **Password Reset Email** - On forgot password request

## 🗄️ Database Fields Added to Users

```sql
is_email_verified BOOLEAN DEFAULT false
email_verification_token VARCHAR(255) NULLABLE
email_verification_token_expires TIMESTAMP NULLABLE
password_reset_token VARCHAR(255) NULLABLE
password_reset_token_expires TIMESTAMP NULLABLE
refresh_token VARCHAR(500) NULLABLE
```

## 🐛 Common Issues & Solutions

### Issue: Email not sending
**Solution**: 
- Check Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Check SMTP settings (smtp.gmail.com:587)

### Issue: JWT token invalid
**Solution**:
- Check JWT_SECRET matches in .env
- Verify token hasn't expired
- Check Authorization header format: `Bearer {token}`

### Issue: Email verification link not working
**Solution**:
- Check FRONTEND_URL in .env
- Token expires after 24 hours
- Use resend verification endpoint

### Issue: Migration fails
**Solution**:
```bash
# Drop and recreate
npm run schema:drop
npm run migration:run
```

## 📚 Documentation Links

- [Full API Guide](docs/AUTHENTICATION.md)
- [System Architecture](docs/AUTH_ARCHITECTURE.md)
- [Main README](README.md)

## ✅ Checklist

- [x] Install packages
- [x] Create DTOs
- [x] Create Strategies
- [x] Create Guards
- [x] Create Decorators
- [x] Create Services
- [x] Create Controllers
- [x] Update User Entity
- [x] Create Email Service
- [x] Configure Auth Module
- [x] Generate Migration
- [x] Create Documentation
- [x] Update README
- [ ] Configure .env
- [ ] Run migration
- [ ] Test all endpoints
- [ ] Deploy to production

## 🎯 Next Features to Add (Optional)

1. **Two-Factor Authentication (2FA)**
2. **Social Login** (Google, Facebook)
3. **Rate Limiting**
4. **Session Management**
5. **Audit Logs**
6. **Email Queue** (Bull/Redis)
7. **SMS Verification**
8. **Account Recovery**

---

**Happy Coding! 🚀**
