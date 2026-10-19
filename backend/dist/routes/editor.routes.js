"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const editor_controller_1 = require("../controllers/editor.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// =====================================================
// Upload a new paper
// =====================================================
router.post("/papers", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), upload_middleware_1.uploadPaper.single("pdf"), editor_controller_1.createPaper);
// =====================================================
// Get papers created by logged-in editor
// =====================================================
router.get("/papers", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.getMyPapers);
// =====================================================
// Get single paper
// =====================================================
router.get("/papers/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.getPaperById);
// =====================================================
// Update paper
// PATCH /api/editor/papers/:id
// =====================================================
router.patch("/papers/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), upload_middleware_1.uploadPaper.single("pdf"), editor_controller_1.updatePaper);
// =====================================================
// Delete paper
// DELETE /api/editor/papers/:id
// =====================================================
router.delete("/papers/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.deletePaper);
// =====================================================
// Get all reviewers
// =====================================================
router.get("/reviewers", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.getReviewers);
// =====================================================
// Editor views single submitted review
// =====================================================
router.get("/review-requests/:reviewRequestId/review", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.getReviewDetails);
// =====================================================
// Editor makes final decision
// =====================================================
router.patch("/papers/:paperId/decision", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.makeFinalDecision);
// =====================================================
// Editor gets submitted reviews for a paper
// =====================================================
router.get("/papers/:paperId/reviews", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), editor_controller_1.getPaperReviews);
exports.default = router;
