import { db } from "@/data/db";
import { includesSearch, paginate, request, sortBy, type Query } from "@/services/http";
import type { Asset } from "@/types";
import type { AssetInput } from "@/schemas";
import { generateId } from "@/lib/format";

const SEARCH_FIELDS: (keyof Asset)[] = ["name", "assetId", "serialNumber", "model", "supplier", "status"];

export const assetsService = {
  async list(query: Query = {}): Promise<{ data: Asset[]; total: number; page: number; pageSize: number }> {
    return request(() => {
      let items = db.assets.slice();
      if (query.status) items = items.filter((a) => a.status === query.status);
      if (query.category) items = items.filter((a) => a.category === query.category);
      if (query.departmentId) items = items.filter((a) => a.departmentId === query.departmentId);
      if (query.condition) items = items.filter((a) => a.condition === query.condition);
      items = items.filter((a) => includesSearch(a, SEARCH_FIELDS, query.search as string));
      items = sortBy(items, query.sortBy, query.sortDir);
      return paginate(items, query);
    });
  },

  async get(id: string): Promise<Asset> {
    return request(() => {
      const asset = db.assets.find((a) => a.id === id);
      if (!asset) throw new Error("Asset not found");
      return asset;
    });
  },

  async create(input: AssetInput): Promise<Asset> {
    return request(() => {
      const assetId = generateId("AF");
      const asset: Asset = {
        id: assetId,
        assetId,
        name: input.name,
        category: input.category,
        serialNumber: input.serialNumber,
        model: input.model,
        status: input.status,
        condition: input.condition,
        ownerId: input.ownerId || undefined,
        departmentId: input.departmentId,
        locationId: input.locationId,
        purchaseDate: input.purchaseDate,
        purchasePrice: input.purchasePrice,
        warrantyExpiry: input.warrantyExpiry,
        supplier: input.supplier,
        healthScore: 100,
        riskScore: 0,
        nextServiceDate: new Date(Date.now() + 180 * 864e5).toISOString(),
        utilization: 0,
        createdAt: new Date().toISOString(),
        timeline: [
          {
            id: `${assetId}-t0`,
            type: "CREATED",
            title: "Asset registered",
            description: "Asset created in inventory",
            actor: "You",
            createdAt: new Date().toISOString(),
          },
        ],
        documents: [],
      };
      db.assets.unshift(asset);
      return asset;
    });
  },

  async update(id: string, patch: Partial<AssetInput>): Promise<Asset> {
    return request(() => {
      const asset = db.assets.find((a) => a.id === id);
      if (!asset) throw new Error("Asset not found");
      Object.assign(asset, patch);
      asset.timeline.push({
        id: `${id}-${Date.now()}`,
        type: "UPDATED",
        title: "Details updated",
        actor: "You",
        createdAt: new Date().toISOString(),
      });
      return asset;
    });
  },

  async remove(id: string): Promise<{ ok: boolean }> {
    return request(() => {
      const idx = db.assets.findIndex((a) => a.id === id);
      if (idx >= 0) db.assets.splice(idx, 1);
      return { ok: true };
    });
  },

  async bulkUpdateStatus(ids: string[], status: Asset["status"]): Promise<{ ok: boolean }> {
    return request(() => {
      ids.forEach((id) => {
        const asset = db.assets.find((a) => a.id === id);
        if (asset) asset.status = status;
      });
      return { ok: true };
    });
  },
};
