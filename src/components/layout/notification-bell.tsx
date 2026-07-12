import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CircleAlert, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/empty-state";
import { useNotifications } from "@/context/notifications-context";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { NOTIFICATION_META } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {unread} new
              </span>
            )}
          </div>
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        </div>
        <div className="scrollbar-thin max-h-[420px] overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.href) {
                  setOpen(false);
                }
              }}
              className={cn(
                "flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-secondary/50",
                !n.read && "bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  n.type === "OVERDUE_RETURN" || n.type === "INSIGHT"
                    ? "bg-warning/15 text-warning"
                    : "bg-primary/15 text-primary"
                )}
              >
                {n.type === "OVERDUE_RETURN" ? <CircleAlert className="size-4" /> : <Bell className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {NOTIFICATION_META[n.type].label} · {relativeTime(n.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-secondary"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UnreadPing() {
  const { unread } = useNotifications();
  return (
    <AnimatePresence>
      {unread > 0 && user && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1 inline-flex items-center"
        >
          <Kbd>{unread}</Kbd>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
