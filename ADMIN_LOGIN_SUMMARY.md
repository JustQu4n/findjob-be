# Admin Login - Quick Reference

## ✅ Đã Hoàn Thành

### Endpoint Mới
```
POST /auth/admin/login
```

### Features
- ✅ Xác thực email/password
- ✅ **Kiểm tra role admin** (chỉ admin mới login được)
- ✅ Kiểm tra email verification
- ✅ Kiểm tra account status
- ✅ Trả về JWT tokens
- ✅ Trả về admin profile

## 🚀 Quick Test

### 1. Register Admin
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Admin",
    "email": "admin@test.com",
    "password": "Admin@123",
    "department": "IT",
    "position": "Admin"
  }'
```

### 2. Verify Email
Check email và click link hoặc:
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=<token>"
```

### 3. Login
```bash
curl -X POST http://localhost:3000/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123"
  }'
```

### 4. Use Token
```bash
TOKEN="<your_access_token>"

curl -X GET http://localhost:3000/admin/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Request/Response

### Request
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

### Success Response
```json
{
  "success": true,
  "message": "Đăng nhập quản trị thành công",
  "user": {
    "user_id": "uuid",
    "email": "admin@example.com",
    "full_name": "Admin Name",
    "roles": ["admin"],
    "admin": {
      "admin_id": "uuid",
      "department": "IT",
      "position": "System Administrator"
    }
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## ❌ Error Messages

| Message | Reason |
|---------|--------|
| Email hoặc mật khẩu không đúng | Wrong email/password |
| Bạn không có quyền truy cập trang quản trị | User is not admin |
| Vui lòng xác thực email trước khi đăng nhập | Email not verified |
| Tài khoản đã bị khóa | Account inactive/banned |

## 🔐 Security

### Password Hashing
- ✅ bcrypt with salt rounds 10

### JWT Tokens
- ✅ Access Token: 15 minutes
- ✅ Refresh Token: 7 days
- ✅ Refresh token hashed in DB

### Role Check
```typescript
// Kiểm tra role TRƯỚC khi cho phép login
const hasAdminRole = user.roles.some(role => role.role_name === RoleName.ADMIN);
if (!hasAdminRole) {
  throw new UnauthorizedException('Bạn không có quyền truy cập trang quản trị');
}
```

## 💻 Frontend Integration

### React/TypeScript
```typescript
const adminLogin = async (email: string, password: string) => {
  const response = await axios.post('/auth/admin/login', {
    email,
    password
  });
  
  localStorage.setItem('admin_token', response.data.accessToken);
  localStorage.setItem('admin_refresh', response.data.refreshToken);
  
  return response.data.user;
};
```

### Use Token
```typescript
axios.get('/admin/dashboard/overview', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  }
});
```

## 🆚 So Sánh với Login Thông Thường

| Feature | `/auth/login` | `/auth/admin/login` |
|---------|---------------|---------------------|
| Job Seeker login | ✅ | ❌ |
| Employer login | ✅ | ❌ |
| Admin login | ✅ | ✅ |
| Role check | ❌ | ✅ (bắt buộc) |
| Admin data | ❌ | ✅ |
| Error message | Generic | Admin-specific |

## 📁 Files Created/Modified

**Mới tạo:**
- `src/modules/auth/dto/admin-login.dto.ts`
- `docs/ADMIN_LOGIN.md`

**Đã cập nhật:**
- `src/modules/auth/auth.service.ts` - Added `loginAdmin()` method
- `src/modules/auth/auth.controller.ts` - Added `POST /auth/admin/login` endpoint
- `src/modules/auth/dto/index.ts` - Export AdminLoginDto

## 🎯 Use Cases

### Admin Dashboard Login Page
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.accessToken);
        navigate('/admin/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## 🔧 Troubleshooting

### Problem: "Bạn không có quyền truy cập trang quản trị"
**Solution:** User phải được register với endpoint `/auth/register-admin`

### Problem: Email chưa verified
**Solution:** Click link trong email hoặc manually set `is_email_verified = true`

### Problem: Account locked
**Solution:** Set `status = 'ACTIVE'` trong database

## ✨ Ready to Use!

Admin login đã sẵn sàng! Có thể:
1. Register admin account
2. Verify email
3. Login với `/auth/admin/login`
4. Use access token cho admin endpoints

---

**Documentation đầy đủ:** [docs/ADMIN_LOGIN.md](ADMIN_LOGIN.md)
