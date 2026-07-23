import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getMatches,
  getMatch,
  deleteMatch,
  getMessages,
  markMessagesRead,
} from "../controllers/matchesController";

const router = Router();

router.use(requireAuth);

router.get("/", getMatches);
router.get("/:matchId", getMatch);
router.delete("/:matchId", deleteMatch);
router.get("/:matchId/messages", getMessages);
router.put("/:matchId/messages/read", markMessagesRead);

export default router;
