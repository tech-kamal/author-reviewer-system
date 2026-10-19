"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const editorInvitation_controller_1 = require("../controllers/editorInvitation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ============================================
// Editor Invitation Routes
// ============================================
// Create Editor Invitation
// POST /api/admin/editor-invitations
router.post("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), editorInvitation_controller_1.createEditorInvitation);
// Get Editor Invitations
// GET /api/admin/editor-invitations
router.get("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), editorInvitation_controller_1.getEditorInvitations);
router.get("/:token", editorInvitation_controller_1.validateEditorInvitation);
router.post("/:token/register", editorInvitation_controller_1.registerEditor);
router.delete("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), editorInvitation_controller_1.deleteEditorInvitation);
exports.default = router;
