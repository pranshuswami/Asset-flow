"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsService = void 0;
exports.listDepartments = listDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
async function listDepartments(organizationId, includeInactive = false) {
    return db_1.prisma.department.findMany({
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
async function createDepartment(organizationId, data) {
    const existing = await db_1.prisma.department.findFirst({
        where: { organizationId, code: data.code },
    });
    if (existing) {
        throw new errors_1.ConflictError("Department code already exists in this organization");
    }
    if (data.parentId) {
        const parent = await db_1.prisma.department.findFirst({
            where: { id: data.parentId, organizationId },
        });
        if (!parent) {
            throw new errors_1.BadRequestError("Parent department not found in this organization");
        }
    }
    if (data.headId) {
        const head = await db_1.prisma.employee.findFirst({
            where: { id: data.headId, department: { organizationId } },
        });
        if (!head) {
            throw new errors_1.BadRequestError("Employee not found in this organization");
        }
    }
    return db_1.prisma.department.create({
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
async function updateDepartment(id, organizationId, data) {
    const existing = await db_1.prisma.department.findFirst({
        where: { id, organizationId },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Department not found");
    }
    if (data.code && data.code !== existing.code) {
        const codeTaken = await db_1.prisma.department.findFirst({
            where: { organizationId, code: data.code, id: { not: id } },
        });
        if (codeTaken) {
            throw new errors_1.ConflictError("Department code already exists");
        }
    }
    if (data.parentId) {
        const parent = await db_1.prisma.department.findFirst({
            where: { id: data.parentId, organizationId },
        });
        if (!parent) {
            throw new errors_1.BadRequestError("Parent department not found in this organization");
        }
    }
    if (data.headId) {
        const head = await db_1.prisma.employee.findFirst({
            where: { id: data.headId, department: { organizationId } },
        });
        if (!head) {
            throw new errors_1.BadRequestError("Employee not found in this organization");
        }
    }
    return db_1.prisma.department.update({
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
async function deleteDepartment(id, organizationId) {
    const existing = await db_1.prisma.department.findFirst({
        where: { id, organizationId },
        include: { children: true },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Department not found");
    }
    if (existing.children.length > 0) {
        throw new errors_1.BadRequestError("Cannot delete department with child departments. Remove children first.");
    }
    await db_1.prisma.department.delete({ where: { id } });
    return { message: "Department deleted successfully" };
}
exports.departmentsService = {
    listDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};
//# sourceMappingURL=departments.service.js.map