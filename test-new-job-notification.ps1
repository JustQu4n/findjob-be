# Test Script for New Job Post Notification Feature

# Hướng dẫn test tính năng thông báo bài viết mới

## Yêu cầu
- Backend server đang chạy
- Có tài khoản Job Seeker
- Có tài khoản Employer (đã link với company)

## Bước 1: Follow Company (Job Seeker)

```powershell
# Lấy token của Job Seeker
$jobSeekerToken = "YOUR_JOB_SEEKER_TOKEN_HERE"
$companyId = "COMPANY_ID_TO_FOLLOW"

# Follow company
$followResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/companies/$companyId/follow" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $jobSeekerToken"
    "Content-Type" = "application/json"
  }

Write-Host "Follow Response:" -ForegroundColor Green
$followResponse | ConvertTo-Json -Depth 5
```

## Bước 2: Kiểm tra danh sách công ty đã follow

```powershell
$followedCompanies = Invoke-RestMethod -Uri "http://localhost:3000/users/companies/followed" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $jobSeekerToken"
  }

Write-Host "`nFollowed Companies:" -ForegroundColor Green
$followedCompanies | ConvertTo-Json -Depth 5
```

## Bước 3: Tạo Job Post (Employer)

```powershell
# Lấy token của Employer (phải thuộc company đã follow ở bước 1)
$employerToken = "YOUR_EMPLOYER_TOKEN_HERE"

$jobPostData = @{
  title = "Senior Backend Developer - Test Notification"
  description = "Test job post để kiểm tra notification"
  requirements = "3+ years experience with Node.js and NestJS"
  location = "Hà Nội"
  address = "123 Test Street"
  experience = "3-5 years"
  level = "SENIOR"
  salary_range = "20-30M"
  gender = "ANY"
  job_type = "FULL_TIME"
  status = "ACTIVE"
  skills = @("NodeJS", "NestJS", "TypeScript", "PostgreSQL")
} | ConvertTo-Json

$createJobResponse = Invoke-RestMethod -Uri "http://localhost:3000/employer/job-posts" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $employerToken"
    "Content-Type" = "application/json"
  } `
  -Body $jobPostData

Write-Host "`nJob Post Created:" -ForegroundColor Green
$createJobResponse | ConvertTo-Json -Depth 5
```

## Bước 4: Kiểm tra thông báo (Job Seeker)

```powershell
# Chờ 1 giây để notification được tạo
Start-Sleep -Seconds 1

$notifications = Invoke-RestMethod -Uri "http://localhost:3000/notifications?page=1&limit=10" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $jobSeekerToken"
  }

Write-Host "`nNotifications:" -ForegroundColor Green
$notifications | ConvertTo-Json -Depth 5

# Kiểm tra notification mới nhất
$latestNotification = $notifications.data[0]
if ($latestNotification.type -eq "new_job_post") {
  Write-Host "`n✓ SUCCESS: Notification received!" -ForegroundColor Green
  Write-Host "Message: $($latestNotification.message)" -ForegroundColor Cyan
  Write-Host "Job Post ID: $($latestNotification.metadata.job_post_id)" -ForegroundColor Cyan
  Write-Host "Company: $($latestNotification.metadata.company_name)" -ForegroundColor Cyan
} else {
  Write-Host "`n✗ FAILED: Expected notification not found" -ForegroundColor Red
}
```

## Bước 5: Đếm số thông báo chưa đọc

```powershell
$unreadCount = Invoke-RestMethod -Uri "http://localhost:3000/notifications/unread/count" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $jobSeekerToken"
  }

Write-Host "`nUnread Notifications Count:" -ForegroundColor Green
$unreadCount | ConvertTo-Json
```

## Bước 6: Đánh dấu đã đọc

```powershell
if ($latestNotification) {
  $notificationId = $latestNotification.id
  
  $markReadResponse = Invoke-RestMethod -Uri "http://localhost:3000/notifications/$notificationId/read" `
    -Method PATCH `
    -Headers @{
      "Authorization" = "Bearer $jobSeekerToken"
    }
  
  Write-Host "`nMarked as Read:" -ForegroundColor Green
  $markReadResponse | ConvertTo-Json -Depth 5
}
```

## Bước 7: Test WebSocket Realtime (Optional)

Tạo file HTML test WebSocket:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Notification Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Realtime Notification Test</h1>
  <div id="notifications"></div>
  
  <script>
    const token = 'YOUR_JOB_SEEKER_TOKEN_HERE';
    
    const socket = io('http://localhost:3000', {
      auth: { token }
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      document.body.insertAdjacentHTML('beforeend', '<p style="color: green">✓ Connected</p>');
    });
    
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      const notifDiv = document.createElement('div');
      notifDiv.style.border = '1px solid #ccc';
      notifDiv.style.padding = '10px';
      notifDiv.style.margin = '10px 0';
      notifDiv.innerHTML = `
        <strong>${notification.type}</strong><br>
        ${notification.message}<br>
        <small>${new Date(notification.created_at).toLocaleString()}</small>
      `;
      document.getElementById('notifications').prepend(notifDiv);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  </script>
</body>
</html>
```

