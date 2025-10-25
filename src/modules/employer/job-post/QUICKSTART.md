# 🚀 Quick Start - Employer Job Post API

## Bắt đầu nhanh trong 5 phút!

### Bước 1: Đăng ký Employer (30 giây)

```bash
curl -X POST http://localhost:3000/auth/register-employer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "Test123456",
    "company_name": "Test Company",
    "company_address": "123 Test Street, HCMC"
  }'
```

### Bước 2: Xác thực Email (30 giây)

Check email và lấy token, sau đó:

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_EMAIL_TOKEN"
  }'
```

### Bước 3: Đăng nhập (30 giây)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "Test123456"
  }'
```

**Lưu `accessToken` từ response!**

### Bước 4: Tạo Job Post đầu tiên (1 phút)

```bash
curl -X POST http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer",
    "description": "Looking for talented developer",
    "requirements": "Node.js, TypeScript, NestJS",
    "salary_range": "$2000-3000",
    "location": "Ho Chi Minh City",
    "employment_type": "full-time",
    "deadline": "2025-12-31"
  }'
```

### Bước 5: Xem Job Posts của bạn (30 giây)

```bash
curl -X GET http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Bước 6: Xem thống kê (30 giây)

```bash
curl -X GET http://localhost:3000/employer/job-posts/statistics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## ✅ Xong!

Bạn đã setup thành công! 

### 📖 Đọc thêm:
- [API Documentation](../docs/EMPLOYER_JOBPOST_API.md) - Chi tiết tất cả endpoints
- [Testing Guide](../docs/EMPLOYER_JOBPOST_TESTING.md) - Hướng dẫn test đầy đủ
- [Module README](./README.md) - Technical details

### 🎯 Thử thêm:

**Tìm kiếm job posts:**
```bash
curl -X GET "http://localhost:3000/employer/job-posts?search=developer" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Lọc theo loại:**
```bash
curl -X GET "http://localhost:3000/employer/job-posts?employment_type=full-time" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Cập nhật job post:**
```bash
curl -X PATCH http://localhost:3000/employer/job-posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salary_range": "$2500-3500"
  }'
```

**Xóa job post:**
```bash
curl -X DELETE http://localhost:3000/employer/job-posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 💡 Tips

1. **Token hết hạn?** Token expires sau 15 phút. Dùng `/auth/refresh` để lấy token mới.
2. **Test nhiều filters?** Combine multiple query params: `?search=dev&employment_type=full-time&location=HCMC`
3. **Dùng Postman?** Import collection từ testing guide
4. **Environment?** Đảm bảo server đang chạy: `npm run start:dev`

---

## ❓ Troubleshooting

**Error: "Không tìm thấy thông tin nhà tuyển dụng"**
→ Đảm bảo bạn đã đăng ký với role employer

**Error: "Bạn không có quyền truy cập"**
→ Check token của bạn có đúng role không

**Error: "Email đã được sử dụng"**
→ Dùng email khác hoặc login với email hiện tại

**Token invalid?**
→ Login lại để lấy token mới
