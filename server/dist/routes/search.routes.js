"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = require("express");
const search_controller_1 = require("../controllers/search.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const zod_1 = require("zod");
const searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1),
});
exports.searchRouter = (0, express_1.Router)();
exports.searchRouter.use(auth_middleware_1.authMiddleware);
exports.searchRouter.use(auth_middleware_1.requireOrg);
exports.searchRouter.get("/", (0, validation_middleware_1.validateQuery)(searchQuerySchema), (0, error_middleware_1.asyncHandler)(search_controller_1.searchController.search));
//# sourceMappingURL=search.routes.js.map