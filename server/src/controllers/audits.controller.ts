import { Request, Response } from "express";
import { auditsService } from "../services/audits.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { AuditStatus, AuditItemStatus } from "@prisma/client";

export const auditsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const result = await auditsService.list(
      {
        organizationId: user.organizationId!,
        departmentId: req.query.departmentId as string | undefined,
        status: req.query.status as AuditStatus | undefined,
        auditorId: req.query.auditorId as string | undefined,
      },
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Audits retrieved successfully",
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const audit = await auditsService.getById(req.params.id as string, req.user!.organizationId!);
=======
    const audit = await auditsService.getById(String(req.params.id), req.user!.organizationId!);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    res.status(200).json({
      success: true,
      data: audit,
      message: "Audit retrieved successfully",
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const audit = await auditsService.create(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: audit,
      message: "Audit created successfully",
    });
  }),

  addItems: asyncHandler(async (req: Request, res: Response) => {
    const audit = await auditsService.addItems(
<<<<<<< HEAD
      req.params.id as string,
=======
      String(req.params.id),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      req.user!.organizationId!,
      req.body.items
    );
    res.status(201).json({
      success: true,
      data: audit,
      message: "Audit items added successfully",
    });
  }),

  verifyItem: asyncHandler(async (req: Request, res: Response) => {
    const item = await auditsService.verifyItem(
<<<<<<< HEAD
      req.params.id as string,
      req.params.itemId as string,
=======
      String(req.params.id),
      String(req.params.itemId),
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
      req.user!.organizationId!,
      req.body
    );
    res.status(200).json({
      success: true,
      data: item,
      message: "Audit item verified successfully",
    });
  }),

  closeAudit: asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const audit = await auditsService.closeAudit(req.params.id as string, req.user!.organizationId!);
=======
    const audit = await auditsService.closeAudit(String(req.params.id), req.user!.organizationId!);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    res.status(200).json({
      success: true,
      data: audit,
      message: "Audit closed successfully",
    });
  }),
};
