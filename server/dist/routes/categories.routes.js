"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const categories_controller_1 = require("../controllers/categories.controller");
const router = (0, express_1.Router)();
exports.categoriesRouter = router;
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
});
const updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().nullable().optional(),
    icon: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.requireOrg);
router.get("/", (0, error_middleware_1.asyncHandler)(categories_controller_1.CategoriesController.list));
router.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateBody)(createCategorySchema), (0, error_middleware_1.asyncHandler)(categories_controller_1.CategoriesController.create));
router.put("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, validation_middleware_1.validateBody)(updateCategorySchema), (0, error_middleware_1.asyncHandler)(categories_controller_1.CategoriesController.update));
router.delete("/:id", (0, auth_middleware_1.requireRole)("ADMIN"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, error_middleware_1.asyncHandler)(categories_controller_1.CategoriesController.delete));
//# sourceMappingURL=categories.routes.js.map