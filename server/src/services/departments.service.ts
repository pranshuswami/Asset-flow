import { prisma } from "../config/db";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

export async function listDepartments(organizationId: string, includeInactive = false) {
  return prisma.department.findMany({
    where: {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      head: { select: { id: true, employeeCode: true, designation: true, user: { select: { firstName: true, lastName: true } } } },
      parent: { select: { id: true, name: true, code: true } },
      children: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true, assets: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(organizationId: string, data: {
  name: string;
  code: string;
  description?: string;
  headId?: string;
  parentId?: string;
}) {
  const existing = await prisma.department.findFirst({
    where: { organizationId, code: data.code },
  });
  if (existing) {
    throw new ConflictError("Department code already exists in this organization");
  }

  if (data.parentId) {
    const parent = await prisma.department.findFirst({
      where: { id: data.parentId, organizationId },
    });
    if (!parent) {
      throw new BadRequestError("Parent department not found in this organization");
    }
  }

  if (data.headId) {
    const head = await prisma.employee.findFirst({
      where: { id: data.headId, department: { organizationId } },
    });
    if (!head) {
      throw new BadRequestError("Employee not found in this organization");
    }
  }

  return prisma.department.create({
    data: {
      ...data,
      organizationId,
      ...(data.headId === undefined && { headId: null }),
      ...(data.parentId === undefined && { parentId: null }),
    },
    include: {
      head: { select: { id: true, employeeCode: true, designation: true, user: { select: { firstName: true, lastName: true } } } },
      parent: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true, assets: true } },
    },
  });
}

export async function updateDepartment(id: string, organizationId: string, data: {
  name?: string;
  code?: string;
  description?: string;
  headId?: string | null;
  parentId?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.department.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new NotFoundError("Department not found");
  }

  if (data.code && data.code !== existing.code) {
    const codeTaken = await prisma.department.findFirst({
      where: { organizationId, code: data.code, id: { not: id } },
    });
    if (codeTaken) {
      throw new ConflictError("Department code already exists");
    }
  }

  if (data.parentId) {
    const parent = await prisma.department.findFirst({
      where: { id: data.parentId, organizationId },
    });
    if (!parent) {
      throw new BadRequestError("Parent department not found in this organization");
    }
  }

  if (data.headId) {
    const head = await prisma.employee.findFirst({
      where: { id: data.headId, department: { organizationId } },
    });
    if (!head) {
      throw new BadRequestError("Employee not found in this organization");
    }
  }

  return prisma.department.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.headId !== undefined && { headId: data.headId }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      head: { select: { id: true, employeeCode: true, designation: true, user: { select: { firstName: true, lastName: true } } } },
      parent: { select: { id: true, name: true, code: true } },
      _count: { select: { employees: true, assets: true } },
    },
  });
}

export async function deleteDepartment(id: string, organizationId: string) {
  const existing = await prisma.department.findFirst({
    where: { id, organizationId },
    include: { children: true },
  });

  if (!existing) {
    throw new NotFoundError("Department not found");
  }

  if (existing.children.length > 0) {
    throw new BadRequestError("Cannot delete department with child departments. Remove children first.");
  }

  await prisma.department.delete({ where: { id } });
  return { message: "Department deleted successfully" };
}

export const departmentsService = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
