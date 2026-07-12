"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
exports.requireOrg = requireOrg;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const errors_1 = require("../utils/errors");
function generateTokens(payload) {
    const accessToken = (0, jsonwebtoken_1.sign)(payload, env_1.env.jwtSecret, { expiresIn: env_1.env.jwtExpiry });
    const refreshToken = (0, jsonwebtoken_1.sign)(payload, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpiry });
    return { accessToken, refreshToken };
}
function verifyAccessToken(token) {
    try {
        return (0, jsonwebtoken_1.verify)(token, env_1.env.jwtSecret);
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid or expired token");
    }
}
function verifyRefreshToken(token) {
    try {
        return (0, jsonwebtoken_1.verify)(token, env_1.env.jwtRefreshSecret);
    }
    catch {
        throw new errors_1.UnauthorizedError("Invalid or expired refresh token");
    }
}
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new errors_1.UnauthorizedError("Missing authorization token");
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    const user = await db_1.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, organizationId: true, isActive: true },
    });
    if (!user || !user.isActive) {
        throw new errors_1.UnauthorizedError("User not found or inactive");
    }
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId ?? undefined,
    };
    next();
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError("Insufficient permissions");
        }
        next();
    };
}
function requireOrg(req, _res, next) {
    if (!req.user?.organizationId) {
        throw new errors_1.ForbiddenError("Organization context required");
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map