import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ArrowLeftRight, Plus, Send, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransferBadge, ConditionBadge } from "@/components/common/badges";
import {
  useAllocations,
  useAssets,
  useCreateAllocation,
  useTransferAllocation,
  useReturnAllocation,
} from "@/hooks/queries";
import { useLookups } from "@/hooks/use-lookups";
import { lookup } from "@/hooks/use-lookups";
import { ASSET_CONDITION_META, ASSET_STATUS_META, TRANSFER_STATUS_META } from "@/constants";
import { allocationSchema, type AllocationInput } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate, relativeTime } from "@/lib/format";
import type { Allocation } from "@/types";

export function AllocationsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useAllocations({ status: status === "all" ? undefined : status, page, pageSize: 12 });
  const transfer = useTransferAllocation();
  const ret = useReturnAllocation();

  const columns = useMemo<ColumnDef<Allocation>[]>(
    () => [
      {
        accessorKey: "assetId",
        header: "Asset",
        cell: ({ row }) => {
          const asset = lookup.asset(row.original.assetId);
          return (
            <div className="min-w-0">
              <p className="truncate font-medium">{asset?.name ?? row.original.assetId}</p>
              <p className="text-xs text-muted-foreground">{row.original.assetId}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "toUserId",
        header: "Recipient",
        cell: ({ row }) => {
          const u = lookup.user(row.original.toUserId);
          return u ? (
            <div className="flex items-center gap-2">
              <UserAvatar name={u.name} size="sm" />
              <span className="text-sm">{u.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "departmentId",
        header: "Department",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{lookup.departmentName(row.original.departmentId)}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <TransferBadge status={row.original.status} />,
      },
      {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => <ConditionBadge condition={row.original.condition} />,
      },
      {
        accessorKey: "requestedAt",
        header: "Requested",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{relativeTime(row.original.requestedAt)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <RowActions row={row.original} onTransfer={transfer.mutateAsync} onReturn={ret.mutateAsync} />,
      },
    ],
    [transfer, ret]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocations & Transfers"
        description="Track asset handovers through the approval workflow."
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> New allocation</Button>}
      />

      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All transfers</SelectItem>
            {Object.entries(TRANSFER_STATUS_META).map(([v, m]) => (
              <SelectItem key={v} value={v}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Double-allocation is blocked automatically.</p>
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
            icon={ArrowLeftRight}
            title="No allocations yet"
            description="Allocate an asset to a teammate to start tracking it."
            action={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> New allocation</Button>}
            className="m-4 min-h-[200px]"
          />
        }
      />

      <AllocationFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function RowActions({
  row,
  onTransfer,
  onReturn,
}: {
  row: Allocation;
  onTransfer: (id: string) => Promise<unknown>;
  onReturn: (id: string) => Promise<unknown>;
}) {
  if (row.status === "REQUESTED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await onTransfer(row.id);
          toast.success("Asset transferred");
        }}
      >
        <Send className="size-3.5" /> Transfer
      </Button>
    );
  }
  if (row.status === "APPROVED" || row.status === "TRANSFERRED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await onReturn(row.id);
          toast.success("Asset returned");
        }}
      >
        <Undo2 className="size-3.5" /> Return
      </Button>
    );
  }
  return <span className="text-xs text-muted-foreground">{formatDate(row.requestedAt)}</span>;
}

function AllocationFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { departments, users } = useLookups();
  const { data: assets } = useAssets({ pageSize: 500 });
  const create = useCreateAllocation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AllocationInput>({ resolver: zodResolver(allocationSchema), defaultValues: { condition: "GOOD" } });

  const onSubmit = async (data: AllocationInput) => {
    try {
      await create.mutateAsync(data);
      toast.success("Allocation requested", { description: "Conflict check passed." });
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const assetOptions = (assets?.data ?? []).filter((a) => a.status === "AVAILABLE" || a.status === "RESERVED");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="size-4 text-primary" /> Allocate asset
          </DialogTitle>
          <DialogDescription>Only available assets can be allocated — conflicts are blocked.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select value={watch("assetId")} onValueChange={(v) => setValue("assetId", v)}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {assetOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.assetId} ({ASSET_STATUS_META[a.status].label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assetId && <p className="text-xs text-destructive">{errors.assetId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Recipient *</Label>
              <Select value={watch("toUserId")} onValueChange={(v) => setValue("toUserId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {users.slice(0, 50).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={watch("departmentId")} onValueChange={(v) => setValue("departmentId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Condition *</Label>
              <Select value={watch("condition")} onValueChange={(v) => setValue("condition", v as AllocationInput["condition"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CONDITION_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Expected return</Label>
              <Input type="date" {...register("expectedReturn")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input placeholder="New hire onboarding…" {...register("reason")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={create.isPending}>Request allocation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
