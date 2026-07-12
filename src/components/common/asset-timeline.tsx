import { motion } from "framer-motion";
import { Boxes, PackageCheck, RefreshCw, Wrench, Search, Trash2, Shuffle, Pencil } from "lucide-react";
import type { AssetTimelineEvent, ActivityType } from "@/types";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";

const ICONS: Record<ActivityType, typeof Boxes> = {
  CREATED: Boxes,
  ALLOCATED: PackageCheck,
  TRANSFERRED: Shuffle,
  MAINTENANCE_REQUESTED: Wrench,
  MAINTENANCE_COMPLETED: Wrench,
  AUDITED: Search,
  RETURNED: RefreshCw,
  DISPOSED: Trash2,
  RESERVED: PackageCheck,
  UPDATED: Pencil,
};

export function AssetTimeline({ events }: { events: AssetTimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <ol className="relative space-y-5 pl-2">
      {sorted.map((event, i) => {
        const Icon = ICONS[event.type];
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative flex gap-4"
          >
            {i !== sorted.length - 1 && (
              <span className="absolute left-[18px] top-9 h-[calc(100%+4px)] w-px bg-border" />
            )}
            <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-primary">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                <span className="text-[10px] text-muted-foreground">{relativeTime(event.createdAt)}</span>
              </div>
              {event.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.description}</p>
              )}
              <p className="mt-0.5 text-[11px] text-muted-foreground">by {event.actor}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function TimelineDot({ type, className }: { type: ActivityType; className?: string }) {
  const Icon = ICONS[type];
  return (
    <span className={cn("flex size-9 items-center justify-center rounded-full border border-border bg-secondary text-primary", className)}>
      <Icon className="size-4" />
    </span>
  );
}
