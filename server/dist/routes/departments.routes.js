"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const departments_controller_1 = require("../controllers/departments.controller");
const router = (0, express_1.Router)();
exports.departmentsRouter = router;
const createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    headId: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional(),
});
const updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    code: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    headId: zod_1.z.string().nullable().optional(),
    parentId: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.requireOrg);
router.get("/", (0, error_middleware_1.asyncHandler)(departments_controller_1.DepartmentsController.list));
router.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateBody)(createDepartmentSchema), (0, error_middleware_1.asyncHandler)(departments_controller_1.DepartmentsController.create));
router.put("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, validation_middleware_1.validateBody)(updateDepartmentSchema), (0, error_middleware_1.asyncHandler)(departments_controller_1.DepartmentsController.update));
router.delete("/:id", (0, auth_middleware_1.requireRole)("ADMIN"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, error_middleware_1.asyncHandler)(departments_controller_1.DepartmentsController.delete));
//# sourceMappingURL=departments.routes.js.map