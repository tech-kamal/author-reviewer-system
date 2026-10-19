"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================
router.get("/", auth_middleware_1.requireAuth, notification_controller_1.getMyNotifications);
// =====================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================================
router.patch("/read-all", auth_middleware_1.requireAuth, notification_controller_1.markAllNotificationsAsRead);
// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================
router.patch("/:id/read", auth_middleware_1.requireAuth, notification_controller_1.markNotificationAsRead);
exports.default = router;
