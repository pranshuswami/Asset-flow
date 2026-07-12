"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetsController = exports.uploadAssetPhoto = void 0;
const multer_1 = __importDefault(require("multer"));
const assets_service_1 = require("../services/assets.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadAssetPhoto = upload.single("photo");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
exports.assetsController = {
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const result = await assets_service_1.assetsService.listAssets({
            organizationId: req.query.org ? String(req.query.org) : user.organizationId,
            status: req.query.status,
            categoryId: req.query.categoryId,
            departmentId: req.query.departmentId,
            locationId: req.query.locationId,
            ownerId: req.query.ownerId,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        }, page, limit);
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: "Assets retrieved successfully",
        });
    }),
    create: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const asset = await assets_service_1.assetsService.createAsset(req.body, user.id);
        res.status(201).json({
            success: true,
            data: asset,
            message: "Asset created successfully",
        });
    }),
    getById: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const asset = await assets_service_1.assetsService.getAssetById(req.params.id);
        res.status(200).json({
            success: true,
            data: asset,
            message: "Asset retrieved successfully",
        });
    }),
    update: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const asset = await assets_service_1.assetsService.updateAsset(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: asset,
            message: "Asset updated successfully",
        });
    }),
    remove: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await assets_service_1.assetsService.deleteAsset(req.params.id);
        res.status(200).json({
            success: true,
            data: result,
            message: "Asset deleted successfully",
        });
    }),
    generateQR: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const asset = await assets_service_1.assetsService.generateQRCode(req.params.id);
        res.status(200).json({
            success: true,
            data: { qrCodeUrl: asset.qrCodeUrl },
            message: "QR code generated successfully",
        });
    }),
    timeline: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const events = await assets_service_1.assetsService.getTimeline(req.params.id);
        res.status(200).json({
            success: true,
            data: events,
            message: "Timeline retrieved successfully",
        });
    }),
    addTimelineEvent: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const event = await assets_service_1.assetsService.addTimelineEvent(req.params.id, req.body, user.id);
        res.status(201).json({
            success: true,
            data: event,
            message: "Timeline event added successfully",
        });
    }),
    uploadPhoto: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.file) {
            res.status(400).json({ success: false, message: "No photo file provided" });
            return;
        }
        const asset = await assets_service_1.assetsService.uploadPhoto(req.params.id, req.file);
        res.status(200).json({
            success: true,
            data: { photoUrl: asset.photoUrl },
            message: "Photo uploaded successfully",
        });
    }),
};
//# sourceMappingURL=assets.controller.js.map