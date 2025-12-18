# AI Chatbot Frontend - Implementation Specification

## Overview
Build an AI-powered chatbot interface with chat history that integrates with the Gemini AI backend. Users must be authenticated to access the chatbot.

## Technology Stack
- React/Next.js (frontend framework)
- TypeScript (type safety)
- Tailwind CSS or Material-UI (styling)
- Axios or Fetch API (HTTP requests)
- React Query or SWR (data fetching & caching)
- Zustand or Context API (state management)

## API Endpoints

### Base URL
```
http://localhost:5000/api/ai-assistant
```

### Authentication Required
All endpoints require JWT token in header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 1. Send Chat Message
```typescript
POST /chat
Request Body: {
  message: string;
  model?: string; // optional, default: 'gemini-1.5-flash-latest'
}

Response: {
  response: string;
  model: string;
  tokensUsed?: number;
  timestamp: Date;
}
```

### 2. Get Chat History
```typescript
GET /history?limit=50
Response: {
  history: Array<{
    id: string;
    userId: string;
    userMessage: string;
    aiResponse: string;
    model: string;
    tokensUsed?: number;
    userType: string;
    createdAt: Date;
  }>;
  total: number;
}
```

### 3. Delete Chat History
```typescript
DELETE /history
Response: {
  message: string;
}
```

### 4. Get Suggestions
```typescript
GET /suggestions
Response: {
  suggestions: string[];
}
```

### 5. Check Status
```typescript
GET /status
Response: {
  configured: boolean;
  message: string;
}
```

## Components Architecture

### Main Components

#### 1. **ChatbotPage** (Main Container)
```typescript
// Path: src/pages/ChatbotPage.tsx or src/app/chatbot/page.tsx

Features:
- Main layout container
- Manages overall state
- Handles authentication check
- Renders ChatWindow and ChatHistory components

State:
- isLoading: boolean
- error: string | null
- activeTab: 'chat' | 'history'
```

#### 2. **ChatWindow** (Chat Interface)
```typescript
// Path: src/components/chatbot/ChatWindow.tsx

Features:
- Display conversation messages
- Message input box
- Send button
- Auto-scroll to latest message
- Loading indicator while AI responds
- Error handling
- Suggestion chips (clickable quick questions)

State:
- messages: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>
- inputValue: string
- isSending: boolean
- error: string | null

Props:
- onSendMessage: (message: string) => Promise<void>
- suggestions: string[]
```

#### 3. **ChatHistory** (History Panel)
```typescript
// Path: src/components/chatbot/ChatHistory.tsx

Features:
- List of past conversations
- Search/filter functionality
- Delete history button
- Load more pagination
- Click to view conversation details
- Date grouping (Today, Yesterday, Last 7 days, etc.)

State:
- history: ChatHistoryItem[]
- isLoading: boolean
- searchQuery: string
- selectedConversation: string | null

Props:
- onDeleteHistory: () => Promise<void>
- onSelectConversation: (id: string) => void
```

#### 4. **MessageBubble** (Individual Message)
```typescript
// Path: src/components/chatbot/MessageBubble.tsx

Features:
- Different styles for user vs AI messages
- Markdown rendering for AI responses
- Copy button
- Timestamp
- Avatar icons

Props:
- message: {
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }
- onCopy?: () => void
```

#### 5. **SuggestionChips** (Quick Questions)
```typescript
// Path: src/components/chatbot/SuggestionChips.tsx

Features:
- Horizontal scrollable chips
- Click to auto-fill message
- Icon per suggestion category

Props:
- suggestions: string[]
- onSelect: (suggestion: string) => void
- disabled?: boolean
```

