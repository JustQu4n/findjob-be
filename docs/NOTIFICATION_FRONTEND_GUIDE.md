# Hướng Dẫn Frontend - Hệ Thống Thông Báo

## Tổng Quan
Document này mô tả cách implement giao diện frontend cho hệ thống thông báo realtime với các tính năng:
- Hiển thị số lượng thông báo chưa đọc (badge)
- Danh sách thông báo
- Đánh dấu đã đọc (single & all)
- WebSocket realtime updates

---

## API Endpoints

### 1. Đếm Thông Báo Chưa Đọc
```
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "unread_count": 5
}
```

### 2. Lấy Danh Sách Thông Báo
```
GET /api/notifications/list?page=1&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "NEW_APPLICATION",
      "message": "Bạn có ứng viên mới cho tin: Senior Developer",
      "metadata": {
        "application_id": "uuid",
        "job_post_id": "uuid"
      },
      "is_read": false,
      "created_at": "2026-01-02T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

### 3. Đánh Dấu 1 Thông Báo Đã Đọc
```
PATCH /api/notifications/:id/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "is_read": true,
  "message": "...",
  "created_at": "..."
}
```

### 4. Đánh Dấu Tất Cả Đã Đọc
```
PATCH /api/notifications/mark-all-read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

---

## Giao Diện 1: Notification Badge (Biểu Tượng Đếm)

### Mô Tả
Badge hiển thị số lượng thông báo chưa đọc trên icon bell/notification ở header/navbar.

### Vị Trí
- Header/Navbar (góc phải)
- Luôn hiển thị khi user đã login
- Badge màu đỏ với số lượng

### UI Components

```jsx
// NotificationBadge.jsx (React example)
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react'; // hoặc icon library khác

const NotificationBadge = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count khi component mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds để cập nhật
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Lắng nghe WebSocket realtime notification
  useEffect(() => {
    // Khi nhận notification mới qua WebSocket
    const handleNewNotification = (notification) => {
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    };

    // Subscribe to socket event
    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <div className="notification-badge-container" onClick={onClick}>
      <Bell className="bell-icon" size={24} />
      {unreadCount > 0 && (
        <span className="badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
```

### CSS Styling

```css
/* NotificationBadge.css */
.notification-badge-container {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-badge-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.bell-icon {
  color: #333;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444; /* red-500 */
  color: white;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

---

## Giao Diện 2: Notification Dropdown Panel

### Mô Tả
Panel/Dropdown hiển thị danh sách thông báo khi click vào badge. Bao gồm:
- Header với nút "Đánh dấu tất cả đã đọc"
- Danh sách thông báo (scroll)
- Phân biệt đã đọc/chưa đọc
- Link đến trang chi tiết (nếu có)

### Vị Trí
- Dropdown từ notification badge
- Absolute position dưới badge
- Width: 350-400px
- Max height: 500px (scroll)

### UI Components

```jsx
// NotificationPanel.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { X, Check } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications/list?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );
      const data = await response.json();
      
      if (page === 1) {
        setNotifications(data.data);
      } else {
        setNotifications(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.data.length === 20);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      
      // Update unread count
      onUnreadCountChange();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      // Update all notifications to read
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Update unread count to 0
      onUnreadCountChange();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.metadata) {
      const { application_id, job_post_id, interview_id } = notification.metadata;
      
      switch (notification.type) {
        case 'NEW_APPLICATION':
          window.location.href = `/employer/applications/${application_id}`;
          break;
        case 'APPLICATION_SUBMITTED':
          window.location.href = `/jobseeker/applications`;
          break;
        case 'INTERVIEW_ASSIGNED':
          window.location.href = `/interviews/${interview_id}`;
          break;
        default:
          break;
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="notification-backdrop" onClick={onClose} />
      
      {/* Panel */}
      <div className="notification-panel">
        {/* Header */}
        <div className="panel-header">
          <h3>Thông báo</h3>
          <div className="header-actions">
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả đã đọc"
            >
              <Check size={16} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading && page === 1 ? (
            <div className="loading">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="empty">
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-content">
                    <div className="notification-type">
                      {getNotificationIcon(notif.type)}
                      <span className="type-label">{getTypeLabel(notif.type)}</span>
                    </div>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </span>
                  </div>
                  {!notif.is_read && <div className="unread-dot" />}
                </div>
              ))}
              
              {/* Load More */}
              {hasMore && (
                <button
                  className="load-more-btn"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Helper functions
const getNotificationIcon = (type) => {
  const icons = {
    NEW_APPLICATION: '📝',
    APPLICATION_SUBMITTED: '✅',
    INTERVIEW_ASSIGNED: '🎯',
    INTERVIEW_COMPLETED: '✨',
  };
  return icons[type] || '📢';
};

const getTypeLabel = (type) => {
  const labels = {
    NEW_APPLICATION: 'Đơn ứng tuyển mới',
    APPLICATION_SUBMITTED: 'Đã nộp đơn',
    INTERVIEW_ASSIGNED: 'Phỏng vấn',
    INTERVIEW_COMPLETED: 'Hoàn thành',
  };
  return labels[type] || 'Thông báo';
};

export default NotificationPanel;
```

### CSS Styling

```css
/* NotificationPanel.css */
.notification-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 998;
}

.notification-panel {
  position: absolute;
  top: 60px; /* Adjust based on header height */
  right: 10px;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mark-all-btn,
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
}

.mark-all-btn:hover,
.close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  max-height: 440px;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #eff6ff; /* blue-50 */
}

