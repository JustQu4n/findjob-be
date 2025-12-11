# AI Chat History - Database Integration

## ✅ Hoàn thành

Tính năng lưu lịch sử chat vào database đã được triển khai thành công!

## 📊 Database Schema

### Bảng: `ai_chat_history`

```sql
CREATE TABLE ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'gemini-pro',
    tokens_used INTEGER,
    user_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);
```

### Các trường dữ liệu:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK tới users table (nullable cho guest) |
| `user_message` | TEXT | Câu hỏi của user |
| `ai_response` | TEXT | Câu trả lời từ AI |
| `model` | VARCHAR(50) | Model đã sử dụng (gemini-pro, ...) |
| `tokens_used` | INTEGER | Số tokens đã tiêu tốn |
| `user_type` | VARCHAR(50) | Loại user (job_seeker, employer, admin, guest) |
| `created_at` | TIMESTAMP | Thời gian tạo |

## 🎯 Tính năng

### 1. **Tự động lưu chat**
- ✅ Mỗi cuộc hội thoại tự động được lưu vào database
- ✅ Lưu cả user message và AI response
- ✅ Tracking tokens usage
- ✅ Phân biệt user type (guest/authenticated)

### 2. **Lấy lịch sử chat của user**
```bash
GET /api/ai-assistant/history?limit=50
Authorization: Bearer <token>
```

### 3. **Xem tất cả lịch sử (Admin)**
```bash
GET /api/ai-assistant/history/all?page=1&limit=50
Authorization: Bearer <token>
```

### 4. **Xóa lịch sử chat**
```bash
DELETE /api/ai-assistant/history
Authorization: Bearer <token>
```

### 5. **Thống kê chat**
```bash
GET /api/ai-assistant/statistics
Authorization: Bearer <token>
```

## 📡 API Endpoints Chi tiết

### 1. Chat (với lưu history)

**Endpoint:** `POST /api/ai-assistant/chat`

**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optional - nếu không có sẽ lưu là guest)

**Request:**
```json
{
  "message": "Làm sao để tìm việc phù hợp?",
  "model": "gemini-pro"
}
```

**Response:**
```json
{
  "response": "Để tìm việc phù hợp...",
  "model": "gemini-pro",
  "tokensUsed": 150,
  "timestamp": "2024-12-11T14:30:00.000Z"
}
```

**Note:** Chat history sẽ tự động được lưu vào database.

### 2. Lấy lịch sử chat của user

**Endpoint:** `GET /api/ai-assistant/history?limit=50`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `limit` (optional): Số lượng records, default 50

**Response:**
```json
{
  "history": [
    {
      "id": "uuid-here",
      "userId": "user-uuid",
      "userMessage": "Làm sao để tìm việc?",
      "aiResponse": "Để tìm việc phù hợp...",
      "model": "gemini-pro",
      "tokensUsed": 150,
      "userType": "job_seeker",
      "createdAt": "2024-12-11T14:30:00.000Z"
    }
  ],
  "total": 25
}
```

### 3. Lấy tất cả lịch sử (Admin only)

**Endpoint:** `GET /api/ai-assistant/history/all?page=1&limit=50`

**Headers:**
- `Authorization: Bearer <token>` (required, admin role)

**Query Parameters:**
- `page` (optional): Trang hiện tại, default 1
- `limit` (optional): Số records/trang, default 50

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "user": {
        "user_id": "uuid",
        "email": "user@example.com",
        "full_name": "User Name"
      },
      "userMessage": "Question...",
      "aiResponse": "Response...",
      "model": "gemini-pro",
      "tokensUsed": 150,
      "userType": "job_seeker",
      "createdAt": "2024-12-11T14:30:00.000Z"
    }
  ],
  "total": 1250,
  "page": 1,
  "totalPages": 25
}
```

### 4. Xóa lịch sử chat

**Endpoint:** `DELETE /api/ai-assistant/history`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "message": "Chat history deleted successfully"
}
```

### 5. Thống kê chat

**Endpoint:** `GET /api/ai-assistant/statistics`

**Headers:**
- `Authorization: Bearer <token>` (required, admin role recommended)

**Response:**
```json
{
  "total": 1250,
  "today": 45,
  "byUserType": [
    { "userType": "job_seeker", "count": "650" },
    { "userType": "employer", "count": "400" },
    { "userType": "guest", "count": "200" }
  ]
}
```

## 🧪 Testing

### Test 1: Chat với user authenticated

```powershell
# Login first
$loginBody = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' `
    -Method POST -Body $loginBody -ContentType 'application/json'

$token = $loginResponse.accessToken

