"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetsService = void 0;
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const cloudinary_1 = require("../utils/cloudinary");
const errors_1 = require("../utils/errors");
function buildWhere(filters) {
    const where = {};
    if (filters.organizationId) {
        where.department = { organizationId: filters.organizationId };
    }
    if (filters.status) {
        where.currentStatus = filters.status;
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
function buildOrderBy(sortBy, sortOrder) {
    const order = sortOrder === "desc" ? "desc" : "asc";
    const validFields = ["createdAt", "updatedAt", "name", "assetCode", "currentStatus", "healthScore"];
    const field = sortBy && validFields.includes(sortBy) ? sortBy : "createdAt";
    return { [field]: order };
}
async function generateAssetCode() {
    const count = await db_1.prisma.asset.count();
    const year = new Date().getFullYear();
    const suffix = String(count + 1).padStart(5, "0");
    return `AST-${year}-${suffix}`;
}
exports.assetsService = {
    async listAssets(filters, page = 1, limit = 20) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const skip = (safePage - 1) * safeLimit;
        const where = buildWhere(filters);
        const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder);
        const [data, total] = await db_1.prisma.$transaction([
            db_1.prisma.asset.findMany({
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
            db_1.prisma.asset.count({ where }),
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
    async createAsset(data, createdById) {
        const code = data.assetCode || (await generateAssetCode());
        const existing = await db_1.prisma.asset.findUnique({ where: { assetCode: code } });
        if (existing) {
            throw new errors_1.ConflictError(`Asset code ${code} already exists`);
        }
<<<<<<< HEAD
=======
        const createdBy = await db_1.prisma.user.findUnique({
            where: { id: createdById },
            select: { organizationId: true },
        });
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        const asset = await db_1.prisma.asset.create({
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
        await db_1.prisma.assetTimeline.create({
            data: {
                assetId: asset.id,
                type: "CREATED",
                description: `Asset "${asset.name}" was created.`,
                actorId: createdById,
            },
        });
        return asset;
    },
    async getAssetById(id) {
        const asset = await db_1.prisma.asset.findUnique({
            where: { id },
            include: {
                category: true,
                department: true,
                location: true,
                owner: true,
                createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        return asset;
    },
    async updateAsset(id, data) {
        const existing = await db_1.prisma.asset.findUnique({ where: { id } });
        if (!existing)
            throw new errors_1.NotFoundError("Asset not found");
        if (data.assetCode && data.assetCode !== existing.assetCode) {
            const clash = await db_1.prisma.asset.findUnique({ where: { assetCode: data.assetCode } });
            if (clash)
                throw new errors_1.ConflictError(`Asset code ${data.assetCode} already exists`);
        }
        return db_1.prisma.asset.update({
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
    async deleteAsset(id) {
        const existing = await db_1.prisma.asset.findUnique({ where: { id } });
        if (!existing)
            throw new errors_1.NotFoundError("Asset not found");
        const activeAllocation = await db_1.prisma.allocation.findFirst({
            where: { assetId: id, status: { in: ["REQUESTED", "APPROVED"] } },
        });
        if (activeAllocation) {
            throw new errors_1.BadRequestError("Cannot delete asset with an active allocation");
        }
        await db_1.prisma.asset.delete({ where: { id } });
        return { id };
    },
    async generateQRCode(id) {
        const asset = await db_1.prisma.asset.findUnique({ where: { id } });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        const qrUrl = `${env_1.env.frontendUrl}/assets/${asset.id}`;
        return db_1.prisma.asset.update({
            where: { id },
            data: { qrCodeUrl: qrUrl },
        });
    },
    async getTimeline(id) {
        const asset = await db_1.prisma.asset.findUnique({ where: { id } });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        return db_1.prisma.assetTimeline.findMany({
            where: { assetId: id },
            orderBy: { createdAt: "desc" },
        });
    },
    async addTimelineEvent(assetId, data, actorId) {
        const asset = await db_1.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        return db_1.prisma.assetTimeline.create({
            data: {
                assetId,
                type: data.type,
                description: data.description,
                metadata: data.metadata,
                actorId,
            },
        });
    },
    async uploadPhoto(id, file) {
        const asset = await db_1.prisma.asset.findUnique({ where: { id } });
        if (!asset)
            throw new errors_1.NotFoundError("Asset not found");
        const result = await (0, cloudinary_1.uploadToCloudinary)(file, "assetflow/assets");
        return db_1.prisma.asset.update({
            where: { id },
            data: { photoUrl: result.secure_url },
        });
    },
};
//# sourceMappingURL=assets.service.js.map