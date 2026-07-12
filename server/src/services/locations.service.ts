import { prisma } from "../config/db";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

export async function listLocations(organizationId: string, includeInactive = false) {
  return prisma.location.findMany({
    where: {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    include: {
      _count: { select: { assets: true, bookings: true } },
    },
    orderBy: { code: "asc" },
  });
}

export async function createLocation(organizationId: string, data: {
  building: string;
  code: string;
  floor?: string;
  room?: string;
}) {
  const existing = await prisma.location.findFirst({
    where: { organizationId, code: data.code },
  });
  if (existing) {
    throw new ConflictError("Location code already exists in this organization");
  }

  return prisma.location.create({
    data: {
      ...data,
      organizationId,
      floor: data.floor ?? null,
      room: data.room ?? null,
    },
    include: { _count: { select: { assets: true, bookings: true } } },
  });
}

export async function updateLocation(id: string, organizationId: string, data: {
  building?: string;
  code?: string;
  floor?: string | null;
  room?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.location.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new NotFoundError("Location not found");
  }

  if (data.code && data.code !== existing.code) {
    const codeTaken = await prisma.location.findFirst({
      where: { organizationId, code: data.code, id: { not: id } },
    });
    if (codeTaken) {
      throw new ConflictError("Location code already exists");
    }
  }

  return prisma.location.update({
    where: { id },
    data: {
      ...(data.building !== undefined && { building: data.building }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.floor !== undefined && { floor: data.floor }),
      ...(data.room !== undefined && { room: data.room }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: { _count: { select: { assets: true, bookings: true } } },
  });
}

export async function deleteLocation(id: string, organizationId: string) {
  const existing = await prisma.location.findFirst({
    where: { id, organizationId },
    include: { _count: { select: { assets: true, bookings: true } } },
  });

  if (!existing) {
    throw new NotFoundError("Location not found");
  }

  if (existing._count.assets > 0) {
    throw new BadRequestError("Cannot delete location with associated assets");
  }

  await prisma.location.delete({ where: { id } });
  return { message: "Location deleted successfully" };
}

export const locationsService = {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
