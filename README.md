# Real-Time Chat Application

A modern, feature-rich real-time chat application built with FastAPI (WebSocket) backend and React frontend with shadcn/ui and Tailwind CSS. Supports multiple chat rooms, real-time messaging, and a WhatsApp-like user experience.

## ✨ Features

### Core Functionality

- **Multi-Room Support**: Join and manage multiple chat rooms simultaneously
- **Real-Time Messaging**: Instant message delivery via WebSocket connections
- **Room Management**: Create, join, and leave rooms with unique room codes
- **Shareable Room Links**: Generate and share room links for easy access
- **User Avatars**: Colorful avatars with first letter of username
- **Date Grouping**: Messages grouped by date with separators (Today, Yesterday, or full date)
- **Active Member Tracking**: View all members in a room and see who's currently active

### User Interface

- **Collapsible Sidebar**: Expandable/collapsible sidebar for room navigation (20px when collapsed)
- **Dark Theme**: Modern dark theme for sidebar and room header
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Unread Message Counts**: Badge indicators showing unread messages per room
- **Room Members Modal**: View all active members in a room (WhatsApp-style)
- **Message Timestamps**: Time display for each message
- **System Messages**: Welcome messages, join/leave notifications, and error messages

### Advanced Features

- **Room Validation**: Validates room codes before joining
- **Error Handling**: Graceful error handling with user-friendly messages
- **Connection Management**: Automatic cleanup of disconnected users
- **Message History**: Maintains message history per room
- **URL Parameters**: Direct room joining via URL parameters

## 📁 Project Structure

```
chat-app/
├── backend/                    # FastAPI backend with WebSocket
│   ├── main.py                 # Main application file
│   ├── connection_manager.py   # WebSocket connection management
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   └── room.py             # Room-related endpoints
│   ├── pyproject.toml          # Poetry dependencies
│   ├── run.sh                  # Server startup script
│   └── README.md               # Backend documentation
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── App.jsx             # Main chat application
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css           # Global styles
│   │   ├── components/
│   │   │   ├── RoomSidebar.jsx      # Sidebar component
│   │   │   ├── RoomMembersModal.jsx # Members modal
│   │   │   └── ui/                  # shadcn/ui components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       └── input.jsx
│   │   └── lib/
│   │       └── utils.js         # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .vscode/                     # VS Code settings
│   └── settings.json
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.9+ (for backend)
- Node.js 16+ and npm/yarn (for frontend)
- Poetry (for Python dependency management)

### Backend Setup

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Install Poetry** (if not already installed):

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. **Install dependencies:**

```bash
poetry install
```

4. **Run the server:**

```bash
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:

```bash
./run.sh
```

The backend will be available at `http://localhost:8000`

**API Endpoints:**

- `GET /` - Root endpoint
- `GET /api/rooms/{room_code}/validate` - Validate room code
- `GET /api/rooms/{room_code}/members` - Get room members
- `WS /ws/{room_code}?username={username}` - WebSocket endpoint for chat

### Frontend Setup

1. **Navigate to the frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage Guide

### Getting Started

1. **Start the backend server** (port 8000)
2. **Start the frontend development server** (port 5173)
3. **Open the frontend** in your browser at `http://localhost:5173`

### Joining a Room

#### Method 1: Manual Join

1. Enter your username
2. Enter a room code
3. Click "Join Room"

#### Method 2: Shareable Link

1. Click "Share Room" button in an active room
2. Share the generated link with others
3. Recipients can open the link and enter their username to join directly

### Managing Multiple Rooms

- **Join Multiple Rooms**: Click "Join New Room" button in the sidebar
- **Switch Between Rooms**: Click on any room in the sidebar
- **Collapse Sidebar**: Click the collapse button (←) in the sidebar header
  - Collapsed view shows only room icons with unread counts
  - Click the expand button (→) to restore full sidebar
- **Leave a Room**: Click the X button on a room or "Leave Room" in the header

### Viewing Room Members

1. Click the **Eye icon** (👁️) in the room header
2. View all active members with their avatars
3. See who's currently online (green indicator)
4. Modal auto-refreshes every 2 seconds

### Features Overview

- **Avatars**: Each user gets a unique colored avatar based on their username
- **Date Separators**: Messages are grouped by date (Today, Yesterday, or full date)
- **Unread Counts**: See unread message counts in the sidebar
- **Dark Theme**: Modern dark theme for better visibility
- **Real-Time Updates**: All messages and member statuses update in real-time

## 🛠️ Technologies

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **WebSocket**: Real-time bidirectional communication
- **Python 3.9+**: Programming language
- **Poetry**: Dependency management
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

### Frontend

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Lucide React**: Icon library
- **WebSocket API**: Client-side WebSocket connections

## 🎨 UI Components

- **Room Sidebar**: Collapsible sidebar showing all joined rooms
- **Chat Interface**: Message display with avatars and timestamps
- **Room Header**: Room info, member view, share, and leave buttons
- **Join Dialog**: Modal for joining new rooms
- **Members Modal**: Popup showing all room members and their status
- **Date Separators**: Visual date grouping in message list

## 🔧 Development

### Backend Development

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Building for Production

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**
The backend is ready for production deployment. Consider using:

- Gunicorn with Uvicorn workers
- Environment variables for configuration
- Proper CORS settings for production domains

## 📝 API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available for educational purposes.

## 🐛 Troubleshooting

### Backend Issues

- **Port already in use**: Change the port in the uvicorn command
- **Import errors**: Ensure Poetry environment is activated
- **WebSocket connection failed**: Check CORS settings and server status

### Frontend Issues

- **Module not found**: Run `npm install` again
- **Build errors**: Clear `node_modules` and reinstall
- **WebSocket connection failed**: Ensure backend is running on port 8000

## 🎯 Future Enhancements

Potential features for future development:

- Message persistence with database
- File/image sharing
- Typing indicators
- Message reactions
- Private messaging
- User authentication
- Message search
- Room encryption

---

**Happy Chatting! 💬**
