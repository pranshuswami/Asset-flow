"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditsService = void 0;
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
function buildAuditWhere(filters) {
    const where = {
        department: { organizationId: filters.organizationId },
    };
    if (filters.departmentId)
        where.departmentId = filters.departmentId;
    if (filters.status)
        where.status = filters.status;
    if (filters.auditorId)
        where.auditorId = filters.auditorId;
    return where;
}
exports.auditsService = {
    async list(filters, page = 1, limit = 20) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const where = buildAuditWhere(filters);
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.audit.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
                include: {
                    department: { select: { id: true, name: true } },
                    auditor: {
                        include: { user: { select: { id: true, firstName: true, lastName: true } } },
                    },
                    _count: { select: { items: true } },
                },
            }),
            db_1.prisma.audit.count({ where }),
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
        const audit = await db_1.prisma.audit.findFirst({
            where: { id, department: { organizationId } },
            include: {
                department: true,
                auditor: { include: { user: true } },
                items: {
                    include: { asset: { select: { id: true, name: true, assetCode: true } } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        if (!audit)
            throw new errors_1.NotFoundError("Audit not found");
        return audit;
    },
    async create(data, createdById) {
        const department = await db_1.prisma.department.findUnique({
            where: { id: data.departmentId },
        });
        if (!department)
            throw new errors_1.NotFoundError("Department not found");
        const auditor = await db_1.prisma.employee.findUnique({ where: { id: data.auditorId } });
        if (!auditor)
            throw new errors_1.NotFoundError("Auditor (employee) not found");
        const audit = await db_1.prisma.audit.create({
            data: {
                title: data.title,
                description: data.description,
                departmentId: data.departmentId,
                auditorId: data.auditorId,
                status: client_1.AuditStatus.PENDING,
            },
        });
        await notify({
            userId: data.auditorId,
            type: client_1.NotificationType.AUDIT_STARTED,
            title: "New audit assigned",
            message: `You have been assigned as auditor for "${data.title}".`,
            link: `/audits/${audit.id}`,
            metadata: { auditId: audit.id },
        });
        try {
            (0, socket_service_1.getIO)().to(`user:${data.auditorId}`).emit("audit:assigned", audit);
        }
        catch {
            /* socket not initialized */
        }
        return this.getById(audit.id, department.organizationId);
    },
    async addItems(id, organizationId, items) {
        const audit = await this.getById(id, organizationId);
        if (audit.status === client_1.AuditStatus.CLOSED) {
            throw new errors_1.BadRequestError("Cannot add items to a closed audit");
        }
        if (!Array.isArray(items) || items.length === 0) {
            throw new errors_1.BadRequestError("Provide at least one audit item");
        }
        for (const item of items) {
            const asset = await db_1.prisma.asset.findUnique({ where: { id: item.assetId } });
            if (!asset)
                throw new errors_1.NotFoundError(`Asset not found: ${item.assetId}`);
        }
        const created = await db_1.prisma.auditItem.createMany({
            data: items.map((item) => ({
                auditId: id,
                assetId: item.assetId,
                remarks: item.remarks,
                status: client_1.AuditItemStatus.PENDING,
            })),
        });
        try {
            (0, socket_service_1.getIO)().to(`org:${organizationId}`).emit("audit:itemsAdded", { auditId: id, count: created.count });
        }
        catch {
            /* socket not initialized */
        }
        return this.getById(id, organizationId);
    },
    async verifyItem(id, itemId, organizationId, data) {
        const audit = await this.getById(id, organizationId);
        if (audit.status === client_1.AuditStatus.CLOSED) {
            throw new errors_1.BadRequestError("Cannot verify items in a closed audit");
        }
        const validStatuses = [
            client_1.AuditItemStatus.PENDING,
            client_1.AuditItemStatus.VERIFIED,
            client_1.AuditItemStatus.MISSING,
            client_1.AuditItemStatus.DAMAGED,
        ];
        if (!validStatuses.includes(data.status)) {
            throw new errors_1.BadRequestError("Invalid audit item status");
        }
        const item = await db_1.prisma.auditItem.findFirst({ where: { id: itemId, auditId: id } });
        if (!item)
            throw new errors_1.NotFoundError("Audit item not found");
        const verified = data.status === client_1.AuditItemStatus.PENDING ? null : new Date();
        const updated = await db_1.prisma.auditItem.update({
            where: { id: itemId },
            data: {
                status: data.status,
                remarks: data.remarks,
                photos: data.photos,
                verifiedAt: verified,
            },
            include: { asset: { select: { id: true, name: true, assetCode: true } } },
        });
        try {
            (0, socket_service_1.getIO)().to(`org:${organizationId}`).emit("audit:itemVerified", updated);
        }
        catch {
            /* socket not initialized */
        }
        return updated;
    },
    async closeAudit(id, organizationId) {
        const audit = await this.getById(id, organizationId);
        if (audit.status === client_1.AuditStatus.CLOSED) {
            throw new errors_1.ConflictError("Audit is already closed");
        }
        const updated = await db_1.prisma.audit.update({
            where: { id },
            data: {
                status: client_1.AuditStatus.CLOSED,
                startedAt: audit.startedAt ?? new Date(),
                closedAt: new Date(),
            },
        });
        try {
            (0, socket_service_1.getIO)().to(`org:${organizationId}`).emit("audit:closed", updated);
        }
        catch {
            /* socket not initialized */
        }
        return this.getById(id, organizationId);
    },
};
//# sourceMappingURL=audits.service.js.map