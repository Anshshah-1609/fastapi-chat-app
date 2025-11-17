import { useEffect, useState, useCallback } from "react";
import { X, Users, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// Generate a consistent color for a username
const getAvatarColor = (username) => {
  if (!username) return "#6B7280";

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#06B6D4",
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Get first letter of username
const getInitial = (username) => {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
};

// Avatar component
const Avatar = ({ username, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        `${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`
      )}
      style={{ backgroundColor: getAvatarColor(username) }}
    >
      {getInitial(username)}
    </div>
  );
};

export function RoomMembersModal({
  roomCode,
  isOpen,
  onClose,
  currentUsername,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async () => {
    if (!roomCode) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/rooms/${encodeURIComponent(
          roomCode
        )}/members`
      );
      const data = await response.json();
      setMembers(data.members || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    if (isOpen && roomCode) {
      fetchMembers();
      // Refresh members every 2 seconds while modal is open
      const interval = setInterval(fetchMembers, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, roomCode, fetchMembers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Room Members
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total} {total === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && members.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No members in this room
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => {
                const isCurrentUser = member.username === currentUsername;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      isCurrentUser
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <div className="relative">
                      <Avatar username={member.username} size="md" />
                      {member.active && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-500 fill-green-500 bg-white dark:bg-gray-800 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.username}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Circle className="h-2 w-2 text-green-500 fill-green-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {member.active ? "Active" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
