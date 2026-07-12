import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const reportsController = {
  assetUtilization: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const organizationId = req.query.org ? String(req.query.org) : user.organizationId;

    const where = { organizationId: { id: organizationId } };
    const statuses = ["AVAILABLE", "ALLOCATED", "RESERVED", "MAINTENANCE", "LOST", "DISPOSED", "RETIRED"] as const;
    type AssetStatus = typeof statuses[number];

    const grouped = await prisma.asset.groupBy({
      by: ["currentStatus"],
      where: { department: { organizationId } },
      _count: { currentStatus: true },
      _sum: { purchaseCost: true },
    });

    const totalAssets = grouped.reduce((sum: number, row: any) => sum + row._count.currentStatus, 0);
    const totalCost = grouped.reduce((sum: number, row: any) => sum + (row._sum.purchaseCost || 0), 0);

    const utilizationRate = totalAssets > 0
      ? ((grouped.find((r: any) => r.currentStatus === "ALLOCATED")?._count.currentStatus || 0) / totalAssets) * 100
      : 0;

    const data = {
      total: totalAssets,
      totalCost,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      breakdown: grouped.map((row: any) => ({
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

  departmentUsage: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const organizationId = req.query.org ? String(req.query.org) : user.organizationId;

    const departments = await prisma.department.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { assets: true } },
      },
    });

    const totalAssets = departments.reduce((sum: number, d: any) => sum + d._count.assets, 0);

    const data = departments.map((d: any) => ({
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

  maintenanceCost: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const organizationId = req.query.org ? String(req.query.org) : user.organizationId;

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const summaries = await prisma.maintenance.groupBy({
      by: ["priority", "status"],
      where: {
        asset: { department: { organizationId } },
        createdAt: { gte: monthAgo },
      },
      _sum: { cost: true },
      _count: { _all: true },
    });

    const totalCost = summaries.reduce((sum: number, row: any) => sum + (row._sum.cost || 0), 0);
    const priorityBreakdown = summaries.reduce((acc: any, row: any) => {
      const existing = acc.find((a: any) => a.priority === row.priority);
      if (existing) {
        existing.cost += row._sum.cost || 0;
        existing.count += row._count._all;
      } else {
        acc.push({ priority: row.priority, cost: row._sum.cost || 0, count: row._count._all });
      }
      return acc;
    }, []);

    const data = {
      period: "last_month",
      totalCost,
      totalRequests: summaries.reduce((sum: number, row: any) => sum + row._count._all, 0),
      summaries: summaries.map((row: any) => ({
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

  idleAssets: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const organizationId = req.query.org ? String(req.query.org) : user.organizationId;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const assets = await prisma.asset.findMany({
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
      assets: assets.map((asset: any) => ({
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
