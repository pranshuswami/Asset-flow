import { Request, Response } from "express";
import multer from "multer";
import { assetsService } from "../services/assets.service";
import { asyncHandler } from "../middlewares/error.middleware";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadAssetPhoto = upload.single("photo");

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const assetsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const result = await assetsService.listAssets(
      {
        organizationId: req.query.org ? String(req.query.org) : user.organizationId,
        status: req.query.status as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        departmentId: req.query.departmentId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        ownerId: req.query.ownerId as string | undefined,
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
      },
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "Assets retrieved successfully",
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const asset = await assetsService.createAsset(req.body, user.id);

    res.status(201).json({
      success: true,
      data: asset,
      message: "Asset created successfully",
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const asset = await assetsService.getAssetById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: asset,
      message: "Asset retrieved successfully",
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const asset = await assetsService.updateAsset(req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      data: asset,
      message: "Asset updated successfully",
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await assetsService.deleteAsset(req.params.id as string);
    res.status(200).json({
      success: true,
      data: result,
      message: "Asset deleted successfully",
    });
  }),

  generateQR: asyncHandler(async (req: Request, res: Response) => {
    const asset = await assetsService.generateQRCode(req.params.id as string);
    res.status(200).json({
      success: true,
      data: { qrCodeUrl: asset.qrCodeUrl },
      message: "QR code generated successfully",
    });
  }),

  timeline: asyncHandler(async (req: Request, res: Response) => {
    const events = await assetsService.getTimeline(req.params.id as string);
    res.status(200).json({
      success: true,
      data: events,
      message: "Timeline retrieved successfully",
    });
  }),

  addTimelineEvent: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const event = await assetsService.addTimelineEvent(req.params.id as string, req.body, user.id);
    res.status(201).json({
      success: true,
      data: event,
      message: "Timeline event added successfully",
    });
  }),

  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No photo file provided" });
      return;
    }
    const asset = await assetsService.uploadPhoto(req.params.id as string, req.file);
    res.status(200).json({
      success: true,
      data: { photoUrl: asset.photoUrl },
      message: "Photo uploaded successfully",
    });
  }),
};
