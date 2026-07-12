import { prisma } from "../config/db";
import { getIO } from "../services/socket.service";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";
import { NotificationType, AllocationStatus, AssetStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

async function emitToOrg(organizationId: string | null | undefined, event: string, payload: any) {
  try {
    const io = getIO();
    if (organizationId) {
      io.to(`org:${organizationId}`).emit(event, payload);
    }
    io.emit(event, payload);
  } catch {
    /* socket not initialized */
  }
}

async function notifyUser(userId: string, input: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}) {
  await prisma.notification.create({
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

async function getEmployee(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!employee) throw new NotFoundError("Employee not found");
  return employee;
}

async function getAssetForAllocation(assetId: string) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new NotFoundError("Asset not found");

  const active = await prisma.allocation.findFirst({
    where: { assetId, status: { in: [AllocationStatus.REQUESTED, AllocationStatus.APPROVED] } },
  });
  if (active) {
    throw new ConflictError("This asset is already allocated or has a pending request");
  }
  if (asset.currentStatus !== AssetStatus.AVAILABLE && asset.currentStatus !== AssetStatus.RESERVED) {
    throw new ConflictError(`Asset is not available for allocation (status: ${asset.currentStatus})`);
  }
  return asset;
}

export const allocationsService = {
  async requestAllocation(data: { assetId: string; employeeId: string; notes?: string; conditionAtAllocation?: string }, requestedByUserId?: string) {
    const employee = await getEmployee(data.employeeId);
    const asset = await getAssetForAllocation(data.assetId);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const allocation = await tx.allocation.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          notes: data.notes,
          conditionAtAllocation: data.conditionAtAllocation,
          status: AllocationStatus.REQUESTED,
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: { currentStatus: AssetStatus.RESERVED },
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
        type: NotificationType.ASSET_ASSIGNED,
        title: "Asset allocation requested",
        message: `An allocation request for asset ${asset.assetCode} has been submitted for you.`,
        link: `/allocations/${allocation.id}`,
        metadata: { allocationId: allocation.id, assetId: data.assetId },
      });

      await emitToOrg(orgId, "allocation:requested", { allocation, assetId: data.assetId });

      return allocation;
    });
  },

  async approveAllocation(allocationId: string, approverUserId?: string, notes?: string) {
    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status !== AllocationStatus.REQUESTED) {
      throw new BadRequestError(`Only REQUESTED allocations can be approved (current: ${allocation.status})`);
    }

    const employee = await getEmployee(allocation.employeeId);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.allocation.update({
        where: { id: allocationId },
        data: { status: AllocationStatus.APPROVED, approvedAt: new Date(), notes: notes ?? allocation.notes },
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { currentStatus: AssetStatus.ALLOCATED, ownerId: allocation.employeeId },
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
        type: NotificationType.ASSET_ASSIGNED,
        title: "Asset allocation approved",
        message: `Your allocation request has been approved.`,
        link: `/allocations/${allocation.id}`,
        metadata: { allocationId, assetId: allocation.assetId },
      });

      await emitToOrg(orgId, "allocation:approved", { allocation: updated, assetId: allocation.assetId });

      return updated;
    });
  },

  async rejectAllocation(allocationId: string, approverUserId?: string, notes?: string) {
    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status !== AllocationStatus.REQUESTED) {
      throw new BadRequestError(`Only REQUESTED allocations can be rejected (current: ${allocation.status})`);
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.allocation.update({
        where: { id: allocationId },
        data: { status: AllocationStatus.REJECTED, notes: notes ?? allocation.notes },
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { currentStatus: AssetStatus.AVAILABLE },
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

  async returnAsset(allocationId: string, actorUserId?: string, notes?: string) {
    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundError("Allocation not found");
    if (allocation.status !== AllocationStatus.APPROVED) {
      throw new BadRequestError(`Only APPROVED allocations can be returned (current: ${allocation.status})`);
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.allocation.update({
        where: { id: allocationId },
        data: { status: AllocationStatus.RETURNED, returnedAt: new Date(), notes: notes ?? allocation.notes },
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { currentStatus: AssetStatus.AVAILABLE, ownerId: null },
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

  async listAllocations(filters: {
    organizationId?: string;
    employeeId?: string;
    assetId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AllocationWhereInput = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.assetId) where.assetId = filters.assetId;
    if (filters.status) where.status = filters.status as AllocationStatus;
    if (filters.organizationId) {
      where.asset = { department: { organizationId: filters.organizationId } };
    }

    const [data, total] = await prisma.$transaction([
      prisma.allocation.findMany({
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
      prisma.allocation.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};

async function getOrgIdForAsset(tx: Prisma.TransactionClient, assetId: string): Promise<string | null> {
  const asset = await tx.asset.findUnique({
    where: { id: assetId },
    select: { department: { select: { organizationId: true } } },
  });
  return asset?.department?.organizationId ?? null;
}
