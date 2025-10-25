# Job Post Module - Employer

## 📋 Tổng quan

Module quản lý tin tuyển dụng (Job Posts) cho Employer. Module này được tách riêng để dễ dàng bảo trì và mở rộng.

## 🏗️ Cấu trúc

```
src/modules/employer/job-post/
├── dto/
│   ├── create-job-post.dto.ts    # DTO cho tạo job post
│   ├── update-job-post.dto.ts    # DTO cho cập nhật job post
│   ├── query-job-post.dto.ts     # DTO cho query parameters
│   └── index.ts                   # Export DTOs
├── job-post.controller.ts         # Controller xử lý HTTP requests
├── job-post.service.ts            # Business logic
└── job-post.module.ts             # Module configuration
```

## 🎯 Tính năng

### CRUD Operations
- ✅ **Create**: Tạo tin tuyển dụng mới
- ✅ **Read**: Xem danh sách và chi tiết tin tuyển dụng
- ✅ **Update**: Cập nhật thông tin tin tuyển dụng
- ✅ **Delete**: Xóa tin tuyển dụng

### Advanced Features
- ✅ **Pagination** - Phân trang kết quả
- ✅ **Statistics** - Thống kê tin tuyển dụng
- ✅ **Authorization** - Employer chỉ quản lý tin của mình
- ✅ **Validation** - Validate tất cả input

~~Đã loại bỏ các tính năng filter (search, employment_type, location) để đơn giản hóa API~~

## 🔐 Security

### Authentication & Authorization
- **JWT Authentication**: Yêu cầu valid access token
- **Role-based Access Control**: Chỉ role `employer` được phép truy cập
- **Ownership Check**: Employer chỉ xem/sửa/xóa tin của mình

### Guards
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employer')
```

## 📊 Database Schema

### JobPost Entity
```typescript
{
  job_post_id: number (PK)
  employer_id: number (FK)
  company_id: number (FK)
  title: string
  description: text
  requirements: text
  salary_range: string
  location: string
  employment_type: enum
  deadline: date
  created_at: timestamp
}
```

### Relationships
- `JobPost` → `Employer` (Many-to-One)
- `JobPost` → `Company` (Many-to-One)
- `JobPost` → `Application` (One-to-Many)

## 🔄 Business Logic

### Create Job Post
1. Validate user là employer
2. Check employer có company hay chưa
3. Auto-assign employer_id và company_id
4. Validate input data
5. Create job post
6. Return created job post với relations

### Get Job Posts
1. Validate user là employer
2. Build query chỉ lấy job posts của employer
3. Apply pagination
4. Order by created_at DESC
5. Return data với pagination info

### Update Job Post
1. Validate ownership
2. Update fields
3. Return updated job post

### Delete Job Post
1. Validate ownership
2. Soft/Hard delete
3. Return success message

### Statistics
1. Count total posts
2. Count active posts (deadline >= now)
3. Count expired posts
4. Group by employment_type

## 📝 DTOs

### CreateJobPostDto
```typescript
{
  title: string (required, max 150)
  description?: string
  requirements?: string
  salary_range?: string (max 50)
  location?: string (max 255)
  employment_type?: enum
  deadline?: date string
}
```

### UpdateJobPostDto
```typescript
{
  // All fields optional
  title?: string
  description?: string
  requirements?: string
  salary_range?: string
  location?: string
  employment_type?: enum
  deadline?: date string
}
```

### QueryJobPostDto
```typescript
{
  // Extends PaginationDto - chỉ có pagination, không có filter
  page?: number (default 1, min 1)
  limit?: number (default 10, min 1, max 100)
}
```

## 🚀 Usage

### Import Module
```typescript
// employer.module.ts
import { JobPostModule } from './job-post/job-post.module';

@Module({
  imports: [JobPostModule],
  ...
})
export class EmployerModule {}
```

### Use Service
```typescript
constructor(
  private readonly jobPostService: JobPostService
) {}

async createJobPost(userId: number, dto: CreateJobPostDto) {
  return this.jobPostService.create(userId, dto);
}
```

## 🧪 Testing

Xem chi tiết trong [EMPLOYER_JOBPOST_TESTING.md](../../docs/EMPLOYER_JOBPOST_TESTING.md)

### Unit Tests (TODO)
- Service methods
- DTO validation
- Business logic

### Integration Tests (TODO)
- API endpoints
- Database operations
- Authorization

### E2E Tests (TODO)
- Complete workflows
- Error scenarios

### Performance

### Optimization
- ✅ **Eager Loading**: Load relations khi cần
- ✅ **Query Builder**: Sử dụng query builder cho complex queries
- ✅ **Pagination**: Limit số lượng kết quả (max 100 items/page)
- ✅ **Indexing**: Index trên employer_id, company_id (database level)
- ✅ **Helper Functions**: Sử dụng pagination helpers để DRY

### Caching (TODO)
- Cache danh sách job posts
- Cache statistics
- Invalidate on create/update/delete

## 🔧 Maintenance

### Code Quality
- ✅ Clean code structure
- ✅ Separation of concerns
- ✅ SOLID principles
- ✅ Type safety (TypeScript)
- ✅ Error handling
- ✅ Validation

### Documentation
- ✅ API documentation
- ✅ Code comments
- ✅ Testing guide
- ✅ README

## 🛣️ Roadmap

### Phase 1 (Completed) ✅
- [x] CRUD operations
- [x] Search & Filter
- [x] Pagination
- [x] Statistics
- [x] Authorization

### Phase 2 (TODO)
- [ ] Upload images for job posts
- [ ] Rich text editor support
- [ ] Auto-close expired posts
- [ ] Email notifications

### Phase 3 (TODO)
- [ ] Analytics dashboard
- [ ] Job post templates
- [ ] Bulk operations
- [ ] Export to PDF/Excel

### Phase 4 (TODO)
- [ ] AI-powered job description suggestions
- [ ] SEO optimization
- [ ] Social media integration
- [ ] Multi-language support

## 🐛 Known Issues

None

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.

## 📄 License

Private - Internal use only
