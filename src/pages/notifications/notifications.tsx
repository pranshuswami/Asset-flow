import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CircleAlert, Sparkles, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useNotifications } from "@/context/notifications-context";
import { NOTIFICATION_META } from "@/constants";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";

export function NotificationsPage() {
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unread} unread · real-time updates via Socket.io`}
        actions={
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="Notifications will appear here in real time." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-secondary/40",
                !n.read && "bg-primary/5"
              )}
              onClick={() => markRead(n.id)}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                  n.type === "OVERDUE_RETURN" || n.type === "INSIGHT"
                    ? "bg-warning/15 text-warning"
                    : n.type === "ASSET_RETURNED"
                    ? "bg-success/15 text-success"
                    : "bg-primary/15 text-primary"
                )}
              >
                {n.type === "OVERDUE_RETURN" ? <CircleAlert className="size-5" /> : n.type === "INSIGHT" ? <Sparkles className="size-5" /> : <Bell className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {NOTIFICATION_META[n.type].label} · {relativeTime(n.createdAt)}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); navigate(n.href ?? "/"); }}>
                <ArrowRight className="size-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
