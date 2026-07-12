import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Boxes, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/avatar";
import { StatusBadge, ConditionBadge } from "@/components/common/badges";
import { useAssets } from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { ASSET_STATUS_META, ASSET_CATEGORY_META } from "@/constants";
import { QrCode as QrIcon } from "lucide-react";
import type { Asset } from "@/types";
import { formatCurrency } from "@/lib/format";
import { AssetDetailDrawer } from "./asset-detail";
import { AssetFormDialog } from "./asset-form";

const STATUS_OPTIONS = Object.entries(ASSET_STATUS_META);
const CATEGORY_OPTIONS = Object.entries(ASSET_CATEGORY_META);

export function AssetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useAssets({
    search,
    status: status === "all" ? undefined : status,
    category: category === "all" ? undefined : category,
    page,
    pageSize: 12,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        accessorKey: "assetId",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground">
              {row.original.name.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.assetId} · {row.original.serialNumber}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <span className="text-sm">{ASSET_CATEGORY_META[row.original.category].label}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "condition",
        header: "Condition",
        cell: ({ row }) => <ConditionBadge condition={row.original.condition} />,
      },
      {
        accessorKey: "departmentId",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {lookup.departmentName(row.original.departmentId)}
          </span>
        ),
      },
      {
        accessorKey: "ownerId",
        header: "Owner",
        cell: ({ row }) => {
          const owner = lookup.user(row.original.ownerId);
          return owner ? (
            <div className="flex items-center gap-2">
              <UserAvatar name={owner.name} size="sm" />
              <span className="text-sm">{owner.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          );
        },
      },
      {
        accessorKey: "healthScore",
        header: "Health",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.original.healthScore}%`,
                  background:
                    row.original.healthScore > 70 ? "hsl(var(--success))" : row.original.healthScore > 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{row.original.healthScore}</span>
          </div>
        ),
      },
      {
        accessorKey: "purchasePrice",
        header: "Value",
        cell: ({ row }) => <span className="text-sm tabular-nums">{formatCurrency(row.original.purchasePrice)}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description={`${data?.total ?? 0} assets under management across all departments.`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Register asset
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, ID or serial…"
            className="pl-9"
          />
          <Boxes className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <Filter className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map(([v, m]) => (
                <SelectItem key={v} value={v}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_OPTIONS.map(([v, m]) => (
                <SelectItem key={v} value={v}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total}
        page={page}
        pageSize={12}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(row) => setSelected(row)}
        empty={
          <EmptyState
            icon={QrIcon}
            title="No assets found"
            description="Try adjusting filters or register a new asset to get started."
            action={<Button onClick={() => setFormOpen(true)}><Plus className="size-4" /> Register asset</Button>}
            className="m-4 min-h-[200px]"
          />
        }
      />

      <AssetDetailDrawer asset={selected} onClose={() => setSelected(null)} />
      <AssetFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
