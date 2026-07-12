"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const audits_controller_1 = require("../controllers/audits.controller");
exports.auditsRouter = (0, express_1.Router)();
const idParamsSchema = zod_1.z.object({ id: zod_1.z.string().min(1) });
const itemParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    itemId: zod_1.z.string().min(1),
});
const listQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    status: zod_1.z.enum(["PENDING", "IN_PROGRESS", "CLOSED"]).optional(),
    auditorId: zod_1.z.string().optional(),
});
const createAuditSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1),
    auditorId: zod_1.z.string().min(1),
});
const addItemsSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        assetId: zod_1.z.string().min(1),
        remarks: zod_1.z.string().optional(),
    }))
        .min(1),
});
const verifyItemSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "VERIFIED", "MISSING", "DAMAGED"]),
    remarks: zod_1.z.string().optional(),
    photos: zod_1.z.any().optional(),
});
exports.auditsRouter.use(auth_middleware_1.authMiddleware, auth_middleware_1.requireOrg);
exports.auditsRouter.get("/", (0, validation_middleware_1.validateQuery)(listQuerySchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.list));
exports.auditsRouter.get("/:id", (0, validation_middleware_1.validateParams)(idParamsSchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.getById));
exports.auditsRouter.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateBody)(createAuditSchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.create));
exports.auditsRouter.post("/:id/items", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, validation_middleware_1.validateBody)(addItemsSchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.addItems));
exports.auditsRouter.patch("/:id/items/:itemId", (0, validation_middleware_1.validateParams)(itemParamsSchema), (0, validation_middleware_1.validateBody)(verifyItemSchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.verifyItem));
exports.auditsRouter.patch("/:id/close", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateParams)(idParamsSchema), (0, error_middleware_1.asyncHandler)(audits_controller_1.auditsController.closeAudit));
//# sourceMappingURL=audits.routes.js.map