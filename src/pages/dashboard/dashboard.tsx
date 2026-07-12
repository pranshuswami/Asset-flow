<<<<<<< HEAD
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
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { TimelineDot } from "@/components/common/asset-timeline";
import { ACTIVITY_META, ASSET_CATEGORY_META } from "@/constants";
import type { Insight } from "@/types";
=======
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { AssetCard, type DashboardAsset } from "@/components/dashboard/asset-card";
import { BottomNavigation } from "@/components/dashboard/bottom-navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { RecentActivity } from "@/components/dashboard/recent-activity";
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec

const assets: DashboardAsset[] = [
  { id: "AF-20394", name: "Robot Assembly Arm", category: "Manufacturing · Line 02", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=85", status: "Optimal" },
  { id: "AF-99321", name: "Deep Learning Node", category: "Compute infrastructure · Rack 04B", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85", status: "Check up" },
  { id: "AF-88721", name: "EV Transit 04", category: "Fleet operations · North depot", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85", status: "Active" },
];

export function DashboardPage() {
<<<<<<< HEAD
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

  const statusDotClassName = {
    Available: "bg-success",
    Allocated: "bg-primary",
    Maintenance: "bg-warning",
  } as const;

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

      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-accent/30 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Enterprise control center</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Your asset operations are running with strong utilization and healthy maintenance coverage.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Track fleet health, workforce allocation and AI-generated recommendations from a single elegant workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">Live ops</Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/copilot">Open AI copilot</Link>
            </Button>
          </div>
        </div>
      </div>

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
                    <span className={cn("size-2 rounded-full", statusDotClassName[s.name as keyof typeof statusDotClassName])} />
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
=======
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground transition-colors">
      <Navbar />
      <main className="mx-auto max-w-[1900px] px-3 py-5 sm:px-6 md:py-7">
        <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.65fr)_minmax(600px,1.35fr)]">
          <AIInsightCard />
          <RecentActivity />
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec
        </div>

        <section className="mt-10">
          <h2 className="text-3xl font-semibold tracking-tight">High-Value Assets</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
