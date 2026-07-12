"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationsController = void 0;
const allocations_service_1 = require("../services/allocations.service");
const error_middleware_1 = require("../middlewares/error.middleware");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
exports.allocationsController = {
    request: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const allocation = await allocations_service_1.allocationsService.requestAllocation({
            assetId: req.body.assetId,
            employeeId: req.body.employeeId,
            notes: req.body.notes,
            conditionAtAllocation: req.body.conditionAtAllocation,
        }, user.id);
        res.status(201).json({
            success: true,
            data: allocation,
            message: "Allocation requested successfully",
        });
    }),
    approve: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const allocation = await allocations_service_1.allocationsService.approveAllocation(req.params.id, user.id, req.body?.notes);
        res.status(200).json({
            success: true,
            data: allocation,
            message: "Allocation approved successfully",
        });
    }),
    reject: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const allocation = await allocations_service_1.allocationsService.rejectAllocation(req.params.id, user.id, req.body?.notes);
        res.status(200).json({
            success: true,
            data: allocation,
            message: "Allocation rejected successfully",
        });
    }),
    return: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const allocation = await allocations_service_1.allocationsService.returnAsset(req.params.id, user.id, req.body?.notes);
        res.status(200).json({
            success: true,
            data: allocation,
            message: "Asset returned successfully",
        });
    }),
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const result = await allocations_service_1.allocationsService.listAllocations({
            organizationId: req.query.org ? String(req.query.org) : user.organizationId,
            employeeId: req.query.employeeId,
            assetId: req.query.assetId,
            status: req.query.status,
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
    getById: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await allocations_service_1.allocationsService.listAllocations({ assetId: req.params.id, limit: 1 });
        const allocation = result.data[0];
        if (!allocation) {
            res.status(404).json({ success: false, message: "Allocation not found" });
            return;
        }
        res.status(200).json({ success: true, data: allocation, message: "Allocation retrieved successfully" });
    }),
};
//# sourceMappingURL=allocations.controller.js.map