## UI/UX Design Specifications

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  Header: "AI Career Assistant" 🤖                   │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│  Chat History       │     Chat Window               │
│  (Left Sidebar)     │     (Main Area)               │
│                     │                               │
│  - Search box       │  ┌─────────────────────────┐ │
│  - Today            │  │ AI: Welcome! How can... │ │
│    • Conv 1         │  └─────────────────────────┘ │
│    • Conv 2         │                               │
│  - Yesterday        │  ┌─────────────────────────┐ │
│    • Conv 3         │  │ User: How to find job?  │ │
│  - Last 7 days      │  └─────────────────────────┘ │
│    • Conv 4         │                               │
│                     │  ┌─────────────────────────┐ │
│  [Delete History]   │  │ AI: To find a job...    │ │
│                     │  └─────────────────────────┘ │
│                     │                               │
│                     │  Suggestions: [Chip1] [Chip2]│
│                     │                               │
│                     │  ┌─────────────────────────┐ │
│                     │  │ Type your message...    │ │
│                     │  │                    [Send]│ │
│                     │  └─────────────────────────┘ │
└─────────────────────┴───────────────────────────────┘
```

### Color Scheme
```typescript
const colors = {
  userMessage: '#E3F2FD', // Light blue
  aiMessage: '#F5F5F5',   // Light grey
  primary: '#1976D2',      // Blue
  accent: '#FF9800',       // Orange
  background: '#FFFFFF',   // White
  text: '#212121',         // Dark grey
  border: '#E0E0E0',       // Light border
}
```

### Responsive Design
- Desktop (>1024px): Side-by-side layout
- Tablet (768px-1024px): Collapsible sidebar
- Mobile (<768px): Tab-based navigation (Chat | History)

## Implementation Steps

### Step 1: Setup API Service
```typescript
// src/services/chatbot.service.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/ai-assistant';

// Get token from localStorage or auth context
const getAuthToken = () => localStorage.getItem('accessToken');

