import { Router } from "express";

import {
  createAdmin,
  getAdmins,
  deleteAdmin,
  getAdminStats,
  getUsersByRole,
  deleteUser,
} from "../controllers/admin.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  requireRole,
} from "../middleware/role.middleware";

const router = Router();



// Get dashboard statistics

router.get(
  "/stats",
  requireAuth,
  requireRole("ADMIN"),
  getAdminStats
);

// ============================================
// Admin Management Routes
// ============================================

// Get all admins

router.get(
  "/admins",
  requireAuth,
  requireRole("ADMIN"),
  getAdmins
);

// Create new admin

router.post(
  "/admins",
  requireAuth,
  requireRole("ADMIN"),
  createAdmin
);

// Delete admin

router.delete(
  "/admins/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteAdmin
);

// ============================================
// Editor / Reviewer Management
// ============================================

router.get(
  "/users",
  requireAuth,
  requireRole("ADMIN"),
  getUsersByRole
);

router.delete(
  "/users/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteUser
);

export default router;