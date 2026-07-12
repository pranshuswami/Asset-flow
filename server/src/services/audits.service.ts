import { prisma } from "../config/db";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors";
import {
  AuditStatus,
  AuditItemStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { getIO } from "../services/socket.service";

export interface AuditListFilters {
  organizationId: string;
  departmentId?: string;
  status?: AuditStatus;
  auditorId?: string;
}

export interface AuditListResult {
  data: any[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const notification = await prisma.notification.create({ data: input });
  try {
    getIO().to(`user:${input.userId}`).emit("notification", notification);
  } catch {
    /* socket not initialized */
  }
  return notification;
}

function buildAuditWhere(filters: AuditListFilters): Prisma.AuditWhereInput {
  const where: Prisma.AuditWhereInput = {
    department: { organizationId: filters.organizationId },
  };
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.status) where.status = filters.status;
  if (filters.auditorId) where.auditorId = filters.auditorId;
  return where;
}

export const auditsService = {
  async list(filters: AuditListFilters, page = 1, limit = 20): Promise<AuditListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = buildAuditWhere(filters);
    const [data, total] = await prisma.$transaction([
      prisma.audit.findMany({
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
      prisma.audit.count({ where }),
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

  async getById(id: string, organizationId: string) {
    const audit = await prisma.audit.findFirst({
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
    if (!audit) throw new NotFoundError("Audit not found");
    return audit;
  },

  async create(data: any, createdById: string) {
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!department) throw new NotFoundError("Department not found");

    const auditor = await prisma.employee.findUnique({ where: { id: data.auditorId } });
    if (!auditor) throw new NotFoundError("Auditor (employee) not found");

    const audit = await prisma.audit.create({
      data: {
        title: data.title,
        description: data.description,
        departmentId: data.departmentId,
        auditorId: data.auditorId,
        status: AuditStatus.PENDING,
      },
    });

    await notify({
      userId: data.auditorId,
      type: NotificationType.AUDIT_STARTED,
      title: "New audit assigned",
      message: `You have been assigned as auditor for "${data.title}".`,
      link: `/audits/${audit.id}`,
      metadata: { auditId: audit.id },
    });

    try {
      getIO().to(`user:${data.auditorId}`).emit("audit:assigned", audit);
    } catch {
      /* socket not initialized */
    }

    return this.getById(audit.id, department.organizationId);
  },

  async addItems(id: string, organizationId: string, items: { assetId: string; remarks?: string }[]) {
    const audit = await this.getById(id, organizationId);
    if (audit.status === AuditStatus.CLOSED) {
      throw new BadRequestError("Cannot add items to a closed audit");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Provide at least one audit item");
    }

    for (const item of items) {
      const asset = await prisma.asset.findUnique({ where: { id: item.assetId } });
      if (!asset) throw new NotFoundError(`Asset not found: ${item.assetId}`);
    }

    const created = await prisma.auditItem.createMany({
      data: items.map((item) => ({
        auditId: id,
        assetId: item.assetId,
        remarks: item.remarks,
        status: AuditItemStatus.PENDING,
      })),
    });

    try {
      getIO().to(`org:${organizationId}`).emit("audit:itemsAdded", { auditId: id, count: created.count });
    } catch {
      /* socket not initialized */
    }

    return this.getById(id, organizationId);
  },

  async verifyItem(
    id: string,
    itemId: string,
    organizationId: string,
    data: { status: AuditItemStatus; remarks?: string; photos?: any }
  ) {
    const audit = await this.getById(id, organizationId);
    if (audit.status === AuditStatus.CLOSED) {
      throw new BadRequestError("Cannot verify items in a closed audit");
    }

    const validStatuses: AuditItemStatus[] = [
      AuditItemStatus.PENDING,
      AuditItemStatus.VERIFIED,
      AuditItemStatus.MISSING,
      AuditItemStatus.DAMAGED,
    ];
    if (!validStatuses.includes(data.status)) {
      throw new BadRequestError("Invalid audit item status");
    }

    const item = await prisma.auditItem.findFirst({ where: { id: itemId, auditId: id } });
    if (!item) throw new NotFoundError("Audit item not found");

    const verified =
      data.status === AuditItemStatus.PENDING ? null : new Date();

    const updated = await prisma.auditItem.update({
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
      getIO().to(`org:${organizationId}`).emit("audit:itemVerified", updated);
    } catch {
      /* socket not initialized */
    }

    return updated;
  },

  async closeAudit(id: string, organizationId: string) {
    const audit = await this.getById(id, organizationId);
    if (audit.status === AuditStatus.CLOSED) {
      throw new ConflictError("Audit is already closed");
    }

    const updated = await prisma.audit.update({
      where: { id },
      data: {
        status: AuditStatus.CLOSED,
        startedAt: audit.startedAt ?? new Date(),
        closedAt: new Date(),
      },
    });

    try {
      getIO().to(`org:${organizationId}`).emit("audit:closed", updated);
    } catch {
      /* socket not initialized */
    }

    return this.getById(id, organizationId);
  },
};
