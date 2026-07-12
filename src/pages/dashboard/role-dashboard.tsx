import { Boxes, CalendarDays, ClipboardCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

const dashboardCopy: Record<Exclude<Role, "ADMIN">, { title: string; description: string; links: { to: string; label: string; icon: typeof Boxes }[] }> = {
  ASSET_MANAGER: { title: "Asset Manager Dashboard", description: "Manage the asset lifecycle, maintenance, allocations, and audits.", links: [{ to: "/assets", label: "Manage assets", icon: Boxes }, { to: "/maintenance", label: "Maintenance", icon: ClipboardCheck }, { to: "/allocations", label: "Allocations", icon: Users }] },
  DEPARTMENT_HEAD: { title: "Department Dashboard", description: "Review your team, department assets, and resource requests.", links: [{ to: "/employees", label: "Team members", icon: Users }, { to: "/assets", label: "Department assets", icon: Boxes }, { to: "/reports", label: "Department reports", icon: ClipboardCheck }] },
  EMPLOYEE: { title: "My Workspace", description: "Access your assigned assets and book the resources you need.", links: [{ to: "/assets", label: "My assets", icon: Boxes }, { to: "/bookings", label: "Book a resource", icon: CalendarDays }] },
};

export function RoleDashboardPage({ role }: { role: Exclude<Role, "ADMIN"> }) {
  const content = dashboardCopy[role];
  return <div className="space-y-6"><PageHeader title={content.title} description={content.description} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{content.links.map((item) => { const Icon = item.icon; return <Card key={item.to} className="transition hover:-translate-y-0.5 hover:border-primary/40"><CardHeader><Icon className="size-5 text-primary" /><CardTitle className="pt-4">{item.label}</CardTitle></CardHeader><CardContent><Button variant="outline" asChild><Link to={item.to}>Open</Link></Button></CardContent></Card>; })}</div></div>;
}
