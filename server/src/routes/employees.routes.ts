import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole, requireOrg } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { EmployeesController } from "../controllers/employees.controller";

const router = Router();

const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1),
  designation: z.string().min(1),
  departmentId: z.string().min(1),
  userId: z.string().min(1),
  phone: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  designation: z.string().min(1).optional(),
  departmentId: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.use(authMiddleware);
router.use(requireOrg);

router.get("/", asyncHandler(EmployeesController.list));
router.get("/:id", validateParams(z.object({ id: z.string() })), asyncHandler(EmployeesController.getById));
router.post("/", requireRole("ADMIN", "ASSET_MANAGER"), validateBody(createEmployeeSchema), asyncHandler(EmployeesController.create));
router.put("/:id", requireRole("ADMIN", "ASSET_MANAGER"), validateParams(z.object({ id: z.string() })), validateBody(updateEmployeeSchema), asyncHandler(EmployeesController.update));

export { router as employeesRouter };
