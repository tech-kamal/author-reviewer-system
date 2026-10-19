import { Router } from "express";

import {
  getMyReviewRequests,
  acceptReviewRequest,
  declineReviewRequest,
  submitReview,
  getMySubmittedReview,
  acceptReviewInvitationByToken,
  declineReviewInvitationByToken,
} from "../controllers/reviewer.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { reviewUpload } from "../middleware/reviewUpload.middleware";

const router = Router();

// ============================================
// Reviewer routes
// ============================================

// Get all review requests assigned to logged-in reviewer

router.get(
  "/review-requests",
  requireAuth,
  requireRole("REVIEWER"),
  getMyReviewRequests
);

// Accept review request

router.patch(
  "/review-requests/:id/accept",
  requireAuth,
  requireRole("REVIEWER"),
  acceptReviewRequest
);

// Decline review request

router.patch(
  "/review-requests/:id/decline",
  requireAuth,
  requireRole("REVIEWER"),
  declineReviewRequest
);

// Submit review

router.post(
  "/review-requests/:id/submit",
  requireAuth,
  requireRole("REVIEWER"),
  reviewUpload.single("attachment"),
  submitReview
);


// ============================================
// Reviewer views own submitted review
// ============================================

router.get(
  "/review-requests/:id/review",
  requireAuth,
  requireRole("REVIEWER"),
  getMySubmittedReview
);


// ============================================
// Email invitation routes
// These routes do not require authentication
// ============================================

// Accept invitation from email

router.get(
  "/invitations/:token/accept",
  acceptReviewInvitationByToken
);

// Decline invitation from email

router.get(
  "/invitations/:token/decline",
  declineReviewInvitationByToken
);

export default router;