.notification-content {
  flex: 1;
}

.notification-type {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.type-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.notification-message {
  font-size: 14px;
  color: #111827;
  margin: 4px 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #3b82f6; /* blue-500 */
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 8px;
  align-self: center;
}

.loading,
.empty {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.load-more-btn {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background-color: #f9fafb;
}

.load-more-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
```

---

## Component Tích Hợp

### Main App Component

```jsx
// App.jsx or Header.jsx
import React, { useState } from 'react';
import NotificationBadge from './NotificationBadge';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleBadgeClick = () => {
    setIsPanelOpen(prev => !prev);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  const handleUnreadCountChange = async () => {
    // Refresh unread count
    const response = await fetch('/api/notifications/unread-count', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    setUnreadCount(data.unread_count);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">My App</div>
        
        <nav className="nav-menu">
          {/* Navigation items */}
        </nav>

        <div className="header-actions">
          <NotificationBadge 
            onClick={handleBadgeClick}
            unreadCount={unreadCount}
          />
          
          <NotificationPanel
            isOpen={isPanelOpen}
            onClose={handlePanelClose}
            onUnreadCountChange={handleUnreadCountChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
```

---

## WebSocket Integration (Optional)

### Setup Socket Connection

```javascript
// socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Use in Component

```javascript
import { connectSocket, getSocket } from './socket';

useEffect(() => {
  const token = getToken();
  const socket = connectSocket(token);

  socket.on('notification', (notification) => {
    // Add new notification to list
    setNotifications(prev => [notification, ...prev]);
    
    // Update unread count
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Show toast notification
    toast.info(notification.message);
  });

  return () => {
    socket.off('notification');
  };
}, []);
```

---

## Mobile Responsive

```css
/* Mobile styles */
@media (max-width: 768px) {
  .notification-panel {
    position: fixed;
    top: auto;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-height: 70vh;
    border-radius: 16px 16px 0 0;
  }

  .notification-item {
    padding: 16px;
  }
}
```

---

## Testing Checklist

- [ ] Badge hiển thị đúng số lượng unread
- [ ] Badge cập nhật realtime khi có notification mới
- [ ] Panel mở/đóng smooth
- [ ] Click notification đánh dấu đã đọc
- [ ] Nút "Đánh dấu tất cả" hoạt động
- [ ] Scroll load more notifications
- [ ] Navigation đến trang chi tiết đúng
- [ ] Responsive trên mobile
- [ ] WebSocket reconnect khi mất kết nối
- [ ] Handle errors gracefully

---

## Performance Tips

1. **Debounce API calls** - Tránh gọi API quá nhiều lần
2. **Cache notifications** - Lưu trong state/localStorage
3. **Lazy load** - Chỉ fetch khi mở panel
4. **Optimize re-renders** - Dùng React.memo, useMemo
5. **Virtual scrolling** - Nếu có nhiều notifications (1000+)

---

## Security Notes

- Always validate token trước khi gọi API
- Không expose sensitive data trong metadata
- Sanitize HTML trong notification message
- Rate limiting trên server để tránh spam
