import bcrypt from "bcryptjs";
import crypto from "crypto";
import { JwtPayload, sign } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/db";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email";

const SALT_ROUNDS = 12;

interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const organization = await prisma.organization.create({
    data: {
      name: data.organizationName,
      slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    },
  });

  const user = await prisma.user.create({
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

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: false },
  });

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch {
    console.warn("[auth] Failed to send verification email");
  }

  return { user, organization };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId ?? undefined,
  };

  const accessToken = sign(payload, env.jwtSecret as any, { expiresIn: env.jwtExpiry as any });
  const refreshToken = sign(payload, env.jwtRefreshSecret as any, { expiresIn: env.jwtRefreshExpiry as any });

  await prisma.refreshToken.create({
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

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const payload: TokenPayload = {
    userId: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
    organizationId: stored.user.organizationId ?? undefined,
  };

  const accessToken = sign(payload, env.jwtSecret as any, { expiresIn: env.jwtExpiry as any });

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

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "If an account exists, a reset email will be sent" };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    prisma.refreshToken.create({
      data: { userId: user.id, token: resetToken, expiresAt },
    }),
  ]);

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch {
    console.warn("[auth] Failed to send password reset email");
  }

  return { message: "If an account exists, a reset email will be sent" };
}

export async function resetPassword(token: string, newPassword: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    }),
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.deleteMany({ where: { userId: stored.userId } }),
  ]);

  return { message: "Password reset successfully" };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
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
    throw new NotFoundError("User not found");
  }

  return user;
}

export const authService = {
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getMe,
};
