# API Quản lý Job Posts cho Employer

## Tổng quan
Module này cung cấp các API cho employer để quản lý các tin tuyển dụng (job posts).

**Base URL:** `/employer/job-posts`

**Authentication:** Yêu cầu JWT token với role `employer`

---

## Endpoints

### 1. Tạo tin tuyển dụng mới

**POST** `/employer/job-posts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Senior Backend Developer",
  "description": "We are looking for an experienced backend developer...",
  "requirements": "- 3+ years experience with Node.js\n- Strong knowledge of TypeScript\n- Experience with NestJS",
  "salary_range": "$2000-$3000",
  "location": "Ho Chi Minh City",
  "employment_type": "full-time",
  "deadline": "2025-12-31"
}
```

**Required Fields:**
- `title` (string, max 150 chars): Tiêu đề công việc

**Optional Fields:**
- `description` (string): Mô tả công việc
- `requirements` (string): Yêu cầu công việc
- `salary_range` (string, max 50 chars): Khoảng lương
- `location` (string, max 255 chars): Địa điểm
- `employment_type` (enum): Loại công việc (`full-time`, `part-time`, `internship`, `contract`)
- `deadline` (date string): Hạn nộp hồ sơ

**Response:**
```json
{
  "message": "Tạo tin tuyển dụng thành công",
  "data": {
    "job_post_id": 1,
    "employer_id": 1,
    "company_id": 1,
    "title": "Senior Backend Developer",
    "description": "We are looking for an experienced backend developer...",
    "requirements": "- 3+ years experience with Node.js...",
    "salary_range": "$2000-$3000",
    "location": "Ho Chi Minh City",
    "employment_type": "full-time",
    "deadline": "2025-12-31T00:00:00.000Z",
    "created_at": "2025-10-26T10:30:00.000Z",
    "company": {
      "company_id": 1,
      "name": "Tech Corp",
      "location": "123 Tech Street",
      "logo_url": "https://example.com/logo.png"
    }
  }
}
```

---

### 2. Lấy danh sách tin tuyển dụng

**GET** `/employer/job-posts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, optional, default: 1, min: 1): Trang hiện tại
- `limit` (number, optional, default: 10, min: 1, max: 100): Số lượng items mỗi trang

**Example:**
```
GET /employer/job-posts?page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "job_post_id": 1,
      "employer_id": 1,
      "company_id": 1,
      "title": "Senior Backend Developer",
      "description": "We are looking for...",
      "requirements": "- 3+ years experience...",
      "salary_range": "$2000-$3000",
      "location": "Ho Chi Minh City",
      "employment_type": "full-time",
      "deadline": "2025-12-31T00:00:00.000Z",
      "created_at": "2025-10-26T10:30:00.000Z",
      "company": {
        "company_id": 1,
        "name": "Tech Corp",
        "location": "123 Tech Street"
      }
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

---

### 3. Lấy chi tiết một tin tuyển dụng

**GET** `/employer/job-posts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "data": {
    "job_post_id": 1,
    "employer_id": 1,
    "company_id": 1,
    "title": "Senior Backend Developer",
    "description": "We are looking for an experienced backend developer...",
    "requirements": "- 3+ years experience with Node.js...",
    "salary_range": "$2000-$3000",
    "location": "Ho Chi Minh City",
    "employment_type": "full-time",
    "deadline": "2025-12-31T00:00:00.000Z",
    "created_at": "2025-10-26T10:30:00.000Z",
    "company": {
      "company_id": 1,
      "name": "Tech Corp",
      "location": "123 Tech Street",
      "logo_url": "https://example.com/logo.png",
      "description": "A leading tech company",
      "industry": "Technology",
      "website": "https://techcorp.com"
    },
    "employer": {
      "employer_id": 1,
      "position": "HR Manager",
      "user": {
        "user_id": 1,
        "email": "employer@example.com",
        "full_name": "Tech Corp"
      }
    }
  }
}
```

---

### 4. Cập nhật tin tuyển dụng

**PATCH** `/employer/job-posts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (Tất cả fields đều optional)
```json
{
  "title": "Senior Backend Developer (Updated)",
  "description": "Updated description...",
  "salary_range": "$2500-$3500",
  "deadline": "2025-11-30"
}
```

**Response:**
```json
{
  "message": "Cập nhật tin tuyển dụng thành công",
  "data": {
    "job_post_id": 1,
    "title": "Senior Backend Developer (Updated)",
    "description": "Updated description...",
    "salary_range": "$2500-$3500",
    "deadline": "2025-11-30T00:00:00.000Z",
    ...
  }
}
```

---

### 5. Xóa tin tuyển dụng

**DELETE** `/employer/job-posts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Xóa tin tuyển dụng thành công"
}
```

---

### 6. Thống kê tin tuyển dụng

**GET** `/employer/job-posts/statistics`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total": 25,
  "active": 18,
  "expired": 7,
  "byEmploymentType": {
    "full-time": 15,
    "part-time": 5,
    "internship": 3,
    "contract": 2
  }
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

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập tin tuyển dụng này"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy tin tuyển dụng"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Tiêu đề công việc không được để trống",
    "Tiêu đề không được vượt quá 150 ký tự"
  ],
  "error": "Bad Request"
}
```

---

## Business Rules

1. **Quyền truy cập**: Employer chỉ có thể quản lý tin tuyển dụng của chính mình
2. **Company Required**: Employer phải được liên kết với công ty trước khi đăng tin
3. **Auto-assign**: `employer_id` và `company_id` được tự động gán từ thông tin employer
4. **Deadline**: Tin tuyển dụng có thể có hoặc không có deadline
5. **Statistics**: Active job posts là những tin còn hạn (deadline >= now hoặc không có deadline)

---

## Workflow

```
1. Login với role employer
2. POST /employer/job-posts - Tạo tin tuyển dụng
3. GET /employer/job-posts - Xem danh sách tin của mình
4. GET /employer/job-posts/:id - Xem chi tiết
5. PATCH /employer/job-posts/:id - Cập nhật
6. DELETE /employer/job-posts/:id - Xóa
7. GET /employer/job-posts/statistics - Xem thống kê
```

---

## Testing with cURL

### Create Job Post
```bash
curl -X POST http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "description": "We are looking for an experienced developer",
    "requirements": "3+ years experience with Node.js",
    "salary_range": "$2000-$3000",
    "location": "Ho Chi Minh City",
    "employment_type": "full-time",
    "deadline": "2025-12-31"
  }'
```

### Get All Job Posts
```bash
curl -X GET "http://localhost:3000/employer/job-posts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Job Post
```bash
curl -X PATCH http://localhost:3000/employer/job-posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer (Updated)",
    "salary_range": "$2500-$3500"
  }'
```

### Delete Job Post
```bash
curl -X DELETE http://localhost:3000/employer/job-posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
