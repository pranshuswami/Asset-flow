"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const organization_controller_1 = require("../controllers/organization.controller");
const router = (0, express_1.Router)();
exports.organizationRouter = router;
const updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    logoUrl: zod_1.z.string().nullable().optional(),
    plan: zod_1.z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
    settings: zod_1.z.any().optional(),
});
router.use(auth_middleware_1.authMiddleware);
router.get("/", (0, error_middleware_1.asyncHandler)(organization_controller_1.OrganizationController.getOrganization));
router.put("/", (0, auth_middleware_1.requireRole)("ADMIN"), (0, validation_middleware_1.validateBody)(updateOrganizationSchema), (0, error_middleware_1.asyncHandler)(organization_controller_1.OrganizationController.updateOrganization));
//# sourceMappingURL=organization.routes.js.map