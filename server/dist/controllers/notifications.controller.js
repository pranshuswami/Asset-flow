"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const errors_1 = require("../utils/errors");
const db_1 = require("../config/db");
const socket_service_1 = require("../services/socket.service");
const error_middleware_1 = require("../middlewares/error.middleware");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
function emitNotification(userId, notification) {
    try {
        const io = (0, socket_service_1.getIO)();
        io.to(`user:${userId}`).emit("notification:new", notification);
    }
    catch (err) {
        console.error("[notification] socket emit failed", err);
    }
}
exports.notificationsController = {
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const where = { userId: user.id };
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_1.prisma.notification.count({ where }),
        ]);
        res.status(200).json({
            success: true,
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            message: "Notifications retrieved successfully",
        });
    }),
    markAsRead: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const { notificationId } = req.body;
        const notification = await db_1.prisma.notification.findFirst({
            where: { id: notificationId, userId: user.id },
        });
        if (!notification) {
            throw new errors_1.NotFoundError("Notification not found");
        }
        await db_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        res.status(200).json({
            success: true,
            data: { id: notificationId, isRead: true },
            message: "Notification marked as read",
        });
    }),
    markAllAsRead: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        await db_1.prisma.notification.updateMany({
            where: { userId: user.id, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({
            success: true,
            data: { updatedCount: true },
            message: "All notifications marked as read",
        });
    }),
    getUnreadCount: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const count = await db_1.prisma.notification.count({
            where: { userId: user.id, isRead: false },
        });
        res.status(200).json({
            success: true,
            data: { count },
            message: "Unread count retrieved",
        });
    }),
};
//# sourceMappingURL=notifications.controller.js.map