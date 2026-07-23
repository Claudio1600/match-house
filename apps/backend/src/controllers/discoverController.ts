import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { UserType } from "@prisma/client";

const DISCOVER_LIMIT = 20;

const DiscoverQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(500).optional(), // km
  budgetMax: z.coerce.number().positive().optional(),
  city: z.string().max(100).optional(),
});

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function discover(req: Request, res: Response): Promise<void> {
  const { userId, userType } = req as AuthRequest;

  const parsed = DiscoverQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { lat, lng, radius = 50, budgetMax, city } = parsed.data;

  // IDs of users already swiped by this user
  const alreadySwiped = await prisma.swipe.findMany({
    where: { fromUserId: userId },
    select: { toUserId: true },
  });
  const swipedIds = alreadySwiped.map((s) => s.toUserId);
  swipedIds.push(userId); // Exclude self

  if (userType === UserType.SEEKER) {
    // Seeker sees landlord profiles with available rooms
    const landlordProfiles = await prisma.landlordProfile.findMany({
      where: {
        availableRooms: { gt: 0 },
        userId: { notIn: swipedIds },
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(budgetMax ? { rent: { lte: budgetMax } } : {}),
      },
      include: {
        photos: { orderBy: { order: "asc" } },
        user: { select: { id: true, email: true, createdAt: true } },
      },
      take: DISCOVER_LIMIT * 3, // Fetch extra to filter/sort by distance
    });

    let results = landlordProfiles;

    // Filter by geographic radius when lat/lng provided
    if (lat !== undefined && lng !== undefined) {
      results = results.filter(
        (p) => haversineKm(lat, lng, p.latitude, p.longitude) <= radius
      );
    }

    // Sort: has photos first → distance (if available) → createdAt
    results.sort((a, b) => {
      const aHasPhotos = a.photos.length > 0 ? 0 : 1;
      const bHasPhotos = b.photos.length > 0 ? 0 : 1;
      if (aHasPhotos !== bHasPhotos) return aHasPhotos - bHasPhotos;

      if (lat !== undefined && lng !== undefined) {
        const distA = haversineKm(lat, lng, a.latitude, a.longitude);
        const distB = haversineKm(lat, lng, b.latitude, b.longitude);
        if (Math.abs(distA - distB) > 0.1) return distA - distB;
      }

      return (
        new Date(a.user.createdAt).getTime() -
        new Date(b.user.createdAt).getTime()
      );
    });

    res.json(results.slice(0, DISCOVER_LIMIT));
    return;
  }

  // LANDLORD sees seeker profiles
  const seekerProfiles = await prisma.seekerProfile.findMany({
    where: {
      userId: { notIn: swipedIds },
      ...(city
        ? {
            preferredCity: { contains: city, mode: "insensitive" },
          }
        : {}),
      ...(budgetMax ? { budgetMax: { gte: 0 } } : {}),
    },
    include: {
      photos: { orderBy: { order: "asc" } },
      user: { select: { id: true, email: true, createdAt: true } },
    },
    take: DISCOVER_LIMIT * 2,
  });

  // Sort: has photos first → createdAt
  const sortedSeekers = seekerProfiles.sort((a, b) => {
    const aHasPhotos = a.photos.length > 0 ? 0 : 1;
    const bHasPhotos = b.photos.length > 0 ? 0 : 1;
    if (aHasPhotos !== bHasPhotos) return aHasPhotos - bHasPhotos;
    return (
      new Date(a.user.createdAt).getTime() -
      new Date(b.user.createdAt).getTime()
    );
  });

  res.json(sortedSeekers.slice(0, DISCOVER_LIMIT));
}
