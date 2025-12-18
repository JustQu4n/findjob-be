# API Công Khai Hiển Thị Và Lọc Job Posts

## Tổng Quan

API này cho phép người dùng (không cần đăng nhập) xem và tìm kiếm tất cả các tin tuyển dụng với nhiều bộ lọc khác nhau.

**Base URL:** `/jobseeker/job-posts`

## Endpoints

### 1. Lấy Danh Sách Tất Cả Job Posts Với Bộ Lọc

**GET** `/jobseeker/job-posts`

Lấy danh sách tất cả job posts có thể lọc theo nhiều tiêu chí.

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `page` | number | Không | Số trang (mặc định: 1) |
| `limit` | number | Không | Số lượng kết quả mỗi trang (mặc định: 10) |
| `keyword` | string | Không | Từ khóa tìm kiếm trong tiêu đề, mô tả, yêu cầu, hoặc tên công ty |
| `location` | string | Không | Lọc theo địa điểm (tìm kiếm gần đúng) |
| `job_type` | enum | Không | Lọc theo loại công việc: `full_time`, `part_time`, `contract`, `internship` |
| `category_id` | string | Không | Lọc theo danh mục công việc (UUID) |
| `level` | enum | Không | Lọc theo cấp độ: `Intern`, `Junior`, `Middle`, `Senior`, `Lead`, `Manager`, `All` |
| `experience` | string | Không | Lọc theo kinh nghiệm (tìm kiếm gần đúng) |
| `salary_range` | string | Không | Lọc theo mức lương (tìm kiếm gần đúng) |
| `company_id` | string | Không | Lọc theo công ty (UUID) |
| `skills` | string[] | Không | Lọc theo kỹ năng (có thể truyền dạng: `?skills=JavaScript,TypeScript,React`) |
| `sort_by` | enum | Không | Sắp xếp theo: `created_at`, `views_count`, `saves_count`, `title`, `salary_range` (mặc định: `created_at`) |
| `sort_order` | enum | Không | Thứ tự sắp xếp: `ASC`, `DESC` (mặc định: `DESC`) |

#### Response Success (200 OK)

