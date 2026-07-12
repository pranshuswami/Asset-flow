import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Wrench, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceBadge, PriorityBadge } from "@/components/common/badges";
import { useMaintenance, useAssets, useCreateMaintenance } from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { MAINTENANCE_PRIORITY_META, MAINTENANCE_STATUS_META } from "@/constants";
import { maintenanceSchema, type MaintenanceInput } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency, relativeTime } from "@/lib/format";
import type { MaintenanceRequest } from "@/types";

export function MaintenancePage() {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useMaintenance({
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    page,
    pageSize: 12,
  });
  const resolve = useResolveMaintenance();

  const columns = useMemo<ColumnDef<MaintenanceRequest>[]>(
    () => [
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => {
          const asset = lookup.asset(row.original.assetId);
          return (
            <div>
              <p className="font-medium">{row.original.assetName}</p>
              <p className="text-xs text-muted-foreground">{asset?.assetId}</p>
            </div>
          );
        },
      },
      { accessorKey: "issue", header: "Issue", cell: ({ row }) => <span className="text-sm">{row.original.issue}</span> },
      { accessorKey: "priority", header: "Priority", cell: ({ row }) => <PriorityBadge priority={row.original.priority} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <MaintenanceBadge status={row.original.status} /> },
      { accessorKey: "raisedBy", header: "Raised by", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.raisedBy}</span> },
      { accessorKey: "cost", header: "Cost", cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.cost ? formatCurrency(row.original.cost) : "—"}</span> },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-xs text-muted-foreground">{relativeTime(row.original.createdAt)}</span> },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status !== "RESOLVED" && row.original.status !== "REJECTED" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await resolve.mutateAsync({ id: row.original.id });
                toast.success("Marked resolved — asset set Available");
              }}
            >
              <CheckCircle2 className="size-3.5" /> Resolve
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Closed</span>
          ),
      },
    ],
    [resolve]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Raise, approve and track repair workflows."
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Raise request</Button>}
      />

      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(MAINTENANCE_STATUS_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {Object.entries(MAINTENANCE_PRIORITY_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total}
        page={page}
        pageSize={12}
        onPageChange={setPage}
        loading={isLoading}
        empty={
          <EmptyState
            icon={Wrench}
            title="No maintenance requests"
            description="All assets healthy. Raise a request if something breaks."
            action={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Raise request</Button>}
            className="m-4 min-h-[200px]"
          />
        }
      />

      <MaintenanceFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function MaintenanceFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: assets } = useAssets({ pageSize: 500 });
  const create = useCreateMaintenance();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MaintenanceInput>({ resolver: zodResolver(maintenanceSchema), defaultValues: { priority: "MEDIUM" } });

  const onSubmit = async (data: MaintenanceInput) => {
    try {
      await create.mutateAsync(data);
      toast.success("Maintenance request raised", { description: "Asset status set to Maintenance." });
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
            <Wrench className="size-4 text-primary" /> Raise maintenance request
          </DialogTitle>
          <DialogDescription>The asset status switches to Maintenance automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select value={watch("assetId")} onValueChange={(v) => setValue("assetId", v)}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {(assets?.data ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.name} · {a.assetId}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority *</Label>
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v as MaintenanceInput["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_PRIORITY_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Technician</Label>
              <Input placeholder="Assign later" {...register("technician")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Issue description *</Label>
            <Textarea placeholder="Describe the problem…" {...register("issue")} />
            {errors.issue && <p className="text-xs text-destructive">{errors.issue.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
