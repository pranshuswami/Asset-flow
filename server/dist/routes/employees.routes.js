"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const employees_controller_1 = require("../controllers/employees.controller");
const router = (0, express_1.Router)();
exports.employeesRouter = router;
const createEmployeeSchema = zod_1.z.object({
    employeeCode: zod_1.z.string().min(1),
    designation: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
});
const updateEmployeeSchema = zod_1.z.object({
    designation: zod_1.z.string().min(1).optional(),
    departmentId: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.requireOrg);
router.get("/", (0, error_middleware_1.asyncHandler)(employees_controller_1.EmployeesController.list));
router.get("/:id", (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, error_middleware_1.asyncHandler)(employees_controller_1.EmployeesController.getById));
router.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateBody)(createEmployeeSchema), (0, error_middleware_1.asyncHandler)(employees_controller_1.EmployeesController.create));
router.put("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, validation_middleware_1.validateBody)(updateEmployeeSchema), (0, error_middleware_1.asyncHandler)(employees_controller_1.EmployeesController.update));
//# sourceMappingURL=employees.routes.js.map