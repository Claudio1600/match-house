import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { AuthRequest } from "./auth";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Troppe richieste, riprova tra un minuto." },
});

export const swipeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthRequest;
    return authReq.userId ?? req.ip ?? "anonymous";
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite swipe raggiunto, riprova tra un minuto." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Troppi tentativi, riprova tra 15 minuti." },
  handler: (_req: Request, res: Response) => {
    res
      .status(429)
      .json({ error: "Troppi tentativi di autenticazione, riprova più tardi." });
  },
});
