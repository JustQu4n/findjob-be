# Admin Login - Documentation

## Tổng Quan

Đã implement endpoint đăng nhập riêng cho admin với các features:
- ✅ Xác thực email/password
- ✅ Kiểm tra role admin
- ✅ Kiểm tra email verification
- ✅ Kiểm tra account status
- ✅ Trả về JWT tokens (access + refresh)
- ✅ Trả về thông tin admin profile

## API Endpoint

### Admin Login

```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Request Body:**
- `email` (required): Email của admin
- `password` (required): Mật khẩu

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập quản trị thành công",
  "user": {
    "user_id": "uuid",
    "email": "admin@example.com",
    "full_name": "Admin Name",
    "phone": "0123456789",
    "avatar_url": "https://...",
    "roles": ["admin"],
    "admin": {
      "admin_id": "uuid",
      "department": "IT",
      "position": "System Administrator",
      "permissions": "{...}"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

#### 401 Unauthorized - Wrong Credentials
```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không đúng"
}
```

#### 401 Unauthorized - Not Admin
```json
{
  "statusCode": 401,
  "message": "Bạn không có quyền truy cập trang quản trị"
}
```

#### 401 Unauthorized - Email Not Verified
```json
{
  "statusCode": 401,
  "message": "Vui lòng xác thực email trước khi đăng nhập"
}
```

#### 401 Unauthorized - Account Locked
```json
{
  "statusCode": 401,
  "message": "Tài khoản đã bị khóa"
}
```

## Sự Khác Biệt với Login Thông Thường

### Endpoint `/auth/login` (Regular Login)
- Cho phép job seeker và employer đăng nhập
- Không kiểm tra role admin
- Trả về data phù hợp với từng role (jobSeeker/employer)

### Endpoint `/auth/admin/login` (Admin Login)
- ✅ **Chỉ cho phép user có role admin**
- ✅ Kiểm tra role trước khi cho phép login
- ✅ Trả về admin-specific data
- ✅ Message rõ ràng nếu không phải admin

## Validation Rules

### Email
- Required: ✅
- Format: Valid email
- Message: "Email không được để trống", "Email không hợp lệ"

### Password
- Required: ✅
- Type: String
- Message: "Mật khẩu không được để trống"

## Security Features

### 1. Password Hashing
- Sử dụng bcrypt để hash password
- Salt rounds: 10

### 2. JWT Tokens
- **Access Token**: Expires in 15 minutes (configurable)
- **Refresh Token**: Expires in 7 days (configurable)
- Refresh token được hash và lưu trong database

### 3. Role Verification
```typescript
const hasAdminRole = user.roles.some(role => role.role_name === RoleName.ADMIN);
if (!hasAdminRole) {
  throw new UnauthorizedException('Bạn không có quyền truy cập trang quản trị');
}
```

### 4. Account Status Check
- Chỉ cho phép account với status = `ACTIVE`
- Reject nếu status = `INACTIVE` hoặc `BANNED`

### 5. Email Verification
- User phải verify email trước khi login
- Check `is_email_verified` = true

## Cách Tạo Admin Account

### 1. Register Admin
```http
POST /auth/register-admin
Content-Type: application/json

{
  "full_name": "Admin Name",
  "email": "admin@example.com",
  "password": "securepassword123",
  "department": "IT",
  "position": "System Administrator"
}
```

### 2. Verify Email
Sau khi register, check email và click vào link verification:
```
GET /auth/verify-email?token=<verification_token>
```

### 3. Login
Sau khi verify email thành công:
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

## Frontend Integration

### React Example

```typescript
import axios from 'axios';

const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/auth/admin/login',
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Save tokens
    localStorage.setItem('admin_access_token', response.data.accessToken);
    localStorage.setItem('admin_refresh_token', response.data.refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message);
    }
    throw new Error('Đăng nhập thất bại');
  }
};

// Usage in component
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const data = await adminLogin(email, password);
    
    if (data.success) {
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    }
  } catch (error: any) {
    setError(error.message);
  }
};
```

### Vue Example

```typescript
import axios from 'axios';

export const useAdminAuth = () => {
  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/auth/admin/login', {
      email,
      password
    });

    if (data.success) {
      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_refresh', data.refreshToken);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
  };

  return { login, logout };
};
```

### Angular Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, {
      email,
      password
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem('admin_token', response.accessToken);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
        }
      })
    );
  }
}
```

## Using Access Token

Sau khi login thành công, sử dụng access token cho các request tiếp theo:

