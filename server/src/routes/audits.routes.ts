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
import { auditsController } from "../controllers/audits.controller";

export const auditsRouter = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });
const itemParamsSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
});

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "CLOSED"]).optional(),
  auditorId: z.string().optional(),
});

const createAuditSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().min(1),
  auditorId: z.string().min(1),
});

const addItemsSchema = z.object({
  items: z
    .array(
      z.object({
        assetId: z.string().min(1),
        remarks: z.string().optional(),
      })
    )
    .min(1),
});

const verifyItemSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "MISSING", "DAMAGED"]),
  remarks: z.string().optional(),
  photos: z.any().optional(),
});

auditsRouter.use(authMiddleware, requireOrg);

auditsRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(auditsController.list)
);

auditsRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(auditsController.getById)
);

auditsRouter.post(
  "/",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(createAuditSchema),
  asyncHandler(auditsController.create)
);

auditsRouter.post(
  "/:id/items",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateParams(idParamsSchema),
  validateBody(addItemsSchema),
  asyncHandler(auditsController.addItems)
);

auditsRouter.patch(
  "/:id/items/:itemId",
  validateParams(itemParamsSchema),
  validateBody(verifyItemSchema),
  asyncHandler(auditsController.verifyItem)
);

auditsRouter.patch(
  "/:id/close",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateParams(idParamsSchema),
  asyncHandler(auditsController.closeAudit)
);
