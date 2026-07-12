import { useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Plus, Crown, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments } from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Department } from "@/types";

export function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();

  const stats = useMemo(() => {
    if (!departments) return null;
    return {
      total: departments.length,
      budget: departments.reduce((s, d) => s + d.budget, 0),
      members: departments.reduce((s, d) => s + d.memberCount, 0),
    };
  }, [departments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organizational structure, budgets and headcount."
        actions={<Button><Plus className="size-4" /> New department</Button>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat icon={Building2} label="Departments" value={stats ? formatNumber(stats.total) : "—"} />
        <MiniStat icon={Users} label="Total members" value={stats ? formatNumber(stats.members) : "—"} />
        <MiniStat icon={IndianRupee} label="Total budget" value={stats ? formatCurrency(stats.budget) : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)
          : departments?.map((dept, i) => <DepartmentCard key={dept.id} dept={dept} index={i} />)}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function DepartmentCard({ dept, index }: { dept: Department; index: number }) {
  const head = lookup.user(dept.headId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-glow">
        <div className="h-1.5 w-full" style={{ background: dept.color }} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold">{dept.name}</p>
              <Badge variant="muted" className="mt-1">{dept.code}</Badge>
            </div>
            <Badge variant={dept.status === "ACTIVE" ? "success" : "secondary"}>{dept.status}</Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-lg font-bold tabular-nums">{dept.memberCount}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(dept.budget)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            {head ? (
              <>
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                  {head.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <span className="text-sm">{head.name}</span>
                <Crown className="ml-auto size-4 text-warning" />
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No department head assigned</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
