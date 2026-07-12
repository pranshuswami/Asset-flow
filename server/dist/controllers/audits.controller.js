"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditsController = void 0;
const audits_service_1 = require("../services/audits.service");
const error_middleware_1 = require("../middlewares/error.middleware");
exports.auditsController = {
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const result = await audits_service_1.auditsService.list({
            organizationId: user.organizationId,
            departmentId: req.query.departmentId,
            status: req.query.status,
            auditorId: req.query.auditorId,
        }, page, limit);
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: "Audits retrieved successfully",
        });
    }),
    getById: (0, error_middleware_1.asyncHandler)(async (req, res) => {
<<<<<<< HEAD
        const audit = await audits_service_1.auditsService.getById(req.params.id, req.user.organizationId);
=======
        const audit = await audits_service_1.auditsService.getById(String(req.params.id), req.user.organizationId);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        res.status(200).json({
            success: true,
            data: audit,
            message: "Audit retrieved successfully",
        });
    }),
    create: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const audit = await audits_service_1.auditsService.create(req.body, req.user.id);
        res.status(201).json({
            success: true,
            data: audit,
            message: "Audit created successfully",
        });
    }),
    addItems: (0, error_middleware_1.asyncHandler)(async (req, res) => {
<<<<<<< HEAD
        const audit = await audits_service_1.auditsService.addItems(req.params.id, req.user.organizationId, req.body.items);
=======
        const audit = await audits_service_1.auditsService.addItems(String(req.params.id), req.user.organizationId, req.body.items);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        res.status(201).json({
            success: true,
            data: audit,
            message: "Audit items added successfully",
        });
    }),
    verifyItem: (0, error_middleware_1.asyncHandler)(async (req, res) => {
<<<<<<< HEAD
        const item = await audits_service_1.auditsService.verifyItem(req.params.id, req.params.itemId, req.user.organizationId, req.body);
=======
        const item = await audits_service_1.auditsService.verifyItem(String(req.params.id), String(req.params.itemId), req.user.organizationId, req.body);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        res.status(200).json({
            success: true,
            data: item,
            message: "Audit item verified successfully",
        });
    }),
    closeAudit: (0, error_middleware_1.asyncHandler)(async (req, res) => {
<<<<<<< HEAD
        const audit = await audits_service_1.auditsService.closeAudit(req.params.id, req.user.organizationId);
=======
        const audit = await audits_service_1.auditsService.closeAudit(String(req.params.id), req.user.organizationId);
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        res.status(200).json({
            success: true,
            data: audit,
            message: "Audit closed successfully",
        });
    }),
};
//# sourceMappingURL=audits.controller.js.map