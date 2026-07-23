import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

const MessagesCursorSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function isParticipant(
  match: { userAId: string; userBId: string },
  userId: string
): boolean {
  return match.userAId === userId || match.userBId === userId;
}

// ── Controllers ──────────────────────────────────────────────────────────────

export async function getMatches(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: {
        select: {
          id: true,
          userType: true,
          landlordProfile: {
            select: {
              title: true,
              city: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
          seekerProfile: {
            select: {
              firstName: true,
              lastName: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      userB: {
        select: {
          id: true,
          userType: true,
          landlordProfile: {
            select: {
              title: true,
              city: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
          seekerProfile: {
            select: {
              firstName: true,
              lastName: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          read: true,
          senderId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(matches);
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const { matchId } = req.params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      userA: {
        select: {
          id: true,
          userType: true,
          landlordProfile: {
            include: { photos: { orderBy: { order: "asc" } } },
          },
          seekerProfile: {
            include: { photos: { orderBy: { order: "asc" } } },
          },
        },
      },
      userB: {
        select: {
          id: true,
          userType: true,
          landlordProfile: {
            include: { photos: { orderBy: { order: "asc" } } },
          },
          seekerProfile: {
            include: { photos: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!match || !isParticipant(match, userId)) {
    res.status(404).json({ error: "Match non trovato" });
    return;
  }

  res.json(match);
}

export async function deleteMatch(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const { matchId } = req.params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match || !isParticipant(match, userId)) {
    res.status(404).json({ error: "Match non trovato" });
    return;
  }

  await prisma.match.delete({ where: { id: matchId } });

  res.json({ message: "Match eliminato" });
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const { matchId } = req.params;

  const parsed = MessagesCursorSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { cursor, limit } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || !isParticipant(match, userId)) {
    res.status(404).json({ error: "Match non trovato" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: {
      matchId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    select: {
      id: true,
      content: true,
      senderId: true,
      read: true,
      createdAt: true,
    },
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor =
    hasMore && items.length > 0
      ? items[items.length - 1].createdAt.toISOString()
      : null;

  res.json({ messages: items, nextCursor, hasMore });
}

export async function markMessagesRead(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;
  const { matchId } = req.params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || !isParticipant(match, userId)) {
    res.status(404).json({ error: "Match non trovato" });
    return;
  }

  await prisma.message.updateMany({
    where: {
      matchId,
      senderId: { not: userId }, // Only mark others' messages as read
      read: false,
    },
    data: { read: true },
  });

  res.json({ message: "Messaggi segnati come letti" });
}
