"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceService = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const socket_service_1 = require("../services/socket.service");
async function notify(input) {
    const notification = await db_1.prisma.notification.create({ data: input });
    try {
        (0, socket_service_1.getIO)().to(`user:${input.userId}`).emit("notification", notification);
    }
    catch {
        /* socket not initialized */
    }
    return notification;
}
function buildMaintenanceWhere(filters) {
    const where = {
        asset: { location: { organizationId: filters.organizationId } },
    };
    if (filters.assetId)
        where.assetId = filters.assetId;
    if (filters.status)
        where.status = filters.status;
    if (filters.priority)
        where.priority = filters.priority;
    if (filters.assignedToId)
        where.assignedToId = filters.assignedToId;
    return where;
}
exports.maintenanceService = {
    async list(filters, page = 1, limit = 20) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const where = buildMaintenanceWhere(filters);
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.maintenance.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
                include: {
                    asset: { select: { id: true, name: true, assetCode: true, currentStatus: true } },
                    assignedTo: {
                        include: { user: { select: { id: true, firstName: true, lastName: true } } },
                    },
                },
            }),
            db_1.prisma.maintenance.count({ where }),
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
        const record = await db_1.prisma.maintenance.findFirst({
            where: { id, asset: { location: { organizationId } } },
            include: {
                asset: true,
                assignedTo: {
                    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
                },
            },
        });
        if (!record)
            throw new errors_1.NotFoundError("Maintenance record not found");
        return record;
    },
    async create(data, createdById) {
        const asset = await db_1.prisma.asset.findUnique({ where: { id: data.assetId } });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        const status = data.status ?? client_1.MaintenanceStatus.PENDING;
        const record = await db_1.prisma.$transaction(async (tx) => {
            const created = await tx.maintenance.create({
                data: {
                    assetId: data.assetId,
                    title: data.title,
                    description: data.description,
                    priority: data.priority ?? client_1.MaintenancePriority.MEDIUM,
                    status,
                    assignedToId: data.assignedToId,
                    cost: data.cost,
                },
            });
            if (status === client_1.MaintenanceStatus.APPROVED) {
                await tx.asset.update({
                    where: { id: data.assetId },
                    data: { currentStatus: client_1.AssetStatus.MAINTENANCE },
                });
            }
            await tx.assetTimeline.create({
                data: {
                    assetId: data.assetId,
                    type: "MAINTENANCE_REQUESTED",
                    description: `Maintenance "${data.title}" was requested.`,
                    actorId: createdById,
                },
            });
            return created;
        });
        const orgId = await this.orgOfAsset(data.assetId);
        if (status === client_1.MaintenanceStatus.APPROVED) {
            try {
                (0, socket_service_1.getIO)().to(`org:${orgId}`).emit("maintenance:approved", record);
            }
            catch {
                /* socket not initialized */
            }
        }
        return this.getById(record.id, orgId);
    },
    async updateStatus(id, organizationId, status) {
        const record = await this.getById(id, organizationId);
        if (!Object.values(client_1.MaintenanceStatus).includes(status)) {
            throw new errors_1.BadRequestError("Invalid maintenance status");
        }
        const updated = await db_1.prisma.$transaction(async (tx) => {
            const result = await tx.maintenance.update({
                where: { id },
                data: {
                    status,
                    resolvedAt: status === client_1.MaintenanceStatus.RESOLVED
                        ? new Date()
                        : status === client_1.MaintenanceStatus.APPROVED
                            ? null
                            : record.resolvedAt,
                },
            });
            if (status === client_1.MaintenanceStatus.APPROVED) {
                await tx.asset.update({
                    where: { id: record.assetId },
                    data: { currentStatus: client_1.AssetStatus.MAINTENANCE },
                });
                await tx.assetTimeline.create({
                    data: {
                        assetId: record.assetId,
                        type: "MAINTENANCE_REQUESTED",
                        description: "Maintenance request was approved. Asset moved to maintenance.",
                    },
                });
            }
            else if (status === client_1.MaintenanceStatus.RESOLVED) {
                await tx.asset.update({
                    where: { id: record.assetId },
                    data: { currentStatus: client_1.AssetStatus.AVAILABLE },
                });
                await tx.assetTimeline.create({
                    data: {
                        assetId: record.assetId,
                        type: "MAINTENANCE_COMPLETED",
                        description: "Maintenance completed. Asset is available again.",
                    },
                });
            }
            return result;
        });
        if (status === client_1.MaintenanceStatus.APPROVED) {
            const asset = await db_1.prisma.asset.findUnique({
                where: { id: record.assetId },
                include: { owner: { include: { user: true } } },
            });
            if (record.assignedToId) {
                await notify({
                    userId: record.assignedToId,
                    type: client_1.NotificationType.MAINTENANCE_APPROVED,
                    title: "Maintenance approved",
                    message: `Maintenance "${record.title}" has been approved and assigned to you.`,
                    link: `/maintenance/${record.id}`,
                    metadata: { maintenanceId: record.id, assetId: record.assetId },
                });
            }
            if (asset?.owner?.userId) {
                await notify({
                    userId: asset.owner.userId,
                    type: client_1.NotificationType.MAINTENANCE_APPROVED,
                    title: "Asset under maintenance",
                    message: `Asset "${asset.name}" is now under maintenance.`,
                    link: `/maintenance/${record.id}`,
                    metadata: { maintenanceId: record.id, assetId: record.assetId },
                });
            }
            try {
                (0, socket_service_1.getIO)().to(`org:${organizationId}`).emit("maintenance:approved", updated);
            }
            catch {
                /* socket not initialized */
            }
        }
        else if (status === client_1.MaintenanceStatus.RESOLVED) {
            try {
                (0, socket_service_1.getIO)().to(`org:${organizationId}`).emit("maintenance:resolved", updated);
            }
            catch {
                /* socket not initialized */
            }
        }
        return this.getById(id, organizationId);
    },
    async assignTechnician(id, organizationId, assignedToId) {
        await this.getById(id, organizationId);
        const technician = await db_1.prisma.employee.findUnique({ where: { id: assignedToId } });
        if (!technician)
            throw new errors_1.NotFoundError("Technician (employee) not found");
        const updated = await db_1.prisma.maintenance.update({
            where: { id },
            data: { assignedToId },
        });
        await notify({
            userId: assignedToId,
            type: client_1.NotificationType.MAINTENANCE_APPROVED,
            title: "Maintenance assigned",
            message: `You have been assigned to a maintenance task.`,
            link: `/maintenance/${id}`,
            metadata: { maintenanceId: id },
        });
        try {
            (0, socket_service_1.getIO)().to(`user:${assignedToId}`).emit("maintenance:assigned", updated);
        }
        catch {
            /* socket not initialized */
        }
        return this.getById(id, organizationId);
    },
    async orgOfAsset(assetId) {
        const asset = await db_1.prisma.asset.findUnique({
            where: { id: assetId },
            include: { location: { select: { organizationId: true } } },
        });
        return asset?.location?.organizationId ?? "";
    },
};
//# sourceMappingURL=maintenance.service.js.map