# Chat with token
$chatBody = @{ message = 'Hệ thống có tính năng gì?' } | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST `
    -Body $chatBody `
    -ContentType 'application/json' `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 2: Chat với guest (không login)

```powershell
$body = @{ message = 'Tôi muốn tìm việc' } | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST -Body $body -ContentType 'application/json'
```

### Test 3: Lấy lịch sử chat

```powershell
# Requires token from Test 1
Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/history?limit=10' `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 4: Xem statistics

```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/statistics' `
    -Headers @{ Authorization = "Bearer $token" }
```

### Test 5: Xóa lịch sử

```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/ai-assistant/history' `
    -Method DELETE `
    -Headers @{ Authorization = "Bearer $token" }
```

## 🔍 Kiểm tra Database trực tiếp

```sql
-- Xem tất cả chat history
SELECT * FROM ai_chat_history ORDER BY created_at DESC LIMIT 10;

-- Đếm số chat theo user type
SELECT user_type, COUNT(*) as count 
FROM ai_chat_history 
GROUP BY user_type;

-- Xem chat history của 1 user cụ thể
SELECT * FROM ai_chat_history 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC;

-- Thống kê tokens usage
SELECT 
    DATE(created_at) as date,
    COUNT(*) as chat_count,
    SUM(tokens_used) as total_tokens,
    AVG(tokens_used) as avg_tokens
FROM ai_chat_history
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 📊 Use Cases

### Use Case 1: User xem lại lịch sử chat
1. User login vào hệ thống
2. User chat với AI về các câu hỏi tuyển dụng
3. User có thể xem lại các câu hỏi và câu trả lời trước đó

### Use Case 2: Admin phân tích usage
1. Admin login vào hệ thống
2. Admin xem statistics để biết:
   - Tổng số chat
   - Số chat hôm nay
   - Phân bố theo user type
3. Admin xem chi tiết tất cả chat history

### Use Case 3: Guest user chat
1. Guest user (chưa login) vẫn có thể chat
2. Chat history được lưu với `userId = null` và `userType = 'guest'`
3. Nếu sau đó guest login, có thể implement logic merge history

## 🔒 Security & Privacy

### Đã implement:
- ✅ User chỉ xem được history của mình
- ✅ User chỉ xóa được history của mình
- ✅ JWT authentication cho các protected endpoints
- ✅ Soft delete với ON DELETE SET NULL

### TODO:
- [ ] Role-based access control cho admin endpoints
- [ ] Data retention policy (tự động xóa chat cũ sau X ngày)
- [ ] Encryption cho sensitive messages
- [ ] Rate limiting per user

## 💡 Best Practices

### For Users:
- Lịch sử chat được lưu vĩnh viễn cho đến khi bạn xóa
- Bạn có thể xóa toàn bộ lịch sử bất cứ lúc nào
- Chat history giúp bạn tham khảo lại các tư vấn trước đó

### For Developers:
- Chat history được lưu async, không ảnh hưởng đến response time
- Nếu lưu database fail, chat vẫn hoạt động bình thường
- Indexes đã được tối ưu cho query performance
- Sử dụng pagination cho endpoints trả về nhiều records

### For Admins:
- Monitor token usage để optimize costs
- Analyze chat patterns để cải thiện system context
- Review guest chats để identify common questions

## 📈 Analytics Queries

### Top 10 most active users
```sql
SELECT 
    u.email,
    u.full_name,
    COUNT(c.id) as chat_count,
    SUM(c.tokens_used) as total_tokens
FROM ai_chat_history c
JOIN users u ON c.user_id = u.user_id
GROUP BY u.user_id, u.email, u.full_name
ORDER BY chat_count DESC
LIMIT 10;
```

### Peak hours analysis
```sql
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as chat_count
FROM ai_chat_history
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

### Model usage comparison
```sql
SELECT 
    model,
    COUNT(*) as usage_count,
    AVG(tokens_used) as avg_tokens,
    SUM(tokens_used) as total_tokens
FROM ai_chat_history
GROUP BY model
ORDER BY usage_count DESC;
```

## 🎯 Roadmap

- [ ] Implement conversation threads (group related chats)
- [ ] Add favorite/bookmark functionality
- [ ] Export chat history (JSON/CSV)
- [ ] Search functionality in chat history
- [ ] Auto-categorize chats by topic
- [ ] Chat analytics dashboard
- [ ] User feedback on AI responses
- [ ] A/B testing different models

---

## ✨ Summary

Tính năng chat history đã được tích hợp hoàn chỉnh với:
- ✅ Database schema & migration
- ✅ Entity & Repository
- ✅ Service methods
- ✅ API endpoints (public & protected)
- ✅ Automatic saving
- ✅ User history management
- ✅ Admin analytics
- ✅ Indexes for performance

Module sẵn sàng sử dụng! 🚀
