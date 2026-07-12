"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationsRouter = void 0;
const express_1 = require("express");
const allocations_controller_1 = require("../controllers/allocations.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const schemas_1 = require("../schemas");
exports.allocationsRouter = (0, express_1.Router)();
exports.allocationsRouter.use(auth_middleware_1.authMiddleware);
exports.allocationsRouter.use(auth_middleware_1.requireOrg);
exports.allocationsRouter.get("/", (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.list));
exports.allocationsRouter.post("/", (0, validation_middleware_1.validateBody)(schemas_1.createAllocationSchema), (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.request));
exports.allocationsRouter.get("/:id", (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.getById));
exports.allocationsRouter.post("/:id/approve", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateBody)(schemas_1.allocationActionSchema), (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.approve));
exports.allocationsRouter.post("/:id/reject", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), (0, validation_middleware_1.validateBody)(schemas_1.allocationActionSchema), (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.reject));
exports.allocationsRouter.post("/:id/return", (0, validation_middleware_1.validateBody)(schemas_1.allocationActionSchema), (0, error_middleware_1.asyncHandler)(allocations_controller_1.allocationsController.return));
//# sourceMappingURL=allocations.routes.js.map