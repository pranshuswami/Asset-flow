import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller";
import { authMiddleware, requireOrg } from "../middlewares/auth.middleware";
import { validateBody, validateQuery } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";

const markReadSchema = z.object({ notificationId: z.string() });
const paginationSchema = z.object({ page: z.string().optional(), limit: z.string().optional() });

export const notificationsRouter: Router = Router();

notificationsRouter.use(authMiddleware);
notificationsRouter.use(requireOrg);

notificationsRouter.get(
  "/",
  validateQuery(paginationSchema),
  asyncHandler(notificationsController.list)
);

notificationsRouter.patch(
  "/read",
  validateBody(markReadSchema),
  asyncHandler(notificationsController.markAsRead)
);

notificationsRouter.patch(
  "/read-all",
  asyncHandler(notificationsController.markAllAsRead)
);

notificationsRouter.get(
  "/unread-count",
  asyncHandler(notificationsController.getUnreadCount)
);
