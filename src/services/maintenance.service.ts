import { db } from "@/data/db";
import { ApiError, includesSearch, paginate, request, sortBy, type Query } from "@/services/http";
import type { Asset, MaintenanceRequest } from "@/types";
import type { MaintenanceInput } from "@/schemas";

function setAssetStatus(assetId: string, status: Asset["status"]) {
  const asset = db.assets.find((a) => a.id === assetId);
  if (asset) asset.status = status;
}

export const maintenanceService = {
  async list(query: Query = {}): Promise<{ data: MaintenanceRequest[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.maintenance.slice();
      if (query.status) items = items.filter((m) => m.status === query.status);
      if (query.priority) items = items.filter((m) => m.priority === query.priority);
      items = items.filter((m) => includesSearch(m, ["assetName", "issue", "raisedBy"], query.search as string));
      items = sortBy(items, query.sortBy ?? "createdAt", query.sortDir ?? "desc");
      return paginate(items, query);
    });
  },

  async create(input: MaintenanceInput): Promise<MaintenanceRequest> {
    return request(() => {
      const asset = db.assets.find((a) => a.id === input.assetId);
      if (!asset) throw new ApiError(404, "Asset not found");
      const req: MaintenanceRequest = {
        id: `mnt_${db.maintenance.length + 1}`,
        assetId: input.assetId,
        assetName: asset.name,
        raisedBy: "You",
        technician: input.technician,
        priority: input.priority,
        issue: input.issue,
        status: "PENDING",
        photos: [],
        createdAt: new Date().toISOString(),
      };
      db.maintenance.unshift(req);
      return req;
    });
  },

  async approve(id: string): Promise<MaintenanceRequest> {
    return request(() => {
      const m = db.maintenance.find((x) => x.id === id);
      if (!m) throw new ApiError(404, "Request not found");
      m.status = "APPROVED";
      m.technician = m.technician ?? "Unassigned";
      setAssetStatus(m.assetId, "MAINTENANCE");
      return m;
    });
  },

  async reject(id: string): Promise<MaintenanceRequest> {
    return request(() => {
      const m = db.maintenance.find((x) => x.id === id);
      if (!m) throw new ApiError(404, "Request not found");
      m.status = "REJECTED";
      setAssetStatus(m.assetId, "AVAILABLE");
      return m;
    });
  },

  async start(id: string): Promise<MaintenanceRequest> {
    return request(() => {
      const m = db.maintenance.find((x) => x.id === id);
      if (!m) throw new ApiError(404, "Request not found");
      m.status = "IN_PROGRESS";
      setAssetStatus(m.assetId, "MAINTENANCE");
      return m;
    });
  },

  async resolve(id: string, cost?: number): Promise<MaintenanceRequest> {
    return request(() => {
      const m = db.maintenance.find((x) => x.id === id);
      if (!m) throw new ApiError(404, "Request not found");
      m.status = "RESOLVED";
      m.resolvedAt = new Date().toISOString();
      m.cost = cost ?? m.cost;
      setAssetStatus(m.assetId, "AVAILABLE");
      const asset = db.assets.find((x) => x.id === m.assetId);
      asset?.timeline.push({
        id: `${m.assetId}-${Date.now()}`,
        type: "MAINTENANCE_COMPLETED",
        title: "Maintenance completed",
        actor: m.technician ?? "Technician",
        createdAt: m.resolvedAt,
      });
      return m;
    });
  },
};
