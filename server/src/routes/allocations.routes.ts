import { Router } from "express";
import { allocationsController } from "../controllers/allocations.controller";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { createAllocationSchema, allocationActionSchema } from "../schemas";

export const allocationsRouter: Router = Router();

allocationsRouter.use(authMiddleware);
allocationsRouter.use(requireOrg);

allocationsRouter.get("/", asyncHandler(allocationsController.list));

allocationsRouter.post(
  "/",
  validateBody(createAllocationSchema),
  asyncHandler(allocationsController.request)
);

allocationsRouter.get("/:id", asyncHandler(allocationsController.getById));

allocationsRouter.post(
  "/:id/approve",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(allocationActionSchema),
  asyncHandler(allocationsController.approve)
);

allocationsRouter.post(
  "/:id/reject",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(allocationActionSchema),
  asyncHandler(allocationsController.reject)
);

allocationsRouter.post(
  "/:id/return",
  validateBody(allocationActionSchema),
  asyncHandler(allocationsController.return)
);
