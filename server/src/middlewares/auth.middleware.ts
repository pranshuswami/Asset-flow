import { Request, Response, NextFunction } from "express";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/db";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

export interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

export function generateTokens(payload: Omit<AuthPayload, "iat" | "exp">) {
  const accessToken = sign(payload, env.jwtSecret as any, { expiresIn: env.jwtExpiry as any });
  const refreshToken = sign(payload, env.jwtRefreshSecret as any, { expiresIn: env.jwtRefreshExpiry as any });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AuthPayload {
  try {
    return verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function verifyRefreshToken(token: string): AuthPayload {
  try {
    return verify(token, env.jwtRefreshSecret) as AuthPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing authorization token");
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, organizationId: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError("User not found or inactive");
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId ?? undefined,
  };

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
}

export function requireOrg(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.organizationId) {
    throw new ForbiddenError("Organization context required");
  }
  next();
}
