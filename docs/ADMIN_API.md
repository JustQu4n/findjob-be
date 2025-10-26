# Admin API Documentation

## Tổng quan

API cho Admin với RBAC (Role-Based Access Control). Super Admin có thể quản lý tất cả Employers trong hệ thống.

---

## Authentication

### 1. Đăng ký Admin

**POST** `/auth/register-admin`

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn Admin",
  "email": "admin@example.com",
  "password": "Admin123456",
  "department": "IT Management",
  "position": "Super Admin"
}
```

**Required Fields:**
- `full_name` (string, max 100): Họ tên
- `email` (string): Email hợp lệ
- `password` (string, min 8): Mật khẩu

**Optional Fields:**
- `department` (string, max 100): Phòng ban
- `position` (string, max 50): Chức vụ

**Response:**
```json
{
  "message": "Đăng ký admin thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "user_id": 1,
    "email": "admin@example.com",
    "full_name": "Nguyễn Văn Admin",
    "role": "admin",
    "department": "IT Management",
    "position": "Super Admin"
  }
}
```

### 2. Xác thực Email

**POST** `/auth/verify-email`

```json
{
  "token": "uuid-token-from-email"
}
```

### 3. Đăng nhập

**POST** `/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "Admin123456"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "user_id": 1,
    "email": "admin@example.com",
    "full_name": "Nguyễn Văn Admin",
    "phone": null,
    "roles": ["admin"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Employer Management

**Base URL:** `/admin/employers`

**Authentication:** Yêu cầu JWT token với role `admin`

### 1. Lấy danh sách Employers

**GET** `/admin/employers`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `search` (string, optional): Tìm theo email hoặc tên
- `status` (enum, optional): Lọc theo trạng thái (active, inactive, suspended)
- `company_name` (string, optional): Lọc theo tên công ty
- `page` (number, optional, default: 1): Trang hiện tại
- `limit` (number, optional, default: 10, max: 100): Số items mỗi trang

**Examples:**
```
GET /admin/employers
GET /admin/employers?search=tech
GET /admin/employers?status=active
GET /admin/employers?company_name=Tech Corp
GET /admin/employers?page=2&limit=20
GET /admin/employers?search=john&status=active&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "employer_id": 1,
      "user_id": 5,
      "company_id": 3,
      "position": "HR Manager",
      "user": {
        "user_id": 5,
        "email": "employer@techcorp.com",
        "full_name": "Tech Corp",
        "phone": "0901234567",
        "status": "active",
        "is_email_verified": true,
        "created_at": "2025-10-26T10:00:00.000Z"
      },
      "company": {
        "company_id": 3,
        "name": "Tech Corp",
        "industry": "Technology",
        "location": "Ho Chi Minh City",
        "website": "https://techcorp.com",
        "logo_url": "https://example.com/logo.png"
      },
      "jobPosts": [
        {
          "job_post_id": 1,
          "title": "Backend Developer",
          "employment_type": "full-time",
          "created_at": "2025-10-26T11:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Lấy chi tiết Employer

**GET** `/admin/employers/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "data": {
    "employer_id": 1,
    "user_id": 5,
    "company_id": 3,
    "position": "HR Manager",
    "user": {
      "user_id": 5,
      "email": "employer@techcorp.com",
      "full_name": "Tech Corp",
      "phone": "0901234567",
      "status": "active",
      "is_email_verified": true,
      "created_at": "2025-10-26T10:00:00.000Z"
    },
    "company": {
      "company_id": 3,
      "name": "Tech Corp",
      "industry": "Technology",
      "description": "Leading tech company",
      "location": "Ho Chi Minh City",
      "website": "https://techcorp.com",
      "logo_url": "https://example.com/logo.png",
      "created_at": "2025-10-26T10:00:00.000Z"
    },
    "jobPosts": [
      {
        "job_post_id": 1,
        "title": "Backend Developer",
        "description": "...",
        "employment_type": "full-time",
        "salary_range": "$2000-3000",
        "location": "HCMC",
        "created_at": "2025-10-26T11:00:00.000Z",
        "applications": [
          {
            "application_id": 1,
            "status": "pending"
          }
        ]
      }
    ]
  },
  "statistics": {
    "total_job_posts": 5,
    "total_applications": 12
  }
}
```

### 3. Cập nhật trạng thái Employer

**PATCH** `/admin/employers/:id/status`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Status Values:**
- `active`: Hoạt động bình thường
- `inactive`: Tạm ngưng
- `suspended`: Bị khóa

**Response:**
```json
{
  "message": "Cập nhật trạng thái thành công",
  "data": {
    "employer_id": 1,
    "user_email": "employer@techcorp.com",
    "status": "inactive"
  }
}
```

### 4. Xóa Employer

**DELETE** `/admin/employers/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Note:** Đây là soft delete - chỉ set status = INACTIVE

