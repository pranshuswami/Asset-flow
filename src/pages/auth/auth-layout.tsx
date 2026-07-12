import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-sidebar/40 p-10 lg:flex">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 size-80 rounded-full bg-accent/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-2.5"
        >
          <div className="flex size-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <svg viewBox="0 0 32 32" className="size-6" fill="none">
              <path d="M9 21V11l7 5 7-5v10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">AssetFlow AI</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-balance">
            Enterprise asset intelligence, <span className="gradient-text">autonomous.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Manage thousands of assets, bookings, maintenance and audits — with AI copilot and predictive insights built in.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: Zap, title: "Real-time ops", desc: "Live allocations & notifications" },
              { icon: ShieldCheck, title: "Role-based", desc: "Granular permissions & SSO-ready" },
              { icon: BarChart3, title: "AI insights", desc: "Utilization & risk scoring" },
              { icon: Sparkles, title: "Copilot", desc: "Natural language commands" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card/50 p-3 backdrop-blur">
                <f.icon className="size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} AssetFlow AI · Trusted by modern teams</p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
