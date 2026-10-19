"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Get dashboard statistics
router.get("/stats", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.getAdminStats);
// ============================================
// Admin Management Routes
// ============================================
// Get all admins
router.get("/admins", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.getAdmins);
// Create new admin
router.post("/admins", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.createAdmin);
// Delete admin
router.delete("/admins/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.deleteAdmin);
// ============================================
// Editor / Reviewer Management
// ============================================
router.get("/users", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.getUsersByRole);
router.delete("/users/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("ADMIN"), admin_controller_1.deleteUser);
exports.default = router;
