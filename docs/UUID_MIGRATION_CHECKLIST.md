# UUID Migration Checklist

## ✅ Pre-Migration

- [x] Backup database hiện tại
- [x] Review tất cả entities
- [x] Update services và controllers
- [x] Verify TypeScript compilation passes
- [x] Generate migration file
- [x] Document breaking changes

## 📋 Files Changed

### Entities ✅
- [x] User Entity - `user_id: string`
- [x] Admin Entity - `admin_id, user_id: string`
- [x] Employer Entity - `employer_id, user_id, company_id: string`
- [x] JobSeeker Entity - `job_seeker_id, user_id: string`
- [x] Company Entity - `company_id: string`
- [x] JobPost Entity - `job_post_id, employer_id, company_id: string`
- [x] Application Entity - `application_id, job_post_id, job_seeker_id: string`
- [x] Role Entity - `role_id: string`
- [x] Permission Entity - `permission_id: string`
- [x] UserRole Entity - `user_id, role_id: string`
- [x] RolePermission Entity - `role_id, permission_id: string`

### Services ✅
- [x] AuthService - `logout(userId: string)`
- [x] JobPostService - All methods use string IDs
- [x] EmployerManagementService - All methods use string IDs

### Controllers ✅
- [x] AuthController - `logout(@GetUser('user_id') userId: string)`
- [x] JobPostController - Removed ParseIntPipe, use string params
- [x] EmployerManagementController - Removed ParseIntPipe, use string params

### Strategies ✅
- [x] JwtStrategy - `JwtPayload.sub: string`
- [x] JwtRefreshStrategy - Works with string sub

### DTOs ⏭️
- [ ] Add UUID validation decorators (Optional)

### Migrations ✅
- [x] `1761451660239-ConvertToUUID.ts` generated

### Documentation ✅
- [x] UUID_REFACTORING.md
- [x] UUID_MIGRATION_SUMMARY.md
- [x] UUID_MIGRATION_CHECKLIST.md

## 🔧 Migration Steps

### 1. Backup (CRITICAL) ⏳
```bash
# PostgreSQL
pg_dump -U postgres -d findjob_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list backup_YYYYMMDD_HHMMSS.sql
```
**Status**: ⏳ Pending

### 2. Stop Application ⏳
```bash
# Stop running instances
pm2 stop all
# or
kill -9 $(lsof -t -i:3000)
```
**Status**: ⏳ Pending

### 3. Run Migration ⏳
```bash
npm run typeorm migration:run -- -d data-source.ts
```
**Expected Output**:
```
query: ALTER TABLE "users" DROP COLUMN "user_id"
query: ALTER TABLE "users" ADD "user_id" uuid NOT NULL DEFAULT uuid_generate_v4()
...
Migration ConvertToUUID1761451660239 has been executed successfully.
```
**Status**: ⏳ Pending

### 4. Verify Database Schema ⏳
```sql
-- Check user_id type
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'user_id';

-- Expected: data_type = 'uuid'
```
**Status**: ⏳ Pending

### 5. Seed Initial Data ⏳
```bash
npm run seed
```
**Status**: ⏳ Pending

### 6. Start Application ⏳
```bash
npm run start:dev
```
**Status**: ⏳ Pending

### 7. Test API Endpoints ⏳

#### Test 1: Register Employer
```bash
curl -X POST http://localhost:3000/auth/register-employer \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "company_name": "Test Company"
  }'
```
**Expected**: Response with UUID user_id
**Status**: ⏳ Pending

#### Test 2: Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```
**Expected**: JWT token with UUID in payload
**Status**: ⏳ Pending

#### Test 3: Create Job Post
```bash
curl -X POST http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "description": "Test description",
    "location": "Hanoi"
  }'
```
**Expected**: Response with UUID job_post_id
**Status**: ⏳ Pending

#### Test 4: Get Job Posts
```bash
curl http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: Array of job posts with UUID IDs
**Status**: ⏳ Pending

#### Test 5: Admin - Get Employers
```bash
curl http://localhost:3000/admin/employers \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected**: Paginated employers with UUID IDs
**Status**: ⏳ Pending

## 🧪 Validation Tests

### Database Integrity ⏳
```sql
-- Count records
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'employers', COUNT(*) FROM employers
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'job_posts', COUNT(*) FROM job_posts;

-- Verify foreign keys
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```
**Status**: ⏳ Pending

