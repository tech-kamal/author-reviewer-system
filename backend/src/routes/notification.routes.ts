import { Router } from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

const router = Router();


// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
  "/",
  requireAuth,
  getMyNotifications
);


// =====================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch(
  "/read-all",
  requireAuth,
  markAllNotificationsAsRead
);


// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch(
  "/:id/read",
  requireAuth,
  markNotificationAsRead
);

export default router;