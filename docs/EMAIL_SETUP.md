# 📧 Hướng dẫn Setup Email cho CareerVibe

## ❌ Lỗi hiện tại

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Nguyên nhân**: Gmail không chấp nhận login với username/password thông thường vì lý do bảo mật.

---

## ✅ Giải pháp 1: Gmail App Password (Khuyến nghị cho Production)

### Bước 1: Bật 2-Step Verification

1. Truy cập: https://myaccount.google.com/security
2. Tìm mục "**2-Step Verification**"
3. Click **"Get Started"** và làm theo hướng dẫn
4. Hoàn tất việc bật 2-Step Verification

### Bước 2: Tạo App Password

1. Sau khi bật 2-Step Verification, truy cập: https://myaccount.google.com/apppasswords
2. Nếu bạn thấy trang này:
   - Chọn **"Select app"** → chọn **"Mail"**
   - Chọn **"Select device"** → chọn **"Other"** 
   - Nhập tên: **"CareerVibe"**
   - Click **"Generate"**

3. Gmail sẽ hiện một password gồm 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)
4. **Copy password này** (không có dấu cách)

### Bước 3: Cập nhật file `.env`

```env
# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=abcdefghijklmnop     # ← Paste App Password ở đây (16 ký tự, không có dấu cách)
MAIL_FROM=noreply@careervibe.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Bước 4: Restart ứng dụng

```bash
# Stop app (Ctrl + C)
# Start lại
npm run start:dev
```

---

## ✅ Giải pháp 2: Mailtrap (Khuyến nghị cho Development)

[Mailtrap](https://mailtrap.io) là dịch vụ email testing - emails sẽ không được gửi thật, chỉ hiện trong inbox ảo.

### Bước 1: Tạo tài khoản Mailtrap

1. Truy cập: https://mailtrap.io
2. Sign up (miễn phí)
3. Verify email

### Bước 2: Lấy SMTP credentials

1. Sau khi login, vào **Email Testing** → **Inboxes**
2. Click vào inbox mặc định (hoặc tạo inbox mới)
3. Vào tab **"SMTP Settings"**
4. Chọn **"Nodemailer"** trong dropdown
5. Copy thông tin hiển thị

### Bước 3: Cập nhật file `.env`

```env
# Email Configuration (Mailtrap - Development)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username     # Từ Mailtrap SMTP Settings
MAIL_PASSWORD=your-mailtrap-password # Từ Mailtrap SMTP Settings
MAIL_FROM=noreply@careervibe.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Bước 4: Restart và test

```bash
npm run start:dev
```

Bây giờ mọi email sẽ xuất hiện trong Mailtrap inbox thay vì gửi thật!

---

## ✅ Giải pháp 3: Development Mode (Tạm thời)

Hệ thống đã được cập nhật để **tự động fallback** trong development mode.

### Cách hoạt động:

Nếu `NODE_ENV=development` và email gửi thất bại:
- Email sẽ **KHÔNG** được gửi thật
- Link verification/reset sẽ được **log ra console**
- Bạn có thể copy link từ console để test

### Cấu hình:

```env
# Application
NODE_ENV=development   # ← Đảm bảo có dòng này

# Email - có thể để trống hoặc giá trị bất kỳ
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@careervibe.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Log output mẫu:

```
[EmailService] ❌ Failed to send verification email to test@example.com: Invalid login

[EmailService] 🔗 VERIFICATION URL (Development Mode):
   http://localhost:5173/verify-email?token=abc-123-def-456

[EmailService] 🔑 TOKEN: abc-123-def-456
```

Copy link này và paste vào trình duyệt để verify email!

---

## 🧪 Test Email Service

### Test 1: Register user

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

**Kết quả mong đợi:**
- Với Gmail App Password hoặc Mailtrap: Email được gửi thật
- Với Development Mode: Link hiện trong console logs

### Test 2: Check console logs

Trong terminal chạy app, bạn sẽ thấy:

```
✅ Verification email sent to: test@example.com
```

Hoặc (nếu email fail):

```
❌ Failed to send verification email to test@example.com: ...
🔗 VERIFICATION URL (Development Mode):
   http://localhost:5173/verify-email?token=...
