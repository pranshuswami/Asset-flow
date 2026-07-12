"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
const db_1 = require("../config/db");
exports.notificationsService = {
    async listNotifications(userId, page, limit) {
        const where = { userId };
        const skip = (page - 1) * limit;
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db_1.prisma.notification.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    async markAsRead(userId, notificationId) {
        const notification = await db_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        await db_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        return { id: notificationId, isRead: true };
    },
    async markAllAsRead(userId) {
        await db_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { updatedCount: true };
    },
    async getUnreadCount(userId) {
        const count = await db_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    },
};
//# sourceMappingURL=notifications.service.js.map