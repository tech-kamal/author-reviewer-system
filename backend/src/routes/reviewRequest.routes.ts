import { Router } from "express";

import {
  createReviewRequest,
  getPaperReviewRequests,
} from "../controllers/reviewRequest.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// ============================================
// Editor invites reviewer
// ============================================

router.post(
  "/review-requests",
  requireAuth,
  requireRole("EDITOR"),
  createReviewRequest
);

// ============================================
// Editor gets review requests for a paper
// ============================================

router.get(
  "/papers/:paperId/review-requests",
  requireAuth,
  requireRole("EDITOR"),
  getPaperReviewRequests
);

export default router;