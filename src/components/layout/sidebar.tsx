import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NAV_GROUPS, navGroupsForRole } from "@/components/layout/nav-config";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sparkles } from "lucide-react";
<<<<<<< HEAD
=======
import { useAuth } from "@/context/auth-context";
>>>>>>> 848cfaa12294c55480bb0e94e3c323af31033fec

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const collapsed = useMediaQuery("(max-width: 1100px)");
  const location = useLocation();
  const { user } = useAuth();
  const groups = user ? navGroupsForRole(user.role) : NAV_GROUPS;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar/60 backdrop-blur-xl md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <Brand collapsed={collapsed} />

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItemLink
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.to, location.pathname)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

function isActive(to: string, path: string) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(to + "/");
}

function NavItemLink({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: (typeof NAV_GROUPS)[number]["items"][number];
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-sidebar-muted hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 -z-10 rounded-lg bg-secondary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <item.icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
        <svg viewBox="0 0 32 32" className="size-5" fill="none">
          <path d="M9 21V11l7 5 7-5v10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">AssetFlow</p>
          <p className="text-[10px] font-medium text-muted-foreground">AI Operations</p>
        </div>
      )}
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-t border-border p-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-3",
          collapsed && "justify-center"
        )}
      >
        <div className="size-8 shrink-0 rounded-lg bg-primary/20 p-1.5 text-primary">
          <Sparkles className="size-5" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-xs font-semibold">AI Insights active</p>
            <p className="text-[10px] text-muted-foreground">5 signals today</p>
          </div>
        )}
      </div>
    </div>
  );
}
