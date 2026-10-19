"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getMyNotifications = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const error_1 = require("../utils/error");
// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================
const getMyNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const notifications = await prisma_1.default.notification.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50,
        });
        const unreadCount = await prisma_1.default.notification.count({
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
    }
    catch (error) {
        console.error("getMyNotifications error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.getMyNotifications = getMyNotifications;
// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================
const markNotificationAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const id = String(req.params.id);
        if (!id) {
            return (0, error_1.sendError)(res, 400, "Notification ID is required");
        }
        const notification = await prisma_1.default.notification.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!notification) {
            return (0, error_1.sendError)(res, 404, "Notification not found");
        }
        const updatedNotification = await prisma_1.default.notification.update({
            where: {
                id: notification.id,
            },
            data: {
                isRead: true,
                readAt: notification.readAt ||
                    new Date(),
            },
        });
        return res.json({
            success: true,
            message: "Notification marked as read",
            notification: updatedNotification,
        });
    }
    catch (error) {
        console.error("markNotificationAsRead error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================
const markAllNotificationsAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return (0, error_1.sendError)(res, 401, "Authentication required");
        }
        const now = new Date();
        const result = await prisma_1.default.notification.updateMany({
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
            message: "All notifications marked as read",
            updatedCount: result.count,
        });
    }
    catch (error) {
        console.error("markAllNotificationsAsRead error:", error);
        return (0, error_1.handlePrismaError)(res, error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
