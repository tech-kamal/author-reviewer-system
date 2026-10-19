"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewRequest_controller_1 = require("../controllers/reviewRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ============================================
// Editor invites reviewer
// ============================================
router.post("/review-requests", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), reviewRequest_controller_1.createReviewRequest);
// ============================================
// Editor gets review requests for a paper
// ============================================
router.get("/papers/:paperId/review-requests", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), reviewRequest_controller_1.getPaperReviewRequests);
exports.default = router;
