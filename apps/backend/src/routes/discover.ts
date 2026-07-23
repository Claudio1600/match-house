import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { discover } from "../controllers/discoverController";

const router = Router();

router.use(requireAuth);
router.get("/", discover);

export default router;
