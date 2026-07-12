import { Request, Response } from "express";
import { allocationsService } from "../services/allocations.service";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const allocationsController = {
  request: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const allocation = await allocationsService.requestAllocation(
      {
        assetId: req.body.assetId,
        employeeId: req.body.employeeId,
        notes: req.body.notes,
        conditionAtAllocation: req.body.conditionAtAllocation,
      },
      user.id
    );

    res.status(201).json({
      success: true,
      data: allocation,
      message: "Allocation requested successfully",
    });
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const allocation = await allocationsService.approveAllocation(
<<<<<<< HEAD
      req.params.id as string,
=======
      String(req.params.id),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      user.id,
      req.body?.notes
    );

    res.status(200).json({
      success: true,
      data: allocation,
      message: "Allocation approved successfully",
    });
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const allocation = await allocationsService.rejectAllocation(
<<<<<<< HEAD
      req.params.id as string,
=======
      String(req.params.id),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      user.id,
      req.body?.notes
    );

    res.status(200).json({
      success: true,
      data: allocation,
      message: "Allocation rejected successfully",
    });
  }),

  return: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const allocation = await allocationsService.returnAsset(
<<<<<<< HEAD
      req.params.id as string,
=======
      String(req.params.id),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      user.id,
      req.body?.notes
    );

    res.status(200).json({
      success: true,
      data: allocation,
      message: "Asset returned successfully",
    });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const result = await allocationsService.listAllocations({
      organizationId: req.query.org ? String(req.query.org) : user.organizationId,
      employeeId: req.query.employeeId as string | undefined,
      assetId: req.query.assetId as string | undefined,
      status: req.query.status as string | undefined,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Allocations retrieved successfully",
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const result = await allocationsService.listAllocations({ assetId: req.params.id as string, limit: 1 });
=======
    const result = await allocationsService.listAllocations({ assetId: String(req.params.id), limit: 1 });
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    const allocation = result.data[0];
    if (!allocation) {
      res.status(404).json({ success: false, message: "Allocation not found" });
      return;
    }
    res.status(200).json({ success: true, data: allocation, message: "Allocation retrieved successfully" });
  }),
};
