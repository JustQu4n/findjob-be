# Admin Access Troubleshooting Guide

## Vấn đề: 403 Forbidden khi truy cập admin endpoints

### Các nguyên nhân có thể:

1. **User không có role admin trong database**
2. **Token không hợp lệ hoặc expired**
3. **User chưa verify email**
4. **User status không phải ACTIVE**

## Cách kiểm tra

### 1. Kiểm tra user có role admin chưa

```sql
-- Kiểm tra user
SELECT u.user_id, u.email, u.full_name, u.is_email_verified, u.status
FROM users u
WHERE u.email = 'admin@example.com';

-- Kiểm tra roles của user
SELECT u.email, r.role_name
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@example.com';

-- Kiểm tra admin profile
SELECT u.email, a.admin_id, a.department, a.position
FROM users u
LEFT JOIN admins a ON u.user_id = a.user_id
WHERE u.email = 'admin@example.com';
```

### 2. Kiểm tra roles có trong database chưa

```sql
-- Xem tất cả roles
SELECT * FROM roles;

-- Nếu chưa có, insert roles
INSERT INTO roles (role_id, role_name, description) VALUES
  (gen_random_uuid(), 'admin', 'Administrator'),
  (gen_random_uuid(), 'employer', 'Employer/Recruiter'),
  (gen_random_uuid(), 'jobseeker', 'Job Seeker')
ON CONFLICT (role_name) DO NOTHING;
```

### 3. Thêm role admin cho user

```sql
-- Lấy user_id và admin role_id
WITH user_data AS (
  SELECT user_id FROM users WHERE email = 'admin@example.com'
),
admin_role AS (
  SELECT role_id FROM roles WHERE role_name = 'admin'
)
INSERT INTO user_roles (user_id, role_id)
SELECT user_data.user_id, admin_role.role_id
FROM user_data, admin_role
ON CONFLICT DO NOTHING;
```

### 4. Verify email nếu chưa

```sql
UPDATE users 
SET is_email_verified = true, 
    status = 'ACTIVE'
WHERE email = 'admin@example.com';
```

## Test với curl

### 1. Register admin
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "System Admin",
    "email": "admin@test.com",
    "password": "Admin@123456",
    "department": "IT",
    "position": "System Administrator"
  }'
```

### 2. Verify email (manual)
```sql
UPDATE users 
SET is_email_verified = true 
WHERE email = 'admin@test.com';
```

### 3. Login và lưu token
```bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123456"
  }')

echo $RESPONSE | jq .

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Token: $TOKEN"
```

### 4. Test admin endpoint
```bash
curl -X GET http://localhost:3000/admin/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"
```

## Debug: Decode JWT Token

Để xem nội dung token:
```bash
# Copy token và paste vào jwt.io
# Hoặc dùng command line
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .
```

Kết quả phải có:
```json
{
  "sub": "user-uuid",
  "email": "admin@test.com",
  "roles": ["admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Common Issues

### Issue 1: "Bạn không có quyền truy cập chức năng này"
**Nguyên nhân:** User không có role admin

**Giải quyết:**
```sql
-- Check current roles
SELECT u.email, r.role_name
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'your_email@example.com';

-- Add admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'your_email@example.com' 
  AND r.role_name = 'admin'
ON CONFLICT DO NOTHING;
```

### Issue 2: "Email chưa được xác thực"
**Giải quyết:**
```sql
UPDATE users 
SET is_email_verified = true 
WHERE email = 'your_email@example.com';
```

### Issue 3: "Tài khoản đã bị khóa"
**Giải quyết:**
```sql
UPDATE users 
SET status = 'ACTIVE' 
WHERE email = 'your_email@example.com';
```

### Issue 4: Token expired
**Giải quyết:** Login lại để lấy token mới
```bash
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin@123456"}'
```

## Quick Fix: Create Admin User Manually

```sql
-- 1. Create admin user
INSERT INTO users (user_id, email, password_hash, full_name, status, is_email_verified)
VALUES (
  gen_random_uuid(),
  'superadmin@system.com',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash 'Admin@123456'
  'Super Administrator',
  'ACTIVE',
  true
);

-- 2. Get user_id
SELECT user_id FROM users WHERE email = 'superadmin@system.com';

-- 3. Create admin profile
INSERT INTO admins (admin_id, user_id, department, position)
VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_FROM_STEP_2',
  'IT',
  'System Administrator'
);

-- 4. Assign admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'superadmin@system.com' 
  AND r.role_name = 'admin';
```

## PowerShell Testing Script

```powershell
# Test admin access
$baseUrl = "http://localhost:3000"

# 1. Login
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/admin/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"Admin@123456"}'

if ($loginResponse.success) {
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.accessToken
    
    # 2. Test dashboard
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $dashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard/overview" `
          -Method GET `
          -Headers $headers
        
        Write-Host "✓ Dashboard access successful" -ForegroundColor Green
        $dashboard | ConvertTo-Json -Depth 5
    }
    catch {
        Write-Host "✗ Dashboard access failed" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}
else {
    Write-Host "✗ Login failed" -ForegroundColor Red
}
```

## Verify RolesGuard is Working

Thêm logging vào RolesGuard để debug:

```typescript
// src/common/guards/roles.guard.ts
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  console.log('Required roles:', requiredRoles);

  if (!requiredRoles) {
    return true;
  }

  const { user } = context.switchToHttp().getRequest();
  
  console.log('User:', user?.email);
  console.log('User roles:', user?.roles?.map(r => r.role_name));
  
  if (!user || !user.roles) {
    throw new ForbiddenException('Bạn không có quyền truy cập');
  }

  const hasRole = requiredRoles.some((role) =>
    user.roles.some((userRole) => userRole.role_name === role),
  );
  
  console.log('Has required role:', hasRole);

  if (!hasRole) {
    throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
  }

  return true;
}
```

Sau đó xem logs khi gọi API để biết chính xác vấn đề ở đâu.

## Summary

Để truy cập admin endpoints, user cần:
1. ✅ Email verified: `is_email_verified = true`
2. ✅ Status: `status = 'ACTIVE'`
3. ✅ Role: Có role 'admin' trong bảng user_roles
4. ✅ Valid token: Login để lấy access token
5. ✅ Admin profile: Có record trong bảng admins (optional but recommended)

Nếu vẫn lỗi 403, check logs và verify từng bước ở trên!
