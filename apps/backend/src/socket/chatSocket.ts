import { Namespace, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../utils/prisma";

interface AuthenticatedSocket extends Socket {
  userId: string;
}

interface SendMessagePayload {
  matchId: string;
  content: string;
}

interface JoinLeavePayload {
  matchId: string;
}

interface TypingPayload {
  matchId: string;
}

async function isMatchParticipant(
  matchId: string,
  userId: string
): Promise<boolean> {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return false;
  return match.userAId === userId || match.userBId === userId;
}

export function registerChatSocket(chatNs: Namespace): void {
  // Auth middleware for the /chat namespace
  chatNs.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Token mancante"));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      (socket as AuthenticatedSocket).userId = payload.userId;
      next();
    } catch {
      next(new Error("Token non valido"));
    }
  });

  chatNs.on("connection", (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId } = socket;

    // Join a personal room so we can target this user for push events (e.g. match:new)
    void socket.join(`user:${userId}`);

    // ── join:match ──────────────────────────────────────────────────────────
    socket.on("join:match", async (payload: JoinLeavePayload) => {
      const { matchId } = payload ?? {};
      if (!matchId || typeof matchId !== "string") return;

      if (!(await isMatchParticipant(matchId, userId))) return;

      void socket.join(`match:${matchId}`);
    });

    // ── leave:match ─────────────────────────────────────────────────────────
    socket.on("leave:match", (payload: JoinLeavePayload) => {
      const { matchId } = payload ?? {};
      if (!matchId || typeof matchId !== "string") return;
      void socket.leave(`match:${matchId}`);
    });

    // ── message:send ─────────────────────────────────────────────────────────
    socket.on("message:send", async (payload: SendMessagePayload) => {
      const { matchId, content } = payload ?? {};
      if (
        !matchId ||
        typeof matchId !== "string" ||
        !content ||
        typeof content !== "string"
      )
        return;

      const trimmedContent = content.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
      if (!trimmedContent) return;

      if (!(await isMatchParticipant(matchId, userId))) return;

      const message = await prisma.message.create({
        data: { matchId, senderId: userId, content: trimmedContent },
        select: {
          id: true,
          matchId: true,
          senderId: true,
          content: true,
          read: true,
          createdAt: true,
        },
      });

      chatNs.to(`match:${matchId}`).emit("message:new", message);
    });

    // ── typing:start ─────────────────────────────────────────────────────────
    socket.on("typing:start", async (payload: TypingPayload) => {
      const { matchId } = payload ?? {};
      if (!matchId || typeof matchId !== "string") return;
      if (!(await isMatchParticipant(matchId, userId))) return;

      socket.to(`match:${matchId}`).emit("typing:update", {
        matchId,
        userId,
        isTyping: true,
      });
    });

    // ── typing:stop ──────────────────────────────────────────────────────────
    socket.on("typing:stop", async (payload: TypingPayload) => {
      const { matchId } = payload ?? {};
      if (!matchId || typeof matchId !== "string") return;
      if (!(await isMatchParticipant(matchId, userId))) return;

      socket.to(`match:${matchId}`).emit("typing:update", {
        matchId,
        userId,
        isTyping: false,
      });
    });

    socket.on("disconnect", () => {
      // Cleanup handled automatically by Socket.io
    });
  });
}
