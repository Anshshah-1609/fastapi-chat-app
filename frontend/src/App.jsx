import { useState, useEffect, useRef, useMemo } from "react";
import { Send, Users, Share2, Check, Plus, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { RoomSidebar } from "./components/RoomSidebar";
import { RoomMembersModal } from "./components/RoomMembersModal";

function App() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState("");
  const [isValidatingRoom, setIsValidatingRoom] = useState(false);
  const [roomValidationError, setRoomValidationError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Multi-room state management
  const [rooms, setRooms] = useState({}); // roomCode -> { messages, ws, connected, unreadCount, lastMessage }
  const [currentRoom, setCurrentRoom] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const wsRefs = useRef({}); // roomCode -> WebSocket
  const messagesEndRef = useRef(null);
  const currentRoomRef = useRef("");

  const scrollToBottom = (smooth = false) => {
    if (messagesEndRef.current) {
      // Scroll to the bottom of the container (newest messages)
      const scrollHeight = messagesEndRef.current.scrollHeight;
      const clientHeight = messagesEndRef.current.clientHeight;
      const maxScrollTop = scrollHeight - clientHeight;

      if (smooth) {
        messagesEndRef.current.scrollTo({
          top: maxScrollTop,
          behavior: "smooth",
        });
      } else {
        messagesEndRef.current.scrollTop = maxScrollTop;
      }
    }
  };

  const currentRoomMessages = useMemo(
    () => rooms[currentRoom]?.messages || [],
    [rooms, currentRoom]
  );

  // Scroll to show newest messages (top of reversed container) when messages change
  useEffect(() => {
    if (currentRoomMessages.length > 0) {
      // Small delay to ensure DOM is updated, then scroll to show newest messages
      const timeoutId = setTimeout(() => {
        scrollToBottom(true); // Use smooth scroll for new messages
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentRoomMessages]);

  // Initial scroll to show newest messages when room is selected
  useEffect(() => {
    if (currentRoom) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(false); // Instant scroll on room change to show newest
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [currentRoom]);

  const validateRoomCode = async (code) => {
    if (!code || !code.trim()) {
      setRoomValidationError("Room code cannot be empty");
      return false;
    }

    setIsValidatingRoom(true);
    setRoomValidationError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/rooms/${encodeURIComponent(code)}/validate`
      );
      const data = await response.json();

      if (data.valid) {
        setRoomValidationError("");
        return true;
      } else {
        setRoomValidationError(
          "Invalid room code. Please check and try again."
        );
        return false;
      }
    } catch (error) {
      console.error("Error validating room:", error);
      setRoomValidationError("Failed to validate room code. Please try again.");
      return false;
    } finally {
      setIsValidatingRoom(false);
    }
  };

  // Check for room code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get("room");

    if (roomFromUrl && !username) {
      setRoomCodeFromUrl(roomFromUrl);
      setRoomCode(roomFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToRoom = async (roomCodeToJoin = null) => {
    const codeToUse = (roomCodeToJoin || roomCode).trim();

    if (!username.trim()) {
      alert("Please enter your username");
      return;
    }

    if (!codeToUse) {
      alert("Please enter a room code");
      return;
    }

    // Check if already connected to this room
    if (rooms[codeToUse]?.connected) {
      setCurrentRoom(codeToUse);
      setShowJoinDialog(false);
      setRoomCode("");
      return;
    }

    // Validate room code if not from URL or if it changed
    if (!roomCodeFromUrl || codeToUse !== roomCodeFromUrl) {
      const isValid = await validateRoomCode(codeToUse);
      if (!isValid) {
        return;
      }
    }

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${codeToUse}?username=${encodeURIComponent(
        username
      )}`
    );

    // Initialize room state
    setRooms((prev) => ({
      ...prev,
      [codeToUse]: {
        messages: [],
        connected: false,
        unreadCount: 0,
        lastMessage: null,
      },
    }));

    ws.onopen = () => {
      setCurrentUsername(username);
      setRooms((prev) => ({
        ...prev,
        [codeToUse]: {
          ...prev[codeToUse],
          connected: true,
        },
      }));
      setCurrentRoom(codeToUse);
      currentRoomRef.current = codeToUse;
      wsRefs.current[codeToUse] = ws;
      setShowJoinDialog(false);
      setRoomCode("");
      setRoomCodeFromUrl("");
      // Update URL without reload
      window.history.pushState({}, "", `?room=${codeToUse}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setRooms((prev) => {
        const roomData = prev[codeToUse] || { messages: [] };
        const newMessages = [...roomData.messages, data];
        const lastMessage =
          data.type === "message"
            ? `${data.username}: ${data.content}`.substring(0, 50)
            : data.message || roomData.lastMessage;

        // Increment unread count if not current room (use ref for current value)
        const unreadCount =
          codeToUse === currentRoomRef.current
            ? 0
            : (roomData.unreadCount || 0) + 1;

        return {
          ...prev,
          [codeToUse]: {
            ...roomData,
            messages: newMessages,
            lastMessage,
            unreadCount,
          },
        };
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert(
        "Failed to connect to chat room. Please check if the server is running."
      );
      setRooms((prev) => {
        const updated = { ...prev };
        delete updated[codeToUse];
        return updated;
      });
    };

    ws.onclose = () => {
      setRooms((prev) => {
        const updated = { ...prev };
        if (updated[codeToUse]) {
          updated[codeToUse] = {
            ...updated[codeToUse],
            connected: false,
          };
        }
        return updated;
      });

      if (currentRoomRef.current === codeToUse) {
        // If leaving current room, switch to another or clear
        setRooms((prev) => {
          const otherRooms = Object.keys(prev).filter(
            (r) => r !== codeToUse && prev[r]?.connected
          );
          if (otherRooms.length > 0) {
            setCurrentRoom(otherRooms[0]);
            currentRoomRef.current = otherRooms[0];
          } else {
            setCurrentRoom("");
            currentRoomRef.current = "";
          }
          return prev;
        });
      }

      delete wsRefs.current[codeToUse];
    };
  };

  const sendMessage = () => {
    if (!currentRoom || !messageInput.trim()) {
      return;
    }

    const ws = wsRefs.current[currentRoom];
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify({ content: messageInput }));
    setMessageInput("");
  };

  const leaveRoom = (roomCodeToLeave) => {
    const ws = wsRefs.current[roomCodeToLeave];
    if (ws) {
      ws.close();
    }

    setRooms((prev) => {
      const updated = { ...prev };
      delete updated[roomCodeToLeave];
      return updated;
    });

    delete wsRefs.current[roomCodeToLeave];

    // If leaving current room, switch to another
    if (currentRoomRef.current === roomCodeToLeave) {
      const otherRooms = Object.keys(rooms).filter(
        (r) => r !== roomCodeToLeave && rooms[r]?.connected
      );
      if (otherRooms.length > 0) {
        setCurrentRoom(otherRooms[0]);
        currentRoomRef.current = otherRooms[0];
      } else {
        setCurrentRoom("");
        currentRoomRef.current = "";
      }
    }
  };

  const selectRoom = (roomCode) => {
    setCurrentRoom(roomCode);
    currentRoomRef.current = roomCode;
    // Clear unread count when switching to room
    setRooms((prev) => ({
      ...prev,
      [roomCode]: {
        ...prev[roomCode],
        unreadCount: 0,
      },
    }));
    window.history.pushState({}, "", `?room=${roomCode}`);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${currentRoom}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a consistent color for a username
  const getAvatarColor = (username) => {
    if (!username) return "#6B7280";

    // Generate a hash from the username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Predefined color palette for avatars
    const colors = [
      "#EF4444", // red
      "#F59E0B", // amber
      "#10B981", // emerald
      "#3B82F6", // blue
      "#8B5CF6", // violet
      "#EC4899", // pink
      "#14B8A6", // teal
      "#F97316", // orange
      "#6366F1", // indigo
      "#06B6D4", // cyan
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
      sm: "w-6 h-6 text-xs",
      md: "w-8 h-8 text-sm",
      lg: "w-10 h-10 text-base",
    };

    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
        style={{ backgroundColor: getAvatarColor(username) }}
      >
        {getInitial(username)}
      </div>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    } else {
      // Format as "Day, Month Date, Year" (e.g., "Monday, January 15, 2024")
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getDateKey = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const msgDate = getDateKey(msg.timestamp);

      // Add date separator if date changed
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        grouped.push({
          type: "date_separator",
          date: msg.timestamp,
          key: `date-${msgDate}-${index}`,
        });
      }

      // Add the message
      grouped.push({
        ...msg,
        key: `msg-${index}`,
      });
    });

    return grouped;
  };

  const hasJoinedRooms = Object.keys(rooms).some(
    (roomCode) => rooms[roomCode]?.connected
  );

  // Initial join screen (no username set)
  if (!username && !hasJoinedRooms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Join Chat Room
            </CardTitle>
            <CardDescription className="text-center">
              {roomCodeFromUrl
                ? "Enter your username to join the room"
                : "Enter your username and room code to start chatting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isValidatingRoom && connectToRoom()
                }
                autoFocus
              />
            </div>
            {!roomCodeFromUrl && (
              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium">
                  Room Code
                </label>
                <Input
                  id="roomCode"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value);
                    setRoomValidationError("");
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isValidatingRoom && connectToRoom()
                  }
                />
                {roomValidationError && (
                  <p className="text-sm text-destructive">
                    {roomValidationError}
                  </p>
                )}
              </div>
            )}
            {roomCodeFromUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Code</label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono font-semibold">
                    {roomCodeFromUrl}
                  </p>
                </div>
                {roomValidationError && (
                  <p className="text-sm text-destructive">
                    {roomValidationError}
                  </p>
                )}
              </div>
            )}
            <Button
              onClick={() => connectToRoom()}
              className="w-full"
              size="lg"
              disabled={isValidatingRoom}
            >
              {isValidatingRoom ? "Validating..." : "Join Room"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main chat interface with sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex h-screen">
      {/* Sidebar */}
      {hasJoinedRooms && (
        <RoomSidebar
          rooms={rooms}
          currentRoom={currentRoom}
          onSelectRoom={selectRoom}
          onLeaveRoom={leaveRoom}
          onJoinNewRoom={() => setShowJoinDialog(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!currentRoom ? (
          // No room selected
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Select a Room
                </CardTitle>
                <CardDescription className="text-center">
                  Choose a room from the sidebar or join a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowJoinDialog(true)}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join New Room
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-700 shadow-sm">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      Room: {currentRoom}
                    </h1>
                    <p className="text-sm text-gray-400">
                      You: {currentUsername}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowMembersModal(true)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                    title="View Members"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyRoomLink}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Share Room
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => leaveRoom(currentRoom)}
                    className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                  >
                    Leave Room
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-6"
              ref={messagesEndRef}
            >
              <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {(() => {
                  const messages = rooms[currentRoom]?.messages || [];
                  const groupedMessages = groupMessagesByDate(messages);

                  return groupedMessages.map((item) => {
                    // Render date separator
                    if (item.type === "date_separator") {
                      return (
                        <div
                          key={item.key}
                          className="flex justify-center my-6"
                        >
                          <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-medium">
                            {formatDate(item.date)}
                          </div>
                        </div>
                      );
                    }

                    // Render message
                    const msg = item;
                    const isOwnMessage = msg.username === currentUsername;
                    const isSystemMessage =
                      msg.type === "user_joined" ||
                      msg.type === "user_left" ||
                      msg.type === "system";
                    const isErrorMessage = msg.type === "error";

                    if (isSystemMessage) {
                      return (
                        <div
                          key={msg.key || msg.id}
                          className="flex justify-center"
                        >
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm">
                            {msg.message || msg.content}
                          </div>
                        </div>
                      );
                    }

                    if (isErrorMessage) {
                      return (
                        <div
                          key={msg.key || msg.id}
                          className="flex justify-center"
                        >
                          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-sm">
                            ⚠️ {msg.message || msg.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.key || msg.id}
                        className={`flex items-end gap-2 ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isOwnMessage && (
                          <Avatar username={msg.username} size="md" />
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border text-card-foreground"
                          }`}
                        >
                          {!isOwnMessage && (
                            <div className="text-xs font-bold mb-1 opacity-80 text-blue-700">
                              {msg.username}
                            </div>
                          )}
                          <div className="text-sm">{msg.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              isOwnMessage
                                ? "opacity-70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        {isOwnMessage && (
                          <Avatar username={msg.username} size="md" />
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border-t">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    size="icon"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Join New Room Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Join New Room</CardTitle>
              <CardDescription>Enter a room code to join</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newRoomCode" className="text-sm font-medium">
                  Room Code
                </label>
                <Input
                  id="newRoomCode"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value);
                    setRoomValidationError("");
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isValidatingRoom && connectToRoom()
                  }
                  autoFocus
                />
                {roomValidationError && (
                  <p className="text-sm text-destructive">
                    {roomValidationError}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJoinDialog(false);
                    setRoomCode("");
                    setRoomValidationError("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => connectToRoom()}
                  className="flex-1"
                  disabled={isValidatingRoom}
                >
                  {isValidatingRoom ? "Validating..." : "Join"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Room Members Modal */}
      <RoomMembersModal
        roomCode={currentRoom}
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        currentUsername={currentUsername}
      />
    </div>
  );
}

export default App;