## Complete Test Script (All-in-One)

```powershell
# ============================================
# Complete Test Script
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing New Job Post Notification Feature" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:3000"
$jobSeekerToken = Read-Host "Enter Job Seeker Token"
$employerToken = Read-Host "Enter Employer Token"
$companyId = Read-Host "Enter Company ID to follow"

# Test 1: Follow Company
Write-Host "`n[TEST 1] Following company..." -ForegroundColor Yellow
try {
  $followResponse = Invoke-RestMethod -Uri "$baseUrl/users/companies/$companyId/follow" `
    -Method POST `
    -Headers @{
      "Authorization" = "Bearer $jobSeekerToken"
      "Content-Type" = "application/json"
    }
  Write-Host "✓ SUCCESS: Company followed" -ForegroundColor Green
} catch {
  Write-Host "✗ FAILED: $_" -ForegroundColor Red
  if ($_.Exception.Response.StatusCode -eq 409) {
    Write-Host "Note: Already following this company" -ForegroundColor Yellow
  }
}

# Test 2: Create Job Post
Write-Host "`n[TEST 2] Creating job post..." -ForegroundColor Yellow
$jobPostData = @{
  title = "Test Position - $(Get-Date -Format 'HH:mm:ss')"
  description = "Testing notification feature"
  location = "Hà Nội"
  salary_range = "20-30M"
  status = "ACTIVE"
} | ConvertTo-Json

try {
  $jobPostResponse = Invoke-RestMethod -Uri "$baseUrl/employer/job-posts" `
    -Method POST `
    -Headers @{
      "Authorization" = "Bearer $employerToken"
      "Content-Type" = "application/json"
    } `
    -Body $jobPostData
  Write-Host "✓ SUCCESS: Job post created" -ForegroundColor Green
  $jobPostId = $jobPostResponse.data.job_post_id
  Write-Host "Job Post ID: $jobPostId" -ForegroundColor Cyan
} catch {
  Write-Host "✗ FAILED: $_" -ForegroundColor Red
  exit 1
}

# Test 3: Check Notifications
Write-Host "`n[TEST 3] Checking notifications..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
  $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications?page=1&limit=5" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $jobSeekerToken"
    }
  
  $latestNotification = $notifications.data[0]
  
  if ($latestNotification -and $latestNotification.type -eq "new_job_post") {
    Write-Host "✓ SUCCESS: Notification received!" -ForegroundColor Green
    Write-Host "Message: $($latestNotification.message)" -ForegroundColor Cyan
    Write-Host "Job Post ID: $($latestNotification.metadata.job_post_id)" -ForegroundColor Cyan
    Write-Host "Company: $($latestNotification.metadata.company_name)" -ForegroundColor Cyan
  } else {
    Write-Host "✗ FAILED: Expected notification not found" -ForegroundColor Red
  }
} catch {
  Write-Host "✗ FAILED: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
```

## Expected Results

✓ Job Seeker follows company successfully
✓ Employer creates job post successfully
✓ Job Seeker receives notification with:
  - type: "new_job_post"
  - message: "{Company Name} vừa đăng tin tuyển dụng mới: {Job Title}"
  - metadata contains: company_id, company_name, job_post_id, job_title
✓ Notification appears in /notifications endpoint
✓ Unread count increases
✓ Can mark notification as read

## Cleanup (Optional)

```powershell
# Unfollow company
Invoke-RestMethod -Uri "$baseUrl/users/companies/$companyId/unfollow" `
  -Method DELETE `
  -Headers @{
    "Authorization" = "Bearer $jobSeekerToken"
  }

Write-Host "Cleanup complete: Unfollowed company" -ForegroundColor Green
```