export const chatbotService = {
  async sendMessage(message: string, model?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      { message, model },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async getChatHistory(limit = 50) {
    const response = await axios.get(
      `${API_BASE_URL}/history?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async deleteHistory() {
    const response = await axios.delete(
      `${API_BASE_URL}/history`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  },

  async getSuggestions() {
    const response = await axios.get(`${API_BASE_URL}/suggestions`);
    return response.data;
  },

  async checkStatus() {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  },
};
```

### Step 2: Create Types
```typescript
// src/types/chatbot.types.ts

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ChatHistoryItem {
  id: string;
  userId: string;
  userMessage: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  userType: string;
  createdAt: Date;
}

export interface ChatResponse {
  response: string;
  model: string;
  tokensUsed?: number;
  timestamp: Date;
}

export interface ChatHistoryResponse {
  history: ChatHistoryItem[];
  total: number;
}

export interface SuggestionsResponse {
  suggestions: string[];
}
```

### Step 3: Create Custom Hook
```typescript
// src/hooks/useChatbot.ts

import { useState, useCallback, useEffect } from 'react';
import { chatbotService } from '@/services/chatbot.service';
import { ChatMessage } from '@/types/chatbot.types';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await chatbotService.getSuggestions();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Call API
      const response = await chatbotService.sendMessage(message);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        type: 'ai',
        content: response.response,
        timestamp: new Date(response.timestamp),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = () => setMessages([]);

  return {
    messages,
    isLoading,
    error,
    suggestions,
    sendMessage,
    clearMessages,
  };
};
```

### Step 4: Build ChatWindow Component
```typescript
// src/components/chatbot/ChatWindow.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import { ChatMessage } from '@/types/chatbot.types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  onSendMessage: (message: string) => Promise<void>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  error,
  suggestions,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    await onSendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          🤖 AI Career Assistant
        </h2>
        <p className="text-sm text-gray-500">
          Ask me anything about jobs, careers, and our platform
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Welcome!</p>
            <p>Start a conversation or try one of the suggestions below</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-pulse">AI is thinking...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <SuggestionChips
            suggestions={suggestions}
            onSelect={handleSuggestionClick}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### Step 5: Build MessageBubble Component
```typescript
// src/components/chatbot/MessageBubble.tsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/chatbot.types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    // Optional: Show toast notification
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {/* Avatar & Name */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">
            {isUser ? '👤' : '🤖'}
          </span>
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
        </div>

        {/* Message Content */}
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className="flex items-center justify-between mt-2 text-xs opacity-75">
          <span>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="hover:opacity-100"
              title="Copy to clipboard"
            >
              📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Step 6: Build ChatHistory Component
```typescript
// src/components/chatbot/ChatHistory.tsx

import React, { useState, useEffect } from 'react';
import { chatbotService } from '@/services/chatbot.service';
import { ChatHistoryItem } from '@/types/chatbot.types';

export const ChatHistory: React.FC = () => {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await chatbotService.getChatHistory(100);
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete all chat history?')) return;
    
    try {
      await chatbotService.deleteHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.userMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.aiResponse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupByDate = (items: ChatHistoryItem[]) => {
    const groups: { [key: string]: ChatHistoryItem[] } = {
      Today: [],
      Yesterday: [],
      'Last 7 days': [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    items.forEach((item) => {
      const date = new Date(item.createdAt);
      if (date >= today) {
        groups.Today.push(item);
      } else if (date >= yesterday) {
        groups.Yesterday.push(item);
      } else if (date >= lastWeek) {
        groups['Last 7 days'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return groups;
  };

  const groups = groupByDate(filteredHistory);

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-4">Chat History</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
      />

      {/* History List */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)]">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          Object.entries(groups).map(([group, items]) =>
            items.length > 0 ? (
              <div key={group}>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  {group}
                </h4>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.userMessage}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {item.aiResponse.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null
          )
        )}
      </div>

      {/* Delete Button */}
      {history.length > 0 && (
        <button
          onClick={handleDelete}
          className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete All History
        </button>
      )}
    </div>
  );
};
```

### Step 7: Build Main Page
```typescript
// src/pages/ChatbotPage.tsx or src/app/chatbot/page.tsx

'use client'; // if using Next.js App Router

import React, { useState } from 'react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';
import { ChatHistory } from '@/components/chatbot/ChatHistory';
import { useChatbot } from '@/hooks/useChatbot';

export default function ChatbotPage() {
  const [showHistory, setShowHistory] = useState(true);
  const { messages, isLoading, error, suggestions, sendMessage } = useChatbot();

  return (
    <div className="h-screen flex flex-col">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            AI Career Assistant
          </h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat History */}
        <div
          className={`${
            showHistory ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 shrink-0`}
        >
          <ChatHistory />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 p-4">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            suggestions={suggestions}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
```

## Features Checklist

### Must Have (MVP)
- [x] User authentication check
- [x] Send message to AI
- [x] Display user and AI messages
- [x] Auto-scroll to latest message
- [x] Loading state while AI responds
- [x] Error handling
- [x] Show suggestion chips
- [x] View chat history
- [x] Delete chat history
- [x] Responsive design

### Nice to Have
- [ ] Markdown rendering for AI responses
- [ ] Code syntax highlighting
- [ ] Copy message button
- [ ] Export conversation
- [ ] Voice input
- [ ] Dark mode
- [ ] Typing indicator
- [ ] Message reactions
- [ ] Search in history
- [ ] Filter by date
- [ ] Infinite scroll for history

### Advanced Features
- [ ] Real-time updates (WebSocket)
- [ ] Multi-language support
- [ ] Share conversation link
- [ ] Save favorite responses
- [ ] Chat analytics
- [ ] Model selection dropdown
- [ ] Token usage display
- [ ] Rate limiting indicator

## Error Handling

### Common Errors
1. **401 Unauthorized**: Redirect to login
2. **403 Forbidden**: Show "Access denied" message
3. **404 Not Found**: Check API endpoint
4. **429 Too Many Requests**: Show rate limit message
5. **500 Server Error**: Show "Try again later" message

```typescript
// Example error handler
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 429) {
    return 'Too many requests. Please wait a moment.';
  } else {
    return error.response?.data?.message || 'Something went wrong';
  }
};
```

## Testing Checklist

### Manual Testing
- [ ] Send message successfully
- [ ] Receive AI response
- [ ] View chat history
- [ ] Delete history
- [ ] Click suggestions
- [ ] Test on mobile
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Test with long messages
- [ ] Test with markdown
- [ ] Test error states
- [ ] Test loading states

### Edge Cases
- [ ] Empty message (should be disabled)
- [ ] Very long message (1000+ chars)
- [ ] Special characters
- [ ] Emoji support
- [ ] Multiple rapid messages
- [ ] Network offline
- [ ] Token expired
- [ ] No chat history

## Performance Optimization

1. **Lazy Load History**: Load only recent 50 items initially
2. **Virtual Scrolling**: For long message lists
3. **Debounce Search**: Wait 300ms before filtering
4. **Memoization**: Use React.memo for MessageBubble
5. **Code Splitting**: Lazy load markdown renderer

## Accessibility

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader support
- [ ] Focus management
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Skip to content link

## Deployment Notes

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Build Command
```bash
npm run build
```

### Production Checklist
- [ ] API URL points to production
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)

---

## Quick Start for Copilot

To implement this feature, follow these steps in order:

1. Create the API service file
2. Create type definitions
3. Create the custom hook
4. Build MessageBubble component
5. Build SuggestionChips component
6. Build ChatWindow component
7. Build ChatHistory component
8. Create the main page
9. Add routing
10. Test thoroughly

Use this specification as a reference. Each component should be created in its own file with proper TypeScript types, error handling, and responsive design.
