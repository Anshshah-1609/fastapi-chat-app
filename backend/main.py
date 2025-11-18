"""Chat App Backend"""

import json
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from utils import get_current_date
from routers import room_router
from connection_manager import manager

app = FastAPI(title="Chat App API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Room router
app.include_router(room_router)


@app.get("/")
async def root():
    """Root endpoint"""

    return {"message": "Chat App API is running"}


@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    """WebSocket endpoint for chat rooms"""

    # Get username from query params
    username = websocket.query_params.get("username", "Anonymous")

    await manager.connect(websocket, room_code, username)

    try:
        while True:
            data = await websocket.receive_text()

            try:
                message_data = json.loads(data)
            except json.JSONDecodeError:
                # Send error message to the user who sent invalid JSON
                await manager.send_personal_message(
                    websocket,
                    {
                        "type": "error",
                        "message": "Invalid message format. Please send valid JSON.",
                        "timestamp": get_current_date()
                    }
                )
                continue

            content = message_data.get("content", "").strip()

            # Validate message content
            if not content:
                await manager.send_personal_message(
                    websocket,
                    {
                        "type": "error",
                        "message": "Message cannot be empty.",
                        "timestamp": get_current_date()
                    }
                )
                continue

            # Create message object
            message = {
                "type": "message",
                "username": username,
                "content": content,
                "timestamp": get_current_date(),
                "id": str(uuid.uuid4())
            }

            # Broadcast to all in the room
            await manager.broadcast_to_room(room_code, message)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
