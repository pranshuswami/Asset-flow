import { NotFoundError } from "../utils/errors";
import { Request, Response } from "express";
import { prisma } from "../config/db";
import { getIO } from "../services/socket.service";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

function emitNotification(userId: string, notification: any) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit("notification:new", notification);
  } catch (err) {
    console.error("[notification] socket emit failed", err);
  }
}

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const where = { userId: user.id };

    const [data, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      message: "Notifications retrieved successfully",
    });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { notificationId } = req.body;

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId: user.id },
    });
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      data: { id: notificationId, isRead: true },
      message: "Notification marked as read",
    });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      data: { updatedCount: true },
      message: "All notifications marked as read",
    });
  }),

  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);

    const count = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.status(200).json({
      success: true,
      data: { count },
      message: "Unread count retrieved",
    });
  }),
};
