import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

router.post("/register", validateBody(signupSchema), asyncHandler(AuthController.register));
router.post("/login", validateBody(loginSchema), asyncHandler(AuthController.login));
router.post("/refresh", validateBody(z.object({ refreshToken: z.string() })), asyncHandler(AuthController.refresh));
router.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(AuthController.forgotPassword));
router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(AuthController.resetPassword));
router.get("/me", asyncHandler(AuthController.me));

export { router as authRouter };
