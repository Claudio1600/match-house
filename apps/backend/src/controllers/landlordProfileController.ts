import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import {
  uploadImage,
  deleteImage,
} from "../services/cloudinaryService";
import { sanitizeText } from "./authController";

// ── Zod schemas ──────────────────────────────────────────────────────────────

const CreateProfileSchema = z.object({
  title: z.string().min(1).max(120),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  rent: z.number().positive(),
  totalRooms: z.number().int().positive(),
  availableRooms: z.number().int().min(0),
  currentTenants: z.number().int().min(0),
  squareMeters: z.number().int().positive().optional(),
  floor: z.number().int().optional(),
  furnished: z.boolean().optional(),
  billsIncluded: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  wifiIncluded: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
  availableFrom: z.string().datetime(),
  description: z.string().min(1).max(2000),
  houseRules: z.string().max(1000).optional(),
  neighborhoodInfo: z.string().max(1000).optional(),
});

const UpdateProfileSchema = CreateProfileSchema.partial();

const ReorderPhotosSchema = z.object({
  order: z.array(z.object({ photoId: z.string(), order: z.number().int() })),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeProfileInput(
  data: Partial<z.infer<typeof CreateProfileSchema>>
): Partial<z.infer<typeof CreateProfileSchema>> {
  const out = { ...data };
  if (out.title) out.title = sanitizeText(out.title);
  if (out.address) out.address = sanitizeText(out.address);
  if (out.city) out.city = sanitizeText(out.city);
  if (out.description) out.description = sanitizeText(out.description);
  if (out.houseRules) out.houseRules = sanitizeText(out.houseRules);
  if (out.neighborhoodInfo)
    out.neighborhoodInfo = sanitizeText(out.neighborhoodInfo);
  return out;
}

// ── Controllers ──────────────────────────────────────────────────────────────

export async function getMyProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const profile = await prisma.landlordProfile.findUnique({
    where: { userId },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (!profile) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  res.json(profile);
}

export async function createProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const existing = await prisma.landlordProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    res.status(409).json({ error: "Profilo già esistente. Usa PUT per aggiornarlo." });
    return;
  }

  const parsed = CreateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const sanitized = sanitizeProfileInput(parsed.data) as z.infer<
    typeof CreateProfileSchema
  >;

  const profile = await prisma.landlordProfile.create({
    data: {
      ...sanitized,
      availableFrom: new Date(sanitized.availableFrom),
      userId,
    },
    include: { photos: true },
  });

  res.status(201).json(profile);
}

export async function updateProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const existing = await prisma.landlordProfile.findUnique({
    where: { userId },
  });
  if (!existing) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const sanitized = sanitizeProfileInput(parsed.data);
  const updateData: Record<string, unknown> = { ...sanitized };
  if (sanitized.availableFrom) {
    updateData.availableFrom = new Date(sanitized.availableFrom);
  }

  const profile = await prisma.landlordProfile.update({
    where: { userId },
    data: updateData,
    include: { photos: { orderBy: { order: "asc" } } },
  });

  res.json(profile);
}

export async function deleteProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const existing = await prisma.landlordProfile.findUnique({
    where: { userId },
    include: { photos: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  // Delete all Cloudinary images first
  await Promise.allSettled(
    existing.photos.map((p) => deleteImage(p.cloudinaryId))
  );

  await prisma.landlordProfile.delete({ where: { userId } });

  res.json({ message: "Profilo eliminato" });
}

export async function uploadPhotos(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const profile = await prisma.landlordProfile.findUnique({
    where: { userId },
    include: { photos: true },
  });
  if (!profile) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: "Nessuna immagine caricata" });
    return;
  }

  const currentCount = profile.photos.length;
  if (currentCount + files.length > 10) {
    res.status(400).json({ error: "Massimo 10 foto per profilo" });
    return;
  }

  const uploadResults = await Promise.all(
    files.map((f) => uploadImage(f.buffer, `match-house/landlords/${userId}`))
  );

  const savedPhotos = await prisma.$transaction(
    uploadResults.map((result, index) =>
      prisma.propertyPhoto.create({
        data: {
          landlordProfileId: profile.id,
          url: result.url,
          cloudinaryId: result.cloudinaryId,
          order: currentCount + index,
          isMain: currentCount === 0 && index === 0,
        },
      })
    )
  );

  res.status(201).json(savedPhotos);
}

export async function deletePhoto(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;
  const { photoId } = req.params;

  const photo = await prisma.propertyPhoto.findUnique({
    where: { id: photoId },
    include: { landlordProfile: true },
  });

  if (!photo || photo.landlordProfile.userId !== userId) {
    res.status(404).json({ error: "Foto non trovata" });
    return;
  }

  await deleteImage(photo.cloudinaryId);
  await prisma.propertyPhoto.delete({ where: { id: photoId } });

  res.json({ message: "Foto eliminata" });
}

export async function reorderPhotos(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const parsed = ReorderPhotosSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const profile = await prisma.landlordProfile.findUnique({
    where: { userId },
    include: { photos: true },
  });
  if (!profile) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  const profilePhotoIds = new Set(profile.photos.map((p) => p.id));

  // Verify ownership of all photo IDs
  for (const item of parsed.data.order) {
    if (!profilePhotoIds.has(item.photoId)) {
      res.status(403).json({ error: "Foto non appartenente al tuo profilo" });
      return;
    }
  }

  await prisma.$transaction(
    parsed.data.order.map((item) =>
      prisma.propertyPhoto.update({
        where: { id: item.photoId },
        data: { order: item.order, isMain: item.order === 0 },
      })
    )
  );

  res.json({ message: "Ordine aggiornato" });
}
