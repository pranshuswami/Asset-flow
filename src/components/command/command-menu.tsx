import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  Search,
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
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCommand } from "@/context/command-context";
import { useGlobalSearch } from "@/hooks/queries";
import { useTheme } from "@/context/theme-context";
import { ALL_NAV_ITEMS } from "@/components/layout/nav-config";
import { Kbd } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

const ICONS: Record<string, typeof Boxes> = {
  "/": LayoutDashboard,
  "/copilot": Sparkles,
  "/assets": Boxes,
  "/employees": Users,
  "/departments": Building2,
  "/locations": Building2,
  "/allocations": ArrowLeftRight,
  "/bookings": CalendarCheck,
  "/maintenance": Wrench,
  "/audits": ClipboardCheck,
  "/reports": BarChart3,
  "/settings": Settings,
};

export function CommandMenu() {
  const { open, setOpen } = useCommand();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useStateSafe("");
  const { data: results = [] } = useGlobalSearch(search);

  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent hideClose className="max-w-[640px] gap-0 overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search assets, people, bookings or type a command…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Kbd>ESC</Kbd>
          </div>
          <Command.List className="scrollbar-thin max-h-[420px] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {search.length <= 1 && (
              <Command.Group heading="Navigation">
                {ALL_NAV_ITEMS.map((item) => {
                  const Icon = ICONS[item.to] ?? Boxes;
                  return (
                    <Command.Item key={item.to} onSelect={() => go(item.to)} className={itemCls}>
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">Go</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {search.length > 1 && results.length > 0 && (
              <Command.Group heading="Results">
                {results.map((r) => (
                  <Command.Item key={`${r.type}-${r.id}`} onSelect={() => go(r.href)} className={itemCls}>
                    <span className="flex size-4 items-center justify-center rounded bg-secondary text-[9px] font-semibold uppercase text-muted-foreground">
                      {r.type[0]}
                    </span>
                    <span className="truncate font-medium">{r.title}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">{r.subtitle}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Actions">
              <Command.Item onSelect={() => go("/assets/new")} className={itemCls}>
                <Plus className="size-4 text-muted-foreground" /> Register new asset
              </Command.Item>
              <Command.Item onSelect={() => go("/allocations")} className={itemCls}>
                <ArrowLeftRight className="size-4 text-muted-foreground" /> New allocation
              </Command.Item>
              <Command.Item onSelect={() => go("/bookings")} className={itemCls}>
                <CalendarCheck className="size-4 text-muted-foreground" /> Book a resource
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  toggle();
                }}
                className={itemCls}
              >
                {theme === "dark" ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
                Toggle {theme === "dark" ? "light" : "dark"} mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function useStateSafe(initial: string) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (!open) setValue("");
  }, [open]);
  return [value, setValue] as const;
}

const itemCls = cn(
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground outline-none",
  "data-[selected=true]:bg-secondary data-[selected=true]:text-foreground"
);
