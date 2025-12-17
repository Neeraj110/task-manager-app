import { useEffect, useRef, useCallback, useState } from "react";
import { useSocket } from "@/contexts/socket-context";
import type { RealtimeEvent } from "@/lib/realtime";

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
}

export function useRealtime(
  boardId: string,
  onEvent: (event: RealtimeEvent) => void
) {
  const { socket, isConnected } = useSocket();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const onEventRef = useRef(onEvent);

  // Keep onEvent ref up to date
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!socket || !isConnected || !boardId) return;

    console.log(`📋 Joining board: ${boardId}`);

    // Join the board room
    socket.emit("join:board", boardId);

    // Listen for user events
    const handleUserJoined = (data: { userId: string; userName: string }) => {
      console.log("👤 User joined:", data.userName);
      setActiveUsers((prev) => {
        if (prev.find((u) => u.id === data.userId)) return prev;
        return [...prev, { id: data.userId, name: data.userName }];
      });
      onEventRef.current({ type: "user:joined", ...data });
    };

    const handleUserLeft = (data: { userId: string; userName: string }) => {
      console.log("👤 User left:", data.userName);
      setActiveUsers((prev) => prev.filter((u) => u.id !== data.userId));
      onEventRef.current({ type: "user:left", ...data });
    };

    socket.on("user:joined", handleUserJoined);
    socket.on("user:left", handleUserLeft);

    // Cleanup
    return () => {
      console.log(`📋 Leaving board: ${boardId}`);
      socket.emit("leave:board", boardId);
      socket.off("user:joined", handleUserJoined);
      socket.off("user:left", handleUserLeft);
    };
  }, [socket, isConnected, boardId]);

  const broadcast = useCallback(
    (event: RealtimeEvent) => {
      if (!socket || !isConnected) {
        console.warn("Cannot broadcast: socket not connected");
        return;
      }

      console.log("📡 Broadcasting event:", event.type);
      socket.emit("board:event", { boardId, event });
    },
    [socket, isConnected, boardId]
  );

  return { activeUsers, isConnected, broadcast };
}
