import { prisma } from "../config/db";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

export async function listCategories(organizationId: string, includeInactive = false) {
  return prisma.category.findMany({
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

export async function createCategory(organizationId: string, data: {
  name: string;
  description?: string;
  icon?: string;
}) {
  const existing = await prisma.category.findFirst({
    where: { organizationId, name: data.name },
  });
  if (existing) {
    throw new ConflictError("Category with this name already exists");
  }

  return prisma.category.create({
    data: {
      ...data,
      organizationId,
      description: data.description ?? null,
      icon: data.icon ?? null,
    },
    include: { _count: { select: { assets: true } } },
  });
}

export async function updateCategory(id: string, organizationId: string, data: {
  name?: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.category.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new NotFoundError("Category not found");
  }

  if (data.name && data.name !== existing.name) {
    const nameTaken = await prisma.category.findFirst({
      where: { organizationId, name: data.name, id: { not: id } },
    });
    if (nameTaken) {
      throw new ConflictError("Category name already exists");
    }
  }

  return prisma.category.update({
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

export async function deleteCategory(id: string, organizationId: string) {
  const existing = await prisma.category.findFirst({
    where: { id, organizationId },
    include: { _count: { select: { assets: true } } },
  });

  if (!existing) {
    throw new NotFoundError("Category not found");
  }

  if (existing._count.assets > 0) {
    throw new BadRequestError("Cannot delete category with associated assets");
  }

  await prisma.category.delete({ where: { id } });
  return { message: "Category deleted successfully" };
}

export const categoriesService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
