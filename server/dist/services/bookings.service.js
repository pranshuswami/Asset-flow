"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
function buildBookingWhere(filters) {
    const where = {
        employee: { department: { organizationId: filters.organizationId } },
    };
    if (filters.employeeId)
        where.employeeId = filters.employeeId;
    if (filters.assetId)
        where.assetId = filters.assetId;
    if (filters.locationId)
        where.locationId = filters.locationId;
    if (filters.status)
        where.status = filters.status;
    if (filters.from || filters.to) {
        const range = {};
        if (filters.from)
            range.gte = filters.from;
        if (filters.to)
            range.lte = filters.to;
        where.startTime = range;
    }
    return where;
}
function buildOverlapWhere(start, end, assetId, locationId, excludeId) {
    const resourceConditions = [];
    if (assetId)
        resourceConditions.push({ assetId });
    if (locationId)
        resourceConditions.push({ locationId });
    if (resourceConditions.length === 0)
        return null;
    return {
        id: excludeId ? { not: excludeId } : undefined,
        status: { not: client_1.BookingStatus.CANCELLED },
        OR: resourceConditions,
        startTime: { lt: end },
        endTime: { gt: start },
    };
}
async function assertNoOverlap(start, end, assetId, locationId, excludeId) {
    const overlap = buildOverlapWhere(start, end, assetId, locationId, excludeId);
    if (!overlap)
        return;
    const clash = await db_1.prisma.booking.findFirst({ where: overlap });
    if (clash) {
        throw new errors_1.ConflictError("Booking overlaps with an existing booking for the same asset or location");
    }
}
exports.bookingsService = {
    async list(filters, page = 1, limit = 20) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const where = buildBookingWhere(filters);
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.booking.findMany({
                where,
                orderBy: { startTime: "asc" },
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
                include: {
                    asset: { select: { id: true, name: true, assetCode: true } },
                    location: {
                        select: { id: true, code: true, building: true, floor: true, room: true },
                    },
                    employee: {
                        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                    },
                },
            }),
            db_1.prisma.booking.count({ where }),
        ]);
        return {
            data,
            meta: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    },
    async getById(id, organizationId) {
        const booking = await db_1.prisma.booking.findFirst({
            where: { id, employee: { department: { organizationId } } },
            include: {
                asset: true,
                location: true,
                employee: { include: { user: true } },
            },
        });
        if (!booking)
            throw new errors_1.NotFoundError("Booking not found");
        return booking;
    },
    async create(data, employeeId) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        if (end <= start)
            throw new errors_1.BadRequestError("End time must be after start time");
        await assertNoOverlap(start, end, data.assetId, data.locationId);
        return db_1.prisma.booking.create({
            data: {
                title: data.title,
                description: data.description,
                assetId: data.assetId,
                locationId: data.locationId,
                employeeId,
                startTime: start,
                endTime: end,
                status: data.status ?? client_1.BookingStatus.CONFIRMED,
                isRecurring: data.isRecurring ?? false,
                recurrence: data.recurrence,
                reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
            },
            include: {
                asset: { select: { id: true, name: true, assetCode: true } },
                location: true,
                employee: { include: { user: true } },
            },
        });
    },
    async update(id, organizationId, data) {
        const existing = await this.getById(id, organizationId);
        const start = data.startTime ? new Date(data.startTime) : existing.startTime;
        const end = data.endTime ? new Date(data.endTime) : existing.endTime;
        if (end <= start)
            throw new errors_1.BadRequestError("End time must be after start time");
        const assetId = data.assetId !== undefined ? data.assetId : existing.assetId;
        const locationId = data.locationId !== undefined ? data.locationId : existing.locationId;
        await assertNoOverlap(start, end, assetId, locationId, id);
        return db_1.prisma.booking.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                assetId,
                locationId,
                startTime: start,
                endTime: end,
                status: data.status,
                isRecurring: data.isRecurring,
                recurrence: data.recurrence,
                reminderAt: data.reminderAt !== undefined
                    ? data.reminderAt
                        ? new Date(data.reminderAt)
                        : null
                    : undefined,
            },
            include: {
                asset: { select: { id: true, name: true, assetCode: true } },
                location: true,
                employee: { include: { user: true } },
            },
        });
    },
    async remove(id, organizationId) {
        await this.getById(id, organizationId);
        await db_1.prisma.booking.delete({ where: { id } });
        return { id };
    },
};
//# sourceMappingURL=bookings.service.js.map