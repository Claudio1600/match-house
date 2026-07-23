import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadPhotos,
  deletePhoto,
  reorderPhotos,
} from "../controllers/landlordProfileController";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyProfile);
router.post("/", createProfile);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

router.post("/photos", upload.array("photos", 10), uploadPhotos);
router.delete("/photos/:photoId", deletePhoto);
router.put("/photos/reorder", reorderPhotos);

export default router;
