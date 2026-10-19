import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePhoto,
} from "../controllers/profile.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(
      null,
      `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WebP images are allowed"));
    }
  },
});

router.get("/", requireAuth, getProfile);

router.patch("/", requireAuth, updateProfile);

router.patch(
  "/photo",
  requireAuth,
  upload.single("profilePhoto"),
  updateProfilePhoto
);

router.patch("/password", requireAuth, changePassword);

export default router;