"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const db_1 = require("../config/db");
const error_middleware_1 = require("../middlewares/error.middleware");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
exports.reportsController = {
    assetUtilization: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const organizationId = req.query.org ? String(req.query.org) : user.organizationId;
        const where = { organizationId: { id: organizationId } };
        const statuses = ["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"];
        const grouped = await db_1.prisma.asset.groupBy({
            by: ["currentStatus"],
            where: { department: { organizationId } },
            _count: { currentStatus: true },
            _sum: { purchaseCost: true },
        });
        const totalAssets = grouped.reduce((sum, row) => sum + row._count.currentStatus, 0);
        const totalCost = grouped.reduce((sum, row) => sum + (row._sum.purchaseCost || 0), 0);
        const utilizationRate = totalAssets > 0
            ? ((grouped.find((r) => r.currentStatus === "ALLOCATED")?._count.currentStatus || 0) / totalAssets) * 100
            : 0;
        const data = {
            total: totalAssets,
            totalCost,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            breakdown: grouped.map((row) => ({
                status: row.currentStatus,
                count: row._count.currentStatus,
                cost: row._sum.purchaseCost || 0,
                percentage: totalAssets > 0 ? Math.round((row._count.currentStatus / totalAssets) * 10000) / 100 : 0,
            })),
        };
        res.status(200).json({
            success: true,
            data,
            message: "Asset utilization report generated",
        });
    }),
    departmentUsage: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const organizationId = req.query.org ? String(req.query.org) : user.organizationId;
        const departments = await db_1.prisma.department.findMany({
            where: { organizationId },
            select: {
                id: true,
                name: true,
                code: true,
                _count: { select: { assets: true } },
            },
        });
        const totalAssets = departments.reduce((sum, d) => sum + d._count.assets, 0);
        const data = departments.map((d) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            assetCount: d._count.assets,
            percentage: totalAssets > 0 ? Math.round((d._count.assets / totalAssets) * 10000) / 100 : 0,
        }));
        res.status(200).json({
            success: true,
            data,
            meta: { totalAssets, departmentCount: departments.length },
            message: "Department usage report generated",
        });
    }),
    maintenanceCost: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const organizationId = req.query.org ? String(req.query.org) : user.organizationId;
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const summaries = await db_1.prisma.maintenance.groupBy({
            by: ["priority", "status"],
            where: {
                asset: { department: { organizationId } },
                createdAt: { gte: monthAgo },
            },
            _sum: { cost: true },
            _count: { _all: true },
        });
        const totalCost = summaries.reduce((sum, row) => sum + (row._sum.cost || 0), 0);
        const priorityBreakdown = summaries.reduce((acc, row) => {
            const existing = acc.find((a) => a.priority === row.priority);
            if (existing) {
                existing.cost += row._sum.cost || 0;
                existing.count += row._count._all;
            }
            else {
                acc.push({ priority: row.priority, cost: row._sum.cost || 0, count: row._count._all });
            }
            return acc;
        }, []);
        const data = {
            period: "last_month",
            totalCost,
            totalRequests: summaries.reduce((sum, row) => sum + row._count._all, 0),
            summaries: summaries.map((row) => ({
                priority: row.priority,
                status: row.status,
                count: row._count._all,
                cost: row._sum.cost || 0,
            })),
            priorityBreakdown,
        };
        res.status(200).json({
            success: true,
            data,
            message: "Maintenance cost report generated",
        });
    }),
    idleAssets: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const organizationId = req.query.org ? String(req.query.org) : user.organizationId;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const assets = await db_1.prisma.asset.findMany({
            where: {
                department: { organizationId },
                OR: [
                    { currentStatus: "AVAILABLE", lastServicedAt: { lt: sixMonthsAgo } },
                    { condition: { in: ["POOR", "DAMAGED"] } },
                    { lifecycle: "INACTIVE" },
                ],
            },
            include: {
                category: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                location: { select: { code: true, building: true, room: true } },
                owner: { select: { employeeCode: true, user: { select: { firstName: true, lastName: true } } } },
            },
            take: 100,
        });
        const data = {
            total: assets.length,
            assets: assets.map((asset) => ({
                id: asset.id,
                assetCode: asset.assetCode,
                name: asset.name,
                status: asset.currentStatus,
                condition: asset.condition,
                lifecycle: asset.lifecycle,
                lastServicedAt: asset.lastServicedAt,
                category: asset.category.name,
                department: asset.department.name,
                location: asset.location,
                owner: asset.owner ? `${asset.owner.user.firstName} ${asset.owner.user.lastName}` : null,
            })),
        };
        res.status(200).json({
            success: true,
            data,
            message: "Idle assets report generated",
        });
    }),
};
//# sourceMappingURL=reports.controller.js.map