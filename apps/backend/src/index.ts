import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import cron from "node-cron";

import { generalLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";
import landlordProfileRoutes from "./routes/landlordProfile";
import seekerProfileRoutes from "./routes/seekerProfile";
import discoverRoutes from "./routes/discover";
import swipeRoutes from "./routes/swipe";
import matchesRoutes from "./routes/matches";
import { registerChatSocket } from "./socket/chatSocket";
import { setSocketServer } from "./controllers/swipeController";
import { prisma } from "./utils/prisma";

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL ?? "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const chatNamespace = io.of("/chat");
registerChatSocket(chatNamespace);
setSocketServer(io);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:8081",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(generalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/landlord-profile", landlordProfileRoutes);
app.use("/api/seeker-profile", seekerProfileRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/matches", matchesRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint non trovato" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Errore interno del server" });
  }
);

// ── Cron jobs ─────────────────────────────────────────────────────────────────

// Delete expired refresh tokens every day at 3:00 AM
cron.schedule("0 3 * * *", async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[CRON] Deleted ${result.count} expired refresh tokens`);
  } catch (err) {
    console.error("[CRON] Error deleting expired refresh tokens:", err);
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, () => {
  console.log(`Match House backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
