# 🤖 AI Assistant Module - Gemini Chatbot

## ✅ Hoàn thành

Module AI Assistant với Gemini đã được triển khai thành công! Chatbot có thể trả lời các câu hỏi liên quan đến hệ thống tuyển dụng và công việc.

## 📦 Cấu trúc Module

```
src/modules/ai-assistant/
├── ai-assistant.controller.ts  # REST API endpoints
├── ai-assistant.service.ts     # Gemini AI logic & system context
├── ai-assistant.module.ts      # Module configuration
└── dto/
    ├── chat-with-gemini.dto.ts # Request DTO
    ├── chat-response.dto.ts    # Response DTO
    └── index.ts
```

## 🎯 Tính năng

### 1. **Chat với AI** (POST `/api/ai-assistant/chat`)
- Trả lời câu hỏi về tìm kiếm việc làm
- Tư vấn về hồ sơ xin việc, CV, phỏng vấn
- Hướng dẫn sử dụng hệ thống
- Tư vấn về kỹ năng và ngành nghề

### 2. **Gợi ý câu hỏi** (GET `/api/ai-assistant/suggestions`)
- Danh sách 6 câu hỏi phổ biến
- Giúp user biết hỏi gì

### 3. **Kiểm tra trạng thái** (GET `/api/ai-assistant/status`)
- Xác nhận API key đã được cấu hình
- Kiểm tra chatbot có sẵn sàng không

## 🚀 Cách sử dụng

### Bước 1: Lấy API Key miễn phí

1. Truy cập: **https://makersuite.google.com/app/apikey**
2. Đăng nhập với Google account
3. Tạo API key mới
4. Copy API key

### Bước 2: Cấu hình

Mở file `.env` và thay thế placeholder:

```env
# Gemini API Key (Free model: gemini-1.5-flash)
GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

### Bước 3: Khởi động server

```bash
npm run start:dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### 1. Status Check

```bash
curl http://localhost:5000/api/ai-assistant/status
```

**Response:**
```json
{
  "configured": true,
  "message": "AI Assistant is ready"
}
```

### 2. Get Suggestions

```bash
curl http://localhost:5000/api/ai-assistant/suggestions
```

**Response:**
```json
{
  "suggestions": [
    "Làm thế nào để tạo hồ sơ xin việc ấn tượng?",
    "Tôi nên chuẩn bị gì cho một buổi phỏng vấn?",
    "..."
  ]
}
```

### 3. Chat with AI

**PowerShell:**
```powershell
$body = @{ 
    message = 'Hệ thống có những tính năng gì?' 
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/ai-assistant/chat' `
    -Method POST `
    -Body $body `
    -ContentType 'application/json' |
    Select-Object -ExpandProperty Content
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Làm sao để tìm việc phù hợp?"}'
```

**Response:**
```json
{
  "response": "Để tìm việc phù hợp, bạn cần: 1. Xác định rõ mục tiêu nghề nghiệp...",
  "model": "gemini-1.5-flash",
  "tokensUsed": 234,
  "timestamp": "2024-12-11T14:30:00.000Z"
}
```

## 🧪 Testing

### Chạy test tự động:

```powershell
.\test-ai-assistant.ps1
```

Test script sẽ:
- ✅ Kiểm tra status endpoint
- ✅ Kiểm tra suggestions endpoint
- ✅ Test 4 câu hỏi khác nhau với chatbot
- 📊 Hiển thị kết quả tổng hợp

### Test thủ công:

Xem hướng dẫn chi tiết trong: [`docs/AI_ASSISTANT_TESTING.md`](docs/AI_ASSISTANT_TESTING.md)

## 🎨 System Context

Chatbot được cấu hình với kiến thức về:

### Tính năng hệ thống:
- ✅ Đăng ký/Đăng nhập cho Job Seeker & Employer
- ✅ Quản lý hồ sơ cá nhân (profile, education, experience, skills, projects)
- ✅ Tìm kiếm và lọc công việc
- ✅ Ứng tuyển và theo dõi trạng thái
- ✅ Đăng tin tuyển dụng (cho employer)
- ✅ Lưu công việc yêu thích
- ✅ Chat giữa employer và candidate
- ✅ Hệ thống thông báo

### Chủ đề hỗ trợ:
- 💼 Tìm kiếm công việc
- 📝 Tạo hồ sơ và CV
- 🎯 Chuẩn bị phỏng vấn
- 📊 Kỹ năng và xu hướng thị trường
- 🏢 Thông tin về công ty
- 📮 Đăng tin tuyển dụng

## 📚 Documentation

1. **[AI_ASSISTANT.md](docs/AI_ASSISTANT.md)** - Documentation đầy đủ
2. **[AI_ASSISTANT_TESTING.md](docs/AI_ASSISTANT_TESTING.md)** - Hướng dẫn test chi tiết

## 🔧 Technical Stack

- **Framework:** NestJS
- **AI SDK:** `@google/generative-ai` v0.21.0
- **Model:** Gemini 1.5 Flash (Free tier)
- **Validation:** class-validator, class-transformer
- **Config:** @nestjs/config

## 💡 Tips

### Chọn Model phù hợp:

```typescript
// Nhanh nhất (khuyến nghị cho chat)
{ "message": "...", "model": "gemini-1.5-flash" }

