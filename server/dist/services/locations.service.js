"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsService = void 0;
exports.listLocations = listLocations;
exports.createLocation = createLocation;
exports.updateLocation = updateLocation;
exports.deleteLocation = deleteLocation;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function listLocations(organizationId, includeInactive = false) {
    return db_1.prisma.location.findMany({
        where: {
            organizationId,
            ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
            _count: { select: { assets: true, bookings: true } },
        },
        orderBy: { code: "asc" },
    });
}
async function createLocation(organizationId, data) {
    const existing = await db_1.prisma.location.findFirst({
        where: { organizationId, code: data.code },
    });
    if (existing) {
        throw new errors_1.ConflictError("Location code already exists in this organization");
    }
    return db_1.prisma.location.create({
        data: {
            ...data,
            organizationId,
            floor: data.floor ?? null,
            room: data.room ?? null,
        },
        include: { _count: { select: { assets: true, bookings: true } } },
    });
}
async function updateLocation(id, organizationId, data) {
    const existing = await db_1.prisma.location.findFirst({
        where: { id, organizationId },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Location not found");
    }
    if (data.code && data.code !== existing.code) {
        const codeTaken = await db_1.prisma.location.findFirst({
            where: { organizationId, code: data.code, id: { not: id } },
        });
        if (codeTaken) {
            throw new errors_1.ConflictError("Location code already exists");
        }
    }
    return db_1.prisma.location.update({
        where: { id },
        data: {
            ...(data.building !== undefined && { building: data.building }),
            ...(data.code !== undefined && { code: data.code }),
            ...(data.floor !== undefined && { floor: data.floor }),
            ...(data.room !== undefined && { room: data.room }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: { _count: { select: { assets: true, bookings: true } } },
    });
}
async function deleteLocation(id, organizationId) {
    const existing = await db_1.prisma.location.findFirst({
        where: { id, organizationId },
        include: { _count: { select: { assets: true, bookings: true } } },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Location not found");
    }
    if (existing._count.assets > 0) {
        throw new errors_1.BadRequestError("Cannot delete location with associated assets");
    }
    await db_1.prisma.location.delete({ where: { id } });
    return { message: "Location deleted successfully" };
}
exports.locationsService = {
    listLocations,
    createLocation,
    updateLocation,
    deleteLocation,
};
//# sourceMappingURL=locations.service.js.map