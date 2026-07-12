import { db } from "@/data/db";
import { includesSearch, request } from "@/services/http";
import type { Asset, Booking, MaintenanceRequest, Notification, User } from "@/types";

export interface SearchResult {
  type: "asset" | "employee" | "department" | "booking" | "maintenance" | "notification";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export const searchService = {
  async global(query: string): Promise<SearchResult[]> {
    return request(() => {
      const q = query.toLowerCase();
      const results: SearchResult[] = [];
      db.assets
        .filter((a) => includesSearch(a, ["name", "assetId", "serialNumber"], q))
        .slice(0, 6)
        .forEach((a: Asset) =>
          results.push({ type: "asset", id: a.id, title: a.name, subtitle: `${a.assetId} · ${a.status}`, href: `/assets/${a.id}` })
        );
      db.users
        .filter((u) => includesSearch(u, ["name", "email", "title"], q))
        .slice(0, 6)
        .forEach((u: User) =>
          results.push({ type: "employee", id: u.id, title: u.name, subtitle: u.title, href: `/employees` })
        );
      db.departments
        .filter((d) => includesSearch(d, ["name", "code"], q))
        .slice(0, 4)
        .forEach((d) => results.push({ type: "department", id: d.id, title: d.name, subtitle: d.code, href: `/departments` }));
      db.bookings
        .filter((b) => includesSearch(b, ["title", "resourceName"], q))
        .slice(0, 4)
        .forEach((b: Booking) =>
          results.push({ type: "booking", id: b.id, title: b.title, subtitle: b.resourceName, href: `/bookings` })
        );
      db.maintenance
        .filter((m) => includesSearch(m, ["assetName", "issue"], q))
        .slice(0, 4)
        .forEach((m: MaintenanceRequest) =>
          results.push({ type: "maintenance", id: m.id, title: m.issue, subtitle: m.assetName, href: `/maintenance` })
        );
      db.notifications
        .filter((n) => includesSearch(n, ["title", "body"], q))
        .slice(0, 3)
        .forEach((n: Notification) =>
          results.push({ type: "notification", id: n.id, title: n.title, subtitle: n.body, href: `/notifications` })
        );
      return results;
    });
  },
};