// Cân bằng chất lượng/tốc độ
{ "message": "...", "model": "gemini-pro" }
```

### Rate Limits (Free tier):
- **60 requests/minute**
- **1,500 requests/day**
- **1 million tokens/day**

### Best Practices:
- ✅ Sử dụng `gemini-1.5-flash` cho response nhanh
- ✅ Cache các câu hỏi phổ biến
- ✅ Implement rate limiting ở phía client
- ⚠️ Không expose API key ra frontend

## 🐛 Troubleshooting

### "API Key not configured"
➡️ Kiểm tra file `.env`, đảm bảo `GEMINI_API_KEY` có giá trị hợp lệ

### "Model not found"
➡️ Sử dụng model name đúng: `gemini-1.5-flash` hoặc `gemini-pro`

### "Rate limit exceeded"
➡️ Free tier có giới hạn requests. Đợi 1 phút và thử lại

### Response chậm
➡️ Sử dụng `gemini-1.5-flash` thay vì `gemini-pro`

## 📊 Test Results

```
✅ Status endpoint: WORKING
✅ Suggestions endpoint: WORKING
⏳ Chat endpoint: Cần API key hợp lệ để test
```

## 🎯 Next Steps

Sau khi có API key:

1. ✅ Thêm API key vào `.env`
2. 🔄 Restart server
3. 🧪 Chạy `.\test-ai-assistant.ps1`
4. ✅ Verify tất cả tests pass
5. 🚀 Sẵn sàng sử dụng!

## 📞 API Examples

### Ví dụ 1: Hỏi về hệ thống
```json
{
  "message": "Hệ thống có những tính năng gì?"
}
```

### Ví dụ 2: Tư vấn tìm việc
```json
{
  "message": "Tôi là sinh viên mới ra trường, cần làm gì để tìm việc IT?"
}
```

### Ví dụ 3: Hướng dẫn sử dụng
```json
{
  "message": "Làm sao để ứng tuyển vào một công việc?"
}
```

### Ví dụ 4: Tư vấn kỹ năng
```json
{
  "message": "Kỹ năng nào quan trọng cho frontend developer?"
}
```

## ✨ Features Highlight

- 🎯 **Context-aware**: Hiểu rõ về hệ thống tuyển dụng
- 🇻🇳 **Vietnamese support**: Hỗ trợ tiếng Việt tốt
- ⚡ **Fast response**: Sử dụng model flash cho tốc độ cao
- 💰 **Free to use**: Sử dụng free tier của Gemini
- 🛡️ **Error handling**: Xử lý lỗi và validation tốt
- 📝 **Well documented**: Có documentation đầy đủ

---

## 🎉 Module đã sẵn sàng!

Chỉ cần thêm **GEMINI_API_KEY** vào file `.env` là có thể sử dụng ngay! 🚀
