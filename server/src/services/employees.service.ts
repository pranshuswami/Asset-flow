import { prisma } from "../config/db";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

export async function listEmployees(organizationId: string, departmentId?: string) {
  return prisma.employee.findMany({
    where: {
      department: { organizationId },
      ...(departmentId && { departmentId }),
      isActive: true,
    },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      department: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEmployee(organizationId: string, data: {
  employeeCode: string;
  designation: string;
  departmentId: string;
  userId: string;
  phone?: string;
}) {
  const existing = await prisma.employee.findFirst({
    where: { employeeCode: data.employeeCode, department: { organizationId } },
  });
  if (existing) {
    throw new ConflictError("Employee code already exists in this organization");
  }

  const user = await prisma.user.findFirst({
    where: { id: data.userId, organizationId },
  });
  if (!user) {
    throw new BadRequestError("User not found in this organization");
  }

  const dept = await prisma.department.findFirst({
    where: { id: data.departmentId, organizationId },
  });
  if (!dept) {
    throw new BadRequestError("Department not found in this organization");
  }

  const existingEmp = await prisma.employee.findUnique({ where: { userId: data.userId } });
  if (existingEmp) {
    throw new ConflictError("Employee record already exists for this user");
  }

  return prisma.employee.create({
    data: { ...data, phone: data.phone ?? null },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function updateEmployee(id: string, organizationId: string, data: {
  designation?: string;
  departmentId?: string;
  phone?: string | null;
  isActive?: boolean;
}) {
  const employee = await prisma.employee.findFirst({
    where: { id, department: { organizationId } },
    include: { user: true },
  });

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  if (data.departmentId) {
    const dept = await prisma.department.findFirst({
      where: { id: data.departmentId, organizationId },
    });
    if (!dept) {
      throw new BadRequestError("Department not found in this organization");
    }
  }

  const [updated] = await prisma.$transaction([
    prisma.employee.update({
      where: { id },
      data: {
        ...(data.designation !== undefined && { designation: data.designation }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    }),
    ...(data.isActive === false
      ? [
          prisma.user.update({
            where: { id: employee.userId },
            data: { isActive: false },
          }),
        ]
      : []),
  ]);

  return updated;
}

export async function getEmployeeById(id: string, organizationId: string) {
  const employee = await prisma.employee.findFirst({
    where: { id, department: { organizationId } },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      department: { select: { id: true, name: true, code: true } },
      allocations: {
        where: { status: { in: ["REQUESTED", "APPROVED"] } },
        include: { asset: { select: { id: true, assetCode: true, name: true, currentStatus: true } } },
      },
    },
  });

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  return employee;
}

export const employeesService = {
  listEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeById,
};
