import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const query = (req.query.q as string) || "";
    const organizationId = req.query.org ? String(req.query.org) : user.organizationId;

    const like = { contains: query, mode: "insensitive" as const };

    const [assets, employees, departments, bookings, maintenance] = await Promise.all([
      prisma.asset.findMany({
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
      prisma.employee.findMany({
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
      prisma.department.findMany({
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
      prisma.booking.findMany({
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
      prisma.maintenance.findMany({
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

    const data = {
      query,
      results: {
        assets: assets.map((a: any) => ({ id: a.id, assetCode: a.assetCode, name: a.name, category: a.category.name, department: a.department.name })),
        employees: employees.map((e: any) => ({ id: e.id, employeeCode: e.employeeCode, name: `${e.user.firstName} ${e.user.lastName}`, designation: e.designation, department: e.department.name, email: e.user.email })),
        departments: departments.map((d: any) => ({ id: d.id, name: d.name, code: d.code })),
        bookings: bookings.map((b: any) => ({ id: b.id, title: b.title, startTime: b.startTime, endTime: b.endTime, status: b.status, employee: `${b.employee.user.firstName} ${b.employee.user.lastName}`, asset: b.asset })),
        maintenance: maintenance.map((m: any) => ({ id: m.id, title: m.title, priority: m.priority, status: m.status, asset: m.asset })),
      },
      totalResults: assets.length + employees.length + departments.length + bookings.length + maintenance.length,
    };

    res.status(200).json({
      success: true,
      data,
      message: "Search completed",
    });
  }),
};