**Response:**
```json
{
  "message": "Xóa nhà tuyển dụng thành công"
}
```

### 5. Thống kê Employers

**GET** `/admin/employers/statistics`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "total": 50,
  "active": 42,
  "inactive": 8,
  "verified": 45,
  "unverified": 5,
  "withCompany": 48,
  "withoutCompany": 2
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy nhà tuyển dụng"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Email không được để trống",
    "Mật khẩu phải có ít nhất 8 ký tự"
  ],
  "error": "Bad Request"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email đã được sử dụng"
}
```

---

## RBAC (Role-Based Access Control)

### Roles

1. **admin** - Super Admin
   - Quản lý tất cả employers
   - Xem thống kê hệ thống
   - Cập nhật trạng thái employers
   - Xóa employers

2. **employer** - Nhà tuyển dụng
   - Quản lý job posts của mình
   - Xem applications

3. **jobseeker** - Người tìm việc
   - Xem job posts
   - Apply jobs

### Guards

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

- **JwtAuthGuard**: Xác thực JWT token
- **RolesGuard**: Kiểm tra role của user
- **@Roles('admin')**: Chỉ admin được phép truy cập

---

## Workflow

### Admin Registration & Login
```
1. POST /auth/register-admin
2. POST /auth/verify-email (với token từ email)
3. POST /auth/login
4. Lưu accessToken
```

### Manage Employers
```
1. GET /admin/employers/statistics - Xem tổng quan
2. GET /admin/employers - Xem danh sách
3. GET /admin/employers/:id - Xem chi tiết
4. PATCH /admin/employers/:id/status - Cập nhật trạng thái
5. DELETE /admin/employers/:id - Xóa (nếu cần)
```

---

## Testing

### Register Admin
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Super Admin",
    "email": "admin@findjob.com",
    "password": "Admin123456",
    "department": "IT",
    "position": "Super Admin"
  }'
```

### Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@findjob.com",
    "password": "Admin123456"
  }'
```

### Get All Employers
```bash
curl -X GET http://localhost:3000/admin/employers \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

### Update Employer Status
```bash
curl -X PATCH http://localhost:3000/admin/employers/1/status \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

---

## Security Best Practices

1. **Authentication Required**: Tất cả endpoints admin yêu cầu valid JWT token
2. **Role Check**: Chỉ user với role `admin` được truy cập
3. **Email Verification**: Admin phải verify email trước khi sử dụng
4. **Soft Delete**: Không xóa hẳn data, chỉ set status = inactive
5. **Password Hashing**: Passwords được hash với bcrypt (salt rounds = 10)
6. **Token Expiry**: Access token expires sau 15 phút

---

## Future Enhancements

- [ ] Audit logs cho admin actions
- [ ] Bulk operations (activate/deactivate nhiều employers)
- [ ] Email notifications khi admin update status
- [ ] Advanced filtering và sorting
- [ ] Export data to CSV/Excel
- [ ] Admin dashboard với charts
- [ ] Permission-based access control (chi tiết hơn role)
