import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService";
import { UserType } from "@prisma/client";

const BCRYPT_ROUNDS = 12;

// In-memory OTP store (use Redis in production for multi-instance setups)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const resetTokenStore = new Map<
  string,
  { userId: string; expiresAt: number }
>();

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z
    .string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .max(72, "Password troppo lunga"),
  userType: z.nativeEnum(UserType),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const LogoutSchema = z.object({
  refreshToken: z.string().min(1),
});

const VerifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, userType } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    res.status(409).json({ error: "Email già registrata" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      userType,
    },
    select: { id: true, email: true, userType: true, isVerified: true },
  });

  const otp = generateOtp();
  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  try {
    await sendVerificationEmail(normalizedEmail, otp);
  } catch (err) {
    console.error("Errore invio email verifica:", err);
  }

  res.status(201).json({
    message: "Registrazione completata. Controlla la tua email per il codice OTP.",
    user,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    res.status(401).json({ error: "Credenziali non valide" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ error: "Credenziali non valide" });
    return;
  }

  const payload = { userId: user.id, userType: user.userType };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "refreshToken mancante" });
    return;
  }

  const { refreshToken } = parsed.data;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    res.status(401).json({ error: "Refresh token non valido o scaduto" });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: "Refresh token non valido o scaduto" });
    return;
  }

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    userType: payload.userType,
  });

  res.json({ accessToken: newAccessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const parsed = LogoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "refreshToken mancante" });
    return;
  }

  await prisma.refreshToken
    .delete({ where: { token: parsed.data.refreshToken } })
    .catch(() => {
      // Token already removed — that's fine
    });

  res.json({ message: "Logout effettuato" });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const parsed = VerifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, otp } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const stored = otpStore.get(normalizedEmail);
  if (!stored || stored.expiresAt < Date.now()) {
    res.status(400).json({ error: "Codice OTP scaduto o non trovato" });
    return;
  }
  if (stored.otp !== otp) {
    res.status(400).json({ error: "Codice OTP non valido" });
    return;
  }

  otpStore.delete(normalizedEmail);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { isVerified: true },
  });

  res.json({ message: "Email verificata con successo" });
}

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = ForgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always respond 200 to avoid user enumeration
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    resetTokenStore.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
    try {
      await sendPasswordResetEmail(normalizedEmail, resetToken);
    } catch (err) {
      console.error("Errore invio email reset:", err);
    }
  }

  res.json({
    message:
      "Se l'email esiste, riceverai le istruzioni per il reset della password.",
  });
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = ResetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { token, newPassword } = parsed.data;
  const stored = resetTokenStore.get(token);

  if (!stored || stored.expiresAt < Date.now()) {
    res.status(400).json({ error: "Token non valido o scaduto" });
    return;
  }

  resetTokenStore.delete(token);

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: stored.userId },
    data: { passwordHash },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });

  res.json({ message: "Password aggiornata con successo" });
}

// Utility: strip HTML helper (re-exported for controllers)
export { sanitizeText };
