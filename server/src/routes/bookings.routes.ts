import { Router } from "express";
import { z } from "zod";
import {
  authMiddleware,
  requireOrg,
  requireRole,
} from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { bookingsController } from "../controllers/bookings.controller";

export const bookingsRouter = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  employeeId: z.string().optional(),
  assetId: z.string().optional(),
  locationId: z.string().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const createBookingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assetId: z.string().optional(),
  locationId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
  reminderAt: z.string().datetime().optional(),
});

const updateBookingSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assetId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
});

bookingsRouter.use(authMiddleware, requireOrg);

bookingsRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(bookingsController.list)
);

bookingsRouter.get(
  "/:id",
  validateParams(idParamsSchema),
  asyncHandler(bookingsController.getById)
);

bookingsRouter.post(
  "/",
  validateBody(createBookingSchema),
  asyncHandler(bookingsController.create)
);

bookingsRouter.put(
  "/:id",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"),
  validateParams(idParamsSchema),
  validateBody(updateBookingSchema),
  asyncHandler(bookingsController.update)
);

bookingsRouter.delete(
  "/:id",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  validateParams(idParamsSchema),
  asyncHandler(bookingsController.remove)
);
