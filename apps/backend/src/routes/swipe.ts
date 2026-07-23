import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { swipeLimiter } from "../middleware/rateLimiter";
import { swipe } from "../controllers/swipeController";

const router = Router();

router.use(requireAuth);
router.post("/", swipeLimiter, swipe);

export default router;
