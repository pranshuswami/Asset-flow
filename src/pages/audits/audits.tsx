import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Plus, Play, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { AuditBadge } from "@/components/common/badges";
import { useAudits, useAudit, useVerifyAuditItem, useStartAudit, useCloseAudit, useCreateAudit } from "@/hooks/queries";
import { useLookups } from "@/hooks/use-lookups";
import { lookup } from "@/hooks/use-lookups";
import { relativeTime } from "@/lib/format";
import type { Audit } from "@/types";

export function AuditsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useAudits({ pageSize: 50 });

  const columns = useMemo<ColumnDef<Audit>[]>(
    () => [
      { accessorKey: "title", header: "Audit", cell: ({ row }) => <p className="font-medium">{row.original.title}</p> },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AuditBadge status={row.original.status} />,
      },
      {
        accessorKey: "departmentIds",
        header: "Departments",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.departmentIds.map((d) => (
              <Badge key={d} variant="muted">{lookup.departmentName(d)}</Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "assetIds",
        header: "Assets",
        cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.assetIds.length}</span>,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.progress} className="w-24" />
            <span className="text-xs text-muted-foreground">{row.original.progress}%</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedId(row.original.id)}>
            <Search className="size-3.5" /> Open
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        description="Physical counts and verification workflows with discrepancy reports."
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> New audit</Button>}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total}
        loading={isLoading}
        onRowClick={(row) => setSelectedId(row.id)}
        empty={
          <EmptyState
            icon={ClipboardCheck}
            title="No audits yet"
            description="Run a physical count to reconcile your inventory."
            action={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> New audit</Button>}
            className="m-4 min-h-[200px]"
          />
        }
      />

      <AuditDetail id={selectedId} onClose={() => setSelectedId(null)} />
      <NewAuditDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function AuditDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: audit } = useAudit(id ?? undefined);
  const verify = useVerifyAuditItem();
  const start = useStartAudit();
  const close = useCloseAudit();
  if (!id || !audit) return null;

  const missing = audit.items.filter((i) => i.status === "MISSING").length;
  const damaged = audit.items.filter((i) => i.status === "DAMAGED").length;

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{audit.title}</SheetTitle>
          <div className="flex items-center gap-2 pt-1">
            <AuditBadge status={audit.status} />
            <span className="text-xs text-muted-foreground">Created {relativeTime(audit.createdAt)}</span>
          </div>
        </SheetHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="flex-1">
              <Progress value={audit.progress} />
            </div>
            <span className="text-sm font-semibold tabular-nums">{audit.progress}%</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {audit.status === "DRAFT" && (
              <Button size="sm" onClick={async () => { await start.mutateAsync(audit.id); toast.success("Audit started"); }}>
                <Play className="size-3.5" /> Start audit
              </Button>
            )}
            <Badge variant="warning">{missing} missing</Badge>
            <Badge variant="destructive">{damaged} damaged</Badge>
            {audit.status !== "CLOSED" && audit.status !== "DRAFT" && (
              <Button size="sm" variant="outline" onClick={async () => { await close.mutateAsync(audit.id); toast.success("Audit closed"); }}>
                <CheckCircle2 className="size-3.5" /> Close audit
              </Button>
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {audit.items.length} assets to verify
          </p>

          <div className="scrollbar-thin max-h-[50vh] space-y-2 overflow-y-auto">
            {audit.items.map((item) => {
              const asset = lookup.asset(item.assetId);
              return (
                <div key={item.assetId} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{asset?.name ?? item.assetId}</p>
                      <p className="text-xs text-muted-foreground">{asset?.assetId}</p>
                    </div>
                    <Badge
                      variant={
                        item.status === "VERIFIED" ? "success" : item.status === "MISSING" ? "destructive" : item.status === "DAMAGED" ? "warning" : "muted"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.status === "PENDING" ? (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => verify.mutateAsync({ id: audit.id, assetId: item.assetId, status: "VERIFIED" })}>
                        Verify
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => verify.mutateAsync({ id: audit.id, assetId: item.assetId, status: "MISSING" })}>
                        Missing
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => verify.mutateAsync({ id: audit.id, assetId: item.assetId, status: "DAMAGED" })}>
                        Damaged
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">by {item.verifiedBy}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NewAuditDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { departments, users } = useLookups();
  const create = useCreateAudit();
  const [title, setTitle] = useState("");
  const [auditorIds, setAuditorIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

  const submit = async () => {
    if (!title || auditorIds.length === 0 || departmentIds.length === 0) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      await create.mutateAsync({ title, auditorIds, departmentIds });
      toast.success("Audit created");
      setTitle(""); setAuditorIds([]); setDepartmentIds([]);
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-4 text-primary" /> New audit
          </DialogTitle>
          <DialogDescription>Assets in the selected departments are queued for verification.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Q3 Physical Count" />
          </div>
          <div className="space-y-1.5">
            <Label>Auditors</Label>
            <div className="flex flex-wrap gap-1.5">
              {users.slice(0, 12).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setAuditorIds((p) => (p.includes(u.id) ? p.filter((x) => x !== u.id) : [...p, u.id]))}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${auditorIds.includes(u.id) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Departments</Label>
            <div className="flex flex-wrap gap-1.5">
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepartmentIds((p) => (p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id]))}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${departmentIds.includes(d.id) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create audit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
