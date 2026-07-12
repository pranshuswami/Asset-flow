"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesService = void 0;
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function listCategories(organizationId, includeInactive = false) {
    return db_1.prisma.category.findMany({
        where: {
            organizationId,
            ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
            _count: { select: { assets: true } },
        },
        orderBy: { name: "asc" },
    });
}
async function createCategory(organizationId, data) {
    const existing = await db_1.prisma.category.findFirst({
        where: { organizationId, name: data.name },
    });
    if (existing) {
        throw new errors_1.ConflictError("Category with this name already exists");
    }
    return db_1.prisma.category.create({
        data: {
            ...data,
            organizationId,
            description: data.description ?? null,
            icon: data.icon ?? null,
        },
        include: { _count: { select: { assets: true } } },
    });
}
async function updateCategory(id, organizationId, data) {
    const existing = await db_1.prisma.category.findFirst({
        where: { id, organizationId },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Category not found");
    }
    if (data.name && data.name !== existing.name) {
        const nameTaken = await db_1.prisma.category.findFirst({
            where: { organizationId, name: data.name, id: { not: id } },
        });
        if (nameTaken) {
            throw new errors_1.ConflictError("Category name already exists");
        }
    }
    return db_1.prisma.category.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.icon !== undefined && { icon: data.icon }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: { _count: { select: { assets: true } } },
    });
}
async function deleteCategory(id, organizationId) {
    const existing = await db_1.prisma.category.findFirst({
        where: { id, organizationId },
        include: { _count: { select: { assets: true } } },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Category not found");
    }
    if (existing._count.assets > 0) {
        throw new errors_1.BadRequestError("Cannot delete category with associated assets");
    }
    await db_1.prisma.category.delete({ where: { id } });
    return { message: "Category deleted successfully" };
}
exports.categoriesService = {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
//# sourceMappingURL=categories.service.js.map