import { Router } from "express";

import {
  createEditorInvitation,
  getEditorInvitations,
  validateEditorInvitation,
  registerEditor,
  deleteEditorInvitation,
} from "../controllers/editorInvitation.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  requireRole,
} from "../middleware/role.middleware";

const router = Router();

// ============================================
// Editor Invitation Routes
// ============================================

// Create Editor Invitation
// POST /api/admin/editor-invitations

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  createEditorInvitation
);

// Get Editor Invitations
// GET /api/admin/editor-invitations

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  getEditorInvitations
);

router.get(
  "/:token",
  validateEditorInvitation
);

router.post(
  "/:token/register",
  registerEditor
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteEditorInvitation
);

export default router;