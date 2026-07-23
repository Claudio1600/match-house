import { Request, Response } from "express";
import { z } from "zod";
import { SwipeAction } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { Server as SocketServer } from "socket.io";

const SwipeSchema = z.object({
  toUserId: z.string().min(1),
  action: z.nativeEnum(SwipeAction),
});

// io is injected at startup
let io: SocketServer | null = null;
export function setSocketServer(socketServer: SocketServer): void {
  io = socketServer;
}

export async function swipe(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;

  const parsed = SwipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { toUserId, action } = parsed.data;

  if (toUserId === userId) {
    res.status(400).json({ error: "Non puoi fare swipe su te stesso" });
    return;
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!targetUser) {
    res.status(404).json({ error: "Utente non trovato" });
    return;
  }

  // Upsert (idempotent if client retries)
  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    create: { fromUserId: userId, toUserId, action },
    update: { action },
  });

  if (action === SwipeAction.PASS) {
    res.json({ matched: false });
    return;
  }

  // Check for mutual SMASH
  const mutualSwipe = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: userId } },
  });

  if (mutualSwipe?.action !== SwipeAction.SMASH) {
    res.json({ matched: false });
    return;
  }

  // Create match (handle race condition with try/catch on unique constraint)
  const [userAId, userBId] = [userId, toUserId].sort();
  let match;
  try {
    match = await prisma.match.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId },
      update: {},
    });
  } catch {
    res.status(500).json({ error: "Errore nella creazione del match" });
    return;
  }

  // Emit real-time event to both users
  if (io) {
    const chatNs = io.of("/chat");
    chatNs.to(`user:${userId}`).emit("match:new", { matchId: match.id, withUserId: toUserId });
    chatNs.to(`user:${toUserId}`).emit("match:new", { matchId: match.id, withUserId: userId });
  }

  res.json({ matched: true, matchId: match.id });
}
