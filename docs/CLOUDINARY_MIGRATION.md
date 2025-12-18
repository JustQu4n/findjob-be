# Cloudinary Migration Guide

## Overview
The system has been refactored to use **Cloudinary** instead of MinIO for all image and file uploads (avatars, resumes, etc.).

## Why Cloudinary?
- ✅ **Permanent URLs**: No expiration issues like presigned URLs
- ✅ **CDN**: Built-in global content delivery network
- ✅ **Image Transformations**: Automatic resizing, optimization, format conversion
- ✅ **Easier Setup**: No need to manage storage infrastructure
- ✅ **Free Tier**: Generous free plan for small-medium projects

---

## Installation

### 1. Install Cloudinary Package

```bash
npm install cloudinary
```

### 2. Get Cloudinary Credentials

1. Sign up for a free account at: https://cloudinary.com/
2. Go to your dashboard: https://cloudinary.com/console
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 3. Update Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important**: Replace `your-cloud-name`, `your-api-key`, and `your-api-secret` with your actual Cloudinary credentials.

---

## Changes Made

### Modules Updated

1. **CloudinaryModule** (NEW)
   - Location: `src/modules/cloudinary/`
   - Service: `CloudinaryService`
   - Methods: `uploadFile()`, `getFileUrl()`, `deleteFile()`, `validateFileType()`, `validateImageType()`

2. **ProfileModule**
   - Replaced `MinioModule` with `CloudinaryModule`
   - Updated `ProfileService` to use `CloudinaryService` for avatar uploads

3. **ApplicationsModule**
   - Replaced `MinioModule` with `CloudinaryModule`
   - Updated `ApplicationsService` to use `CloudinaryService` for resume uploads

### Key Differences

#### MinIO (Old)
- Stored object keys in DB (e.g., `avatars/12345-file.jpg`)
- Generated presigned URLs with expiration (7 days max)
- Required calling `getFileUrl()` every time to regenerate URL

#### Cloudinary (New)
- Stores permanent public URLs in DB (e.g., `https://res.cloudinary.com/...`)
- URLs never expire
- `getFileUrl()` just returns the URL as-is (no regeneration needed)

### Database Fields
No changes needed! The same fields (`avatar_url`, `resume_url`) are used, but now they store Cloudinary URLs instead of object keys.

---

## Testing

### 1. Test Avatar Upload

```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Upload avatar
curl -X POST http://localhost:3000/api/users/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

Expected response:
```json
{
  "message": "Cập nhật avatar thành công",
  "data": {
    "avatar_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/avatars/12345-image.jpg",
    "avatar_download_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/avatars/12345-image.jpg"
  }
}
```

### 2. Test Resume Upload (Application)

```bash
# Submit application with resume
curl -X POST http://localhost:3000/api/jobseeker/applications/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "job_post_id=YOUR_JOB_ID" \
  -F "cover_letter=My cover letter" \
  -F "resume=@/path/to/resume.pdf"
```

### 3. Test Profile Retrieval

```bash
# Get profile
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The `avatar_url` should be a permanent Cloudinary URL that doesn't expire.

---

## Migration Steps (If You Have Existing Data)

If you have existing users with MinIO URLs in the database:

### Option 1: Keep Old URLs (Temporary)
- Old MinIO URLs will still work if MinIO is running
- New uploads will use Cloudinary
- Gradually users will update their avatars to Cloudinary

### Option 2: Migrate All Files (Recommended)
1. Export all files from MinIO
2. Upload them to Cloudinary programmatically
3. Update database URLs

Example migration script:

```typescript
// migration-script.ts
import { CloudinaryService } from './src/modules/cloudinary/cloudinary.service';
import { MinioService } from './src/modules/minio/minio.service';
import { getRepository } from 'typeorm';
import { User } from './src/database/entities/user/user.entity';

async function migrateAvatars() {
  const userRepo = getRepository(User);
  const minioService = new MinioService(/* ... */);
  const cloudinaryService = new CloudinaryService(/* ... */);
  
  const users = await userRepo.find();
  
  for (const user of users) {
    if (user.avatar_url && !user.avatar_url.includes('cloudinary')) {
      try {
        // Download from MinIO
        const fileBuffer = await minioService.downloadFile(user.avatar_url);
        
        // Upload to Cloudinary
        const file = { buffer: fileBuffer, mimetype: 'image/jpeg', originalname: 'avatar.jpg' };
        const newUrl = await cloudinaryService.uploadFile(file, 'avatars');
        
        // Update DB
        user.avatar_url = newUrl;
        await userRepo.save(user);
        
        console.log(`Migrated avatar for user ${user.user_id}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user.user_id}:`, error);
      }
    }
  }
}
```

---

## Cloudinary Dashboard Features

After uploading files, you can:

1. **View Media Library**: https://cloudinary.com/console/media_library
   - See all uploaded files
   - Organize by folders (avatars, resumes, etc.)
   - View usage statistics

2. **Transformations**: Apply transformations to images
   ```
   https://res.cloudinary.com/cloud-name/image/upload/w_200,h_200,c_fill/avatars/image.jpg
   ```
   - `w_200,h_200`: Resize to 200x200
   - `c_fill`: Crop mode
   - `q_auto`: Auto quality
   - `f_auto`: Auto format (WebP for modern browsers)

3. **Analytics**: Monitor bandwidth and transformations

---

## Troubleshooting

### Error: "Invalid credentials"
- Check your `.env` file has correct Cloudinary credentials
- Make sure you copied from https://cloudinary.com/console

### Error: "Upload failed"
- Check file size (free tier: 10MB per file)
- Check file type is supported
- Check network connectivity to Cloudinary servers

### URLs not working
- Ensure URLs start with `https://res.cloudinary.com/`
- Check if the resource exists in Cloudinary dashboard
- Verify cloud name is correct

### Old MinIO URLs still in database
- These won't work unless MinIO is still running
- Follow migration steps above to update to Cloudinary URLs

---

## Rollback (If Needed)

If you need to rollback to MinIO:

1. Revert changes in:
   - `src/modules/users/profile/profile.module.ts`
   - `src/modules/users/profile/profile.service.ts`
   - `src/modules/users/applications/applications.module.ts`
   - `src/modules/users/applications/applications.service.ts`

2. Replace `CloudinaryModule` imports back to `MinioModule`
3. Replace `cloudinaryService` back to `minioService`
4. Restart the application

---

## Additional Resources

- **Cloudinary Documentation**: https://cloudinary.com/documentation
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration
- **Image Transformations**: https://cloudinary.com/documentation/image_transformations
- **Upload API**: https://cloudinary.com/documentation/upload_images

---

## Support

For issues or questions:
1. Check Cloudinary status: https://status.cloudinary.com/
2. Review Cloudinary docs: https://cloudinary.com/documentation
3. Check application logs for detailed error messages
