# MinIO Setup & Troubleshooting Guide

## Quick Start

### 1. Start MinIO Container
```bash
docker-compose up -d minio
```

### 2. Verify MinIO is Running
```bash
docker ps | grep minio
```

You should see:
```
be-minio-1   quay.io/minio/minio:latest   Up X seconds   0.0.0.0:9000-9001->9000-9001/tcp
```

### 3. Access MinIO Console
Open browser: http://localhost:9001

**Default credentials** (from docker-compose.yml):
- Username: `yourminiouser`
- Password: `yourminiopassword`

## Environment Variables

Create `.env` file in project root:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=yourminiouser
MINIO_SECRET_KEY=yourminiopassword
MINIO_BUCKET_NAME=mybucket
```

## Common Errors & Solutions

### Error: "ECONNREFUSED ::1:9000" or "ECONNREFUSED 127.0.0.1:9000"

**Cause**: MinIO container is not running

**Solution**:
```bash
# Start MinIO
docker-compose up -d minio

# Verify it's running
docker ps | grep minio
```

### Error: "Bucket does not exist"

**Cause**: Bucket not created automatically

**Solution**:
1. Access MinIO console at http://localhost:9001
2. Login with credentials
3. Create a bucket named `mybucket` (or your custom name)

Alternatively, the service will auto-create bucket on first connection.

### Error: "Access Denied"

**Cause**: Wrong credentials or bucket permissions

**Solution**:
1. Check credentials in `.env` match docker-compose.yml
2. Restart NestJS app: `npm run start:dev`
3. Check bucket policy in MinIO console

### Error: "Invalid file type"

**Cause**: Uploaded file is not PDF, DOC, or DOCX

**Solution**:
Only upload files with extensions:
- `.pdf` (application/pdf)
- `.doc` (application/msword)
- `.docx` (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

## Testing MinIO

### Test File Upload via API

```bash
# Submit application with resume
curl -X POST http://localhost:3000/api/jobseeker/applications/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "job_post_id=JOB_POST_UUID" \
  -F "cover_letter=Sample cover letter" \
  -F "resume=@/path/to/resume.pdf"
```

### Test MinIO Connection Directly

```bash
# Check MinIO health
curl http://localhost:9000/minio/health/live

# Expected response: OK
```

### View Uploaded Files in MinIO Console

1. Go to http://localhost:9001
2. Login
3. Navigate to `mybucket` > `resumes/` folder
4. You'll see uploaded files with timestamp prefix

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Start only MinIO
docker-compose up -d minio

# Stop MinIO
docker-compose stop minio

# Remove MinIO container (keeps data)
docker-compose rm -f minio

# View MinIO logs
docker-compose logs -f minio

# Restart MinIO
docker-compose restart minio
```

## Data Persistence

MinIO data is stored in Docker volume `minio_data`. 

To backup/restore:
```bash
# Backup
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data

# Restore
docker run --rm -v minio_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/minio-backup.tar.gz --strip 1"
```

## Production Considerations

1. **Change default credentials** in docker-compose.yml
2. **Enable SSL** if exposing to internet
3. **Set up bucket lifecycle policies** for old file cleanup
4. **Configure CDN** for better performance
5. **Set file size limits** in NestJS multer config
6. **Implement virus scanning** for uploaded files

## Debugging

Enable debug logs in MinIO service:

```typescript
// src/modules/minio/minio.service.ts
console.log('MinIO Client Config:', {
  endPoint: this.configService.get('MINIO_ENDPOINT'),
  port: this.configService.get('MINIO_PORT'),
  useSSL: this.configService.get('MINIO_USE_SSL'),
});
```

Check NestJS console for:
- MinIO connection errors
- Bucket creation status
- File upload progress
- Generated presigned URLs
