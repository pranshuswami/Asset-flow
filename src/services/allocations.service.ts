import { db } from "@/data/db";
import { ApiError, paginate, request, sortBy, type Query } from "@/services/http";
import type { Allocation } from "@/types";
import type { AllocationInput } from "@/schemas";

function reconcileAsset(assetId: string, status: Asset["status"], ownerId?: string) {
  const asset = db.assets.find((a) => a.id === assetId);
  if (asset) {
    asset.status = status;
    if (ownerId !== undefined) asset.ownerId = ownerId;
  }
}

export const allocationsService = {
  async list(query: Query = {}): Promise<{ data: Allocation[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.allocations.slice();
      if (query.status) items = items.filter((a) => a.status === query.status);
      if (query.assetId) items = items.filter((a) => a.assetId === query.assetId);
      items = sortBy(items, query.sortBy ?? "requestedAt", query.sortDir ?? "desc");
      const res = paginate(items, query);
      return res;
    });
  },

  async create(input: AllocationInput): Promise<Allocation> {
    return request(() => {
      const asset = db.assets.find((a) => a.id === input.assetId);
      if (!asset) throw new ApiError(404, "Asset not found");
      if (asset.status === "ALLOCATED") {
        throw new ApiError(409, "Asset is already allocated — conflict detected.");
      }
      const allocation: Allocation = {
        id: `alc_${db.allocations.length + 1}`,
        assetId: input.assetId,
        toUserId: input.toUserId,
        departmentId: input.departmentId,
        status: "REQUESTED",
        reason: input.reason,
        condition: input.condition,
        requestedBy: "You",
        requestedAt: new Date().toISOString(),
        expectedReturn: input.expectedReturn,
      };
      db.allocations.unshift(allocation);
      reconcileAsset(input.assetId, "RESERVED");
      return allocation;
    });
  },

  async approve(id: string): Promise<Allocation> {
    return request(() => {
      const a = db.allocations.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Allocation not found");
      a.status = "APPROVED";
      a.approvedBy = "You";
      reconcileAsset(a.assetId, "RESERVED", a.toUserId);
      return a;
    });
  },

  async transfer(id: string): Promise<Allocation> {
    return request(() => {
      const a = db.allocations.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Allocation not found");
      a.status = "TRANSFERRED";
      a.transferredAt = new Date().toISOString();
      reconcileAsset(a.assetId, "ALLOCATED", a.toUserId);
      const asset = db.assets.find((x) => x.id === a.assetId);
      asset?.timeline.push({
        id: `${a.assetId}-${Date.now()}`,
        type: "TRANSFERRED",
        title: "Transferred",
        description: `Transferred to ${a.toUserId}`,
        actor: "You",
        createdAt: a.transferredAt,
      });
      return a;
    });
  },

  async return(id: string): Promise<Allocation> {
    return request(() => {
      const a = db.allocations.find((x) => x.id === id);
      if (!a) throw new ApiError(404, "Allocation not found");
      a.status = "RETURNED";
      a.returnedAt = new Date().toISOString();
      reconcileAsset(a.assetId, "AVAILABLE", undefined);
      const asset = db.assets.find((x) => x.id === a.assetId);
      asset?.timeline.push({
        id: `${a.assetId}-${Date.now()}`,
        type: "RETURNED",
        title: "Returned",
        actor: "You",
        createdAt: a.returnedAt,
      });
      return a;
    });
  },
};
