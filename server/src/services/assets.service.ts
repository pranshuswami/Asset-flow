import { prisma } from "../config/db";
import { env } from "../config/env";
import { uploadToCloudinary } from "../utils/cloudinary";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export interface AssetListFilters {
  organizationId?: string;
  status?: string;
  categoryId?: string;
  departmentId?: string;
  locationId?: string;
  ownerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AssetListResult {
  data: any[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

function buildWhere(filters: AssetListFilters): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {};

  if (filters.organizationId) {
    where.department = { organizationId: filters.organizationId };
  }
  if (filters.status) {
    where.currentStatus = filters.status as any;
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.locationId) {
    where.locationId = filters.locationId;
  }
  if (filters.ownerId) {
    where.ownerId = filters.ownerId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { assetCode: { contains: filters.search, mode: "insensitive" } },
      { serialNumber: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(sortBy?: string, sortOrder?: string): Prisma.AssetOrderByWithRelationInput {
  const order = sortOrder === "desc" ? "desc" : "asc";
  const validFields = ["createdAt", "updatedAt", "name", "assetCode", "currentStatus", "healthScore"];
  const field = sortBy && validFields.includes(sortBy) ? sortBy : "createdAt";
  return { [field]: order } as Prisma.AssetOrderByWithRelationInput;
}

async function generateAssetCode(): Promise<string> {
  const count = await prisma.asset.count();
  const year = new Date().getFullYear();
  const suffix = String(count + 1).padStart(5, "0");
  return `AST-${year}-${suffix}`;
}

export const assetsService = {
  async listAssets(
    filters: AssetListFilters,
    page = 1,
    limit = 20
  ): Promise<AssetListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where = buildWhere(filters);
    const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder);

    const [data, total] = await prisma.$transaction([
      prisma.asset.findMany({
        where,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          location: { select: { id: true, code: true, building: true } },
          owner: { select: { id: true, employeeCode: true, designation: true } },
        },
      }),
      prisma.asset.count({ where }),
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

  async createAsset(data: any, createdById: string) {
    const code = data.assetCode || (await generateAssetCode());

    const existing = await prisma.asset.findUnique({ where: { assetCode: code } });
    if (existing) {
      throw new ConflictError(`Asset code ${code} already exists`);
    }

<<<<<<< HEAD
=======
    const createdBy = await prisma.user.findUnique({
      where: { id: createdById },
      select: { organizationId: true },
    });

>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
    const asset = await prisma.asset.create({
      data: {
        assetCode: code,
        name: data.name,
        description: data.description,
<<<<<<< HEAD
=======
        organizationId: createdBy?.organizationId ?? "",
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        categoryId: data.categoryId,
        departmentId: data.departmentId,
        locationId: data.locationId,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        supplier: data.supplier,
        purchaseCost: data.purchaseCost,
        createdById,
      },
    });

    await prisma.assetTimeline.create({
      data: {
        assetId: asset.id,
        type: "CREATED",
        description: `Asset "${asset.name}" was created.`,
        actorId: createdById,
      },
    });

    return asset;
  },

  async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        location: true,
        owner: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  },

  async updateAsset(id: string, data: any) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Asset not found");

    if (data.assetCode && data.assetCode !== existing.assetCode) {
      const clash = await prisma.asset.findUnique({ where: { assetCode: data.assetCode } });
      if (clash) throw new ConflictError(`Asset code ${data.assetCode} already exists`);
    }

    return prisma.asset.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        departmentId: data.departmentId,
        locationId: data.locationId,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
        supplier: data.supplier,
        purchaseCost: data.purchaseCost,
        currentStatus: data.currentStatus,
        condition: data.condition,
        lifecycle: data.lifecycle,
        healthScore: data.healthScore,
      },
    });
  },

  async deleteAsset(id: string) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Asset not found");

    const activeAllocation = await prisma.allocation.findFirst({
      where: { assetId: id, status: { in: ["REQUESTED", "APPROVED"] } },
    });
    if (activeAllocation) {
      throw new BadRequestError("Cannot delete asset with an active allocation");
    }

    await prisma.asset.delete({ where: { id } });
    return { id };
  },

  async generateQRCode(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError("Asset not found");

    const qrUrl = `${env.frontendUrl}/assets/${asset.id}`;

    return prisma.asset.update({
      where: { id },
      data: { qrCodeUrl: qrUrl },
    });
  },

  async getTimeline(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError("Asset not found");

    return prisma.assetTimeline.findMany({
      where: { assetId: id },
      orderBy: { createdAt: "desc" },
    });
  },

  async addTimelineEvent(assetId: string, data: any, actorId?: string) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundError("Asset not found");

    return prisma.assetTimeline.create({
      data: {
        assetId,
        type: data.type,
        description: data.description,
        metadata: data.metadata,
        actorId,
      },
    });
  },

  async uploadPhoto(id: string, file: Express.Multer.File) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError("Asset not found");

    const result: any = await uploadToCloudinary(file, "assetflow/assets");
    return prisma.asset.update({
      where: { id },
      data: { photoUrl: (result as any).secure_url },
    });
  },
};
