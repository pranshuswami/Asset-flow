import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "destructive" | "accent";
  loading?: boolean;
}

const accentMap = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  accent: "text-accent-foreground bg-accent",
};

export function StatCard({ label, value, icon: Icon, delta, hint, accent = "primary", loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-24 animate-pulse rounded bg-muted" />
      </Card>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-glow">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className={cn("flex size-9 items-center justify-center rounded-lg", accentMap[accent])}>
            <Icon className="size-4.5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
          {typeof value === "number" ? formatCompact(value) : value}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              )}
            >
              {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </Card>
    </motion.div>
  );
}
