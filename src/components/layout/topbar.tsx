import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/empty-state";
import { useCommand } from "@/context/command-context";
import { useHotkey } from "@/hooks/use-hotkey";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Topbar() {
  const { toggle, setOpen } = useCommand();
  const [mobileOpen, setMobileOpen] = useState(false);

  useHotkey("mod+k", (e) => {
    e.preventDefault();
    toggle();
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <button
        onClick={() => setOpen(true)}
        className="group flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 md:max-w-md"
      >
        <Search className="size-4" />
        <span className="truncate">Search or jump to…</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <UserMenu />
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
