"""Connection manager for chat rooms"""

import asyncio
import json
from typing import Dict, Set, Optional

from fastapi import WebSocket

from utils import get_current_date


class ConnectionManager:
    """Manager for active connections to rooms"""

    def __init__(self):
        # room_code -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # WebSocket -> (room_code, username)
        self.connection_info: Dict[WebSocket, tuple] = {}

    async def connect(self, websocket: WebSocket, room_code: str, username: str):
        """Connect a websocket to a room"""

        await websocket.accept()

        if room_code not in self.active_connections:
            self.active_connections[room_code] = set()

        self.active_connections[room_code].add(websocket)
        self.connection_info[websocket] = (room_code, username)

        # Send welcome message to the newly connected user
        await self.send_personal_message(
            websocket,
            {
                "type": "system",
                "message": f"Welcome to room {room_code}! You joined as {username}.",
                "timestamp":  get_current_date()
            }
        )

        # Notify others in the room
        await self.broadcast_to_room(
            room_code,
            {
                "type": "user_joined",
                "username": username,
                "message": f"{username} joined the chat",
                "timestamp": get_current_date()
            },
            exclude_websocket=websocket
        )

    def disconnect(self, websocket: WebSocket):
        """Disconnect a websocket from a room"""

        if websocket in self.connection_info:
            room_code, username = self.connection_info[websocket]

            if room_code in self.active_connections:
                self.active_connections[room_code].discard(websocket)

                # Remove room if empty
                if not self.active_connections[room_code]:
                    del self.active_connections[room_code]

            del self.connection_info[websocket]

            # Notify others in the room
            if room_code in self.active_connections:
                asyncio.create_task(self.broadcast_to_room(
                    room_code,
                    {
                        "type": "user_left",
                        "username": username,
                        "message": f"{username} left the chat",
                        "timestamp":  get_current_date()
                    }
                ))

    async def broadcast_to_room(
        self,
        room_code: str,
        message: dict,
        exclude_websocket: Optional[WebSocket] = None
    ) -> None:
        """Broadcast a message to all connections in a room"""

        if room_code not in self.active_connections:
            return

        message_json = json.dumps(message)
        disconnected = set()

        for connection in self.active_connections[room_code]:
            if connection == exclude_websocket:
                continue
            try:
                await connection.send_text(message_json)
            except (RuntimeError, ConnectionError, OSError):
                disconnected.add(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Send a personal message to a specific websocket connection"""

        try:
            await websocket.send_text(json.dumps(message))
        except (RuntimeError, ConnectionError, OSError):
            self.disconnect(websocket)


manager = ConnectionManager()
