import { Request, Response } from "express";
import { maintenanceService } from "../services/maintenance.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { MaintenanceStatus } from "@prisma/client";

export const maintenanceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const result = await maintenanceService.list(
      {
        organizationId: user.organizationId!,
        assetId: req.query.assetId as string | undefined,
        status: req.query.status as MaintenanceStatus | undefined,
        priority: req.query.priority as any,
        assignedToId: req.query.assignedToId as string | undefined,
      },
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Maintenance records retrieved successfully",
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const record = await maintenanceService.getById(String(req.params.id), req.user!.organizationId!);
    res.status(200).json({
      success: true,
      data: record,
      message: "Maintenance record retrieved successfully",
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await maintenanceService.create(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: record,
      message: "Maintenance request created successfully",
    });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const record = await maintenanceService.updateStatus(
      String(req.params.id),
      req.user!.organizationId!,
      req.body.status
    );
    res.status(200).json({
      success: true,
      data: record,
      message: `Maintenance status updated to ${req.body.status}`,
    });
  }),

  assignTechnician: asyncHandler(async (req: Request, res: Response) => {
    const record = await maintenanceService.assignTechnician(
      String(req.params.id),
      req.user!.organizationId!,
      req.body.assignedToId
    );
    res.status(200).json({
      success: true,
      data: record,
      message: "Technician assigned successfully",
    });
  }),
};
