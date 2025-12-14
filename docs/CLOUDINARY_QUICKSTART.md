# Quick Start: Cloudinary Setup

## Step 1: Install Dependencies

```bash
npm install
```

This will install the `cloudinary` package (version ^2.0.0) that was added to package.json.

## Step 2: Get Cloudinary Credentials

1. Go to https://cloudinary.com/ and sign up for a free account
2. After login, you'll see your dashboard at https://cloudinary.com/console
3. Copy these three values from the "Product Environment Credentials" section:
   - **Cloud Name** (e.g., `dmz1abc23`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

## Step 3: Update .env File

Add these lines to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dmz1abc23
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

**Replace the values with your actual Cloudinary credentials!**

## Step 4: Restart Backend

```bash
npm run start:dev
```

## Step 5: Test Upload

Try uploading an avatar or resume through your API:

```bash
# Test avatar upload (replace TOKEN and file path)
curl -X POST http://localhost:3000/api/users/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

You should see a response with a Cloudinary URL like:
```json
{
  "message": "Cập nhật avatar thành công",
  "data": {
    "avatar_url": "https://res.cloudinary.com/dmz1abc23/image/upload/v1701234567/avatars/1701234567890-image.jpg"
  }
}
```

## That's It!

All image and file uploads now use Cloudinary instead of MinIO. URLs are permanent and never expire.

## Cloudinary Free Tier Limits

- ✅ 25 credits/month (generous for small apps)
- ✅ 25GB storage
- ✅ 25GB bandwidth
- ✅ Unlimited transformations

Perfect for development and small production apps!

## Need Help?

- See [CLOUDINARY_MIGRATION.md](./CLOUDINARY_MIGRATION.md) for detailed documentation
- Check [Cloudinary docs](https://cloudinary.com/documentation) for API details
- View your uploads at https://cloudinary.com/console/media_library
