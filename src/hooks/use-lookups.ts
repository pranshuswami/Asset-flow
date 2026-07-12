import { useMemo } from "react";
import { useDepartments, useEmployees } from "@/hooks/queries";
import { db } from "@/data/db";

// Lightweight synchronous lookups against the in-memory store (demo mode).
export const lookup = {
  user: (id?: string) => db.users.find((u) => u.id === id),
  userName: (id?: string) => db.users.find((u) => u.id === id)?.name ?? "Unassigned",
  departmentName: (id?: string) => db.departments.find((d) => d.id === id)?.name ?? "—",
  department: (id?: string) => db.departments.find((d) => d.id === id),
  location: (id?: string) => db.locations.find((l) => l.id === id),
  asset: (id?: string) => db.assets.find((a) => a.id === id),
};

// Reactive lookups for forms (role assignments, department pickers, etc.)
export function useLookups() {
  const { data: departments = [] } = useDepartments();
  const { data: employees } = useEmployees({ pageSize: 500 });
  const users = employees?.data ?? db.users;
  return useMemo(
    () => ({
      departments,
      users,
      departmentName: (id?: string) => departments.find((d) => d.id === id)?.name ?? "—",
      userName: (id?: string) => users.find((u) => u.id === id)?.name ?? "Unassigned",
      user: (id?: string) => users.find((u) => u.id === id),
    }),
    [departments, users]
  );
}
