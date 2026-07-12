import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Cloud,
  Database,
  ExternalLink,
  Filter,
  Maximize2,
  Network,
  ShieldAlert,
  TriangleAlert,
  X,
} from "lucide-react";

type AlertLevel = "critical" | "warning" | "info";

type AlertItem = {
  id: number;
  level: AlertLevel;
  title: string;
  time: string;
  description: string;
  actionable?: boolean;
};

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    level: "critical",
    title: "Unauthorized Access Attempt",
    time: "14:20:05",
    description:
      "System detected multiple failed login attempts on Node 09-US-EAST. IP: 192.168.1.104 blocked.",
    actionable: true,
  },
  {
    id: 2,
    level: "warning",
    title: "High CPU Utilization",
    time: "14:18:22",
    description:
      "Database cluster 04-EU reporting 88% CPU load. Autoscale sequence initiated.",
  },
  {
    id: 3,
    level: "info",
    title: "Backup Successful",
    time: "14:15:00",
    description: "Snapshot ID 992-KLD completed in 4.2 seconds. Storage verified.",
  },
  {
    id: 4,
    level: "warning",
    title: "Latency Spike",
    time: "14:12:45",
    description: "API-Gateway latency exceeded 200ms threshold for 30s.",
  },
];

const statusColor: Record<AlertLevel, string> = {
  critical: "bg-red-500 shadow-[0_0_8px_#ef4444]",
  warning: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
  info: "bg-blue-500 shadow-[0_0_8px_#0070f3]",
};

export function ReportsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [bars, setBars] = useState([82, 73, 25, 39, 67, 55, 45]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBars((current) => current.map(() => Math.floor(Math.random() * 70) + 20));
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const dismissAlert = (id: number) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
      <section className="flex h-11 overflow-hidden rounded-lg border border-border bg-card">
        <div className="z-10 flex shrink-0 items-center gap-2 border-r border-border bg-muted/60 px-3 text-xs font-medium uppercase tracking-wide">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          System Heartbeat
        </div>

        <div className="flex items-center gap-8 overflow-hidden whitespace-nowrap px-5 text-xs text-muted-foreground">
          <span>
            US-EAST-1: <b className="text-emerald-400">99.98%</b>
          </span>
          <span>
            EU-CENTRAL: <b className="text-emerald-400">100%</b>
          </span>
          <span>
            DB LATENCY: <b className="text-amber-400">14ms</b>
          </span>
          <span>
            AI THROUGHPUT: <b className="text-foreground">1.2k req/s</b>
          </span>
          <span>
            MEM LOAD: <b className="text-muted-foreground">42%</b>
          </span>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-border bg-card xl:col-span-8">
          <PanelHeader title="Network Topology">
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Maximize2 size={14} />
              Expand View
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Filter size={14} />
              Filter
            </button>
          </PanelHeader>

          <div className="relative h-[350px] overflow-hidden bg-[radial-gradient(#252525_1px,transparent_1px)] [background-size:20px_20px] sm:h-[430px]">
            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60 sm:h-80 sm:w-80" />
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/80 sm:h-48 sm:w-48" />

            <svg className="absolute inset-0 h-full w-full opacity-50">
              <line
                x1="50%"
                y1="50%"
                x2="30%"
                y2="23%"
                stroke="currentColor"
                strokeDasharray="5 5"
                className="text-zinc-500"
              />
              <line
                x1="50%"
                y1="50%"
                x2="72%"
                y2="70%"
                stroke="currentColor"
                strokeDasharray="5 5"
                className="text-zinc-500"
              />
              <line x1="50%" y1="50%" x2="78%" y2="45%" stroke="#ef4444" />
            </svg>

            <TopologyNode
              className="left-1/2 top-1/2"
              label="CORE NETWORK"
              icon={<Network size={22} />}
              primary
            />
            <TopologyNode
              className="left-[30%] top-[23%]"
              label="AWS-CLUSTER-01"
              icon={<Cloud size={18} className="text-blue-500" />}
            />
            <TopologyNode
              className="bottom-[25%] right-[25%]"
              label="DB-SHARD-ALPHA"
              icon={<Database size={18} className="text-emerald-500" />}
            />
            <TopologyNode
              className="right-[18%] top-[42%]"
              label="NODE-FAILED-09"
              icon={<TriangleAlert size={18} className="text-red-500" />}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>Active Nodes: 124</span>
            <span>Latency Avg: 18ms</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card xl:col-span-4">
          <PanelHeader title="Live Alert Feed">
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
              {alerts.filter((alert) => alert.level === "critical").length} CRITICAL
            </span>
          </PanelHeader>

          <div>
            {alerts.length ? (
              alerts.map((alert) => (
                <article key={alert.id} className="border-b border-border p-4 last:border-b-0">
                  <div className="flex gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusColor[alert.level]}`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <h3 className="flex-1 text-sm font-medium">{alert.title}</h3>
                        <time className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {alert.time}
                        </time>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{alert.description}</p>

                      {alert.actionable && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="rounded bg-foreground px-2 py-1 text-[10px] font-bold text-background hover:opacity-90"
                          >
                            ISOLATE
                          </button>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="rounded border border-border px-2 py-1 text-[10px] font-bold hover:bg-muted"
                          >
                            DISMISS
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                <ShieldAlert size={24} />
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </div>

          <button className="flex w-full items-center justify-center gap-2 border-t border-border py-4 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
            View Audit Log <ExternalLink size={13} />
          </button>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">Throughput (Req/min)</h3>

          <div className="mt-6 flex h-32 items-end gap-1">
            {bars.map((height, index) => (
              <div
                key={index}
                style={{ height: `${height}%` }}
                className="flex-1 rounded-t bg-blue-500/25 transition-all duration-500 hover:bg-blue-500"
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-xs font-medium uppercase text-muted-foreground">AI Inference Latency</h3>

          <div className="mt-12 flex items-end justify-between">
            <Metric value="12ms" label="P99" />
            <Metric value="8ms" label="P50" color="text-emerald-400" />
            <Metric value="24ms" label="MAX" />
          </div>
        </div>

        <div className="relative min-h-52 overflow-hidden rounded-xl border border-border bg-card p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_55%)] opacity-70" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-border/80" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-600/60" />
          <div className="absolute left-[34%] top-[35%] h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#0070f3]" />
          <div className="absolute right-[31%] top-[54%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />

          <div className="relative flex h-full flex-col justify-between">
            <h3 className="text-xs font-medium uppercase text-muted-foreground">Global Traffic Distribution</h3>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>North America</span>
                <span>42%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[42%] rounded-full bg-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 sm:px-5">
      <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function TopologyNode({
  className,
  label,
  icon,
  primary = false,
}: {
  className: string;
  label: string;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <div className={`group absolute ${className} -translate-x-1/2 -translate-y-1/2`}>
      <div
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition group-hover:scale-110 ${
          primary
            ? "h-12 w-12 rounded-lg border-white bg-white text-black shadow-white/20"
            : "border-zinc-700 bg-zinc-900"
        }`}
      >
        {icon}
      </div>
      <span className="pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 whitespace-nowrap rounded border border-border bg-background px-2 py-1 text-[9px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function Metric({ value, label, color = "text-foreground" }: { value: string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}