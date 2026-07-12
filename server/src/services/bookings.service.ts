import { prisma } from "../config/db";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";
import { Booking, BookingStatus, Prisma } from "@prisma/client";

export interface BookingListFilters {
  organizationId: string;
  employeeId?: string;
  assetId?: string;
  locationId?: string;
  status?: BookingStatus;
  from?: Date;
  to?: Date;
}

export interface BookingListResult {
  data: Booking[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

function buildBookingWhere(filters: BookingListFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {
    employee: { department: { organizationId: filters.organizationId } },
  };

  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.locationId) where.locationId = filters.locationId;
  if (filters.status) where.status = filters.status;

  if (filters.from || filters.to) {
    const range: Prisma.DateTimeFilter = {};
    if (filters.from) range.gte = filters.from;
    if (filters.to) range.lte = filters.to;
    where.startTime = range;
  }

  return where;
}

function buildOverlapWhere(
  start: Date,
  end: Date,
  assetId?: string | null,
  locationId?: string | null,
  excludeId?: string
): Prisma.BookingWhereInput | null {
  const resourceConditions: Prisma.BookingWhereInput[] = [];
  if (assetId) resourceConditions.push({ assetId });
  if (locationId) resourceConditions.push({ locationId });
  if (resourceConditions.length === 0) return null;

  return {
    id: excludeId ? { not: excludeId } : undefined,
    status: { not: BookingStatus.CANCELLED },
    OR: resourceConditions,
    startTime: { lt: end },
    endTime: { gt: start },
  };
}

async function assertNoOverlap(
  start: Date,
  end: Date,
  assetId?: string | null,
  locationId?: string | null,
  excludeId?: string
) {
  const overlap = buildOverlapWhere(start, end, assetId, locationId, excludeId);
  if (!overlap) return;
  const clash = await prisma.booking.findFirst({ where: overlap });
  if (clash) {
    throw new ConflictError(
      "Booking overlaps with an existing booking for the same asset or location"
    );
  }
}

export const bookingsService = {
  async list(filters: BookingListFilters, page = 1, limit = 20): Promise<BookingListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = buildBookingWhere(filters);
    const [data, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: {
          asset: { select: { id: true, name: true, assetCode: true } },
          location: {
            select: { id: true, code: true, building: true, floor: true, room: true },
          },
          employee: {
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async getById(id: string, organizationId: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, employee: { department: { organizationId } } },
      include: {
        asset: true,
        location: true,
        employee: { include: { user: true } },
      },
    });
    if (!booking) throw new NotFoundError("Booking not found");
    return booking;
  },

  async create(data: any, employeeId: string) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) throw new BadRequestError("End time must be after start time");

    await assertNoOverlap(start, end, data.assetId, data.locationId);

    return prisma.booking.create({
      data: {
        title: data.title,
        description: data.description,
        assetId: data.assetId,
        locationId: data.locationId,
        employeeId,
        startTime: start,
        endTime: end,
        status: data.status ?? BookingStatus.CONFIRMED,
        isRecurring: data.isRecurring ?? false,
        recurrence: data.recurrence,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
      },
      include: {
        asset: { select: { id: true, name: true, assetCode: true } },
        location: true,
        employee: { include: { user: true } },
      },
    });
  },

  async update(id: string, organizationId: string, data: any) {
    const existing = await this.getById(id, organizationId);

    const start = data.startTime ? new Date(data.startTime) : existing.startTime;
    const end = data.endTime ? new Date(data.endTime) : existing.endTime;
    if (end <= start) throw new BadRequestError("End time must be after start time");

    const assetId = data.assetId !== undefined ? data.assetId : existing.assetId;
    const locationId = data.locationId !== undefined ? data.locationId : existing.locationId;

    await assertNoOverlap(start, end, assetId, locationId, id);

    return prisma.booking.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        assetId,
        locationId,
        startTime: start,
        endTime: end,
        status: data.status,
        isRecurring: data.isRecurring,
        recurrence: data.recurrence,
        reminderAt:
          data.reminderAt !== undefined
            ? data.reminderAt
              ? new Date(data.reminderAt)
              : null
            : undefined,
      },
      include: {
        asset: { select: { id: true, name: true, assetCode: true } },
        location: true,
        employee: { include: { user: true } },
      },
    });
  },

  async remove(id: string, organizationId: string) {
    await this.getById(id, organizationId);
    await prisma.booking.delete({ where: { id } });
    return { id };
  },
};
