"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = void 0;
const db_1 = require("../config/db");
exports.settingsService = {
    async getProfile(userId) {
        const profile = await db_1.prisma.user.findUnique({
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
        return profile;
    },
    async updateProfile(userId, data) {
        const updatedUser = await db_1.prisma.user.update({
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
            await db_1.prisma.employee.updateMany({
                where: { userId },
                data: { phone: data.phone },
            });
        }
        return updatedUser;
    },
    async updateNotifications(userId, settings) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });
        if (!user?.organizationId) {
            throw new Error("Organization not found");
        }
        await db_1.prisma.organization.update({
            where: { id: user.organizationId },
            data: { settings },
        });
        return { settings };
    },
};
//# sourceMappingURL=settings.service.js.map