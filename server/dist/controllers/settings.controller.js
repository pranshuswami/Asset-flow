"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = void 0;
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const error_middleware_1 = require("../middlewares/error.middleware");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
exports.settingsController = {
    getProfile: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const profile = await db_1.prisma.user.findUnique({
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
            throw new errors_1.NotFoundError("Profile not found");
        }
        res.status(200).json({
            success: true,
            data: profile,
            message: "Profile retrieved successfully",
        });
    }),
    updateProfile: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const { firstName, lastName, phone, avatarUrl } = req.body;
        const updatedUser = await db_1.prisma.user.update({
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
            await db_1.prisma.employee.updateMany({
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
    updateNotifications: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const settings = req.body;
        await db_1.prisma.organization.update({
            where: { id: user.organizationId },
            data: { settings },
        });
        res.status(200).json({
            success: true,
            data: { settings },
            message: "Notification settings updated successfully",
        });
    }),
};
//# sourceMappingURL=settings.controller.js.map