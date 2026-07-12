"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceController = void 0;
const maintenance_service_1 = require("../services/maintenance.service");
const error_middleware_1 = require("../middlewares/error.middleware");
exports.maintenanceController = {
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const result = await maintenance_service_1.maintenanceService.list({
            organizationId: user.organizationId,
            assetId: req.query.assetId,
            status: req.query.status,
            priority: req.query.priority,
            assignedToId: req.query.assignedToId,
        }, page, limit);
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: "Maintenance records retrieved successfully",
        });
    }),
    getById: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const record = await maintenance_service_1.maintenanceService.getById(req.params.id, req.user.organizationId);
        res.status(200).json({
            success: true,
            data: record,
            message: "Maintenance record retrieved successfully",
        });
    }),
    create: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const record = await maintenance_service_1.maintenanceService.create(req.body, req.user.id);
        res.status(201).json({
            success: true,
            data: record,
            message: "Maintenance request created successfully",
        });
    }),
    updateStatus: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const record = await maintenance_service_1.maintenanceService.updateStatus(req.params.id, req.user.organizationId, req.body.status);
        res.status(200).json({
            success: true,
            data: record,
            message: `Maintenance status updated to ${req.body.status}`,
        });
    }),
    assignTechnician: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const record = await maintenance_service_1.maintenanceService.assignTechnician(req.params.id, req.user.organizationId, req.body.assignedToId);
        res.status(200).json({
            success: true,
            data: record,
            message: "Technician assigned successfully",
        });
    }),
};
//# sourceMappingURL=maintenance.controller.js.map