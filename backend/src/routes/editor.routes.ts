import { Router } from "express";

import {
  createPaper,
  getMyPapers,
  getPaperById,
  getReviewers,
  getReviewDetails,
  getPaperReviews,
  makeFinalDecision,
  updatePaper,
  deletePaper,
} from "../controllers/editor.controller";

import { requireAuth } from "../middleware/auth.middleware";

import { requireRole } from "../middleware/role.middleware";

import { uploadPaper } from "../middleware/upload.middleware";

const router = Router();

// =====================================================
// Upload a new paper
// =====================================================

router.post(
  "/papers",
  requireAuth,
  requireRole("EDITOR"),
  uploadPaper.single("pdf"),
  createPaper
);

// =====================================================
// Get papers created by logged-in editor
// =====================================================

router.get(
  "/papers",
  requireAuth,
  requireRole("EDITOR"),
  getMyPapers
);

// =====================================================
// Get single paper
// =====================================================

router.get(
  "/papers/:id",
  requireAuth,
  requireRole("EDITOR"),
  getPaperById
);

// =====================================================
// Update paper
// PATCH /api/editor/papers/:id
// =====================================================

router.patch(
  "/papers/:id",
  requireAuth,
  requireRole("EDITOR"),
  uploadPaper.single("pdf"),
  updatePaper
);


// =====================================================
// Delete paper
// DELETE /api/editor/papers/:id
// =====================================================

router.delete(
  "/papers/:id",
  requireAuth,
  requireRole("EDITOR"),
  deletePaper
);


// =====================================================
// Get all reviewers
// =====================================================

router.get(
  "/reviewers",
  requireAuth,
  requireRole("EDITOR"),
  getReviewers
);

// =====================================================
// Editor views single submitted review
// =====================================================

router.get(
  "/review-requests/:reviewRequestId/review",
  requireAuth,
  requireRole("EDITOR"),
  getReviewDetails
);

// =====================================================
// Editor makes final decision
// =====================================================

router.patch(
  "/papers/:paperId/decision",
  requireAuth,
  requireRole("EDITOR"),
  makeFinalDecision
);

// =====================================================
// Editor gets submitted reviews for a paper
// =====================================================

router.get(
  "/papers/:paperId/reviews",
  requireAuth,
  requireRole("EDITOR"),
  getPaperReviews
);

export default router;