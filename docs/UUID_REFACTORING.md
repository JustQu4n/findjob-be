# UUID Refactoring Documentation

## Tổng quan

Hệ thống đã được refactor để sử dụng UUID (Universally Unique Identifier) thay vì số nguyên tự động tăng (SERIAL/INTEGER) cho tất cả các khóa chính và khóa ngoại.

## Lý do sử dụng UUID

### Ưu điểm:
1. **Bảo mật tốt hơn**: UUID không thể đoán được, tránh việc enumeration attacks
2. **Phân tán tốt**: Có thể tạo UUID ở nhiều nơi mà không lo xung đột
3. **Tích hợp dễ dàng**: Dễ dàng merge dữ liệu từ nhiều nguồn khác nhau
4. **Scalability**: Phù hợp cho hệ thống phân tán và microservices
5. **Tránh lộ thông tin**: Không thể suy ra số lượng bản ghi từ ID

### Nhược điểm (đã cân nhắc):
1. **Kích thước lớn hơn**: UUID chiếm 16 bytes so với 4 bytes của INTEGER
2. **Performance**: Index UUID có thể chậm hơn INTEGER (nhưng PostgreSQL tối ưu tốt với UUID)
3. **Readable**: Khó đọc hơn số nguyên (nhưng không ảnh hưởng API)

## Các thay đổi chính

### 1. Entities

Tất cả các entity đã được cập nhật để sử dụng UUID:

#### User Entity
```typescript
@PrimaryGeneratedColumn('uuid')
user_id: string;
```

#### Admin Entity
```typescript
@PrimaryGeneratedColumn('uuid')
admin_id: string;

@Column({ type: 'uuid', unique: true })
user_id: string;
```

#### Employer Entity
```typescript
@PrimaryGeneratedColumn('uuid')
employer_id: string;

@Column({ type: 'uuid', unique: true })
user_id: string;

@Column({ type: 'uuid', nullable: true })
company_id: string;
```

#### JobSeeker Entity
```typescript
@PrimaryGeneratedColumn('uuid')
job_seeker_id: string;

@Column({ type: 'uuid', unique: true })
user_id: string;
```

#### Company Entity
```typescript
@PrimaryGeneratedColumn('uuid')
company_id: string;
```

#### JobPost Entity
```typescript
@PrimaryGeneratedColumn('uuid')
job_post_id: string;

@Column({ type: 'uuid' })
employer_id: string;

@Column({ type: 'uuid' })
company_id: string;
```

#### Application Entity
```typescript
@PrimaryGeneratedColumn('uuid')
application_id: string;

@Column({ type: 'uuid' })
job_post_id: string;

@Column({ type: 'uuid' })
job_seeker_id: string;
```

#### Role Entity
```typescript
@PrimaryGeneratedColumn('uuid')
role_id: string;
```

#### Permission Entity
```typescript
@PrimaryGeneratedColumn('uuid')
permission_id: string;
```

#### Junction Tables (UserRole, RolePermission)
```typescript
@PrimaryColumn({ type: 'uuid' })
user_id: string;

@PrimaryColumn({ type: 'uuid' })
role_id: string;
```

### 2. Services

Tất cả các method trong services đã được cập nhật để sử dụng `string` thay vì `number`:

#### AuthService
```typescript
async logout(userId: string) { ... }
```

#### JobPostService
```typescript
async create(userId: string, createJobPostDto: CreateJobPostDto) { ... }
async findAll(userId: string, query: QueryJobPostDto) { ... }
async findOne(userId: string, jobPostId: string) { ... }
async update(userId: string, jobPostId: string, updateJobPostDto: UpdateJobPostDto) { ... }
async remove(userId: string, jobPostId: string) { ... }
async getStatistics(userId: string) { ... }
```

#### EmployerManagementService
```typescript
async findOne(employerId: string) { ... }
async updateStatus(employerId: string, updateStatusDto: UpdateEmployerStatusDto) { ... }
async remove(employerId: string) { ... }
```

### 3. Controllers

Controllers đã được cập nhật để:
- Loại bỏ `ParseIntPipe` 
- Sử dụng `string` cho tất cả các tham số ID
- Sử dụng `@Param('id')` thay vì `@Param('id', ParseIntPipe)`

#### JobPostController
```typescript
@Get(':id')
findOne(
  @GetUser('user_id') userId: string,
  @Param('id') id: string,
) {
  return this.jobPostService.findOne(userId, id);
}
```

