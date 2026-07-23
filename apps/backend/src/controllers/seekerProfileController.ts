import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { uploadImage, deleteImage } from "../services/cloudinaryService";
import { sanitizeText } from "./authController";

// ── Zod schemas ──────────────────────────────────────────────────────────────

const CreateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  age: z.number().int().min(18).max(100),
  bio: z.string().min(1).max(1000),
  occupation: z.string().min(1).max(100),
  university: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  smoker: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  schedule: z.string().max(200).optional(),
  cleanliness: z.number().int().min(1).max(5).optional(),
  noiseLevel: z.number().int().min(1).max(5).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  preferredCity: z.string().max(100).optional(),
  moveInDate: z.string().datetime().optional(),
  hobbies: z.array(z.string().max(50)).max(20).optional(),
  sports: z.array(z.string().max(50)).max(20).optional(),
  languages: z.array(z.string().max(50)).max(20).optional(),
});

const UpdateProfileSchema = CreateProfileSchema.partial();

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeProfileInput(
  data: Partial<z.infer<typeof CreateProfileSchema>>
): Partial<z.infer<typeof CreateProfileSchema>> {
  const out = { ...data };
  if (out.firstName) out.firstName = sanitizeText(out.firstName);
  if (out.lastName) out.lastName = sanitizeText(out.lastName);
  if (out.bio) out.bio = sanitizeText(out.bio);
  if (out.occupation) out.occupation = sanitizeText(out.occupation);
  if (out.university) out.university = sanitizeText(out.university);
  if (out.company) out.company = sanitizeText(out.company);
  if (out.schedule) out.schedule = sanitizeText(out.schedule);
  if (out.preferredCity) out.preferredCity = sanitizeText(out.preferredCity);
  if (out.hobbies) out.hobbies = out.hobbies.map(sanitizeText);
  if (out.sports) out.sports = out.sports.map(sanitizeText);
  if (out.languages) out.languages = out.languages.map(sanitizeText);
  return out;
}

// ── Controllers ──────────────────────────────────────────────────────────────

export async function getMyProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const profile = await prisma.seekerProfile.findUnique({
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

  const existing = await prisma.seekerProfile.findUnique({ where: { userId } });
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

  const profile = await prisma.seekerProfile.create({
    data: {
      ...sanitized,
      userId,
      hobbies: sanitized.hobbies ?? [],
      sports: sanitized.sports ?? [],
      languages: sanitized.languages ?? [],
      moveInDate: sanitized.moveInDate
        ? new Date(sanitized.moveInDate)
        : undefined,
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

  const existing = await prisma.seekerProfile.findUnique({ where: { userId } });
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
  if (sanitized.moveInDate) {
    updateData.moveInDate = new Date(sanitized.moveInDate);
  }

  const profile = await prisma.seekerProfile.update({
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

  const existing = await prisma.seekerProfile.findUnique({
    where: { userId },
    include: { photos: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Profilo non trovato" });
    return;
  }

  await Promise.allSettled(
    existing.photos.map((p) => deleteImage(p.cloudinaryId))
  );

  await prisma.seekerProfile.delete({ where: { userId } });

  res.json({ message: "Profilo eliminato" });
}

export async function uploadPhotos(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req as AuthRequest;

  const profile = await prisma.seekerProfile.findUnique({
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
  if (currentCount + files.length > 6) {
    res.status(400).json({ error: "Massimo 6 foto per profilo seeker" });
    return;
  }

  const uploadResults = await Promise.all(
    files.map((f) => uploadImage(f.buffer, `match-house/seekers/${userId}`))
  );

  const savedPhotos = await prisma.$transaction(
    uploadResults.map((result, index) =>
      prisma.seekerPhoto.create({
        data: {
          seekerProfileId: profile.id,
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

  const photo = await prisma.seekerPhoto.findUnique({
    where: { id: photoId },
    include: { seekerProfile: true },
  });

  if (!photo || photo.seekerProfile.userId !== userId) {
    res.status(404).json({ error: "Foto non trovata" });
    return;
  }

  await deleteImage(photo.cloudinaryId);
  await prisma.seekerPhoto.delete({ where: { id: photoId } });

  res.json({ message: "Foto eliminata" });
}
