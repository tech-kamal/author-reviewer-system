import { Router } from "express";
import {
  getMyRevisionRequests,
  acknowledgeRevisionRequest,
  downloadRevisionAttachment,
} from "../controllers/revisionRequest.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/revision-requests",
  requireAuth,
  requireRole("REVIEWER"),
  getMyRevisionRequests
);

router.patch(
  "/revision-requests/:revisionRequestId/received",
  requireAuth,
  requireRole("REVIEWER"),
  acknowledgeRevisionRequest
);


router.get(
  "/revision-requests/:revisionRequestId/attachment",
  requireAuth,
  requireRole("REVIEWER"),
  downloadRevisionAttachment
);
export default router;