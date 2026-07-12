"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const locations_controller_1 = require("../controllers/locations.controller");
const router = (0, express_1.Router)();
exports.locationsRouter = router;
const createLocationSchema = zod_1.z.object({
    building: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
    floor: zod_1.z.string().optional(),
    room: zod_1.z.string().optional(),
});
const updateLocationSchema = zod_1.z.object({
    building: zod_1.z.string().min(1).optional(),
    code: zod_1.z.string().min(1).optional(),
    floor: zod_1.z.string().nullable().optional(),
    room: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.requireOrg);
router.get("/", (0, error_middleware_1.asyncHandler)(locations_controller_1.LocationsController.list));
router.post("/", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateBody)(createLocationSchema), (0, error_middleware_1.asyncHandler)(locations_controller_1.LocationsController.create));
router.put("/:id", (0, auth_middleware_1.requireRole)("ADMIN", "ASSET_MANAGER"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, validation_middleware_1.validateBody)(updateLocationSchema), (0, error_middleware_1.asyncHandler)(locations_controller_1.LocationsController.update));
router.delete("/:id", (0, auth_middleware_1.requireRole)("ADMIN"), (0, validation_middleware_1.validateParams)(zod_1.z.object({ id: zod_1.z.string() })), (0, error_middleware_1.asyncHandler)(locations_controller_1.LocationsController.delete));
//# sourceMappingURL=locations.routes.js.map