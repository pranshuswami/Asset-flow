import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { CategoriesController } from "../controllers/categories.controller";

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.use(authMiddleware);
router.use(requireOrg);

router.get("/", asyncHandler(CategoriesController.list));
router.post("/", requireRole("ADMIN", "ASSET_MANAGER"), validateBody(createCategorySchema), asyncHandler(CategoriesController.create));
router.put("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validateParams(z.object({ id: z.string() })), validateBody(updateCategorySchema), asyncHandler(CategoriesController.update));
router.delete("/:id", requireRole("ADMIN"), validateParams(z.object({ id: z.string() })), asyncHandler(CategoriesController.delete));

export { router as categoriesRouter };
