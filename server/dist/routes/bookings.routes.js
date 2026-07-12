"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const bookings_controller_1 = require("../controllers/bookings.controller");
exports.bookingsRouter = (0, express_1.Router)();
const idParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const listQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    employeeId: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    locationId: zod_1.z.string().optional(),
    status: zod_1.z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
const createBookingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    locationId: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    status: zod_1.z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
    isRecurring: zod_1.z.boolean().optional(),
    recurrence: zod_1.z.string().optional(),
    reminderAt: zod_1.z.string().datetime().optional(),
});
const updateBookingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    assetId: zod_1.z.string().nullable().optional(),
    locationId: zod_1.z.string().nullable().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
    isRecurring: zod_1.z.boolean().optional(),
    recurrence: zod_1.z.string().optional(),
    reminderAt: zod_1.z.string().datetime().nullable().optional(),
});
exports.bookingsRouter.use(auth_middleware_1.authMiddleware, auth_middleware_1.requireOrg);
exports.bookingsRouter.get("/", (0, validation_middleware_1.validateQuery)(listQuerySchema), (0, error_middleware_1.asyncHandler)(bookings_controller_1.bookingsController.list));
exports.bookingsRouter.get("/:id", (0, validation_middleware_1.validateParams)(idParamsSchema), (0, error_middleware_1.asyncHandler)(bookings_controller_1.bookingsController.getById));
exports.bookingsRouter.post("/", (0, validation_middleware_1.validateBody)(createBookingSchema), (0, error_middleware_1.asyncHandler)(bookings_controller_1.bookingsController.create));
exports.bookingsRouter.put("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, validation_middleware_1.validateBody)(updateBookingSchema), (0, error_middleware_1.asyncHandler)(bookings_controller_1.bookingsController.update));
exports.bookingsRouter.delete("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, error_middleware_1.asyncHandler)(bookings_controller_1.bookingsController.remove));
//# sourceMappingURL=bookings.routes.js.map