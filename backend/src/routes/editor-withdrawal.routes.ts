import { Router } from "express";
import {
  getWithdrawalRequests,
  decideWithdrawalRequest,
} from "../controllers/editor-withdrawal.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("EDITOR"),
  getWithdrawalRequests
);

router.patch(
  "/:id/decision",
  requireAuth,
  requireRole("EDITOR"),
  decideWithdrawalRequest
);

export default router;