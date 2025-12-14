# Avatar Upload during Registration

Hệ thống hỗ trợ upload avatar khi đăng ký tài khoản cho tất cả các loại người dùng (JobSeeker, Employer, Admin).

## Database Schema

Avatar URL được lưu ở 2 nơi:
1. **users table**: `avatar_url` VARCHAR(500) - Avatar chung cho user
2. **employers table**: `avatar_url` VARCHAR(500) - Avatar riêng cho employer profile  
3. **job_seekers table**: `avatar_url` VARCHAR(500) - Avatar riêng cho job seeker profile

## API Endpoints

### 1. Register JobSeeker with Avatar
**POST** `/api/auth/register`

**Content-Type**: `multipart/form-data`

**Request Body**:
```
full_name: string (required)
email: string (required) 
password: string (required, min 8 chars with uppercase, lowercase, number, special char)
phone: string (optional, 10-11 digits)
role: "job_seeker" | "employer" | "admin" (required)
avatar: file (optional, JPG/PNG/GIF)
```

**Response Success (201)**:
```json
{
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "job_seeker"
  }
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "password=SecureP@ss123" \
  -F "phone=0123456789" \
  -F "role=job_seeker" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

### 2. Register Employer with Avatar
**POST** `/api/auth/register-employer`

**Content-Type**: `multipart/form-data`

**Request Body**:
```
fullname: string (required)
email: string (required)
password: string (required)
company_name: string (required)
company_address: string (required)
company_logo_url: string (optional)
company_description: string (optional)
company_industry: string (optional)
company_website: string (optional)
avatar: file (optional, JPG/PNG/GIF)
```

**Response Success (201)**:
```json
{
  "message": "Đăng ký nhà tuyển dụng thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "user_id": "uuid",
    "email": "employer@company.com",
    "company_name": "ABC Company",
    "role": "employer"
  },
  "company": {
    "company_id": "uuid",
    "name": "ABC Company",
    "location": "Hanoi"
  }
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/register-employer \
  -F "fullname=Jane Smith" \
  -F "email=jane@company.com" \
  -F "password=SecureP@ss123" \
  -F "company_name=ABC Company" \
  -F "company_address=123 Street, Hanoi" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

### 3. Register Admin with Avatar
**POST** `/api/auth/register-admin`

**Content-Type**: `multipart/form-data`

**Request Body**:
```
full_name: string (required)
email: string (required)
password: string (required)
department: string (required)
position: string (required)
avatar: file (optional, JPG/PNG/GIF)
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/register-admin \
  -F "full_name=Admin User" \
  -F "email=admin@system.com" \
  -F "password=SecureP@ss123" \
  -F "department=IT" \
  -F "position=System Administrator" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

## Avatar File Restrictions

### Allowed File Types
- **Extensions**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/gif`

### Storage
- **Location**: MinIO bucket `mybucket` in folder `avatars/`
- **Naming**: `avatars/{timestamp}-{original-filename}`
- **Example**: `avatars/1762719280755-profile.jpg`

### Validation
File is validated before upload:
```typescript
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
if (!allowedMimeTypes.includes(avatar.mimetype)) {
  throw BadRequestException('File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF');
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 409 Conflict
```json
{
  "message": "Email đã được sử dụng",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## Implementation Details

### Entity Updates

**User Entity** (`users` table):
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
avatar_url: string;
```

**Employer Entity** (`employers` table):
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
avatar_url: string;
```

**JobSeeker Entity** (`job_seekers` table):
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
avatar_url: string;
```

### Service Logic

```typescript
// Upload avatar if provided
let avatar_url: string | undefined = undefined;
if (avatar) {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedMimeTypes.includes(avatar.mimetype)) {
    throw new BadRequestException(
      'File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF',
    );
  }
  avatar_url = await this.minioService.uploadFile(avatar, 'avatars');
}

// Save to user
const user = this.userRepository.create({
  email,
  password_hash,
  full_name,
  avatar_url,
  // ... other fields
});
```

### Profile Creation

Avatar is saved to both User entity and role-specific entity (Employer/JobSeeker):

```typescript
private async createRoleSpecificProfile(user: User, role: UserRole, avatar_url?: string) {
  switch (role) {
    case UserRole.JOB_SEEKER:
      const jobSeeker = this.jobSeekerRepository.create({ 
        user,
        avatar_url  // Saved to job_seekers table
      });
      await this.jobSeekerRepository.save(jobSeeker);
      break;
    case UserRole.EMPLOYER:
      const employer = this.employerRepository.create({ 
        user,
        avatar_url  // Saved to employers table
      });
      await this.employerRepository.save(employer);
      break;
  }
}
```

---

## Testing

### Test with Postman

1. **Create new request**
2. **Method**: POST
3. **URL**: `http://localhost:3000/api/auth/register`
4. **Body**: 
   - Select `form-data`
   - Add fields:
     - `full_name`: Text
     - `email`: Text
     - `password`: Text
     - `phone`: Text
     - `role`: Text (value: `job_seeker`)
     - `avatar`: File (select image file)
5. **Send**

### Verify Upload

1. Check MinIO console: http://localhost:9001
2. Navigate to `mybucket` > `avatars/`
3. Avatar file should appear with timestamp prefix

### Verify Database

```sql
-- Check user avatar
SELECT user_id, email, full_name, avatar_url FROM users WHERE email = 'test@example.com';

-- Check job seeker avatar
SELECT js.job_seeker_id, js.avatar_url, u.email 
FROM job_seekers js 
JOIN users u ON js.user_id = u.user_id 
WHERE u.email = 'test@example.com';

-- Check employer avatar
SELECT e.employer_id, e.avatar_url, u.email 
FROM employers e 
JOIN users u ON e.user_id = u.user_id 
WHERE u.email = 'employer@test.com';
```

---

## Frontend Integration

### JavaScript/Fetch Example

```javascript
const formData = new FormData();
formData.append('full_name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'SecureP@ss123');
formData.append('phone', '0123456789');
formData.append('role', 'job_seeker');

// Get file from input
const avatarInput = document.getElementById('avatar');
if (avatarInput.files[0]) {
  formData.append('avatar', avatarInput.files[0]);
}

const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  body: formData,
  // DO NOT set Content-Type header, browser will set it automatically with boundary
});

const data = await response.json();
console.log(data);
```

### React Example

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('full_name', fullName);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('role', 'job_seeker');
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  try {
    const res = await axios.post('/api/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};
```

---

## Notes

- Avatar upload is **optional** - registration works without avatar
- Avatar is validated for type before upload
- Invalid file types return 400 Bad Request
- Avatar URL is stored in both `users` table and role-specific table
- MinIO must be running for avatar upload to work
- File size limits can be configured in NestJS multer settings
