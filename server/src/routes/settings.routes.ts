import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authMiddleware, requireOrg } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const updateNotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  bookingReminders: z.boolean().optional(),
  maintenanceAlerts: z.boolean().optional(),
  auditNotifications: z.boolean().optional(),
});

export const settingsRouter: Router = Router();

settingsRouter.use(authMiddleware);
settingsRouter.use(requireOrg);

settingsRouter.get("/profile", asyncHandler(settingsController.getProfile));
settingsRouter.patch("/profile", validateBody(updateProfileSchema), asyncHandler(settingsController.updateProfile));
settingsRouter.patch("/notifications", validateBody(updateNotificationSettingsSchema), asyncHandler(settingsController.updateNotifications));
