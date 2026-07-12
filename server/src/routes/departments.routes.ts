import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { DepartmentsController } from "../controllers/departments.controller";

const router = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  headId: z.string().optional(),
  parentId: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  headId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.use(authMiddleware);
router.use(requireOrg);

router.get("/", asyncHandler(DepartmentsController.list));
router.post("/", requireRole("ADMIN", "ASSET_MANAGER"), validateBody(createDepartmentSchema), asyncHandler(DepartmentsController.create));
router.put("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validateParams(z.object({ id: z.string() })), validateBody(updateDepartmentSchema), asyncHandler(DepartmentsController.update));
router.delete("/:id", requireRole("ADMIN"), validateParams(z.object({ id: z.string() })), asyncHandler(DepartmentsController.delete));

export { router as departmentsRouter };
