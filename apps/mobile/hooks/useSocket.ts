import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { Message, Match } from "../types";

interface TypingUpdate {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

interface UseSocketOptions {
  onMessage?: (message: Message) => void;
  onMatch?: (match: Match) => void;
  onTyping?: (update: TypingUpdate) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!accessToken) return;

    const wsUrl =
      process.env.EXPO_PUBLIC_WS_URL || "http://localhost:3000";

    const socket = io(`${wsUrl}/chat`, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("message:new", (message: Message) => {
      optionsRef.current.onMessage?.(message);
    });

    socket.on("match:new", (match: Match) => {
      optionsRef.current.onMatch?.(match);
    });

    socket.on("typing:update", (update: TypingUpdate) => {
      optionsRef.current.onTyping?.(update);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const sendMessage = useCallback(
    (matchId: string, content: string) => {
      socketRef.current?.emit("message:send", { matchId, content });
    },
    []
  );

  const startTyping = useCallback((matchId: string) => {
    socketRef.current?.emit("typing:start", { matchId });
  }, []);

  const stopTyping = useCallback((matchId: string) => {
    socketRef.current?.emit("typing:stop", { matchId });
  }, []);

  const joinMatch = useCallback((matchId: string) => {
    socketRef.current?.emit("match:join", { matchId });
  }, []);

  const leaveMatch = useCallback((matchId: string) => {
    socketRef.current?.emit("match:leave", { matchId });
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    startTyping,
    stopTyping,
    joinMatch,
    leaveMatch,
  };
}
