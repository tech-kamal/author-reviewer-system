import { Router } from "express";

import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/editor-only",
  requireAuth,
  requireRole("EDITOR"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "You are an authenticated editor",
      user: req.user,
    });
  }
);

router.get(
  "/reviewer-only",
  requireAuth,
  requireRole("REVIEWER"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "You are an authenticated reviewer",
      user: req.user,
    });
  }
);

export default router;