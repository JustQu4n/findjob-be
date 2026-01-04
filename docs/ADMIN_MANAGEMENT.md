# Admin Management System - Documentation

## Tổng Quan

Hệ thống quản trị admin hoàn chỉnh với các chức năng:
- ✅ Quản lý Users (Job Seekers & Employers)
- ✅ Quản lý Companies
- ✅ Quản lý Categories
- ✅ Quản lý Employers
- ✅ Dashboard & Statistics

## Cấu Trúc Module

```
src/modules/admin/
├── user-management/          # Quản lý tất cả users
├── company-management/        # Quản lý companies
├── employer-management/       # Quản lý employers (đã có sẵn)
├── category/                  # Quản lý categories (đã có sẵn)
├── dashboard/                 # Thống kê tổng quan
└── admin.module.ts           # Main admin module
```

---

## 1. User Management Module

### API Endpoints

#### Get All Users
```http
GET /admin/users?page=1&limit=10&search=john&status=ACTIVE&role=job_seeker
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Trang hiện tại
- `limit` (optional): Số lượng items mỗi trang
- `search` (optional): Tìm kiếm theo email hoặc full_name
- `status` (optional): Filter theo status (ACTIVE, INACTIVE, BANNED)
- `role` (optional): Filter theo role (job_seeker, employer, admin)

**Response:**
```json
{
  "data": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "ACTIVE",
      "created_at": "2026-01-01T00:00:00.000Z",
      "jobSeeker": {
        "job_seeker_id": "uuid",
        "bio": "Software developer"
      },
      "employer": null,
      "roles": [
        {
          "role_id": "uuid",
          "name": "user"
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get User Detail
```http
GET /admin/users/:userId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {
    "user_id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "status": "ACTIVE",
    "jobSeeker": {
      "job_seeker_id": "uuid",
      "applications": [...],
      "followedCompanies": [...],
      "savedJobs": [...]
    }
  },
  "statistics": {
    "role": "job_seeker",
    "total_applications": 15,
    "total_followed_companies": 5,
    "total_saved_jobs": 20
  }
}
```

#### Update User Status
```http
PATCH /admin/users/:userId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "BANNED"
}
```

**Status Values:**
- `ACTIVE`: Tài khoản hoạt động bình thường
- `INACTIVE`: Tài khoản tạm ngưng
- `BANNED`: Tài khoản bị cấm

#### Delete User
```http
DELETE /admin/users/:userId
Authorization: Bearer <admin_token>
```

**Note:** Sử dụng soft delete, không xóa vĩnh viễn khỏi database.

#### Get User Statistics
```http
GET /admin/users/statistics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "total_users": 1000,
  "active_users": 850,
  "inactive_users": 100,
  "banned_users": 50,
  "total_job_seekers": 700,
  "total_employers": 300,
  "recent_users_30_days": 150,
  "user_status_breakdown": {
    "active": 850,
    "inactive": 100,
    "banned": 50
  },
  "user_type_breakdown": {
    "job_seekers": 700,
    "employers": 300
  }
}
```

---

## 2. Company Management Module

### API Endpoints

#### Create Company
```http
POST /admin/companies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "FPT Software",
  "industry": "Information Technology",
  "description": "Leading software company",
  "location": "Hà Nội",
  "address": "123 Cau Giay",
  "employee_count": 5000,
  "website": "https://fpt-software.com",
  "logo_url": "https://...",
  "overview": "Company overview...",
  "benefits": "Great benefits...",
  "vision": "Our vision...",
  "mission": "Our mission..."
}
```

#### Get All Companies
```http
GET /admin/companies?page=1&limit=10&search=FPT&industry=IT&location=Hanoi
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Tìm kiếm theo tên công ty
- `industry`: Filter theo ngành nghề
- `location`: Filter theo địa điểm

#### Get Company Detail
```http
GET /admin/companies/:companyId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {
    "company_id": "uuid",
    "name": "FPT Software",
    "industry": "IT",
    "employers": [...],
    "jobPosts": [...]
  },
  "statistics": {
    "total_job_posts": 50,
    "active_job_posts": 35,
    "total_followers": 1200,
    "total_employers": 25
  }
}
```

#### Update Company
```http
PATCH /admin/companies/:companyId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Company
```http
DELETE /admin/companies/:companyId
Authorization: Bearer <admin_token>
```

**Note:** Không thể xóa công ty có job posts đang active.

#### Get Company Statistics
```http
GET /admin/companies/statistics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "total_companies": 500,
  "recent_companies_30_days": 25,
  "companies_by_industry": [
    {
      "industry": "Information Technology",
      "count": 150
    },
    {
      "industry": "Finance",
      "count": 100
    }
  ],
  "top_companies_by_followers": [...],
  "top_companies_by_job_posts": [...]
}
```

---

## 3. Dashboard Module

### API Endpoints

#### Get Overview Statistics
```http
GET /admin/dashboard/overview?start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc

**Response:**
```json
{
  "users": {
    "total": 1000,
    "active": 850,
    "job_seekers": 700,
    "employers": 300
  },
  "companies": {
    "total": 500
  },
  "job_posts": {
    "total": 2500,
    "active": 1800
  },
  "applications": {
    "total": 15000,
    "pending": 3000,
    "accepted": 5000
  },
  "categories": {
    "total": 25
  },
  "social": {
    "total_posts": 500
  },
  "notifications": {
    "total": 50000
  }
}
```

#### Get Growth Statistics
```http
GET /admin/dashboard/growth
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "users": {
    "this_month": 150,
    "last_month": 120,
    "growth_rate": 25.0
  },
  "job_posts": {
    "this_month": 250,
    "last_month": 200,
    "growth_rate": 25.0
  },
  "applications": {
    "this_month": 1500,
    "last_month": 1200,
    "growth_rate": 25.0
  }
}
```

#### Get Top Categories
```http
GET /admin/dashboard/top-categories?limit=10
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "category_id": "uuid",
    "name": "Software Development",
    "slug": "software-development",
    "job_posts_count": 500
  },
  {
    "category_id": "uuid",
    "name": "Marketing",
    "slug": "marketing",
    "job_posts_count": 300
  }
]
```

#### Get Top Companies
```http
GET /admin/dashboard/top-companies?limit=10
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "by_followers": [
    {
      "company_id": "uuid",
      "name": "FPT Software",
      "logo_url": "https://...",
      "followers_count": 5000
    }
  ],
  "by_job_posts": [
    {
      "company_id": "uuid",
      "name": "Viettel",
      "logo_url": "https://...",
      "job_posts_count": 150
    }
  ]
}
```

#### Get Application Status Breakdown
```http
GET /admin/dashboard/application-status
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "status": "PENDING",
    "count": 3000
  },
  {
    "status": "ACCEPTED",
    "count": 5000
  },
  {
    "status": "REJECTED",
    "count": 7000
  }
]
```

#### Get Recent Activities
```http
GET /admin/dashboard/recent-activities?limit=20
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "recent_users": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "created_at": "2026-01-03T10:00:00.000Z"
    }
  ],
  "recent_job_posts": [...],
  "recent_applications": [...],
  "recent_companies": [...]
}
```

#### Get Chart Data - Users
```http
GET /admin/dashboard/charts/users?days=30
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "date": "2026-01-01",
    "count": 15
  },
  {
    "date": "2026-01-02",
    "count": 20
  }
]
```

#### Get Chart Data - Job Posts
```http
GET /admin/dashboard/charts/job-posts?days=30
Authorization: Bearer <admin_token>
```

#### Get Chart Data - Applications
```http
GET /admin/dashboard/charts/applications?days=30
Authorization: Bearer <admin_token>
```

---

## 4. Employer Management Module (Existing)

### API Endpoints

#### Get All Employers
```http
GET /admin/employers?page=1&limit=10&search=john&status=ACTIVE&company_name=FPT
Authorization: Bearer <admin_token>
```

#### Get Employer Detail
```http
GET /admin/employers/:employerId
Authorization: Bearer <admin_token>
```

#### Update Employer Status
```http
PATCH /admin/employers/:employerId/status
Authorization: Bearer <admin_token>

{
  "status": "ACTIVE"
}
```

#### Delete Employer
```http
DELETE /admin/employers/:employerId
Authorization: Bearer <admin_token>
```

---

## 5. Category Module (Existing)

### API Endpoints

#### Create Category
```http
POST /admin/categories
Authorization: Bearer <admin_token>

{
  "name": "Software Development",
  "slug": "software-development",
  "description": "..."
}
```

#### Get All Categories
```http
GET /admin/categories
Authorization: Bearer <admin_token>
```

#### Get Category Detail
```http
GET /admin/categories/:categoryId
Authorization: Bearer <admin_token>
```

#### Update Category
```http
PATCH /admin/categories/:categoryId
Authorization: Bearer <admin_token>

{
  "name": "Updated Name"
}
```

#### Delete Category
```http
DELETE /admin/categories/:categoryId
Authorization: Bearer <admin_token>
```
