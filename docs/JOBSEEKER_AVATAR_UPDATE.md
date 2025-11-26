# JobSeeker Profile Avatar Update

API để cập nhật avatar cho profile JobSeeker.

## Endpoint

**PATCH** `/api/jobseeker/profile/avatar`

**Authentication**: Required (JWT Token với role 'jobseeker')

## Request

**Content-Type**: `multipart/form-data`

**Body**:
- `avatar` (file, required): File ảnh avatar (JPG, PNG, GIF)

## Response

### Success Response (200)

```json
{
  "message": "Cập nhật avatar thành công",
  "data": {
    "avatar_url": "avatars/1762720000000-profile.jpg",
    "avatar_download_url": "https://minio-presigned-url-for-download..."
  }
}
```

### Error Responses

**400 Bad Request** - File không hợp lệ:
```json
{
  "message": "File avatar không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF",
  "error": "Bad Request",
  "statusCode": 400
}
```

**400 Bad Request** - Không có file:
```json
{
  "message": "Vui lòng chọn file avatar",
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 Unauthorized** - Không có token:
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**403 Forbidden** - Không phải role jobseeker:
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

**404 Not Found** - Không tìm thấy profile:
```json
{
  "message": "Không tìm thấy hồ sơ người tìm việc",
  "error": "Not Found",
  "statusCode": 404
}
```

## File Requirements

### Allowed File Types
- **Extensions**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/gif`

### Storage
- **Location**: MinIO bucket `mybucket/avatars/`
- **Naming**: `avatars/{timestamp}-{original-filename}`

## Implementation Details

### What Happens
1. Validates avatar file type (JPG, PNG, GIF only)
2. Deletes old avatar from MinIO if exists
3. Uploads new avatar to MinIO folder `avatars/`
4. Updates `avatar_url` in both `job_seekers` and `users` tables
5. Returns new avatar URL and presigned download URL (valid 24 hours)

### Database Updates
Avatar URL is saved to both tables:
- `job_seekers.avatar_url`
- `users.avatar_url`

This ensures consistency across user profile and job seeker specific profile.

## Usage Examples

### cURL Example

```bash
curl -X PATCH http://localhost:3000/api/jobseeker/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

### JavaScript/Fetch Example

```javascript
const avatarInput = document.getElementById('avatar');
const file = avatarInput.files[0];

const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('http://localhost:3000/api/jobseeker/profile/avatar', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: formData,
});

const data = await response.json();
console.log('New avatar URL:', data.data.avatar_url);
console.log('Download URL:', data.data.avatar_download_url);
```

### Axios Example

```javascript
import axios from 'axios';

const handleAvatarUpdate = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await axios.patch(
      'http://localhost:3000/api/jobseeker/profile/avatar',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('Success:', response.data);
    // response.data.data.avatar_url - MinIO path
    // response.data.data.avatar_download_url - Temporary download URL
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};
```

### React Example with Preview

```jsx
import { useState } from 'react';
import axios from 'axios';

function AvatarUpload({ token }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await axios.patch(
        '/api/jobseeker/profile/avatar',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      alert(res.data.message);
      // Update preview with download URL
      setPreview(res.data.data.avatar_download_url);
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        name="avatar"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileChange}
      />
      
      {preview && (
        <img src={preview} alt="Preview" style={{ width: 150, height: 150, borderRadius: '50%' }} />
      )}
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Update Avatar'}
      </button>
    </form>
  );
}
```

## Testing with Postman

1. **Create new request**
2. **Method**: PATCH
3. **URL**: `http://localhost:3000/api/jobseeker/profile/avatar`
4. **Headers**:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
5. **Body**:
   - Select `form-data`
   - Add field: `avatar` (Type: File)
   - Select image file
6. **Send**

## Verify Changes

### Check Database

```sql
-- Check job seeker avatar
SELECT js.job_seeker_id, js.avatar_url, u.email, u.avatar_url as user_avatar
FROM job_seekers js
JOIN users u ON js.user_id = u.user_id
WHERE u.email = 'jobseeker@test.com';
```

### Check MinIO

1. Open MinIO console: http://localhost:9001
2. Navigate to `mybucket` > `avatars/`
3. Old avatar should be deleted
4. New avatar file should appear with timestamp prefix

## Notes

- ✅ Old avatar is automatically deleted from MinIO
- ✅ Avatar URL is updated in both `users` and `job_seekers` tables
- ✅ Returns presigned download URL valid for 24 hours
- ✅ File type validation prevents non-image uploads
- ✅ Only jobseeker role can update their own avatar
- ⚠️ MinIO must be running for avatar upload to work
- ⚠️ If old avatar deletion fails, it continues with upload (logged to console)

## Related APIs

- **GET** `/api/jobseeker/profile/:id` - Get profile (includes avatar_url)
- **PUT** `/api/jobseeker/profile` - Update other profile fields
- **POST** `/api/auth/register` - Register with avatar (during signup)

## Security

- JWT authentication required
- Role-based access control (jobseeker only)
- User can only update their own avatar
- File type validation
- Automatic cleanup of old avatar files