```typescript
// Add to axios interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Or manually for each request
const response = await axios.get('/admin/dashboard/overview', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`
  }
});
```

## Token Refresh

Khi access token hết hạn, sử dụng refresh token:

```typescript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  
  const response = await axios.post('/auth/refresh', {
    refreshToken
  });
  
  if (response.data.success) {
    localStorage.setItem('admin_access_token', response.data.accessToken);
    localStorage.setItem('admin_refresh_token', response.data.refreshToken);
    return response.data.accessToken;
  }
};

// Auto refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Testing với curl

### 1. Register Admin
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Super Admin",
    "email": "superadmin@example.com",
    "password": "Admin@12345",
    "department": "IT",
    "position": "System Administrator"
  }'
```

### 2. Verify Email (check email để lấy token)
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=<verification_token>"
```

### 3. Admin Login
```bash
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "Admin@12345"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Đăng nhập quản trị thành công",
  "user": {
    "user_id": "...",
    "email": "superadmin@example.com",
    "full_name": "Super Admin",
    "roles": ["admin"],
    "admin": {
      "admin_id": "...",
      "department": "IT",
      "position": "System Administrator"
    }
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### 4. Test với Access Token
```bash
TOKEN="<your_access_token>"

curl -X GET http://localhost:3000/admin/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"
```

## Testing với Postman

### Setup Environment
1. Create new environment "Admin"
2. Add variables:
   - `base_url`: http://localhost:3000
   - `admin_email`: superadmin@example.com
   - `admin_password`: Admin@12345
   - `access_token`: (will be set automatically)
   - `refresh_token`: (will be set automatically)

### Create Admin Login Request
1. Method: POST
2. URL: `{{base_url}}/auth/admin/login`
3. Body (raw JSON):
```json
{
  "email": "{{admin_email}}",
  "password": "{{admin_password}}"
}
```
4. Tests (to save tokens):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("access_token", response.accessToken);
    pm.environment.set("refresh_token", response.refreshToken);
}
```

### Use in Other Requests
Authorization tab:
- Type: Bearer Token
- Token: `{{access_token}}`

## Common Issues & Solutions

### Issue: "Bạn không có quyền truy cập trang quản trị"
**Cause:** User không có role admin
**Solution:** 
- Register với endpoint `/auth/register-admin`
- Hoặc manually add admin role trong database

### Issue: "Vui lòng xác thực email trước khi đăng nhập"
**Cause:** Email chưa được verify
**Solution:** 
- Click link trong email verification
- Hoặc manually update `is_email_verified = true` trong database

### Issue: "Tài khoản đã bị khóa"
**Cause:** User status = INACTIVE hoặc BANNED
**Solution:** 
- Update status = ACTIVE trong database
- Hoặc contact system admin

### Issue: Token expired
**Cause:** Access token đã hết hạn (15 minutes)
**Solution:** 
- Use refresh token endpoint: `POST /auth/refresh`
- Implement auto-refresh in frontend

## Security Best Practices

### 1. Store Tokens Securely
- ✅ Use `httpOnly` cookies for refresh token (recommended)
- ✅ Use short-lived access tokens (15 min)
- ✅ Never expose tokens in URLs
- ❌ Avoid storing in localStorage if possible (XSS risk)

### 2. Implement Logout
```typescript
const logout = async () => {
  const token = localStorage.getItem('admin_access_token');
  
  await axios.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
  
  window.location.href = '/admin/login';
};
```

### 3. Protect Admin Routes
```typescript
// React Router example
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_access_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  if (!token || !user.roles?.includes('admin')) {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

// Usage
<Route path="/admin/*" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
} />
```

### 4. CSRF Protection
- Use CSRF tokens for state-changing operations
- Implement SameSite cookies
- Validate origin headers

## Related Endpoints

- `POST /auth/register-admin` - Register new admin
- `POST /auth/login` - Regular user login (job seeker/employer)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (invalidate refresh token)
- `GET /auth/me` - Get current user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## Related Files

- [auth.service.ts](../src/modules/auth/auth.service.ts)
- [auth.controller.ts](../src/modules/auth/auth.controller.ts)
- [admin-login.dto.ts](../src/modules/auth/dto/admin-login.dto.ts)
- [admin.entity.ts](../src/database/entities/admin/admin.entity.ts)
- [jwt-auth.guard.ts](../src/common/guards/jwt-auth.guard.ts)
- [roles.guard.ts](../src/common/guards/roles.guard.ts)

## Summary

✅ Endpoint `/auth/admin/login` đã sẵn sàng  
✅ Validation email & password  
✅ Kiểm tra role admin  
✅ Kiểm tra email verification & account status  
✅ Trả về JWT tokens (access + refresh)  
✅ Trả về admin profile data  
✅ Security best practices implemented  

Admin có thể login và sử dụng access token để truy cập các admin endpoints!
