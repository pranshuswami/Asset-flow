import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes,
  CircleCheck,
  Wrench,
  ArrowLeftRight,
  CalendarCheck,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import {
  ChartCard,
  UtilizationArea,
  CategoryBars,
  DepartmentBars,
  StatusDonut,
} from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useActivity,
  useDashboardMetrics,
  useInsights,
} from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { cn } from "@/lib/cn";
import { formatPercent, relativeTime } from "@/lib/format";
import { TimelineDot } from "@/components/common/asset-timeline";
import { ACTIVITY_META, ASSET_CATEGORY_META } from "@/constants";
import type { Insight } from "@/types";

const C = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  accent: "hsl(var(--accent-foreground))",
};

export function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { data: activity } = useActivity();
  const { data: insights } = useInsights();

  const statusDonut = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Available", value: metrics.available, color: C.success },
      { name: "Allocated", value: metrics.allocated, color: C.primary },
      { name: "Maintenance", value: metrics.maintenance, color: C.warning },
    ];
  }, [metrics]);

  const categoryData = useMemo(
    () =>
      metrics?.categoryBreakdown.map((c) => ({
        category: ASSET_CATEGORY_META[c.category].label,
        count: c.count,
      })) ?? [],
    [metrics]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Real-time view of your asset fleet, utilization and AI-powered signals."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">Export report</Link>
            </Button>
            <Button asChild>
              <Link to="/assets/new">Register asset</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Assets" value={metrics?.totalAssets ?? 0} icon={Boxes} accent="primary" loading={isLoading} delta={2.4} hint="vs last month" />
        <StatCard label="Available" value={metrics?.available ?? 0} icon={CircleCheck} accent="success" loading={isLoading} />
        <StatCard label="Allocated" value={metrics?.allocated ?? 0} icon={ArrowLeftRight} accent="accent" loading={isLoading} />
        <StatCard label="Maintenance" value={metrics?.maintenance ?? 0} icon={Wrench} accent="warning" loading={isLoading} />
        <StatCard label="Bookings" value={metrics?.bookings ?? 0} icon={CalendarCheck} accent="primary" loading={isLoading} />
        <StatCard label="Utilization" value={`${metrics?.utilization ?? 0}%`} icon={Gauge} accent="success" loading={isLoading} delta={metrics?.utilizationDelta} hint="MoM" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Bookings & Allocations" subtitle="Last 8 months" className="lg:col-span-2">
          {metrics ? <UtilizationArea data={metrics.monthlyBookings} /> : <Skeleton className="h-[280px] w-full" />}
        </ChartCard>

        <ChartCard title="Fleet Status" subtitle="Live distribution">
          {metrics ? (
            <div className="relative">
              <StatusDonut data={statusDonut} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{metrics.utilization}%</span>
                <span className="text-xs text-muted-foreground">utilized</span>
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs">
                {statusDonut.map((s) => (
                  <span key={s.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <Skeleton className="h-[240px] w-full" />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Assets by Category" className="lg:col-span-1">
          {metrics ? <CategoryBars data={categoryData} /> : <Skeleton className="h-[280px] w-full" />}
        </ChartCard>

        <ChartCard title="Department Ranking" subtitle="By utilization" className="lg:col-span-2">
          {metrics ? <DepartmentBars data={metrics.departmentRanking} /> : <Skeleton className="h-[300px] w-full" />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Activity Feed" subtitle="Recent operations across the fleet" className="h-full">
            <div className="space-y-1">
              {activity?.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/40"
                >
                  <TimelineDot type={item.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.actor}</span>{" "}
                      <span className="text-muted-foreground">{ACTIVITY_META[item.type].verb}</span>{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(item.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard title="AI Insights" subtitle="Generated today" className="h-full">
            <div className="space-y-2.5">
              {insights?.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const tone =
    insight.severity === "critical"
      ? "border-destructive/30 bg-destructive/5"
      : insight.severity === "warning"
      ? "border-warning/30 bg-warning/5"
      : insight.severity === "positive"
      ? "border-success/30 bg-success/5"
      : "border-primary/30 bg-primary/5";

  const Icon = insight.severity === "positive" ? TrendingUp : insight.severity === "critical" ? AlertTriangle : Lightbulb;

  return (
    <div className={cn("rounded-xl border p-3", tone)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0 text-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">{insight.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{insight.description}</p>
        </div>
      </div>
      {insight.metric && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {insight.metric}
          </Badge>
          {insight.delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                insight.delta >= 0 ? "text-success" : "text-destructive"
              )}
            >
              <ArrowUpRight className="size-3" />
              {Math.abs(insight.delta)}%
            </span>
          )}
        </div>
      )}
      {insight.recommendation && (
        <p className="mt-2 rounded-lg bg-background/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          💡 {insight.recommendation}
        </p>
      )}
    </div>
  );
}
