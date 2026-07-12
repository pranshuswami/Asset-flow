import { prisma } from "../config/db";

export interface NotificationSettings {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  bookingReminders?: boolean;
  maintenanceAlerts?: boolean;
  auditNotifications?: boolean;
}

export const notificationsService = {
  async listNotifications(userId: string, page: number, limit: number) {
    const where = { userId };
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { id: notificationId, isRead: true };
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updatedCount: true };
  },

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  },
};
