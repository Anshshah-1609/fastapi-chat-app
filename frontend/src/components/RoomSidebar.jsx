import { Button } from "./ui/button";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoomSidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  onLeaveRoom,
  onJoinNewRoom,
}) {
  const joinedRooms = Object.keys(rooms).filter(
    (roomCode) => rooms[roomCode].connected
  );

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Chat Rooms</h2>
        <p className="text-xs text-gray-400 mt-1">
          {joinedRooms.length} room{joinedRooms.length !== 1 ? "s" : ""} joined
        </p>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {joinedRooms.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            No rooms joined
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {joinedRooms.map((roomCode) => {
              const room = rooms[roomCode];
              const isActive = roomCode === currentRoom;
              const unreadCount = room.unreadCount || 0;

              return (
                <div
                  key={roomCode}
                  className={cn(
                    "group relative flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  )}
                  onClick={() => onSelectRoom(roomCode)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{roomCode}</p>
                    {room.lastMessage && (
                      <p
                        className={cn(
                          "text-xs truncate",
                          isActive ? "text-gray-200" : "text-gray-400"
                        )}
                      >
                        {room.lastMessage}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && !isActive && (
                    <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                      isActive
                        ? "text-white hover:bg-blue-700"
                        : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeaveRoom(roomCode);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join New Room Button */}
      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={onJoinNewRoom}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
          variant="outline"
          size="sm"
        >
          + Join New Room
        </Button>
      </div>
    </div>
  );
}
