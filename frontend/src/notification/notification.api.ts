import { api } from "../api/api";


// =====================================================
// TYPES
// =====================================================

export type Notification = {
  id: string;

  userId: string;

  type: string;

  title: string;

  message: string;

  relatedId?: string | null;

  relatedType?: string | null;

  isRead: boolean;

  createdAt: string;

  readAt?: string | null;
};


// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

export const getMyNotifications = async (): Promise<{
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}> => {
  const response = await api.get(
    "/notifications"
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to load notifications"
    );
  }

  return result;
};


// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

export const markNotificationAsRead = async (
  notificationId: string
): Promise<{
  success: boolean;
  message: string;
  notification: Notification;
}> => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to mark notification as read"
    );
  }

  return result;
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

export const markAllNotificationsAsRead =
  async (): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
  }> => {
    const response = await api.patch(
      "/notifications/read-all"
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to mark all notifications as read"
      );
    }

    return result;
  };