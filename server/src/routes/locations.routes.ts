import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { LocationsController } from "../controllers/locations.controller";

const router = Router();

const createLocationSchema = z.object({
  building: z.string().min(1),
  code: z.string().min(1),
  floor: z.string().optional(),
  room: z.string().optional(),
});

const updateLocationSchema = z.object({
  building: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.use(authMiddleware);
router.use(requireOrg);

router.get("/", asyncHandler(LocationsController.list));
router.post("/", requireRole("ADMIN", "ASSET_MANAGER"), validateBody(createLocationSchema), asyncHandler(LocationsController.create));
router.put("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validateParams(z.object({ id: z.string() })), validateBody(updateLocationSchema), asyncHandler(LocationsController.update));
router.delete("/:id", requireRole("ADMIN"), validateParams(z.object({ id: z.string() })), asyncHandler(LocationsController.delete));

export { router as locationsRouter };
