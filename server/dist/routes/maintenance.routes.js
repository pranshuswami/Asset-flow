"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const maintenance_controller_1 = require("../controllers/maintenance.controller");
exports.maintenanceRouter = (0, express_1.Router)();
const idParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const listQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"])
        .optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    assignedToId: zod_1.z.string().optional(),
});
const createMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string(),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    status: zod_1.z
        .enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"])
        .optional(),
    assignedToId: zod_1.z.string().optional(),
    cost: zod_1.z.number().optional(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"]),
});
const assignTechnicianSchema = zod_1.z.object({
    assignedToId: zod_1.z.string().min(1),
});
exports.maintenanceRouter.use(auth_middleware_1.authMiddleware, auth_middleware_1.requireOrg);
exports.maintenanceRouter.get("/", (0, validation_middleware_1.validateQuery)(listQuerySchema), (0, error_middleware_1.asyncHandler)(maintenance_controller_1.maintenanceController.list));
exports.maintenanceRouter.get("/:id", (0, validation_middleware_1.validateParams)(idParamsSchema), (0, error_middleware_1.asyncHandler)(maintenance_controller_1.maintenanceController.getById));
exports.maintenanceRouter.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateBody)(createMaintenanceSchema), (0, error_middleware_1.asyncHandler)(maintenance_controller_1.maintenanceController.create));
exports.maintenanceRouter.patch("/:id/status", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, validation_middleware_1.validateBody)(updateStatusSchema), (0, error_middleware_1.asyncHandler)(maintenance_controller_1.maintenanceController.updateStatus));
exports.maintenanceRouter.patch("/:id/assign", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, validation_middleware_1.validateBody)(assignTechnicianSchema), (0, error_middleware_1.asyncHandler)(maintenance_controller_1.maintenanceController.assignTechnician));
//# sourceMappingURL=maintenance.routes.js.map