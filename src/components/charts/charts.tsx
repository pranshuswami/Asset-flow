import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/theme-context";

const C = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  accent: "hsl(var(--accent-foreground))",
  muted: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--border))",
};

const SERIES = [C.primary, C.success, C.warning, C.destructive, C.accent, "#06b6d4", "#ec4899", "#8b5cf6"];

function useTooltipStyle() {
  const { theme } = useTheme();
  return {
    contentStyle: {
      background: theme === "dark" ? "hsl(240 9% 8%)" : "#fff",
      border: "1px solid hsl(var(--border))",
      borderRadius: 12,
      fontSize: 12,
      boxShadow: "0 8px 30px -8px rgba(0,0,0,0.4)",
    },
    labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
    cursor: { fill: "hsl(var(--secondary))", opacity: 0.5 },
  };
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function UtilizationArea({ data }: { data: { month: string; bookings: number; allocations: number }[] }) {
  const tip = useTooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="g-primary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity={0.4} />
            <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="g-success" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.success} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.muted }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.muted }} />
        <Tooltip {...tip} />
        <Area type="monotone" dataKey="bookings" stroke={C.primary} strokeWidth={2} fill="url(#g-primary)" />
        <Area type="monotone" dataKey="allocations" stroke={C.success} strokeWidth={2} fill="url(#g-success)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ data }: { data: { category: string; count: number }[] }) {
  const tip = useTooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -16, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
        <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: C.muted }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.muted }} />
        <Tooltip {...tip} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const tip = useTooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3} stroke="none">
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip {...tip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DepartmentBars({ data }: { data: { name: string; utilization: number; assets: number }[] }) {
  const tip = useTooltipStyle();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data} margin={{ left: 8, right: 16 }} barCategoryGap={10}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: C.muted }} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={90} tick={{ fontSize: 11, fill: C.muted }} />
        <Tooltip {...tip} formatter={(v: number) => [`${v}%`, "Utilization"]} />
        <Bar dataKey="utilization" radius={[0, 6, 6, 0]} maxBarSize={22} fill={C.primary} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HealthRadial({ score }: { score: number }) {
  const tip = useTooltipStyle();
  const color = score >= 80 ? C.success : score >= 50 ? C.warning : C.destructive;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart
        innerRadius="72%"
        outerRadius="100%"
        data={[{ name: "Health", value: score, fill: color }]}
        startAngle={220}
        endAngle={-40}
      >
        <RadialBar dataKey="value" cornerRadius={20} background={{ fill: C.grid }} />
        <Tooltip {...tip} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
