import { prisma } from "../config/db";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";
import {
  AssetStatus,
  MaintenanceStatus,
  MaintenancePriority,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { getIO } from "../services/socket.service";

export interface MaintenanceListFilters {
  organizationId: string;
  assetId?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  assignedToId?: string;
}

export interface MaintenanceListResult {
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

function buildMaintenanceWhere(filters: MaintenanceListFilters): Prisma.MaintenanceWhereInput {
  const where: Prisma.MaintenanceWhereInput = {
    asset: { location: { organizationId: filters.organizationId } },
  };
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  return where;
}

export const maintenanceService = {
  async list(filters: MaintenanceListFilters, page = 1, limit = 20): Promise<MaintenanceListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = buildMaintenanceWhere(filters);
    const [data, total] = await prisma.$transaction([
      prisma.maintenance.findMany({
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
      prisma.maintenance.count({ where }),
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
    const record = await prisma.maintenance.findFirst({
      where: { id, asset: { location: { organizationId } } },
      include: {
        asset: true,
        assignedTo: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });
    if (!record) throw new NotFoundError("Maintenance record not found");
    return record;
  },

  async create(data: any, createdById: string) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new NotFoundError("Asset not found");

    const status =
      (data.status as MaintenanceStatus) ?? MaintenanceStatus.PENDING;

    const record = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.maintenance.create({
        data: {
          assetId: data.assetId,
          title: data.title,
          description: data.description,
          priority: (data.priority as MaintenancePriority) ?? MaintenancePriority.MEDIUM,
          status,
          assignedToId: data.assignedToId,
          cost: data.cost,
        },
      });

      if (status === MaintenanceStatus.APPROVED) {
        await tx.asset.update({
          where: { id: data.assetId },
          data: { currentStatus: AssetStatus.MAINTENANCE },
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
    if (status === MaintenanceStatus.APPROVED) {
      try {
        getIO().to(`org:${orgId}`).emit("maintenance:approved", record);
      } catch {
        /* socket not initialized */
      }
    }

    return this.getById(record.id, orgId);
  },

  async updateStatus(id: string, organizationId: string, status: MaintenanceStatus) {
    const record = await this.getById(id, organizationId);

    if (!Object.values(MaintenanceStatus).includes(status)) {
      throw new BadRequestError("Invalid maintenance status");
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const result = await tx.maintenance.update({
        where: { id },
        data: {
          status,
          resolvedAt:
            status === MaintenanceStatus.RESOLVED
              ? new Date()
              : status === MaintenanceStatus.APPROVED
                ? null
                : record.resolvedAt,
        },
      });

      if (status === MaintenanceStatus.APPROVED) {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { currentStatus: AssetStatus.MAINTENANCE },
        });
        await tx.assetTimeline.create({
          data: {
            assetId: record.assetId,
            type: "MAINTENANCE_REQUESTED",
            description: "Maintenance request was approved. Asset moved to maintenance.",
          },
        });
      } else if (status === MaintenanceStatus.RESOLVED) {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { currentStatus: AssetStatus.AVAILABLE },
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

    if (status === MaintenanceStatus.APPROVED) {
      const asset = await prisma.asset.findUnique({
        where: { id: record.assetId },
        include: { owner: { include: { user: true } } },
      });

      if (record.assignedToId) {
        await notify({
          userId: record.assignedToId,
          type: NotificationType.MAINTENANCE_APPROVED,
          title: "Maintenance approved",
          message: `Maintenance "${record.title}" has been approved and assigned to you.`,
          link: `/maintenance/${record.id}`,
          metadata: { maintenanceId: record.id, assetId: record.assetId },
        });
      }
      if (asset?.owner?.userId) {
        await notify({
          userId: asset.owner.userId,
          type: NotificationType.MAINTENANCE_APPROVED,
          title: "Asset under maintenance",
          message: `Asset "${asset.name}" is now under maintenance.`,
          link: `/maintenance/${record.id}`,
          metadata: { maintenanceId: record.id, assetId: record.assetId },
        });
      }

      try {
        getIO().to(`org:${organizationId}`).emit("maintenance:approved", updated);
      } catch {
        /* socket not initialized */
      }
    } else if (status === MaintenanceStatus.RESOLVED) {
      try {
        getIO().to(`org:${organizationId}`).emit("maintenance:resolved", updated);
      } catch {
        /* socket not initialized */
      }
    }

    return this.getById(id, organizationId);
  },

  async assignTechnician(id: string, organizationId: string, assignedToId: string) {
    await this.getById(id, organizationId);

    const technician = await prisma.employee.findUnique({ where: { id: assignedToId } });
    if (!technician) throw new NotFoundError("Technician (employee) not found");

    const updated = await prisma.maintenance.update({
      where: { id },
      data: { assignedToId },
    });

    await notify({
      userId: assignedToId,
      type: NotificationType.MAINTENANCE_APPROVED,
      title: "Maintenance assigned",
      message: `You have been assigned to a maintenance task.`,
      link: `/maintenance/${id}`,
      metadata: { maintenanceId: id },
    });

    try {
      getIO().to(`user:${assignedToId}`).emit("maintenance:assigned", updated);
    } catch {
      /* socket not initialized */
    }

    return this.getById(id, organizationId);
  },

  async orgOfAsset(assetId: string): Promise<string> {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { location: { select: { organizationId: true } } },
    });
    return asset?.location?.organizationId ?? "";
  },
};
