# Frontend Notification System - Implementation Specification

## Overview
Implement a real-time notification system for React.js frontend that integrates with the NestJS backend WebSocket API using Socket.IO.

---

## Backend API Details

### WebSocket Connection (Socket.IO)
- **URL**: `http://localhost:5000` (adjust based on your backend URL)
- **Protocol**: Socket.IO with WebSocket transport
- **CORS**: Enabled
- **Namespace**: Default (`/`)

### Socket Events

#### Client → Server Events
```javascript
// Join user's notification room after connection
socket.emit('join', userId);

// Leave user's notification room (optional)
socket.emit('leave', userId);
```

#### Server → Client Events
```javascript
// Receive new notification in real-time
socket.on('notification', (notification) => {
  // notification object structure:
  // {
  //   id: "uuid",
  //   user_id: "uuid",
  //   type: "string",
  //   message: "string",
  //   metadata: {},
  //   is_read: false,
  //   created_at: "ISO date string"
  // }
});
```

### REST API Endpoints

#### Get Notifications List
```http
GET /api/notifications/list?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "application_submitted",
      "message": "New application received",
      "metadata": {},
      "is_read": false,
      "created_at": "2025-12-12T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "is_read": true
}
```

---

## Frontend Implementation Requirements

### 1. Dependencies to Install
```bash
npm install socket.io-client
# Optional for UI components
npm install @headlessui/react @heroicons/react
```

### 2. Project Structure
Create the following files in your React project:

```
src/
├── services/
│   └── notificationService.js       # Socket.IO connection & API calls
├── contexts/
│   └── NotificationContext.js       # React Context for notifications
├── hooks/
│   └── useNotifications.js          # Custom hook to use notifications
├── components/
│   ├── NotificationBell.jsx         # Bell icon with badge
│   ├── NotificationDropdown.jsx     # Dropdown list of notifications
│   ├── NotificationItem.jsx         # Single notification item
│   └── NotificationToast.jsx        # Toast popup for new notifications
└── utils/
    └── notificationHelpers.js       # Helper functions (formatting, etc.)
```

---

## 3. Implementation Details

### A. Notification Service (`src/services/notificationService.js`)

