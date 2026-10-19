"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewer_controller_1 = require("../controllers/reviewer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const reviewUpload_middleware_1 = require("../middleware/reviewUpload.middleware");
const router = (0, express_1.Router)();
// ============================================
// Reviewer routes
// ============================================
// Get all review requests assigned to logged-in reviewer
router.get("/review-requests", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), reviewer_controller_1.getMyReviewRequests);
// Accept review request
router.patch("/review-requests/:id/accept", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), reviewer_controller_1.acceptReviewRequest);
// Decline review request
router.patch("/review-requests/:id/decline", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), reviewer_controller_1.declineReviewRequest);
// Submit review
router.post("/review-requests/:id/submit", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), reviewUpload_middleware_1.reviewUpload.single("attachment"), reviewer_controller_1.submitReview);
// ============================================
// Reviewer views own submitted review
// ============================================
router.get("/review-requests/:id/review", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), reviewer_controller_1.getMySubmittedReview);
// ============================================
// Email invitation routes
// These routes do not require authentication
// ============================================
// Accept invitation from email
router.get("/invitations/:token/accept", reviewer_controller_1.acceptReviewInvitationByToken);
// Decline invitation from email
router.get("/invitations/:token/decline", reviewer_controller_1.declineReviewInvitationByToken);
exports.default = router;
