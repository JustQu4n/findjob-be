# Testing Guide - Employer Job Post API

## Bước 1: Đăng ký và đăng nhập Employer

### 1.1. Đăng ký Employer
```bash
POST http://localhost:3000/auth/register-employer
Content-Type: application/json

{
  "email": "employer@techcorp.com",
  "password": "Password123!",
  "company_name": "Tech Corp",
  "company_address": "123 Tech Street, District 1, HCMC",
  "company_logo_url": "https://example.com/techcorp-logo.png",
  "company_description": "A leading technology company specializing in web development",
  "company_industry": "Information Technology",
  "company_website": "https://techcorp.com"
}
```

### 1.2. Xác thực Email
```bash
POST http://localhost:3000/auth/verify-email
Content-Type: application/json

{
  "token": "TOKEN_FROM_EMAIL"
}
```

### 1.3. Đăng nhập
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "employer@techcorp.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "user": {...},
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Lưu accessToken để sử dụng cho các request sau**

---

## Bước 2: Test CRUD Job Posts

### 2.1. Tạo Job Post #1 - Backend Developer
```bash
POST http://localhost:3000/employer/job-posts
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Senior Backend Developer",
  "description": "We are looking for an experienced Backend Developer to join our growing team. You will be responsible for designing and implementing server-side logic, ensuring high performance and responsiveness.",
  "requirements": "- 3+ years of experience with Node.js and TypeScript\n- Strong knowledge of NestJS framework\n- Experience with PostgreSQL and TypeORM\n- Understanding of RESTful APIs and microservices\n- Experience with Docker and CI/CD",
  "salary_range": "$2000 - $3000",
  "location": "Ho Chi Minh City",
  "employment_type": "full-time",
  "deadline": "2025-12-31"
}
```

### 2.2. Tạo Job Post #2 - Frontend Developer
```bash
POST http://localhost:3000/employer/job-posts
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Frontend Developer (React)",
  "description": "Join our team as a Frontend Developer working with modern React technologies.",
  "requirements": "- 2+ years experience with React\n- Knowledge of TypeScript\n- Experience with Redux or similar state management\n- Familiar with CSS frameworks (Tailwind, Material-UI)",
  "salary_range": "$1500 - $2500",
  "location": "Ho Chi Minh City",
  "employment_type": "full-time",
  "deadline": "2025-11-30"
}
```

### 2.3. Tạo Job Post #3 - Internship
```bash
POST http://localhost:3000/employer/job-posts
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Software Development Intern",
  "description": "Great opportunity for students to learn and grow with experienced developers.",
  "requirements": "- Currently pursuing CS degree\n- Basic knowledge of programming\n- Eager to learn",
  "salary_range": "$300 - $500",
  "location": "Ho Chi Minh City",
  "employment_type": "internship",
  "deadline": "2025-10-31"
}
```

### 2.4. Lấy tất cả Job Posts
```bash
GET http://localhost:3000/employer/job-posts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.5. Lấy Job Posts với phân trang
```bash
GET http://localhost:3000/employer/job-posts?page=1&limit=5
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.6. Lấy trang 2
```bash
GET http://localhost:3000/employer/job-posts?page=2&limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.7. Lấy chi tiết Job Post
```bash
GET http://localhost:3000/employer/job-posts/1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.8. Cập nhật Job Post
```bash
PATCH http://localhost:3000/employer/job-posts/1
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Senior Backend Developer (Updated)",
  "salary_range": "$2500 - $3500",
  "deadline": "2026-01-31"
}
```

### 2.9. Xem thống kê
```bash
GET http://localhost:3000/employer/job-posts/statistics
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2.10. Xóa Job Post
```bash
DELETE http://localhost:3000/employer/job-posts/3
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Bước 3: Test Error Cases

### 3.1. Tạo Job Post thiếu title (400 Bad Request)
```bash
POST http://localhost:3000/employer/job-posts
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "description": "Missing title",
  "location": "HCMC"
}
```

### 3.2. Truy cập Job Post của người khác (403 Forbidden)
```bash
# Đăng nhập với employer khác và thử truy cập job post ID của employer đầu tiên
GET http://localhost:3000/employer/job-posts/1
Authorization: Bearer ANOTHER_EMPLOYER_TOKEN
```

### 3.3. Truy cập Job Post không tồn tại (404 Not Found)
```bash
GET http://localhost:3000/employer/job-posts/99999
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 3.4. Không có token (401 Unauthorized)
```bash
GET http://localhost:3000/employer/job-posts
# Không có Authorization header
```

### 3.5. Token của role khác (403 Forbidden)
```bash
# Đăng nhập với role job_seeker và thử truy cập
GET http://localhost:3000/employer/job-posts
Authorization: Bearer JOB_SEEKER_TOKEN
```

---

## Test với Postman

### Import vào Postman Collection

1. Tạo Environment với biến:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: Để trống (sẽ set sau khi login)

2. Tạo Collection "Employer Job Post API"

3. Add Pre-request Script cho Collection:
```javascript
pm.environment.set("accessToken", pm.response.json().accessToken);
```

4. Add Authorization cho Collection:
   - Type: Bearer Token
   - Token: `{{accessToken}}`

---

## Expected Results

### Successful Responses
- ✅ **201 Created**: Khi tạo job post thành công
- ✅ **200 OK**: Khi get, update, delete thành công
- ✅ Pagination: Trả về đúng số lượng items theo limit
- ✅ Filter: Chỉ trả về kết quả match với filter
- ✅ Statistics: Đếm đúng số lượng active/expired posts

### Error Responses
- ❌ **400 Bad Request**: Validation error
- ❌ **401 Unauthorized**: Không có token hoặc token invalid
- ❌ **403 Forbidden**: Không đủ quyền (sai role hoặc truy cập post của người khác)
- ❌ **404 Not Found**: Job post không tồn tại

---

## Tips

1. **Lưu tokens**: Save accessToken sau khi login để dùng cho các request khác
2. **Check expiry**: Access token expires sau 15 phút, refresh nếu cần
3. **Test pagination**: Tạo nhiều job posts để test phân trang
4. **Test filters**: Tạo posts với employment_type và location khác nhau
5. **Test ownership**: Tạo nhiều employer accounts để test quyền truy cập

---

## Quick Test Script (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let accessToken = '';

async function test() {
  // 1. Login
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'employer@techcorp.com',
    password: 'Password123!'
  });
  accessToken = loginRes.data.accessToken;
  console.log('✅ Logged in');

  // 2. Create job post
  const createRes = await axios.post(
    `${BASE_URL}/employer/job-posts`,
    {
      title: 'Test Job',
      description: 'Test Description',
      employment_type: 'full-time',
      location: 'HCMC'
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  console.log('✅ Created job post:', createRes.data.data.job_post_id);

  // 3. Get all posts
  const listRes = await axios.get(
    `${BASE_URL}/employer/job-posts`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  console.log('✅ Total posts:', listRes.data.pagination.total);

  // 4. Get statistics
  const statsRes = await axios.get(
    `${BASE_URL}/employer/job-posts/statistics`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  console.log('✅ Statistics:', statsRes.data);
}

test().catch(console.error);
```
