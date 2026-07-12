import { db } from "@/data/db";
import { ApiError, includesSearch, paginate, request, sortBy, type Query } from "@/services/http";
import type { Audit } from "@/types";
import type { AuditInput } from "@/schemas";

export const auditsService = {
  async list(query: Query = {}): Promise<{ data: Audit[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.audits.slice();
      if (query.status) items = items.filter((a) => a.status === query.status);
      items = items.filter((a) => includesSearch(a, ["title"], query.search as string));
      items = sortBy(items, query.sortBy ?? "createdAt", query.sortDir ?? "desc");
      return paginate(items, query);
    });
  },

  async get(id: string): Promise<Audit> {
    return request(() => {
      const audit = db.audits.find((a) => a.id === id);
      if (!audit) throw new ApiError(404, "Audit not found");
      return audit;
    });
  },

  async create(input: AuditInput): Promise<Audit> {
    return request(() => {
      const assetIds = db.assets
        .filter((a) => input.departmentIds.includes(a.departmentId))
        .map((a) => a.id);
      const audit: Audit = {
        id: `aud_${db.audits.length + 1}`,
        title: input.title,
        status: "DRAFT",
        auditorIds: input.auditorIds,
        departmentIds: input.departmentIds,
        assetIds,
        items: assetIds.map((assetId) => ({ assetId, status: "PENDING" })),
        progress: 0,
        createdAt: new Date().toISOString(),
      };
      db.audits.unshift(audit);
      return audit;
    });
  },

  async start(id: string): Promise<Audit> {
    return request(() => {
      const a = db.audits.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Audit not found");
      a.status = "IN_PROGRESS";
      return a;
    });
  },

  async verifyItem(id: string, assetId: string, status: "VERIFIED" | "MISSING" | "DAMAGED", note?: string): Promise<Audit> {
    return request(() => {
      const a = db.audits.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Audit not found");
      const item = a.items.find((i) => i.assetId === assetId);
      if (item) {
        item.status = status;
        item.note = note;
        item.verifiedBy = "You";
      }
      const verified = a.items.filter((i) => i.status !== "PENDING").length;
      a.progress = Math.round((verified / a.items.length) * 100);
      if (a.progress === 100) a.status = "COMPLETED";
      return a;
    });
  },

  async close(id: string): Promise<Audit> {
    return request(() => {
      const a = db.audits.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Audit not found");
      a.status = "CLOSED";
      a.closedAt = new Date().toISOString();
      a.progress = 100;
      return a;
    });
  },
};
