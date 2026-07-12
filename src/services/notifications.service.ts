import { db } from "@/data/db";
import { request } from "@/services/http";
import type { Notification } from "@/types";
import { generateId } from "@/lib/format";

type Listener = (n: Notification) => void;

class NotificationBus {
  private listeners = new Set<Listener>();
  private interval: ReturnType<typeof setInterval> | null = null;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(n: Notification) {
    db.notifications.unshift(n);
    this.listeners.forEach((l) => l(n));
  }

  // Simulates Socket.io server pushes for a live feel.
  startSimulation() {
    if (this.interval) return;
    const samples = [
      { type: "BOOKING_REMINDER" as const, title: "Conference Room B in 30 min", body: "Design Review with Product team." },
      { type: "TRANSFER_APPROVED" as const, title: "Transfer approved", body: "Asset ready for pickup." },
      { type: "MAINTENANCE_APPROVED" as const, title: "Maintenance approved", body: "Technician assigned." },
      { type: "ASSET_RETURNED" as const, title: "Asset returned", body: "Condition verified Good." },
    ];
    this.interval = setInterval(() => {
      if (Math.random() > 0.55) return;
      const s = samples[Math.floor(Math.random() * samples.length)]!;
      this.emit({
        id: generateId("not"),
        type: s.type,
        title: s.title,
        body: s.body,
        read: false,
        createdAt: new Date().toISOString(),
        href: "/notifications",
      });
    }, 18000);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

export const notificationBus = new NotificationBus();

export const notificationsService = {
  async list(): Promise<Notification[]> {
    return request(() => db.notifications.slice(), { delay: false });
  },

  async unreadCount(): Promise<number> {
    return request(() => db.notifications.filter((n) => !n.read).length, { delay: false });
  },

  async markRead(id: string): Promise<void> {
    return request(() => {
      const n = db.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    }, { delay: false });
  },

  async markAllRead(): Promise<void> {
    return request(() => {
      db.notifications.forEach((n) => (n.read = true));
    }, { delay: false });
  },
};
