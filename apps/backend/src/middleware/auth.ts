import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserType } from "@prisma/client";

export interface AuthRequest extends Request {
  userId: string;
  userType: UserType;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Token mancante" });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userType = payload.userType;
    next();
  } catch {
    res.status(401).json({ error: "Token non valido" });
  }
};
