import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Users, UserPlus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, Kbd } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/queries";
import { lookup } from "@/hooks/use-lookups";
import { useLookups } from "@/hooks/use-lookups";
import { ROLES } from "@/constants";
import { useCommand } from "@/context/command-context";
import { useLookups } from "@/hooks/use-lookups";
import { relativeTime } from "@/lib/format";
import type { User } from "@/types";

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [dept, setDept] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEmployees({
    search,
    role: role === "all" ? undefined : role,
    departmentId: dept === "all" ? undefined : dept,
    page,
    pageSize: 12,
  });
  const { departments } = useLookups();
  const { setOpen } = useCommand();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={row.original.name} src={row.original.avatar} />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
      },
      {
        accessorKey: "departmentId",
        header: "Department",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{lookup.departmentName(row.original.departmentId)}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
            {ROLES.find((r) => r.value === row.original.role)?.label}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "ACTIVE" ? "success" : "warning"}>{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: "lastActive",
        header: "Last active",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{relativeTime(row.original.lastActive)}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="People across your organization and their asset footprint."
        actions={<Button><UserPlus className="size-4" /> Invite</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search people…" className="pl-9" />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
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
        empty={
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Try a different search or invite a teammate."
            action={<Button variant="outline" onClick={() => setOpen(true)}>Quick search <Kbd>⌘K</Kbd></Button>}
            className="m-4 min-h-[200px]"
          />
        }
      />
    </div>
  );
}
