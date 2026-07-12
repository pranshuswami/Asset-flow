import { db } from "@/data/db";
import { lookup } from "@/hooks/use-lookups";

export function exportToCsv(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

export function exportToJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ExportableAsset {
  assetId: string;
  name: string;
  category: string;
  status: string;
  department: string;
  owner: string;
  health: number;
  value: number;
}

export function getAssetsExport(): ExportableAsset[] {
  return db.assets.map((a) => ({
    assetId: a.assetId,
    name: a.name,
    category: a.category,
    status: a.status,
    department: lookup.departmentName(a.departmentId),
    owner: lookup.userName(a.ownerId),
    health: a.healthScore,
    value: a.purchasePrice,
  }));
}
