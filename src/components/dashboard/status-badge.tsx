import { cn } from "@/lib/cn";
export type AssetStatus = "Optimal" | "Check up" | "Active";
const tones: Record<AssetStatus, string> = { Optimal: "bg-emerald-500/15 text-emerald-400", "Check up": "bg-amber-500/15 text-amber-400", Active: "bg-emerald-500/15 text-emerald-400" };
export function StatusBadge({ status }: { status: AssetStatus }) { return <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold uppercase", tones[status])}>{status}</span>; }