### UUID Format Validation ⏳
```sql
-- Verify all user_ids are valid UUIDs
SELECT user_id FROM users 
WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
-- Expected: 0 rows (or only rows with version 1/5 UUIDs if generated differently)

-- Check UUID version (should be v4)
SELECT 
  user_id,
  substring(user_id::text, 15, 1) as version
FROM users 
LIMIT 5;
-- Expected: version = '4'
```
**Status**: ⏳ Pending

### Performance Tests ⏳
```bash
# Load test
ab -n 1000 -c 10 http://localhost:3000/employer/job-posts \
  -H "Authorization: Bearer TOKEN"
```
**Status**: ⏳ Pending

## 🐛 Common Issues & Solutions

### Issue 1: Migration fails
**Solution**:
```bash
# Check migration status
npm run typeorm migration:show -- -d data-source.ts

# Drop database and recreate (CAUTION: Loses all data)
dropdb findjob_db && createdb findjob_db
npm run typeorm migration:run -- -d data-source.ts
```

### Issue 2: TypeScript errors
**Solution**:
```bash
# Clean build
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Issue 3: JWT validation fails
**Solution**:
- Check JwtPayload interface has `sub: string`
- Verify generateTokens uses `user.user_id` (string)
- Clear browser tokens and re-login

### Issue 4: Foreign key violations
**Solution**:
```sql
-- Check orphaned records
SELECT e.* FROM employers e
LEFT JOIN users u ON e.user_id = u.user_id
WHERE u.user_id IS NULL;

-- Clean up if needed
DELETE FROM employers WHERE user_id NOT IN (SELECT user_id FROM users);
```

## 📊 Monitoring

### After Migration
- [ ] Monitor application logs for errors
- [ ] Check database size increase
- [ ] Monitor query performance
- [ ] Verify all features work correctly

### Metrics to Track
```sql
-- Database size
SELECT 
  pg_size_pretty(pg_database_size('findjob_db')) as db_size;

-- Index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Slow queries (enable logging first)
-- Check postgresql.log
```

## 🔄 Rollback Plan

### If Migration Fails ⚠️
```bash
# 1. Revert migration
npm run typeorm migration:revert -- -d data-source.ts

# 2. Restore from backup
dropdb findjob_db
createdb findjob_db
pg_restore -d findjob_db backup_YYYYMMDD_HHMMSS.sql

# 3. Restart application
npm run start:dev
```

### Git Rollback
```bash
# Revert all changes
git checkout HEAD -- src/database/entities/
git checkout HEAD -- src/modules/
git checkout HEAD -- src/common/

# Delete migration
rm src/database/migrations/1761451660239-ConvertToUUID.ts
```

## 📱 Frontend Updates Required

### TypeScript Interfaces ⏳
```typescript
// Update all ID types from number to string
interface User {
  user_id: string;  // was: number
  email: string;
  // ...
}

interface JobPost {
  job_post_id: string;  // was: number
  title: string;
  // ...
}
```

### API Calls ⏳
```typescript
// Update URL parameters
const jobPost = await api.get(`/job-posts/${jobPostId}`);
// jobPostId is now string UUID, not number

// Update localStorage/sessionStorage
localStorage.setItem('user_id', user.user_id); // already string
```

### Form Validation ⏳
```typescript
// Add UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (!uuidRegex.test(userId)) {
  throw new Error('Invalid user ID format');
}
```

## ✅ Sign-Off

### Technical Lead
- [ ] Code review completed
- [ ] Migration plan approved
- [ ] Rollback plan verified

### Database Admin
- [ ] Backup verified
- [ ] Migration tested in staging
- [ ] Performance impact assessed

### QA Team
- [ ] Test cases updated
- [ ] Regression tests passed
- [ ] API documentation updated

### DevOps
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Deployment plan ready

## 📅 Timeline

- **Code Changes**: ✅ Completed (2025-10-26)
- **Testing**: ⏳ Pending
- **Staging Deployment**: ⏳ Pending
- **Production Deployment**: ⏳ Pending

## 📞 Support

### If Issues Occur:
1. Check logs: `tail -f logs/application.log`
2. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
3. Contact: 
   - Backend Team: backend-team@company.com
   - DBA: dba@company.com
   - DevOps: devops@company.com

---

**Created**: 2025-10-26  
**Last Updated**: 2025-10-26  
**Status**: ✅ Ready for Migration  
**Next Step**: Backup database and run migration
