import { sleep } from "@/lib/format";

// --- Mock API client -------------------------------------------------------
// Simulates a real REST/GraphQL backend: network latency, pagination,
// filtering, optimistic-mutation-friendly responses. Swap `request` for a
// real `fetch` wrapper to point at the Express server without touching callers.

export interface Query {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const LATENCY = { min: 120, max: 420 };

function latency() {
  return sleep(LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min));
}

export async function request<T>(resolver: () => T | Promise<T>, opts?: { delay?: boolean }): Promise<T> {
  if (opts?.delay !== false) await latency();
  return await resolver();
}

export function paginate<T>(items: T[], query: Query = {}): { data: T[]; total: number; page: number; pageSize: number } {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(200, query.pageSize ?? 20);
  const start = (page - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

export function sortBy<T>(items: T[], sortByKey?: string, dir: "asc" | "desc" = "asc"): T[] {
  if (!sortByKey) return items;
  return [...items].sort((a, b) => {
    const av = (a as any)[sortByKey];
    const bv = (b as any)[sortByKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

export function includesSearch<T>(item: T, fields: (keyof T)[], search?: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return fields.some((f) => String((item as any)[f] ?? "").toLowerCase().includes(q));
}
