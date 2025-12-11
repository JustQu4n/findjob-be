# AI Assistant - Gemini Chatbot Module

## Tổng quan

Module AI Assistant cung cấp tính năng chatbot thông minh sử dụng Google Gemini AI để hỗ trợ người dùng với các câu hỏi liên quan đến hệ thống tuyển dụng và công việc.

## Tính năng chính

- ✅ Chat với Gemini AI (sử dụng model free: `gemini-1.5-flash`)
- ✅ Context-aware responses về hệ thống tuyển dụng
- ✅ Gợi ý câu hỏi thường gặp
- ✅ Kiểm tra trạng thái cấu hình API
- ✅ Hỗ trợ nhiều ngôn ngữ (chủ yếu tiếng Việt)

## Cấu hình

### 1. Lấy Gemini API Key (Miễn phí)

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy API key

### 2. Cập nhật Environment Variables

Thêm vào file `.env`:

```env
# Gemini API Key (Free model: gemini-1.5-flash)
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Models có sẵn (Free)

- `gemini-1.5-flash` (mặc định) - Nhanh, phù hợp cho chat
- `gemini-pro` - Cân bằng giữa tốc độ và chất lượng

## API Endpoints

### 1. Chat với AI Assistant

**Endpoint:** `POST /api/ai-assistant/chat`

**Request Body:**
```json
{
  "message": "Làm thế nào để tạo hồ sơ xin việc ấn tượng?",
  "model": "gemini-1.5-flash"  // optional, default: gemini-1.5-flash
}
```

**Response:**
```json
{
  "response": "Để tạo hồ sơ xin việc ấn tượng, bạn cần...",
  "model": "gemini-1.5-flash",
  "tokensUsed": 150,
  "timestamp": "2024-03-20T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hệ thống có những tính năng gì?"
  }'
```

### 2. Lấy gợi ý câu hỏi

**Endpoint:** `GET /api/ai-assistant/suggestions`

**Response:**
```json
{
  "suggestions": [
    "Làm thế nào để tạo hồ sơ xin việc ấn tượng?",
    "Tôi nên chuẩn bị gì cho một buổi phỏng vấn?",
    "Các kỹ năng nào đang được tìm kiếm nhiều hiện nay?",
    "Làm sao để theo dõi các công việc tôi đã ứng tuyển?",
    "Tôi muốn đăng tin tuyển dụng, cần làm gì?",
    "Hệ thống có những tính năng gì?"
  ]
}
```

### 3. Kiểm tra trạng thái

**Endpoint:** `GET /api/ai-assistant/status`

**Response:**
```json
{
  "configured": true,
  "message": "AI Assistant is ready"
}
```

## System Context

Chatbot được cấu hình với context về hệ thống tuyển dụng, bao gồm:

### Các chủ đề hỗ trợ:
1. **Tìm kiếm công việc**: Tư vấn về tìm việc, kỹ năng cần thiết
2. **Đăng tin tuyển dụng**: Hướng dẫn employer đăng tin, quản lý ứng viên
3. **Hồ sơ cá nhân**: Tư vấn tạo profile, viết CV
4. **Ứng tuyển**: Hướng dẫn quy trình apply, theo dõi trạng thái
5. **Thông tin công ty**: Cung cấp thông tin về công ty, văn hóa
6. **Kỹ năng & Ngành nghề**: Tư vấn về kỹ năng, xu hướng thị trường

### Tính năng hệ thống:
- Đăng ký/Đăng nhập (Job Seeker & Employer)
- Quản lý hồ sơ (profile, education, experience, skills, projects)
- Tìm kiếm và lọc công việc
- Ứng tuyển và theo dõi application
- Đăng tin tuyển dụng và quản lý ứng viên
- Lưu công việc yêu thích và theo dõi công ty
- Chat giữa employer và candidate
- Nhận thông báo

## Testing

### 1. Kiểm tra cấu hình

```bash
curl http://localhost:5000/api/ai-assistant/status
```

### 2. Test chat với các câu hỏi mẫu

```bash
# Câu hỏi về tìm việc
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tôi muốn tìm việc lập trình viên, cần chuẩn bị gì?"}'

# Câu hỏi về đăng tin
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Làm sao để đăng tin tuyển dụng?"}'

# Câu hỏi về hệ thống
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hệ thống này có tính năng gì?"}'
```

### 3. Test với model khác

```bash
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Top 5 kỹ năng quan trọng cho developer?",
    "model": "gemini-pro"
  }'
```

## Error Handling

### API Key không được cấu hình:
```json
{
  "statusCode": 400,
  "message": "Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.",
  "error": "Bad Request"
}
```

### Lỗi từ Gemini API:
```json
{
  "statusCode": 400,
  "message": "Failed to get response from AI: API key not valid",
  "error": "Bad Request"
}
```

## Best Practices

1. **Rate Limiting**: Gemini free tier có giới hạn requests, nên implement rate limiting
2. **Caching**: Cache các câu hỏi phổ biến để tiết kiệm API calls
3. **Error Handling**: Luôn có fallback response khi API không khả dụng
4. **Security**: Không expose API key ra client, chỉ call từ backend

## Troubleshooting

### Vấn đề: API key không hoạt động
- Kiểm tra API key đã được tạo đúng tại Google AI Studio
- Đảm bảo API key không có khoảng trắng thừa
- Kiểm tra region restrictions (nếu có)

### Vấn đề: Response chậm
- Sử dụng `gemini-1.5-flash` thay vì `gemini-pro` để tăng tốc độ
- Implement timeout cho requests (mặc định 30s)

### Vấn đề: Token limit exceeded
- Rút ngắn system context nếu cần
- Giới hạn độ dài message từ user

## Future Enhancements

- [ ] Conversation history (multi-turn chat)
- [ ] Stream responses for better UX
- [ ] Integration với job database để trả về kết quả cụ thể
- [ ] Multi-language support
- [ ] Analytics và logging
- [ ] Rate limiting
- [ ] Caching layer

## Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "@nestjs/config": "^3.x.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x"
}
```

## References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Pricing](https://ai.google.dev/pricing)
