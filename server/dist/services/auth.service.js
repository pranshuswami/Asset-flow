"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
exports.register = register;
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
const email_1 = require("../utils/email");
const SALT_ROUNDS = 12;
async function register(data) {
    const existing = await db_1.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new errors_1.ConflictError("Email already registered");
    }
    const passwordHash = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
    const organization = await db_1.prisma.organization.create({
        data: {
            name: data.organizationName,
            slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
    });
    const user = await db_1.prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: "ADMIN",
            organizationId: organization.id,
            emailVerified: false,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, organizationId: true },
    });
    const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    await db_1.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: false },
    });
    try {
        await (0, email_1.sendVerificationEmail)(user.email, verificationToken);
    }
    catch {
        console.warn("[auth] Failed to send verification email");
    }
    return { user, organization };
}
async function login(email, password) {
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
        throw new errors_1.UnauthorizedError("Invalid email or password");
    }
    const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        throw new errors_1.UnauthorizedError("Invalid email or password");
    }
    await db_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId ?? undefined,
    };
    const accessToken = (0, jsonwebtoken_1.sign)(payload, env_1.env.jwtSecret, { expiresIn: env_1.env.jwtExpiry });
    const refreshToken = (0, jsonwebtoken_1.sign)(payload, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpiry });
    await db_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            emailVerified: user.emailVerified,
        },
        accessToken,
        refreshToken,
    };
}
async function refreshAccessToken(refreshToken) {
    const stored = await db_1.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
        throw new errors_1.UnauthorizedError("Invalid or expired refresh token");
    }
    const payload = {
        userId: stored.user.id,
        email: stored.user.email,
        role: stored.user.role,
        organizationId: stored.user.organizationId ?? undefined,
    };
    const accessToken = (0, jsonwebtoken_1.sign)(payload, env_1.env.jwtSecret, { expiresIn: env_1.env.jwtExpiry });
    return {
        accessToken,
        user: {
            id: stored.user.id,
            email: stored.user.email,
            firstName: stored.user.firstName,
            lastName: stored.user.lastName,
            role: stored.user.role,
            organizationId: stored.user.organizationId,
        },
    };
}
async function forgotPassword(email) {
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { message: "If an account exists, a reset email will be sent" };
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db_1.prisma.$transaction([
        db_1.prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
        db_1.prisma.refreshToken.create({
            data: { userId: user.id, token: resetToken, expiresAt },
        }),
    ]);
    try {
        await (0, email_1.sendPasswordResetEmail)(user.email, resetToken);
    }
    catch {
        console.warn("[auth] Failed to send password reset email");
    }
    return { message: "If an account exists, a reset email will be sent" };
}
async function resetPassword(token, newPassword) {
    const stored = await db_1.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
        throw new errors_1.UnauthorizedError("Invalid or expired reset token");
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
    await db_1.prisma.$transaction([
        db_1.prisma.user.update({
            where: { id: stored.userId },
            data: { passwordHash },
        }),
        db_1.prisma.refreshToken.delete({ where: { id: stored.id } }),
        db_1.prisma.refreshToken.deleteMany({ where: { userId: stored.userId } }),
    ]);
    return { message: "Password reset successfully" };
}
async function getMe(userId) {
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarUrl: true,
            emailVerified: true,
            isActive: true,
            organizationId: true,
            lastLoginAt: true,
            createdAt: true,
            employee: { select: { id: true, employeeCode: true, designation: true, departmentId: true, phone: true } },
            organization: { select: { id: true, name: true, slug: true, plan: true } },
        },
    });
    if (!user) {
        throw new errors_1.NotFoundError("User not found");
    }
    return user;
}
exports.authService = {
    register,
    login,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getMe,
};
//# sourceMappingURL=auth.service.js.map