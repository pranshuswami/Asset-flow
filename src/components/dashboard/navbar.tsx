import { Bell, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  return <header className="flex h-[77px] items-center justify-between border-b border-border bg-card px-3 sm:px-6"><p className="text-[28px] font-bold tracking-tight text-foreground">AssetFlow AI</p><div className="flex items-center gap-3 sm:gap-5"><button aria-label="Search" className="text-foreground transition hover:text-primary"><Search className="size-6" /></button><button aria-label="Notifications" className="relative text-foreground transition hover:text-primary"><Bell className="size-5" /><span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary" /></button><ThemeToggle /><UserAvatar name="Olivia Rhye" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" size="sm" className="ring-1 ring-border" /></div></header>;
}
