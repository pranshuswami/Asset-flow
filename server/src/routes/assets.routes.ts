import { Router } from "express";
import { assetsController, uploadAssetPhoto } from "../controllers/assets.controller";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { createAssetSchema, updateAssetSchema, addTimelineEventSchema } from "../schemas";

export const assetsRouter: Router = Router();

assetsRouter.use(authMiddleware);
assetsRouter.use(requireOrg);

assetsRouter.get("/", asyncHandler(assetsController.list));

assetsRouter.post(
  "/",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(createAssetSchema),
  asyncHandler(assetsController.create)
);

assetsRouter.get("/:id", asyncHandler(assetsController.getById));

assetsRouter.patch(
  "/:id",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(updateAssetSchema),
  asyncHandler(assetsController.update)
);

assetsRouter.delete(
  "/:id",
  requireRole("ADMIN", "ASSET_MANAGER"),
  asyncHandler(assetsController.remove)
);

assetsRouter.post("/:id/qr", asyncHandler(assetsController.generateQR));

assetsRouter.get("/:id/timeline", asyncHandler(assetsController.timeline));

assetsRouter.post(
  "/:id/timeline",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateBody(addTimelineEventSchema),
  asyncHandler(assetsController.addTimelineEvent)
);

assetsRouter.post(
  "/:id/photo",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  uploadAssetPhoto,
  asyncHandler(assetsController.uploadPhoto)
);
