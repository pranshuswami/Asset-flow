import { prisma } from "../config/db";

export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  employee?: {
    id: string;
    employeeCode: string;
    designation: string;
    profilePicture: string | null;
    phone: string | null;
    joinDate: Date;
    department: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export const settingsService = {
  async getProfile(userId: string): Promise<ProfileData> {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new Error("Profile not found");
    }

    return profile as ProfileData;
  },

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    if (data.phone !== undefined) {
      await prisma.employee.updateMany({
        where: { userId },
        data: { phone: data.phone },
      });
    }

    return updatedUser;
  },

  async updateNotifications(userId: string, settings: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      throw new Error("Organization not found");
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { settings },
    });

    return { settings };
  },
};
