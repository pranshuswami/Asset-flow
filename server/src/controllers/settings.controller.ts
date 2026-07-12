import { Request, Response } from "express";
import { prisma } from "../config/db";
import { NotFoundError } from "../utils/errors";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const settingsController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        organization: { select: { id: true, name: true, slug: true, plan: true } },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            profilePicture: true,
            phone: true,
            joinDate: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: "Profile retrieved successfully",
    });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { firstName, lastName, phone, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    if (phone !== undefined && updatedUser) {
      await prisma.employee.updateMany({
        where: { userId: user.id },
        data: { phone },
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  }),

  updateNotifications: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const settings = req.body;

    await prisma.organization.update({
      where: { id: user.organizationId! },
      data: { settings },
    });

    res.status(200).json({
      success: true,
      data: { settings },
      message: "Notification settings updated successfully",
    });
  }),
};
