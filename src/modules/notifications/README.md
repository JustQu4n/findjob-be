README - Notifications (Realtime) Testing

Mục tiêu
- Hướng dẫn nhanh cách thử tính năng Realtime Notifications của backend.
- Gồm: chuẩn bị, cách kết nối Socket.IO client, cách kích hoạt notification từ API (đăng apply / thay đổi trạng thái), và kiểm tra DB.

Vị trí
- Module backend: `src/modules/notifications`
- Entity DB: `notifications` (migration `1763717100000-CreateNotifications.ts`)

Yêu cầu (Prerequisites)
- Backend đã chạy (dev hoặc production) và có thể truy cập API.
- Migrations đã chạy: `npm run migration:run` (để tạo bảng `notifications` và các thay đổi khác).
- Có account user/employer sẵn để đăng nhập và lấy JWT.
- Nếu chạy locally, đảm bảo `app.port` (mặc định 5000) không bị trùng.

Các bước kiểm thử

1) Build / chạy backend
- Chạy migration:

```powershell
npm run migration:run
```

- Start dev (hot-reload) hoặc prod build:

```powershell
# Dev
npm run start:dev

# Hoặc prod (build + node)
npm run start:prod
```

2) Lấy token (login)
- Đăng nhập để lấy JWT (ví dụ endpoint `POST /api/auth/login`).
- Lưu `access_token` (Bearer) để gọi các endpoint REST.

3) Kết nối Socket.IO client (ví dụ Node script)
- Tạo file `test-client.js` (hoặc chạy trong Node REPL). Ví dụ dùng `socket.io-client`:

```javascript
// test-client.js
const io = require('socket.io-client');

// Thay URL nếu cần
const SERVER_URL = 'http://localhost:5000';

// Nếu gateway dùng namespace hoặc path khác, điều chỉnh accordingly
const socket = io(SERVER_URL, {
  transports: ['websocket'],
  // Nếu bạn muốn gửi token cho socket auth, gắn vào query/extraHeaders
  // auth: { token: 'Bearer <ACCESS_TOKEN>' }
});

// Replace <USER_ID> with the numeric/uuid id of the user you want to listen for
const USER_ID = '<USER_ID_PLACEHOLDER>';

socket.on('connect', () => {
  console.log('connected', socket.id);
  // Current gateway expects clients to emit 'join' with their userId
  socket.emit('join', USER_ID);
});

socket.on('notification', (payload) => {
  console.log('Received notification:', payload);
});

socket.on('disconnect', () => console.log('disconnected'));

// Keep process alive
setInterval(() => {}, 1000);
```

- Cài phụ thuộc và chạy client:

```powershell
npm install socket.io-client
node test-client.js
```

4) Kích hoạt notification từ API
- Cách 1: Submit một application (jobseeker -> employer) để backend tạo notification cho employer.
  - Endpoint ví dụ (project có thể khác): `POST /api/jobseeker/applications/submit` (multipart/form-data, attach resume file).
  - Thêm header `Authorization: Bearer <ACCESS_TOKEN>` của jobseeker.

- Cách 2: Employer cập nhật trạng thái application (ví dụ accept/reject) — backend sẽ gửi notification cho jobseeker.
  - Endpoint ví dụ: `PATCH /api/employer/application/applications/:applicationId/status` với body `{ "status": "accepted" }`.
  - Thêm header `Authorization: Bearer <EMPLOYER_ACCESS_TOKEN>`.

Ví dụ CURL (status update):

```powershell
# Replace placeholders
$access = '<EMPLOYER_ACCESS_TOKEN>'
$applicationId = '<APPLICATION_ID>'

curl -X PATCH "http://localhost:5000/api/employer/application/applications/$applicationId/status" -H "Authorization: Bearer $access" -H "Content-Type: application/json" -d '{"status":"accepted"}'
```

Lưu ý: Các đường dẫn endpoint có thể khác tùy cách project định tuyến; xem console logs khi backend khởi động để biết mapping thực tế (NestJS prints mapped routes).

5) Quan sát client
- Nếu client đã join `user:<USER_ID>` room, nó sẽ nhận sự kiện `notification` kèm payload notification (DB record) ngay sau khi action trigger.

6) Kiểm tra DB
- Bảng `notifications` lưu các notification đã gửi. Bạn có thể query:

```sql
SELECT * FROM notifications WHERE user_id = '<USER_ID>' ORDER BY created_at DESC LIMIT 10;
```

Trường thông dụng trong `notifications`:
- `id`: uuid
- `user_id`: uuid (người nhận)
- `type`: text (ví dụ 'application_submitted' / 'application_status_updated')
- `message`: text
- `metadata`: jsonb (thông tin bổ sung, e.g., application id)
- `is_read`: boolean
- `created_at`: timestamp

Gợi ý debug
- Nếu không thấy notification trên client:
  - Kiểm tra client có thực sự kết nối không (socket connected?)
  - Kiểm tra server logs khi action được thực hiện: NotificationsService.createNotification(...) có thrown error?
  - Kiểm tra token/auth cho endpoint: nếu request bị 401 thì backend không tạo notification.
  - Kiểm tra migrations đã được áp dụng (bảng `notifications` tồn tại).
  - Nếu client dùng userId giả, server không thực hiện token-auth for socket join — hãy đảm bảo client dùng đúng user id hoặc implement socket JWT auth (recommended).

Tùy chọn: gửi notification thủ công
- Nếu bạn muốn gửi notification trực tiếp từ backend để test, mở một route tạm thời (dev) hoặc dùng Nest tinker script để gọi `NotificationsService.sendToUser(userId, { type: 'test', message: 'Hello' })`.

Ví dụ nhanh (Node snippet trong Nest runtime hoặc REPL):
```javascript
// Pseudocode within Nest context
await notificationsService.sendToUser('<USER_ID>', { type: 'test', message: 'Test push', metadata: { foo: 'bar' } });
```

Bảo mật & cải tiến
- Hiện gateway mặc định cho phép client tự `emit('join', userId)`; người dùng có thể giả mạo. Đề xuất:
  - Triển khai JWT auth cho socket (verify token trong `handleConnection`) và auto-join room dựa trên payload.sub.
  - Hoặc require server-only event call để thêm socket vào room.

Kết luận
- README này cung cấp các bước cơ bản để test tính năng Notifications realtime.
- Nếu bạn muốn, tôi có thể:
  - Thêm một tiện ích test HTTP endpoint `POST /dev/notifications/send` (dev-only) để gửi notification thủ công.
  - Triển khai socket JWT authentication tự động khi kết nối.

Nếu cần phiên bản tiếng Anh hoặc ví dụ Postman collection, báo cho tôi biết.