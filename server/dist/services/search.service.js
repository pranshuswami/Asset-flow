"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = void 0;
const db_1 = require("../config/db");
exports.searchService = {
    async globalSearch(organizationId, query) {
        const like = { contains: query, mode: "insensitive" };
        const [assets, employees, departments, bookings, maintenance] = await Promise.all([
            db_1.prisma.asset.findMany({
                where: {
                    department: { organizationId },
                    OR: [
                        { name: like },
                        { assetCode: like },
                        { serialNumber: like },
                        { description: like },
                    ],
                },
                include: {
                    category: { select: { name: true } },
                    department: { select: { name: true } },
                },
                take: 10,
            }),
            db_1.prisma.employee.findMany({
                where: {
                    department: { organizationId },
                    OR: [
                        { employeeCode: like },
                        { designation: like },
                    ],
                },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    department: { select: { name: true } },
                },
                take: 10,
            }),
            db_1.prisma.department.findMany({
                where: {
                    organizationId,
                    OR: [
                        { name: like },
                        { code: like },
                        { description: like },
                    ],
                },
                take: 10,
            }),
            db_1.prisma.booking.findMany({
                where: {
                    employee: { department: { organizationId } },
                    OR: [
                        { title: like },
                        { description: like },
                    ],
                },
                include: {
                    employee: { select: { employeeCode: true, user: { select: { firstName: true, lastName: true } } } },
                    asset: { select: { assetCode: true, name: true } },
                },
                take: 10,
            }),
            db_1.prisma.maintenance.findMany({
                where: {
                    asset: { department: { organizationId } },
                    OR: [
                        { title: like },
                        { description: like },
                    ],
                },
                include: {
                    asset: { select: { assetCode: true, name: true } },
                },
                take: 10,
            }),
        ]);
        return {
            query,
            results: {
                assets: assets.map((a) => ({ id: a.id, assetCode: a.assetCode, name: a.name, category: a.category.name, department: a.department.name })),
                employees: employees.map((e) => ({ id: e.id, employeeCode: e.employeeCode, name: `${e.user.firstName} ${e.user.lastName}`, designation: e.designation, department: e.department.name, email: e.user.email })),
                departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.code })),
                bookings: bookings.map((b) => ({ id: b.id, title: b.title, startTime: b.startTime, endTime: b.endTime, status: b.status, employee: `${b.employee.user.firstName} ${b.employee.user.lastName}`, asset: b.asset })),
                maintenance: maintenance.map((m) => ({ id: m.id, title: m.title, priority: m.priority, status: m.status, asset: m.asset })),
            },
            totalResults: assets.length + employees.length + departments.length + bookings.length + maintenance.length,
        };
    },
};
//# sourceMappingURL=search.service.js.map