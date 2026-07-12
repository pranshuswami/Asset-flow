"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const zod_1 = require("zod");
const markReadSchema = zod_1.z.object({ notificationId: zod_1.z.string() });
const paginationSchema = zod_1.z.object({ page: zod_1.z.string().optional(), limit: zod_1.z.string().optional() });
exports.notificationsRouter = (0, express_1.Router)();
exports.notificationsRouter.use(auth_middleware_1.authMiddleware);
exports.notificationsRouter.use(auth_middleware_1.requireOrg);
exports.notificationsRouter.get("/", (0, validation_middleware_1.validateQuery)(paginationSchema), (0, error_middleware_1.asyncHandler)(notifications_controller_1.notificationsController.list));
exports.notificationsRouter.patch("/read", (0, validation_middleware_1.validateBody)(markReadSchema), (0, error_middleware_1.asyncHandler)(notifications_controller_1.notificationsController.markAsRead));
exports.notificationsRouter.patch("/read-all", (0, error_middleware_1.asyncHandler)(notifications_controller_1.notificationsController.markAllAsRead));
exports.notificationsRouter.get("/unread-count", (0, error_middleware_1.asyncHandler)(notifications_controller_1.notificationsController.getUnreadCount));
//# sourceMappingURL=notifications.routes.js.map