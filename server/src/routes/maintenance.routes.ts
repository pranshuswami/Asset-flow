import { Router } from "express";
import { z } from "zod";
import {
  authMiddleware,
  requireOrg,
  requireRole,
} from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { maintenanceController } from "../controllers/maintenance.controller";

export const maintenanceRouter = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  assetId: z.string().optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assignedToId: z.string().optional(),
});

const createMaintenanceSchema = z.object({
  assetId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"])
    .optional(),
  assignedToId: z.string().optional(),
  cost: z.number().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS", "RESOLVED"]),
});

const assignTechnicianSchema = z.object({
  assignedToId: z.string().min(1),
});

maintenanceRouter.use(authMiddleware, requireOrg);

maintenanceRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(maintenanceController.list)
);

maintenanceRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(maintenanceController.getById)
);

maintenanceRouter.post(
  "/",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(createMaintenanceSchema),
  asyncHandler(maintenanceController.create)
);

maintenanceRouter.patch(
  "/:id/status",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateParams(idParamsSchema),
  validateBody(updateStatusSchema),
  asyncHandler(maintenanceController.updateStatus)
);

maintenanceRouter.patch(
  "/:id/assign",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateParams(idParamsSchema),
  validateBody(assignTechnicianSchema),
  asyncHandler(maintenanceController.assignTechnician)
);
