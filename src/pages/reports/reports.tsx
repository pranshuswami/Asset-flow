import { useMemo } from "react";
import { Download, FileText, FileSpreadsheet, Printer, TrendingDown, Activity } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChartCard, CategoryBars, DepartmentBars, UtilizationArea, StatusDonut } from "@/components/charts/charts";
import { useDashboardMetrics } from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { exportToCsv, exportToJson, getAssetsExport } from "@/lib/export";
import { formatCurrency } from "@/lib/format";
import { ASSET_CATEGORY_META } from "@/constants";

const C = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
};

export function ReportsPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const categoryData = useMemo(
    () => metrics?.categoryBreakdown.map((c) => ({ category: ASSET_CATEGORY_META[c.category].label, count: c.count })) ?? [],
    [metrics]
  );
  const statusDonut = useMemo(
    () => [
      { name: "Available", value: metrics?.available ?? 0, color: C.success },
      { name: "Allocated", value: metrics?.allocated ?? 0, color: C.primary },
      { name: "Maintenance", value: metrics?.maintenance ?? 0, color: C.warning },
    ],
    [metrics]
  );

  const exportAssets = () => {
    const data = getAssetsExport();
    exportToCsv("assetflow-assets.csv", [
      ["Asset ID", "Name", "Category", "Status", "Department", "Owner", "Health", "Value"],
      ...data.map((a) => [a.assetId, a.name, a.category, a.status, a.department, a.owner, a.health, a.value]),
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Utilization, costs and operational trends across the fleet."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportAssets}>
              <FileSpreadsheet className="size-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToJson("assetflow-metrics.json", metrics)}>
              <FileText className="size-4" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <Button size="sm">
              <Download className="size-4" /> Export PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Asset Utilization Trend" subtitle="Bookings vs allocations" className="lg:col-span-2">
          {metrics ? <UtilizationArea data={metrics.monthlyBookings} /> : <Skeleton className="h-[280px]" />}
        </ChartCard>
        <ChartCard title="Assets by Category">
          {metrics ? <CategoryBars data={categoryData} /> : <Skeleton className="h-[280px]" />}
        </ChartCard>
        <ChartCard title="Fleet Status">
          {metrics ? <StatusDonut data={statusDonut} /> : <Skeleton className="h-[240px]" />}
        </ChartCard>
        <ChartCard title="Department Utilization" className="lg:col-span-2">
          {metrics ? <DepartmentBars data={metrics.departmentRanking} /> : <Skeleton className="h-[300px]" />}
        </ChartCard>
      </div>

      <PredictiveSection />
    </div>
  );
}

function PredictiveSection() {
  const { data: metrics } = useDashboardMetrics();
  const atRisk = metrics ? metrics.healthDistribution.find((h) => h.range === "0-49")?.count ?? 0 : 0;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <InsightCard
        icon={Activity}
        title="Most used assets"
        desc="Conference Room A, Tesla Model Y, Dell Latitude 7440"
        tone="success"
      />
      <InsightCard
        icon={TrendingDown}
        title="Idle assets (180+ days)"
        desc="Capital tied up in unused inventory — reallocate or retire."
        tone="warning"
        metric={`${metrics?.healthDistribution[3]?.count ?? 0} idle`}
      />
      <InsightCard
        icon={TrendingDown}
        title="At-risk assets"
        desc="Health below 50 — schedule preventive maintenance."
        tone="destructive"
        metric={`${atRisk} at risk`}
      />
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  desc,
  tone,
  metric,
}: {
  icon: typeof Activity;
  title: string;
  desc: string;
  tone: "success" | "warning" | "destructive";
  metric?: string;
}) {
  const toneCls =
    tone === "success" ? "text-success bg-success/10" : tone === "warning" ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10";
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${toneCls}`}>
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{title}</p>
            {metric && <Badge variant="outline" className="text-[10px]">{metric}</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </Card>
  );
}
