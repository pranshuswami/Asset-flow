import { Router } from "express";
import { reportsController } from "../controllers/reports.controller";
import { authMiddleware, requireOrg } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/error.middleware";

export const reportsRouter: Router = Router();

reportsRouter.use(authMiddleware);
reportsRouter.use(requireOrg);

reportsRouter.get("/utilization", asyncHandler(reportsController.assetUtilization));
reportsRouter.get("/department-usage", asyncHandler(reportsController.departmentUsage));
reportsRouter.get("/maintenance-cost", asyncHandler(reportsController.maintenanceCost));
reportsRouter.get("/idle-assets", asyncHandler(reportsController.idleAssets));
