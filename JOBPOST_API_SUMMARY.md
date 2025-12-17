# API Job Posts - Quick Reference

## Endpoint Chính

### GET `/jobseeker/job-posts` (Public)
Lấy danh sách job posts với đầy đủ bộ lọc

**Các bộ lọc có sẵn:**
- ✅ `keyword` - Tìm kiếm trong title, description, requirements, company name
- ✅ `location` - Lọc theo địa điểm
- ✅ `job_type` - full_time | part_time | contract | internship
- ✅ `category_id` - UUID của category
- ✅ `level` - Intern | Junior | Middle | Senior | Lead | Manager | All
- ✅ `experience` - Tìm kiếm gần đúng kinh nghiệm
- ✅ `salary_range` - Tìm kiếm gần đúng mức lương
- ✅ `company_id` - UUID của công ty
- ✅ `skills` - Mảng kỹ năng (dạng: skills=JS,React,Node)
- ✅ `sort_by` - created_at | views_count | saves_count | title | salary_range
- ✅ `sort_order` - ASC | DESC
- ✅ `page` - Số trang (default: 1)
- ✅ `limit` - Số items/trang (default: 10)

**Ví dụ:**
```
GET /jobseeker/job-posts?keyword=developer&location=Hà%20Nội&job_type=full_time&level=Senior&skills=React,TypeScript&sort_by=salary_range&sort_order=DESC&page=1&limit=10
```

## Các Endpoints Khác

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/jobseeker/job-posts` | GET | Public | Lấy tất cả jobs với filter |
| `/jobseeker/job-posts/search` | GET | Public | Tìm kiếm jobs (giống endpoint trên) |
| `/jobseeker/job-posts/featured` | GET | Public | Jobs nổi bật |
| `/jobseeker/job-posts/most-viewed` | GET | Public | Jobs xem nhiều nhất |
| `/jobseeker/job-posts/most-saved` | GET | Public | Jobs lưu nhiều nhất |
| `/jobseeker/job-posts/:id` | GET | Public | Chi tiết job (auto tăng view) |
| `/jobseeker/job-posts/:id/related` | GET | Public | Jobs liên quan |
| `/jobseeker/saved/save-job/:jobId` | POST | Jobseeker | Lưu job |
| `/jobseeker/saved/unsave-job/:jobId` | DELETE | Jobseeker | Bỏ lưu job |
| `/jobseeker/saved/jobs` | GET | Jobseeker | Xem jobs đã lưu |
| `/jobseeker/saved/check/:jobId` | GET | Jobseeker | Check đã lưu chưa |

## Files Đã Được Cập Nhật

✅ [search-job-post.dto.ts](src/modules/users/job-posts/dto/search-job-post.dto.ts) - DTO với đầy đủ filters
✅ [job-posts.service.ts](src/modules/users/job-posts/job-posts.service.ts) - Service với logic filtering
✅ [job-posts.controller.ts](src/modules/users/job-posts/job-posts.controller.ts) - Controller đã cập nhật

## Tài Liệu Chi Tiết

Xem file [JOBPOST_PUBLIC_API.md](docs/JOBPOST_PUBLIC_API.md) để biết thêm chi tiết về:
- Request/Response examples
- Error handling
- Frontend integration examples
- Postman testing
