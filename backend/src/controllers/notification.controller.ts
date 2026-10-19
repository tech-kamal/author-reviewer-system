import { Response } from "express";
import prisma from "../prisma";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  sendError,
  handlePrismaError,
} from "../utils/error";

// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(
        res,
        401,
        "Authentication required"
      );
    }

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 50,
      });

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false,
        },
      });

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "getMyNotifications error:",
      error
    );

    return handlePrismaError(res, error);
  }
};


// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return sendError(
        res,
        401,
        "Authentication required"
      );
    }

    const id = String(req.params.id);

    if (!id) {
      return sendError(
        res,
        400,
        "Notification ID is required"
      );
    }

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

    if (!notification) {
      return sendError(
        res,
        404,
        "Notification not found"
      );
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },

        data: {
          isRead: true,
          readAt:
            notification.readAt ||
            new Date(),
        },
      });

    return res.json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "markNotificationAsRead error:",
      error
    );

    return handlePrismaError(res, error);
  }
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

export const markAllNotificationsAsRead =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return sendError(
          res,
          401,
          "Authentication required"
        );
      }

      const now = new Date();

      const result =
        await prisma.notification.updateMany({
          where: {
            userId: req.user.id,
            isRead: false,
          },

          data: {
            isRead: true,
            readAt: now,
          },
        });

      return res.json({
        success: true,
        message:
          "All notifications marked as read",
        updatedCount: result.count,
      });
    } catch (error) {
      console.error(
        "markAllNotificationsAsRead error:",
        error
      );

      return handlePrismaError(res, error);
    }
  };