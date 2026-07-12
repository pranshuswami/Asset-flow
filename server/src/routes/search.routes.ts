import { Router } from "express";
import { searchController } from "../controllers/search.controller";
import { authMiddleware, requireOrg } from "../middlewares/auth.middleware";
import { validateQuery } from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";

const searchQuerySchema = z.object({
  q: z.string().min(1),
});

export const searchRouter: Router = Router();

searchRouter.use(authMiddleware);
searchRouter.use(requireOrg);

searchRouter.get(
  "/",
  validateQuery(searchQuerySchema),
  asyncHandler(searchController.search)
);
