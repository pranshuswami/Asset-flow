import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authMiddleware, requireOrg } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { aiChatSchema } from "../schemas";

export const aiRouter: Router = Router();

aiRouter.use(authMiddleware);
aiRouter.use(requireOrg);

aiRouter.post("/chat", validateBody(aiChatSchema), asyncHandler(aiController.chat));
