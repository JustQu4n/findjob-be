# Employer Authentication API

## Register Employer

Register a new employer account with company information.

### Endpoint
```
POST /auth/register-employer
```

### Request Body
```json
{
  "email": "employer@example.com",
  "password": "password123",
  "company_name": "Tech Corp",
  "company_address": "123 Tech Street",
  "company_logo_url": "https://example.com/logo.png",
  "company_description": "A leading tech company.",
  "company_industry": "Technology",
  "company_website": "https://techcorp.com"
}
```

### Required Fields
- `email`: Valid email address
- `password`: Minimum 8 characters
- `company_name`: Company name (max 150 characters)
- `company_address`: Company address (max 255 characters)

### Optional Fields
- `company_logo_url`: URL to company logo
- `company_description`: Description of the company
- `company_industry`: Industry type (max 100 characters)
- `company_website`: Company website URL

### Response
```json
{
  "message": "Đăng ký nhà tuyển dụng thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "user_id": 1,
    "email": "employer@example.com",
    "company_name": "Tech Corp",
    "role": "employer"
  },
  "company": {
    "company_id": 1,
    "name": "Tech Corp",
    "location": "123 Tech Street"
  }
}
```

### Workflow
1. **Register** - Create employer account with company
2. **Verify Email** - Check email and verify using the token
3. **Login** - Use login endpoint to get access token

## Verify Email

After registration, verify the email using the token sent to the employer's email.

### Endpoint
```
POST /auth/verify-email
```

### Request Body
```json
{
  "token": "uuid-token-from-email"
}
```

## Login

After email verification, login to get access tokens.

### Endpoint
```
POST /auth/login
```

### Request Body
```json
{
  "email": "employer@example.com",
  "password": "password123"
}
```

### Response
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "user_id": 1,
    "email": "employer@example.com",
    "full_name": "Tech Corp",
    "phone": null,
    "roles": ["employer"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Other Auth Endpoints

All other authentication endpoints work the same for employers:
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user profile

## Error Responses

### Email Already Exists
```json
{
  "statusCode": 409,
  "message": "Email đã được sử dụng"
}
```

### Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Email không được để trống",
    "Mật khẩu phải có ít nhất 8 ký tự"
  ],
  "error": "Bad Request"
}
```
