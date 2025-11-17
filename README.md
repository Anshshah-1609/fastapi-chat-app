# Real-Time Chat Application

A real-time chat application built with FastAPI (WebSocket) backend and React frontend with shadcn/ui and Tailwind CSS.

## Features

- Multiple users can join chat rooms using room codes
- Real-time messaging via WebSocket
- Modern UI with shadcn/ui components and Tailwind CSS
- User join/leave notifications
- Responsive design

## Project Structure

```
chat-app/
├── backend/          # FastAPI backend with WebSocket
│   ├── main.py       # Main application file
│   └── pyproject.toml # Poetry dependencies
└── frontend/         # React frontend
    ├── src/
    │   ├── App.jsx   # Main chat component
    │   └── components/ # UI components
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Poetry (if not already installed):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. Install dependencies:
```bash
poetry install
```

4. Run the server:
```bash
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Start the backend server (port 8000)
2. Start the frontend development server (port 5173)
3. Open the frontend in your browser
4. Enter a username and room code
5. Share the room code with others to join the same chat room
6. Start chatting in real-time!

## Technologies

- **Backend**: FastAPI, WebSocket, Python, Poetry, Uvicorn
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Lucide Icons