#### EmployerManagementController
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.employerManagementService.findOne(id);
}
```

### 4. Migration

File migration đã được tạo tự động: `1761451660239-ConvertToUUID.ts`

Migration này sẽ:
1. Drop tất cả foreign key constraints
2. Drop tất cả indexes
3. Chuyển đổi tất cả primary keys từ SERIAL/INTEGER sang UUID
4. Chuyển đổi tất cả foreign keys sang UUID
5. Tạo lại indexes
6. Tạo lại foreign key constraints

**⚠️ QUAN TRỌNG**: Migration này sẽ **XÓA TẤT CẢ DỮ LIỆU HIỆN TẠI** vì không thể chuyển đổi INTEGER sang UUID mà giữ nguyên dữ liệu.

## Hướng dẫn triển khai

### 1. Backup Database (BẮT BUỘC)
```bash
pg_dump -U postgres -d your_database > backup_before_uuid.sql
```

### 2. Chạy Migration
```bash
npm run typeorm migration:run -- -d data-source.ts
```

### 3. Seed lại dữ liệu
```bash
npm run seed
```

### 4. Kiểm tra
```bash
# Test authentication
curl -X POST http://localhost:3000/auth/register-employer \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "company_name": "Test Company"
  }'

# Verify UUIDs in response
```

## Breaking Changes

### API Response Format

**Trước:**
```json
{
  "user_id": 1,
  "employer_id": 1,
  "company_id": 1
}
```

**Sau:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "employer_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "company_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

### API Request Format

**Trước:**
```
GET /employer/job-posts/1
DELETE /admin/employers/5
```

**Sau:**
```
GET /employer/job-posts/550e8400-e29b-41d4-a716-446655440000
DELETE /admin/employers/6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

## Testing

### Unit Tests
Cập nhật tất cả unit tests để sử dụng UUID strings:

```typescript
// Trước
const mockUserId = 1;
const mockJobPostId = 1;

// Sau
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockJobPostId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
```

### Integration Tests
```typescript
describe('JobPost API', () => {
  it('should create job post and return UUID', async () => {
    const response = await request(app.getHttpServer())
      .post('/employer/job-posts')
      .send(createJobPostDto);
    
    expect(response.body.data.job_post_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
```

## Performance Considerations

### Indexing
PostgreSQL tối ưu tốt với UUID. Tất cả primary keys và foreign keys đã được index tự động.

### Query Optimization
```typescript
// ✅ Good - Sử dụng exact match
where: { user_id: '550e8400-e29b-41d4-a716-446655440000' }

// ❌ Bad - Tránh LIKE với UUID
where: { user_id: Like('%550e8400%') }
```

### Caching Strategy
UUID làm cache keys rất tốt vì đảm bảo tính duy nhất toàn cục:

```typescript
const cacheKey = `job_post:${jobPostId}`;
await redis.set(cacheKey, JSON.stringify(jobPost), 'EX', 3600);
```

## Rollback Plan

Nếu cần rollback, chạy migration down:

```bash
npm run typeorm migration:revert -- -d data-source.ts
```

**⚠️ CHÚ Ý**: Rollback cũng sẽ xóa dữ liệu. Phải restore từ backup.

## Best Practices

### 1. Validation
Luôn validate UUID format trong DTOs:

```typescript
import { IsUUID } from 'class-validator';

export class UpdateJobPostDto {
  @IsUUID('4', { message: 'ID không hợp lệ' })
  job_post_id: string;
}
```

### 2. Error Messages
Cập nhật error messages để phù hợp:

```typescript
// Trước
throw new NotFoundException(`Job post with ID ${id} not found`);

// Sau (giống vậy, nhưng id là UUID)
throw new NotFoundException(`Không tìm thấy tin tuyển dụng với ID ${id}`);
```

### 3. Logging
Log UUID đầy đủ để dễ debug:

```typescript
this.logger.log(`Creating job post for user ${userId}`);
// Output: Creating job post for user 550e8400-e29b-41d4-a716-446655440000
```

## Frontend Impact

### TypeScript Interfaces
```typescript
// Trước
interface User {
  user_id: number;
  email: string;
}

// Sau
interface User {
  user_id: string;
  email: string;
}
```

### API Calls
```typescript
// Trước
const response = await api.get(`/job-posts/${1}`);

// Sau
const response = await api.get(`/job-posts/${jobPostId}`);
// jobPostId = "550e8400-e29b-41d4-a716-446655440000"
```

## Monitoring

### Database Size
UUID sẽ làm tăng kích thước database. Monitor:

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Query Performance
Monitor slow queries với UUID:

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

## Support

Nếu gặp vấn đề sau khi migrate:

1. Check migration status: `npm run typeorm migration:show -- -d data-source.ts`
2. Verify entity definitions match database schema
3. Clear TypeORM cache: `rm -rf dist/`
4. Rebuild: `npm run build`

## Changelog

- **2025-10-26**: Refactor tất cả entities sang UUID
- **2025-10-26**: Cập nhật services và controllers
- **2025-10-26**: Tạo migration ConvertToUUID
- **2025-10-26**: Cập nhật documentation

## References

- [PostgreSQL UUID Documentation](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [TypeORM UUID Support](https://typeorm.io/entities#primary-columns)
- [UUID Best Practices](https://www.uuidtools.com/what-is-uuid)