```

### Test 3: Verify email

**Option A**: Click link trong email (nếu email gửi thành công)

**Option B**: Copy URL từ console logs và paste vào browser

**Option C**: Dùng API trực tiếp:

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_FROM_LOGS"}'
```

---

## 📊 So sánh các giải pháp

| Giải pháp | Ưu điểm | Nhược điểm | Khuyến nghị |
|-----------|---------|------------|-------------|
| **Gmail App Password** | ✅ Gửi email thật<br>✅ Miễn phí<br>✅ Reliable | ⚠️ Cần setup 2FA<br>⚠️ Cần tạo app password | **Production** |
| **Mailtrap** | ✅ Dễ setup<br>✅ Inbox ảo tiện lợi<br>✅ Không gửi email thật | ⚠️ Chỉ cho testing | **Development** |
| **Development Mode** | ✅ Không cần config email<br>✅ Nhanh chóng | ⚠️ Không test được email<br>⚠️ Chỉ dùng tạm | **Quick testing** |

---

## 🔧 Troubleshooting

### Lỗi: "Username and Password not accepted"

**Giải pháp:**
- Kiểm tra đã bật 2-Step Verification chưa
- Đảm bảo dùng App Password, KHÔNG phải password Gmail thường
- App Password phải là 16 ký tự, không có dấu cách

### Lỗi: "Connection timeout"

**Giải pháp:**
- Kiểm tra `MAIL_HOST` và `MAIL_PORT` đúng chưa
- Gmail: `smtp.gmail.com:587`
- Mailtrap: `smtp.mailtrap.io:2525`
- Kiểm tra firewall/antivirus có block port 587 không

### Lỗi: "self signed certificate"

**Giải pháp:**
Thêm vào `auth.module.ts`:

```typescript
transport: {
  host: '...',
  port: 587,
  secure: false,
  auth: { ... },
  tls: {
    rejectUnauthorized: false  // ← Thêm dòng này
  }
}
```

### Email không nhận được (Gmail App Password)

**Kiểm tra:**
1. Check Spam folder
2. Kiểm tra MAIL_USER có đúng email không
3. Kiểm tra App Password có chính xác không (16 ký tự)
4. Kiểm tra console logs có lỗi không

---

## 🎯 Khuyến nghị

### Development (Local)
```env
# Option 1: Mailtrap (Tốt nhất)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_pass

# Option 2: Development Mode
NODE_ENV=development
MAIL_USER=
MAIL_PASSWORD=
```

### Production
```env
# Gmail với App Password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-business-email@gmail.com
MAIL_PASSWORD=your_16_char_app_password

# Hoặc dùng dịch vụ email chuyên nghiệp
# SendGrid, AWS SES, Mailgun, etc.
```

---

## 📝 Các service email khác (Tùy chọn)

### SendGrid (Khuyến nghị cho Production)
- 100 emails/day miễn phí
- Reliable, fast
- https://sendgrid.com

### AWS SES
- $0.10 per 1,000 emails
- Cần AWS account
- https://aws.amazon.com/ses/

### Mailgun
- 5,000 emails/month miễn phí
- https://www.mailgun.com

---

## ✅ Checklist

- [ ] Chọn giải pháp email (Gmail App Password / Mailtrap / Development)
- [ ] Cập nhật file `.env` với credentials đúng
- [ ] Restart ứng dụng
- [ ] Test register endpoint
- [ ] Kiểm tra console logs
- [ ] Verify email thành công
- [ ] Test login sau khi verify

---

**Lưu ý:** Development Mode chỉ nên dùng để test nhanh. Để test đầy đủ email templates, nên dùng Mailtrap hoặc Gmail App Password.

---

**Need help?** Check the main [AUTHENTICATION.md](./AUTHENTICATION.md) document.
