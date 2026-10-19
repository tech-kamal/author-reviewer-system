import { Router } from "express";

import {
  getRevisionData,
  sendRevisionToAuthor,
  getRevisionTracking,
  sendRevisionReminder,
  acknowledgeRevisionRequest,
} from "../controllers/revisionRequest.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { reviewUpload } from "../middleware/reviewUpload.middleware";

const router = Router();

// ============================================
// Get revision data for editor
// ============================================

router.get(
  "/papers/:paperId/revision-data",
  requireAuth,
  getRevisionData
);


router.get(
  "/revision-requests/tracking",
  requireAuth,
  requireRole("EDITOR"),
  getRevisionTracking
);

// ============================================
// Send revision request to author
// ============================================

router.post(
  "/papers/:paperId/revision-request",
  requireAuth,
  requireRole("EDITOR"),
  reviewUpload.single("revisionAttachment"),
  sendRevisionToAuthor
);

// ============================================
// Send revision reminder to author
// ============================================

router.post(
  "/revision-requests/:revisionRequestId/reminder",
  requireAuth,
  requireRole("EDITOR"),
  sendRevisionReminder
);

router.patch(
  "/revision-requests/:revisionRequestId/received",
  requireAuth,
  requireRole("REVIEWER"),
  acknowledgeRevisionRequest
);

export default router;