```json
{
  "data": [
    {
      "job_post_id": "uuid",
      "title": "Senior Full Stack Developer",
      "description": "Mô tả công việc...",
      "requirements": "Yêu cầu...",
      "location": "Hà Nội",
      "address": "Địa chỉ cụ thể...",
      "experience": "3-5 năm",
      "level": "Senior",
      "salary_range": "20-30 triệu",
      "gender": "any",
      "job_type": "full_time",
      "status": "active",
      "views_count": 150,
      "saves_count": 25,
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z",
      "expires_at": "2025-01-01T23:59:59Z",
      "deadline": "2024-12-31",
      "company": {
        "company_id": "uuid",
        "name": "Tech Company Ltd",
        "logo": "https://...",
        "location": "Hà Nội",
        "size": "100-500",
        "website": "https://example.com"
      },
      "category": {
        "category_id": "uuid",
        "name": "IT - Phần mềm"
      },
      "employer": {
        "employer_id": "uuid",
        "full_name": "Nguyễn Văn A"
      },
      "jobPostSkills": [
        {
          "skill": {
            "id": "uuid",
            "name": "JavaScript"
          }
        },
        {
          "skill": {
            "id": "uuid",
            "name": "React"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Ví dụ Requests

**1. Lấy tất cả job posts (không lọc):**
```
GET /jobseeker/job-posts?page=1&limit=10
```

**2. Tìm kiếm theo từ khóa và địa điểm:**
```
GET /jobseeker/job-posts?keyword=developer&location=Hà%20Nội&page=1&limit=10
```

**3. Lọc theo loại công việc và cấp độ:**
```
GET /jobseeker/job-posts?job_type=full_time&level=Senior&page=1&limit=10
```

**4. Lọc theo nhiều tiêu chí:**
```
GET /jobseeker/job-posts?keyword=react&location=Hà%20Nội&job_type=full_time&level=Middle&experience=2-3&sort_by=salary_range&sort_order=DESC
```

**5. Lọc theo kỹ năng:**
```
GET /jobseeker/job-posts?skills=JavaScript,TypeScript,React&page=1&limit=10
```

**6. Sắp xếp theo lượt xem:**
```
GET /jobseeker/job-posts?sort_by=views_count&sort_order=DESC&page=1&limit=10
```

---

### 2. Tìm Kiếm Job Posts

**GET** `/jobseeker/job-posts/search`

Endpoint chuyên dụng cho tìm kiếm với tất cả các bộ lọc tương tự như endpoint trên.

#### Query Parameters

Giống hệt với endpoint `/jobseeker/job-posts`

#### Response

```json
{
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "filters": {
      "keyword": "developer",
      "location": "Hà Nội",
      "job_type": "full_time",
      "category_id": null,
      "level": "Senior",
      "experience": null,
      "salary_range": null,
      "company_id": null,
      "skills": ["JavaScript", "React"],
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

---

### 3. Lấy Job Posts Nổi Bật

**GET** `/jobseeker/job-posts/featured`

Lấy các job posts nổi bật (có nhiều lượt xem và lưu).

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `page` | number | Không | Số trang (mặc định: 1) |
| `limit` | number | Không | Số lượng kết quả (mặc định: 10) |

#### Response

Giống như response của `/jobseeker/job-posts`

---

### 4. Lấy Job Posts Được Xem Nhiều Nhất

**GET** `/jobseeker/job-posts/most-viewed`

Lấy các job posts được xem nhiều nhất.

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `page` | number | Không | Số trang (mặc định: 1) |
| `limit` | number | Không | Số lượng kết quả (mặc định: 10) |

---

### 5. Lấy Job Posts Được Lưu Nhiều Nhất

**GET** `/jobseeker/job-posts/most-saved`

Lấy các job posts được lưu nhiều nhất.

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `page` | number | Không | Số trang (mặc định: 1) |
| `limit` | number | Không | Số lượng kết quả (mặc định: 10) |

---

### 6. Xem Chi Tiết Job Post

**GET** `/jobseeker/job-posts/:id`

Lấy thông tin chi tiết của một job post.

#### Path Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `id` | string | Có | UUID của job post |

#### Response Success (200 OK)

```json
{
  "data": {
    "job_post_id": "uuid",
    "title": "Senior Full Stack Developer",
    "description": "Mô tả chi tiết...",
    "requirements": "Yêu cầu chi tiết...",
    "location": "Hà Nội",
    "address": "Địa chỉ cụ thể...",
    "experience": "3-5 năm",
    "level": "Senior",
    "salary_range": "20-30 triệu",
    "gender": "any",
    "job_type": "full_time",
    "status": "active",
    "views_count": 151,
    "saves_count": 25,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "expires_at": "2025-01-01T23:59:59Z",
    "deadline": "2024-12-31",
    "company": { ... },
    "category": { ... },
    "employer": { ... },
    "skills": [
      {
        "id": "uuid",
        "name": "JavaScript"
      },
      {
        "id": "uuid",
        "name": "React"
      }
    ]
  }
}
```

**Note:** Mỗi lần gọi endpoint này, `views_count` sẽ tự động tăng thêm 1.

#### Response Error (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy tin tuyển dụng",
  "error": "Not Found"
}
```

---

### 7. Lấy Các Job Posts Liên Quan

**GET** `/jobseeker/job-posts/:id/related`

Lấy các job posts liên quan đến một job post cụ thể (cùng category hoặc công ty/địa điểm).

#### Path Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `id` | string | Có | UUID của job post |

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `limit` | number | Không | Số lượng kết quả (mặc định: 5) |

#### Response Success (200 OK)

```json
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ]
}
```

---

## Endpoints Yêu Cầu Authentication (Jobseeker)

### 8. Lưu Job Post

**POST** `/jobseeker/saved/save-job/:jobId`

Lưu một job post vào danh sách yêu thích.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Response Success (201 Created)

```json
{
  "message": "Lưu tin tuyển dụng thành công",
  "data": {
    "saved_job_id": "uuid",
    "job_seeker_id": "uuid",
    "job_post_id": "uuid",
    "saved_at": "2024-12-01T10:00:00Z"
  }
}
```

---

### 9. Bỏ Lưu Job Post

**DELETE** `/jobseeker/saved/unsave-job/:jobId`

Bỏ lưu một job post khỏi danh sách yêu thích.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Response Success (200 OK)

```json
{
  "message": "Bỏ lưu tin tuyển dụng thành công"
}
```

---

### 10. Xem Các Job Posts Đã Lưu

**GET** `/jobseeker/saved/jobs`

Lấy danh sách các job posts đã lưu.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `page` | number | Không | Số trang (mặc định: 1) |
| `limit` | number | Không | Số lượng kết quả (mặc định: 10) |

---

### 11. Kiểm Tra Đã Lưu Job Post Chưa

**GET** `/jobseeker/saved/check/:jobId`

Kiểm tra xem một job post đã được lưu chưa.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Response Success (200 OK)

```json
{
  "isSaved": true,
  "savedAt": "2024-12-01T10:00:00Z"
}
```

---

## Lưu Ý

1. **Tất cả endpoint public** (không cần authentication):
   - GET `/jobseeker/job-posts`
   - GET `/jobseeker/job-posts/search`
   - GET `/jobseeker/job-posts/featured`
   - GET `/jobseeker/job-posts/most-viewed`
   - GET `/jobseeker/job-posts/most-saved`
   - GET `/jobseeker/job-posts/:id`
   - GET `/jobseeker/job-posts/:id/related`

2. **Các endpoint yêu cầu authentication** (role: jobseeker):
   - POST `/jobseeker/saved/save-job/:jobId`
   - DELETE `/jobseeker/saved/unsave-job/:jobId`
   - GET `/jobseeker/saved/jobs`
   - GET `/jobseeker/saved/check/:jobId`

3. **Chỉ hiển thị job posts có status = 'active'**

4. **Kết quả luôn bao gồm thông tin công ty, category, và employer**

5. **Sắp xếp mặc định:** Theo thời gian tạo mới nhất (created_at DESC)

6. **Pagination:** Mặc định page=1, limit=10

7. **Skills filter:** Có thể truyền dạng query string: `?skills=skill1,skill2,skill3`

## Ví Dụ Frontend Integration

### Tìm kiếm job posts với React:

```javascript
const searchJobs = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.location) params.append('location', filters.location);
  if (filters.job_type) params.append('job_type', filters.job_type);
  if (filters.level) params.append('level', filters.level);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  if (filters.skills && filters.skills.length > 0) {
    params.append('skills', filters.skills.join(','));
  }
  
  const response = await fetch(
    `${API_BASE_URL}/jobseeker/job-posts?${params.toString()}`
  );
  
  return await response.json();
};

// Usage
const results = await searchJobs({
  keyword: 'React Developer',
  location: 'Hà Nội',
  job_type: 'full_time',
  level: 'Middle',
  skills: ['React', 'TypeScript', 'Node.js'],
  page: 1,
  limit: 10
});
```

## Testing với Postman

Import collection từ file `docs/posts.postman_collection.json` và thêm các request mới cho job posts filtering.
