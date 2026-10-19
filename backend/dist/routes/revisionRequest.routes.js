"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const revisionRequest_controller_1 = require("../controllers/revisionRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const reviewUpload_middleware_1 = require("../middleware/reviewUpload.middleware");
const router = (0, express_1.Router)();
// ============================================
// Get revision data for editor
// ============================================
router.get("/papers/:paperId/revision-data", auth_middleware_1.requireAuth, revisionRequest_controller_1.getRevisionData);
router.get("/revision-requests/tracking", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), revisionRequest_controller_1.getRevisionTracking);
// ============================================
// Send revision request to author
// ============================================
router.post("/papers/:paperId/revision-request", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), reviewUpload_middleware_1.reviewUpload.single("revisionAttachment"), revisionRequest_controller_1.sendRevisionToAuthor);
// ============================================
// Send revision reminder to author
// ============================================
router.post("/revision-requests/:revisionRequestId/reminder", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("EDITOR"), revisionRequest_controller_1.sendRevisionReminder);
router.patch("/revision-requests/:revisionRequestId/received", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("REVIEWER"), revisionRequest_controller_1.acknowledgeRevisionRequest);
exports.default = router;
