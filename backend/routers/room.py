"""Routers for the chat app"""

from fastapi import APIRouter

from connection_manager import manager

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("/{room_code}/validate")
async def validate_room(room_code: str):
    """
    Validate if a room code exists (has active connections or is a valid room).
    For now, we'll consider any room code as valid since rooms are created on first connection.
    In a production app, you might want to check against a database.
    """
    # Room codes are valid if they're non-empty strings
    # In a real app, you might check against a database or active rooms
    if room_code and room_code.strip():
        return {
            "valid": True,
            "room_code": room_code,
            "active": room_code in manager.active_connections
        }
    return {"valid": False, "room_code": room_code}


@router.get("/{room_code}/members")
async def get_room_members(room_code: str):
    """Get all active members in a room"""

    if room_code not in manager.active_connections:
        return {
            "room_code": room_code,
            "members": [],
            "total": 0
        }

    # Get all usernames from active connections in this room
    members = []
    for websocket in manager.active_connections[room_code]:
        if websocket in manager.connection_info:
            room, username = manager.connection_info[websocket]
            if room == room_code:
                members.append({
                    "username": username,
                    "active": True  # All members in active_connections are currently active
                })

    return {
        "room_code": room_code,
        "members": members,
        "total": len(members)
    }
