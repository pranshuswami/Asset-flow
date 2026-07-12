"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const zod_1 = require("zod");
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
const updateNotificationSettingsSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    bookingReminders: zod_1.z.boolean().optional(),
    maintenanceAlerts: zod_1.z.boolean().optional(),
    auditNotifications: zod_1.z.boolean().optional(),
});
exports.settingsRouter = (0, express_1.Router)();
exports.settingsRouter.use(auth_middleware_1.authMiddleware);
exports.settingsRouter.use(auth_middleware_1.requireOrg);
exports.settingsRouter.get("/profile", (0, error_middleware_1.asyncHandler)(settings_controller_1.settingsController.getProfile));
exports.settingsRouter.patch("/profile", (0, validation_middleware_1.validateBody)(updateProfileSchema), (0, error_middleware_1.asyncHandler)(settings_controller_1.settingsController.updateProfile));
exports.settingsRouter.patch("/notifications", (0, validation_middleware_1.validateBody)(updateNotificationSettingsSchema), (0, error_middleware_1.asyncHandler)(settings_controller_1.settingsController.updateNotifications));
//# sourceMappingURL=settings.routes.js.map