```javascript
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  // Connect to Socket.IO server
  connect(userId, token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${token}` // Optional: if backend validates token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification server:', this.socket.id);
      // Join user's notification room
      this.socket.emit('join', userId);
    });

    this.socket.on('notification', (notification) => {
      console.log('New notification received:', notification);
      // Notify all listeners
      this.listeners.forEach(callback => callback(notification));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  // Disconnect from server
  disconnect(userId) {
    if (this.socket) {
      this.socket.emit('leave', userId);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Add listener for new notifications
  onNotification(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Fetch notifications from REST API
  async fetchNotifications(token, page = 1, limit = 20) {
    const response = await fetch(
      `${BACKEND_URL}/api/notifications/list?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  }

  // Mark notification as read
  async markAsRead(notificationId, token) {
    const response = await fetch(
      `${BACKEND_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  }
}

export default new NotificationService();
```

### B. Notification Context (`src/contexts/NotificationContext.js`)

```javascript
import React, { createContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user and token from your auth context/state
  // This is a placeholder - adjust based on your auth implementation
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('access_token');

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id || !token) return;

    // Connect to WebSocket
    notificationService.connect(user.id, token);

    // Listen for new notifications
    const unsubscribe = notificationService.onNotification((notification) => {
      // Add new notification to the top of the list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
      }

      // Optional: Show toast notification
      // You can trigger a toast here
    });

    // Fetch initial notifications
    loadNotifications();

    // Cleanup on unmount
    return () => {
      unsubscribe();
      notificationService.disconnect(user.id);
    };
  }, [user?.id, token]);

  // Load notifications from API
  const loadNotifications = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.fetchNotifications(token, page);
      setNotifications(response.data);
      
      // Calculate unread count
      const unread = response.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      await notificationService.markAsRead(notificationId, token);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    await Promise.all(
      unreadNotifications.map(n => markAsRead(n.id))
    );
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
```

### C. Custom Hook (`src/hooks/useNotifications.js`)

```javascript
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  
  return context;
};
```

### D. Notification Bell Component (`src/components/NotificationBell.jsx`)

```jsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        {/* Bell Icon (use your icon library) */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
```

### E. Notification Dropdown (`src/components/NotificationDropdown.jsx`)

```jsx
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading,
    error,
    markAllAsRead
  } = useNotifications();
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500">
            Error: {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>No notifications yet</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <a
            href="/notifications"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
```

### F. Notification Item Component (`src/components/NotificationItem.jsx`)

```jsx
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from './utils';

const NotificationItem = ({ notification }) => {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Optional: Navigate based on notification type
    // Example: if notification.type === 'application_submitted', navigate to /applications
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'application_submitted':
        return '📝';
      case 'application_accepted':
        return '✅';
      case 'application_rejected':
        return '❌';
      case 'message_received':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          
          {/* Metadata (optional) */}
          {notification.metadata && notification.metadata.jobTitle && (
            <p className="text-xs text-gray-500 mt-1">
              Job: {notification.metadata.jobTitle}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(notification.created_at)}
          </p>
        </div>

        {/* Unread Indicator */}
        {!notification.is_read && (
          <div className="flex-shrink-0">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for time formatting
const formatDistanceToNow = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export default NotificationItem;
```

### G. Toast Notification Component (`src/components/NotificationToast.jsx`)

```jsx
import React, { useEffect, useState } from 'react';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 text-2xl">
            🔔
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              New Notification
            </h4>
            <p className="text-sm text-gray-700">
              {notification.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
```

---

## 4. Integration Steps

### Step 1: Wrap App with NotificationProvider

In your `src/App.js` or `src/index.js`:

```jsx
import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import App from './App';

function Root() {
  return (
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
}

export default Root;
```

### Step 2: Add NotificationBell to Header/Navbar

```jsx
import React from 'react';
import NotificationBell from './components/NotificationBell';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <h1>CareerVibe</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Add notification bell */}
          <NotificationBell />
          
          {/* Other nav items */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

### Step 3: Optional - Add Toast Notifications

In your `NotificationContext.js`, add toast state:

```javascript
const [toastNotification, setToastNotification] = useState(null);

// In the onNotification listener:
notificationService.onNotification((notification) => {
  setNotifications(prev => [notification, ...prev]);
  if (!notification.is_read) {
    setUnreadCount(prev => prev + 1);
  }
  
  // Show toast
  setToastNotification(notification);
});

// Add to context value
const value = {
  // ...existing values
  toastNotification,
  clearToast: () => setToastNotification(null)
};
```

Then in your `App.js`:

```jsx
import { useNotifications } from './hooks/useNotifications';
import NotificationToast from './components/NotificationToast';

function App() {
  const { toastNotification, clearToast } = useNotifications();
  
  return (
    <div>
      {/* Your app content */}
      
      {/* Toast notification */}
      {toastNotification && (
        <NotificationToast
          notification={toastNotification}
          onClose={clearToast}
        />
      )}
    </div>
  );
}
```

---

## 5. Environment Variables

Create `.env` file in your React project:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## 6. Styling Considerations

The examples above use Tailwind CSS classes. If you're using different styling:

- **Plain CSS**: Create separate CSS files for each component
- **Styled Components**: Convert the className styles to styled components
- **Material-UI**: Use MUI components like Badge, Menu, IconButton
- **Ant Design**: Use Ant Design's Badge, Dropdown, Notification components

---

## 7. Testing

### Test WebSocket Connection

1. Open browser DevTools → Network → WS tab
2. You should see a WebSocket connection to your backend
3. Check Console for connection logs

### Test Real-time Notifications

1. Login as a job seeker
2. Open notifications panel
3. In another browser/incognito, login as employer and change an application status
4. You should see the notification appear in real-time in the job seeker's panel

### Test REST API

1. Open Network tab
2. Notifications should be fetched on mount
3. Clicking "mark as read" should send PATCH request

---

## 8. Advanced Features (Optional)

### A. Notification Sounds
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/notification-sound.mp3');
  audio.play();
};

// In onNotification listener
notificationService.onNotification((notification) => {
  // ... existing code
  playNotificationSound();
});
```

### B. Browser Notifications
```javascript
const showBrowserNotification = (notification) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New Notification', {
      body: notification.message,
      icon: '/logo.png'
    });
  }
};

// Request permission on mount
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

### C. Infinite Scroll for Notifications
```javascript
const loadMore = async () => {
  const nextPage = currentPage + 1;
  const response = await notificationService.fetchNotifications(token, nextPage);
  setNotifications(prev => [...prev, ...response.data]);
  setCurrentPage(nextPage);
};
```

### D. Filter Notifications by Type
```javascript
const [filter, setFilter] = useState('all'); // 'all', 'unread', 'application', etc.

const filteredNotifications = notifications.filter(n => {
  if (filter === 'all') return true;
  if (filter === 'unread') return !n.is_read;
  return n.type === filter;
});
```

---

## 9. Troubleshooting

### WebSocket not connecting
- Check CORS settings on backend
- Verify backend URL in environment variables
- Check browser console for errors
- Ensure Socket.IO client version matches server version

### Notifications not appearing in real-time
- Verify `socket.emit('join', userId)` is called after connection
- Check backend logs to see if notification is emitted
- Verify user is logged in and userId is correct

### High memory usage
- Implement cleanup in useEffect
- Disconnect socket when component unmounts
- Limit number of notifications stored in state

---

## 10. Security Considerations

1. **Authentication**: Always send JWT token with Socket.IO connection
2. **Validation**: Validate notification data on both client and server
3. **Rate Limiting**: Implement rate limiting on backend
4. **XSS Prevention**: Sanitize notification messages before rendering
5. **HTTPS**: Use WSS (secure WebSocket) in production

---

## Summary

This specification provides:
- ✅ Real-time WebSocket connection using Socket.IO
- ✅ React Context for global notification state
- ✅ Custom hook for easy access
- ✅ Bell icon with unread badge
- ✅ Dropdown notification list
- ✅ Toast notifications for new messages
- ✅ Mark as read functionality
- ✅ Integration with REST API
- ✅ Responsive UI components
- ✅ Error handling and loading states

Follow the implementation steps above to integrate the notification system into your React frontend.
