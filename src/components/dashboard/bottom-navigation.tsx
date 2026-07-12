import { BarChart3, CalendarDays, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
const items = [{ to: "/", label: "Home", icon: Home }, { to: "/bookings", label: "Book", icon: CalendarDays }, { to: "/reports", label: "Reports", icon: BarChart3 }];
export function BottomNavigation() { return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-10 py-3 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-around">{items.map((item) => <NavLink key={item.label} to={item.to} className={({ isActive }) => cn("flex min-w-20 flex-col items-center gap-1 text-sm font-semibold transition", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}><item.icon className="size-6" /><span>{item.label}</span></NavLink>)}</div></nav>; }
