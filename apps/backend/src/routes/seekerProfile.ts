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
} from "../controllers/seekerProfileController";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyProfile);
router.post("/", createProfile);
router.put("/", updateProfile);
router.delete("/", deleteProfile);

router.post("/photos", upload.array("photos", 6), uploadPhotos);
router.delete("/photos/:photoId", deletePhoto);

export default router;
