"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeesService = void 0;
exports.listEmployees = listEmployees;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.getEmployeeById = getEmployeeById;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function listEmployees(organizationId, departmentId) {
    return db_1.prisma.employee.findMany({
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
async function createEmployee(organizationId, data) {
    const existing = await db_1.prisma.employee.findFirst({
        where: { employeeCode: data.employeeCode, department: { organizationId } },
    });
    if (existing) {
        throw new errors_1.ConflictError("Employee code already exists in this organization");
    }
    const user = await db_1.prisma.user.findFirst({
        where: { id: data.userId, organizationId },
    });
    if (!user) {
        throw new errors_1.BadRequestError("User not found in this organization");
    }
    const dept = await db_1.prisma.department.findFirst({
        where: { id: data.departmentId, organizationId },
    });
    if (!dept) {
        throw new errors_1.BadRequestError("Department not found in this organization");
    }
    const existingEmp = await db_1.prisma.employee.findUnique({ where: { userId: data.userId } });
    if (existingEmp) {
        throw new errors_1.ConflictError("Employee record already exists for this user");
    }
    return db_1.prisma.employee.create({
        data: { ...data, phone: data.phone ?? null },
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
            department: { select: { id: true, name: true, code: true } },
        },
    });
}
async function updateEmployee(id, organizationId, data) {
    const employee = await db_1.prisma.employee.findFirst({
        where: { id, department: { organizationId } },
        include: { user: true },
    });
    if (!employee) {
        throw new errors_1.NotFoundError("Employee not found");
    }
    if (data.departmentId) {
        const dept = await db_1.prisma.department.findFirst({
            where: { id: data.departmentId, organizationId },
        });
        if (!dept) {
            throw new errors_1.BadRequestError("Department not found in this organization");
        }
    }
    const [updated] = await db_1.prisma.$transaction([
        db_1.prisma.employee.update({
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
                db_1.prisma.user.update({
                    where: { id: employee.userId },
                    data: { isActive: false },
                }),
            ]
            : []),
    ]);
    return updated;
}
async function getEmployeeById(id, organizationId) {
    const employee = await db_1.prisma.employee.findFirst({
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
        throw new errors_1.NotFoundError("Employee not found");
    }
    return employee;
}
exports.employeesService = {
    listEmployees,
    createEmployee,
    updateEmployee,
    getEmployeeById,
};
//# sourceMappingURL=employees.service.js.map