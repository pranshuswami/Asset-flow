import { db } from "@/data/db";
import { request } from "@/services/http";
import type { DashboardMetrics } from "@/types";

export const dashboardService = {
  async metrics(): Promise<DashboardMetrics> {
    return request(() => {
      const assets = db.assets;
      const total = assets.length;
      const byStatus = (s: string) => assets.filter((a) => a.status === s).length;
      const available = byStatus("AVAILABLE");
      const allocated = byStatus("ALLOCATED");
      const maintenance = byStatus("MAINTENANCE");

      const categoryBreakdown = Object.keys(
        assets.reduce<Record<string, number>>((acc, a) => {
          acc[a.category] = (acc[a.category] ?? 0) + 1;
          return acc;
        }, {})
      ).map((category) => ({ category: category as DashboardMetrics["categoryBreakdown"][number]["category"], count: assets.filter((a) => a.category === category).length }));

      const departmentRanking = db.departments
        .map((d) => {
          const deptAssets = assets.filter((a) => a.departmentId === d.id);
          const avgUtil = deptAssets.length
            ? Math.round(deptAssets.reduce((s, a) => s + a.utilization, 0) / deptAssets.length)
            : 0;
          return { departmentId: d.id, name: d.name, utilization: avgUtil, assets: deptAssets.length };
        })
        .sort((a, b) => b.utilization - a.utilization);

      const monthlyBookings = Array.from({ length: 8 }, (_, i) => {
        const month = new Date(Date.now() - (7 - i) * 30 * 864e5).toLocaleString("en-US", { month: "short" });
        return {
          month,
          bookings: db.bookings.filter((b) => Math.abs(+new Date(b.start) - +new Date(Date.now() - (7 - i) * 30 * 864e5)) < 30 * 864e5).length + Math.floor(20 + i * 3),
          allocations: db.allocations.filter((a) => Math.abs(+new Date(a.requestedAt) - +new Date(Date.now() - (7 - i) * 30 * 864e5)) < 30 * 864e5).length + Math.floor(12 + i * 2),
        };
      });

      const healthDistribution = [
        { range: "90-100", count: assets.filter((a) => a.healthScore >= 90).length },
        { range: "70-89", count: assets.filter((a) => a.healthScore >= 70 && a.healthScore < 90).length },
        { range: "50-69", count: assets.filter((a) => a.healthScore >= 50 && a.healthScore < 70).length },
        { range: "0-49", count: assets.filter((a) => a.healthScore < 50).length },
      ];

      const utilization = Math.round((allocated / Math.max(1, total)) * 100);
      const utilizationTrend = Array.from({ length: 14 }, (_, i) => 40 + Math.round(30 * Math.sin(i / 2) + i));

      return {
        totalAssets: total,
        available,
        allocated,
        maintenance,
        bookings: db.bookings.filter((b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN").length,
        transfers: db.allocations.filter((a) => a.status === "TRANSFERRED").length,
        utilization,
        utilizationDelta: 4.2,
        utilizationTrend,
        categoryBreakdown,
        departmentRanking,
        monthlyBookings,
        healthDistribution,
      };
    });
  },

  async activity(): Promise<typeof db.activity> {
    return request(() => db.activity.slice(0, 12), { delay: false });
  },

  async insights() {
    return request(() => db.insights, { delay: false });
  },
};
