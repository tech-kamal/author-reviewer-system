import { Router } from "express";
import {
  createDraft,
  getCurrentDraft,
  getMyDrafts,
  getMySubmissions,
  getDraftById,
  updateDraft,
  deleteDraft,
  submitSubmissionDraft,
} from "../controllers/submission-draft.controller";

import { uploadSubmissionFiles } from "../controllers/submission-file.controller";
import upload from "../config/upload";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";


const router = Router();

// Create a new draft
router.post(
  "/",
  requireAuth,
  requireRole("REVIEWER"),
  createDraft
);

// Get latest/current draft of logged-in author
router.get(
  "/current",
  requireAuth,
  requireRole("REVIEWER"),
  getCurrentDraft
);



// Get all drafts of logged-in author
router.get(
  "/",
  requireAuth,
  requireRole("REVIEWER"),
  getMyDrafts
);


router.get(
  "/submissions",
  requireAuth,
  requireRole("REVIEWER"),
  getMySubmissions
);


// Get single draft
router.get(
  "/:id",
  requireAuth,
  requireRole("REVIEWER"),
  getDraftById
);

// Save / update draft
router.patch(
  "/:id",
  requireAuth,
  requireRole("REVIEWER"),
  updateDraft
);

// Delete draft
router.delete(
  "/:id",
  requireAuth,
  requireRole("REVIEWER"),
  deleteDraft
);


router.post(
  "/:id/submit",
  requireAuth,
  requireRole("REVIEWER"),
  submitSubmissionDraft
);

router.post(
  "/:id/files",
  requireAuth,
  requireRole("REVIEWER"),
  upload.fields([
    { name: "mainFile", maxCount: 1 },
    { name: "supplementaryFile", maxCount: 1 },
  ]),
  uploadSubmissionFiles
);







export default router;