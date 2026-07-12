import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types";
import { canAccessRoute } from "@/lib/role-access";
import {
  LayoutDashboard,
  Boxes,
  Users,
  Building2,
  ArrowLeftRight,
  CalendarCheck,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Settings,
  Sparkles,
  MapPin,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  group: "main" | "operations" | "insights";
}

export const NAV_GROUPS: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: "main",
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard, group: "main" },
      { label: "AI Copilot", to: "/copilot", icon: Sparkles, group: "main" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Assets", to: "/assets", icon: Boxes, group: "operations" },
      { label: "Employees", to: "/employees", icon: Users, group: "operations" },
      { label: "Departments", to: "/departments", icon: Building2, group: "operations" },
      { label: "Locations", to: "/locations", icon: MapPin, group: "operations" },
      { label: "Allocations", to: "/allocations", icon: ArrowLeftRight, group: "operations" },
      { label: "Bookings", to: "/bookings", icon: CalendarCheck, group: "operations" },
      { label: "Maintenance", to: "/maintenance", icon: Wrench, group: "operations" },
      { label: "Audits", to: "/audits", icon: ClipboardCheck, group: "operations" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { label: "Reports", to: "/reports", icon: BarChart3, group: "insights" },
      { label: "Settings", to: "/settings", icon: Settings, group: "insights" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function navGroupsForRole(role: Role) {
  return NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => item.to === "/" || canAccessRoute(role, item.to)) })).filter((group) => group.items.length > 0);
}
