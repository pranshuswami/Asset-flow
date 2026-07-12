"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.use(auth_middleware_1.authMiddleware);
exports.reportsRouter.use(auth_middleware_1.requireOrg);
exports.reportsRouter.get("/utilization", (0, error_middleware_1.asyncHandler)(reports_controller_1.reportsController.assetUtilization));
exports.reportsRouter.get("/department-usage", (0, error_middleware_1.asyncHandler)(reports_controller_1.reportsController.departmentUsage));
exports.reportsRouter.get("/maintenance-cost", (0, error_middleware_1.asyncHandler)(reports_controller_1.reportsController.maintenanceCost));
exports.reportsRouter.get("/idle-assets", (0, error_middleware_1.asyncHandler)(reports_controller_1.reportsController.idleAssets));
//# sourceMappingURL=reports.routes.js.map