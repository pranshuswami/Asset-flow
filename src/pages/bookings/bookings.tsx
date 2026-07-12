import { useMemo, useState } from "react";
import { CalendarCheck, Plus, Video, Car, Projector, Boxes } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingBadge } from "@/components/common/badges";
import { useBookings, useCreateBooking } from "@/hooks/queries";
import { useLookups } from "@/hooks/use-lookups";
import { bookingSchema, type BookingInput } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/types";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18
const RESOURCE_ICON = { ROOM: Video, VEHICLE: Car, PROJECTOR: Projector, EQUIPMENT: Boxes } as const;

function weekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function BookingsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data } = useBookings();
  const days = useMemo(weekDays, []);
  const bookings = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Bookings"
        description="Meeting rooms, vehicles, projectors and equipment — overlap-free."
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Book resource</Button>}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-secondary/30 text-center">
          <div />
          {days.map((d) => (
            <div key={d.toISOString()} className={cn("border-l border-border py-2", isToday(d) && "bg-primary/10")}>
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p className={cn("text-sm font-semibold", isToday(d) && "text-primary")}>{d.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-r border-border">
            {HOURS.map((h) => (
              <div key={h} className="flex h-16 items-start justify-end pr-1.5 pt-1 text-[10px] text-muted-foreground">
                {h}:00
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="relative border-l border-border">
              {HOURS.map((h) => (
                <div key={h} className="h-16 border-b border-border/60 last:border-0" />
              ))}
              {bookings
                .filter((b) => isSameDay(new Date(b.start), day))
                .map((b) => (
                  <BookingBlock key={b.id} booking={b} />
                ))}
            </div>
          ))}
        </div>
      </div>

      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function BookingBlock({ booking }: { booking: Booking }) {
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const startH = start.getHours() + start.getMinutes() / 60;
  const duration = (end.getTime() - start.getTime()) / 36e5;
  const top = (startH - 8) * 64;
  const height = Math.max(duration * 64 - 4, 28);
  const Icon = RESOURCE_ICON[booking.resourceType];
  const cancelled = booking.status === "CANCELLED";

  return (
    <div
      className={cn(
        "absolute left-1 right-1 overflow-hidden rounded-lg border p-1.5 text-xs shadow-sm transition-transform hover:scale-[1.02]",
        cancelled ? "border-border bg-secondary/40 text-muted-foreground" : "border-primary/30 bg-primary/10 text-primary"
      )}
      style={{ top, height }}
      title={`${booking.title} · ${booking.resourceName}`}
    >
      <div className="flex items-center gap-1 font-medium">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{booking.title}</span>
      </div>
      {height > 40 && <p className="truncate text-[10px] opacity-80">{booking.resourceName}</p>}
    </div>
  );
}

function BookingFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { users } = useLookups();
  const create = useCreateBooking();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { resourceType: "ROOM", recurring: false },
  });

  const onSubmit = async (data: BookingInput) => {
    try {
      await create.mutateAsync(data);
      toast.success("Booking confirmed", { description: "No scheduling conflicts." });
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" /> Book a resource
          </DialogTitle>
          <DialogDescription>We'll prevent overlapping reservations automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Resource type *</Label>
              <Select value={watch("resourceType")} onValueChange={(v) => setValue("resourceType", v as BookingInput["resourceType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROOM">Meeting Room</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle</SelectItem>
                  <SelectItem value="PROJECTOR">Projector</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resource ID *</Label>
              <Input placeholder="R-A" {...register("resourceId")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input placeholder="Sprint Planning" {...register("title")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start *</Label>
              <Input type="datetime-local" {...register("start")} />
            </div>
            <div className="space-y-1.5">
              <Label>End *</Label>
              <Input type="datetime-local" {...register("end")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Booked by *</Label>
              <Select value={watch("userId")} onValueChange={(v) => setValue("userId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {users.slice(0, 50).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex h-9 items-center gap-2 text-sm">
                <input type="checkbox" {...register("recurring")} className="size-4 rounded border-border" />
                Recurring booking
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={create.isPending}>Confirm booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isToday(d: Date) {
  return isSameDay(d, new Date());
}
