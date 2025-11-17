# Chat App Backend

FastAPI backend with WebSocket support for real-time chat.

## Setup

1. Install Poetry if you haven't already:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Install dependencies:
```bash
poetry install
```

3. Run the server:
```bash
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will run on `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `WS /ws/{room_code}?username={username}` - WebSocket endpoint for chat rooms

