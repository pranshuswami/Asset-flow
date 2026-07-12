import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { OrganizationController } from "../controllers/organization.controller";

const router = Router();

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logoUrl: z.string().nullable().optional(),
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  settings: z.any().optional(),
});

router.use(authMiddleware);
router.get("/", asyncHandler(OrganizationController.getOrganization));
router.put("/", requireRole("ADMIN"), validateBody(updateOrganizationSchema), asyncHandler(OrganizationController.updateOrganization));

export { router as organizationRouter };
