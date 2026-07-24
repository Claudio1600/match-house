import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { discover, getMapProperties } from "../controllers/discoverController";

const router = Router();

router.use(requireAuth);
router.get("/", discover);
router.get("/properties", getMapProperties);

export default router;
