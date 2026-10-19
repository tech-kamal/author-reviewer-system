import { Router } from "express";

import {
  createWithdrawalRequest,
  getMyWithdrawalRequests,
  deleteWithdrawnManuscript,
} from "../controllers/withdrawal.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

/**
 * =====================================================
 * AUTHOR WITHDRAWAL REQUESTS
 * =====================================================
 */

// Create withdrawal request
router.post(
  "/",
  requireAuth,
  requireRole("REVIEWER"),
  createWithdrawalRequest
);

// Get my withdrawal requests/history
router.get(
  "/",
  requireAuth,
  requireRole("REVIEWER"),
  getMyWithdrawalRequests
);


// Permanently delete approved withdrawn manuscript
router.delete(
  "/:paperId",
  requireAuth,
  requireRole("REVIEWER"),
  deleteWithdrawnManuscript
);

export default router;