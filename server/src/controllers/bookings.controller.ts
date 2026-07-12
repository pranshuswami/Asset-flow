import { Request, Response } from "express";
import { prisma } from "../config/db";
import { bookingsService } from "../services/bookings.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ForbiddenError } from "../utils/errors";
import { getIO } from "../services/socket.service";
import { BookingStatus } from "@prisma/client";

async function resolveEmployeeId(req: Request): Promise<string> {
  const user = req.user!;
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
  if (!employee) throw new ForbiddenError("Employee profile not found for this user");
  return employee.id;
}

export const bookingsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const result = await bookingsService.list(
      {
        organizationId: user.organizationId!,
        employeeId: req.query.employeeId as string | undefined,
        assetId: req.query.assetId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        status: req.query.status as BookingStatus | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      },
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Bookings retrieved successfully",
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const booking = await bookingsService.getById(req.params.id as string, req.user!.organizationId!);
=======
    const booking = await bookingsService.getById(String(req.params.id), req.user!.organizationId!);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking retrieved successfully",
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const employeeId = await resolveEmployeeId(req);
    const booking = await bookingsService.create(req.body, employeeId);

    try {
      getIO().to(`org:${req.user!.organizationId}`).emit("booking:created", booking);
    } catch {
      /* socket not initialized */
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.update(
<<<<<<< HEAD
      req.params.id as string,
=======
      String(req.params.id),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      req.user!.organizationId!,
      req.body
    );

    try {
      getIO().to(`org:${req.user!.organizationId}`).emit("booking:updated", booking);
    } catch {
      /* socket not initialized */
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const result = await bookingsService.remove(req.params.id as string, req.user!.organizationId!);
=======
    const result = await bookingsService.remove(String(req.params.id), req.user!.organizationId!);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec

    try {
      getIO().to(`org:${req.user!.organizationId}`).emit("booking:deleted", { id: req.params.id });
    } catch {
      /* socket not initialized */
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Booking deleted successfully",
    });
  }),
};
