"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsController = void 0;
const db_1 = require("../config/db");
const bookings_service_1 = require("../services/bookings.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const errors_1 = require("../utils/errors");
const socket_service_1 = require("../services/socket.service");
async function resolveEmployeeId(req) {
    const user = req.user;
    const employee = await db_1.prisma.employee.findUnique({ where: { userId: user.id } });
    if (!employee)
        throw new errors_1.ForbiddenError("Employee profile not found for this user");
    return employee.id;
}
exports.bookingsController = {
    list: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const result = await bookings_service_1.bookingsService.list({
            organizationId: user.organizationId,
            employeeId: req.query.employeeId,
            assetId: req.query.assetId,
            locationId: req.query.locationId,
            status: req.query.status,
            from: req.query.from ? new Date(req.query.from) : undefined,
            to: req.query.to ? new Date(req.query.to) : undefined,
        }, page, limit);
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
            message: "Bookings retrieved successfully",
        });
    }),
    getById: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const booking = await bookings_service_1.bookingsService.getById(String(req.params.id), req.user.organizationId);
        res.status(200).json({
            success: true,
            data: booking,
            message: "Booking retrieved successfully",
        });
    }),
    create: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const employeeId = await resolveEmployeeId(req);
        const booking = await bookings_service_1.bookingsService.create(req.body, employeeId);
        try {
            (0, socket_service_1.getIO)().to(`org:${req.user.organizationId}`).emit("booking:created", booking);
        }
        catch {
            /* socket not initialized */
        }
        res.status(201).json({
            success: true,
            data: booking,
            message: "Booking created successfully",
        });
    }),
    update: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const booking = await bookings_service_1.bookingsService.update(String(req.params.id), req.user.organizationId, req.body);
        try {
            (0, socket_service_1.getIO)().to(`org:${req.user.organizationId}`).emit("booking:updated", booking);
        }
        catch {
            /* socket not initialized */
        }
        res.status(200).json({
            success: true,
            data: booking,
            message: "Booking updated successfully",
        });
    }),
    remove: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const result = await bookings_service_1.bookingsService.remove(String(req.params.id), req.user.organizationId);
        try {
            (0, socket_service_1.getIO)().to(`org:${req.user.organizationId}`).emit("booking:deleted", { id: req.params.id });
        }
        catch {
            /* socket not initialized */
        }
        res.status(200).json({
            success: true,
            data: result,
            message: "Booking deleted successfully",
        });
    }),
};
//# sourceMappingURL=bookings.controller.js.map