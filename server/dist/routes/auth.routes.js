"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
exports.authRouter = router;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    organizationName: zod_1.z.string().min(1),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8),
});
router.post("/register", (0, validation_middleware_1.validateBody)(signupSchema), (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.register));
router.post("/login", (0, validation_middleware_1.validateBody)(loginSchema), (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.login));
router.post("/refresh", (0, validation_middleware_1.validateBody)(zod_1.z.object({ refreshToken: zod_1.z.string() })), (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.refresh));
router.post("/forgot-password", (0, validation_middleware_1.validateBody)(forgotPasswordSchema), (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.forgotPassword));
router.post("/reset-password", (0, validation_middleware_1.validateBody)(resetPasswordSchema), (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.resetPassword));
router.get("/me", (0, error_middleware_1.asyncHandler)(auth_controller_1.AuthController.me));
//# sourceMappingURL=auth.routes.js.map