"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationsService = void 0;
const db_1 = require("../config/db");
const socket_service_1 = require("../services/socket.service");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
async function emitToOrg(organizationId, event, payload) {
    try {
        const io = (0, socket_service_1.getIO)();
        if (organizationId) {
            io.to(`org:${organizationId}`).emit(event, payload);
        }
        io.emit(event, payload);
    }
    catch {
        /* socket not initialized */
    }
}
async function notifyUser(userId, input) {
    await db_1.prisma.notification.create({
        data: {
            userId,
            type: input.type,
            title: input.title,
            message: input.message,
            link: input.link,
            metadata: input.metadata,
        },
    });
}
async function getEmployee(employeeId) {
    const employee = await db_1.prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!employee)
        throw new errors_1.NotFoundError("Employee not found");
    return employee;
}
async function getAssetForAllocation(assetId) {
    const asset = await db_1.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset)
        throw new errors_1.NotFoundError("Asset not found");
    const active = await db_1.prisma.allocation.findFirst({
        where: { assetId, status: { in: [client_1.AllocationStatus.REQUESTED, client_1.AllocationStatus.APPROVED] } },
    });
    if (active) {
        throw new errors_1.ConflictError("This asset is already allocated or has a pending request");
    }
    if (asset.currentStatus !== client_1.AssetStatus.AVAILABLE && asset.currentStatus !== client_1.AssetStatus.RESERVED) {
        throw new errors_1.ConflictError(`Asset is not available for allocation (status: ${asset.currentStatus})`);
    }
    return asset;
}
exports.allocationsService = {
    async requestAllocation(data, requestedByUserId) {
        const employee = await getEmployee(data.employeeId);
        const asset = await getAssetForAllocation(data.assetId);
        return db_1.prisma.$transaction(async (tx) => {
            const allocation = await tx.allocation.create({
                data: {
                    assetId: data.assetId,
                    employeeId: data.employeeId,
                    notes: data.notes,
                    conditionAtAllocation: data.conditionAtAllocation,
                    status: client_1.AllocationStatus.REQUESTED,
                },
            });
            await tx.asset.update({
                where: { id: data.assetId },
                data: { currentStatus: client_1.AssetStatus.RESERVED },
            });
            await tx.assetTimeline.create({
                data: {
                    assetId: data.assetId,
                    type: "ALLOCATED",
                    description: `Allocation requested for ${employee.user.firstName} ${employee.user.lastName}.`,
                    actorId: requestedByUserId,
                    metadata: { allocationId: allocation.id, status: "REQUESTED" },
                },
            });
            const orgId = await getOrgIdForAsset(tx, data.assetId);
            await notifyUser(employee.user.id, {
                type: client_1.NotificationType.ASSET_ASSIGNED,
                title: "Asset allocation requested",
                message: `An allocation request for asset ${asset.assetCode} has been submitted for you.`,
                link: `/allocations/${allocation.id}`,
                metadata: { allocationId: allocation.id, assetId: data.assetId },
            });
            await emitToOrg(orgId, "allocation:requested", { allocation, assetId: data.assetId });
            return allocation;
        });
    },
    async approveAllocation(allocationId, approverUserId, notes) {
        const allocation = await db_1.prisma.allocation.findUnique({ where: { id: allocationId } });
        if (!allocation)
            throw new errors_1.NotFoundError("Allocation not found");
        if (allocation.status !== client_1.AllocationStatus.REQUESTED) {
            throw new errors_1.BadRequestError(`Only REQUESTED allocations can be approved (current: ${allocation.status})`);
        }
        const employee = await getEmployee(allocation.employeeId);
        return db_1.prisma.$transaction(async (tx) => {
            const updated = await tx.allocation.update({
                where: { id: allocationId },
                data: { status: client_1.AllocationStatus.APPROVED, approvedAt: new Date(), notes: notes ?? allocation.notes },
            });
            await tx.asset.update({
                where: { id: allocation.assetId },
                data: { currentStatus: client_1.AssetStatus.ALLOCATED, ownerId: allocation.employeeId },
            });
            await tx.assetTimeline.create({
                data: {
                    assetId: allocation.assetId,
                    type: "ALLOCATED",
                    description: `Allocation approved for ${employee.user.firstName} ${employee.user.lastName}.`,
                    actorId: approverUserId,
                    metadata: { allocationId, status: "APPROVED" },
                },
            });
            const orgId = await getOrgIdForAsset(tx, allocation.assetId);
            await notifyUser(employee.user.id, {
                type: client_1.NotificationType.ASSET_ASSIGNED,
                title: "Asset allocation approved",
                message: `Your allocation request has been approved.`,
                link: `/allocations/${allocation.id}`,
                metadata: { allocationId, assetId: allocation.assetId },
            });
            await emitToOrg(orgId, "allocation:approved", { allocation: updated, assetId: allocation.assetId });
            return updated;
        });
    },
    async rejectAllocation(allocationId, approverUserId, notes) {
        const allocation = await db_1.prisma.allocation.findUnique({ where: { id: allocationId } });
        if (!allocation)
            throw new errors_1.NotFoundError("Allocation not found");
        if (allocation.status !== client_1.AllocationStatus.REQUESTED) {
            throw new errors_1.BadRequestError(`Only REQUESTED allocations can be rejected (current: ${allocation.status})`);
        }
        return db_1.prisma.$transaction(async (tx) => {
            const updated = await tx.allocation.update({
                where: { id: allocationId },
                data: { status: client_1.AllocationStatus.REJECTED, notes: notes ?? allocation.notes },
            });
            await tx.asset.update({
                where: { id: allocation.assetId },
                data: { currentStatus: client_1.AssetStatus.AVAILABLE },
            });
            await tx.assetTimeline.create({
                data: {
                    assetId: allocation.assetId,
                    type: "RETURNED",
                    description: `Allocation request rejected.`,
                    actorId: approverUserId,
                    metadata: { allocationId, status: "REJECTED" },
                },
            });
            const orgId = await getOrgIdForAsset(tx, allocation.assetId);
            await emitToOrg(orgId, "allocation:rejected", { allocation: updated, assetId: allocation.assetId });
            return updated;
        });
    },
    async returnAsset(allocationId, actorUserId, notes) {
        const allocation = await db_1.prisma.allocation.findUnique({ where: { id: allocationId } });
        if (!allocation)
            throw new errors_1.NotFoundError("Allocation not found");
        if (allocation.status !== client_1.AllocationStatus.APPROVED) {
            throw new errors_1.BadRequestError(`Only APPROVED allocations can be returned (current: ${allocation.status})`);
        }
        return db_1.prisma.$transaction(async (tx) => {
            const updated = await tx.allocation.update({
                where: { id: allocationId },
                data: { status: client_1.AllocationStatus.RETURNED, returnedAt: new Date(), notes: notes ?? allocation.notes },
            });
            await tx.asset.update({
                where: { id: allocation.assetId },
                data: { currentStatus: client_1.AssetStatus.AVAILABLE, ownerId: null },
            });
            await tx.assetTimeline.create({
                data: {
                    assetId: allocation.assetId,
                    type: "RETURNED",
                    description: `Asset returned.`,
                    actorId: actorUserId,
                    metadata: { allocationId, status: "RETURNED" },
                },
            });
            const orgId = await getOrgIdForAsset(tx, allocation.assetId);
            await emitToOrg(orgId, "allocation:returned", { allocation: updated, assetId: allocation.assetId });
            return updated;
        });
    },
    async listAllocations(filters) {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(100, Math.max(1, filters.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.assetId)
            where.assetId = filters.assetId;
        if (filters.status)
            where.status = filters.status;
        if (filters.organizationId) {
            where.asset = { department: { organizationId: filters.organizationId } };
        }
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.allocation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    asset: { select: { id: true, assetCode: true, name: true, photoUrl: true } },
                    employee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            designation: true,
                            user: { select: { id: true, firstName: true, lastName: true, email: true } },
                        },
                    },
                },
            }),
            db_1.prisma.allocation.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
};
async function getOrgIdForAsset(tx, assetId) {
    const asset = await tx.asset.findUnique({
        where: { id: assetId },
        select: { department: { select: { organizationId: true } } },
    });
    return asset?.department?.organizationId ?? null;
}
//# sourceMappingURL=allocations.service.js.map