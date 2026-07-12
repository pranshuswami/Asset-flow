import { db } from "@/data/db";
import { ApiError, includesSearch, paginate, request, sortBy, type Query } from "@/services/http";
import type { Booking } from "@/types";
import type { BookingInput } from "@/schemas";

export const bookingsService = {
  async list(query: Query = {}): Promise<{ data: Booking[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.bookings.slice();
      if (query.resourceType) items = items.filter((b) => b.resourceType === query.resourceType);
      if (query.status) items = items.filter((b) => b.status === query.status);
      items = items.filter((b) => includesSearch(b, ["title", "resourceName"], query.search as string));
      items = sortBy(items, query.sortBy ?? "start", query.sortDir ?? "asc");
      return paginate(items, query);
    });
  },

  async calendar(rangeStart: string, rangeEnd: string): Promise<Booking[]> {
    return request(() =>
      db.bookings.filter((b) => b.start >= rangeStart && b.start <= rangeEnd)
    );
  },

  async create(input: BookingInput): Promise<Booking> {
    return request(() => {
      const overlap = db.bookings.find(
        (b) =>
          b.resourceId === input.resourceId &&
          b.status !== "CANCELLED" &&
          ((input.start >= b.start && input.start < b.end) ||
            (input.end > b.start && input.end <= b.end) ||
            (input.start <= b.start && input.end >= b.end))
      );
      if (overlap) {
        throw new ApiError(409, `Conflicts with "${overlap.title}" (${overlap.resourceName}).`);
      }
      const booking: Booking = {
        id: `bk_${db.bookings.length + 1}`,
        resourceId: input.resourceId,
        resourceName:
          input.resourceType === "ROOM"
            ? `Conference Room ${input.resourceId.slice(-1)}`
            : input.resourceType === "VEHICLE"
            ? "Fleet Vehicle"
            : input.resourceType === "PROJECTOR"
            ? "Epson Projector"
            : "AV Kit",
        resourceType: input.resourceType,
        userId: input.userId,
        title: input.title,
        start: input.start,
        end: input.end,
        status: "CONFIRMED",
        recurring: input.recurring ?? false,
        attendees: input.attendees ?? [],
      };
      db.bookings.push(booking);
      return booking;
    });
  },

  async cancel(id: string): Promise<{ ok: boolean }> {
    return request(() => {
      const b = db.bookings.find((x) => x.id === id);
      if (b) b.status = "CANCELLED";
      return { ok: true };
    });
  },
};
