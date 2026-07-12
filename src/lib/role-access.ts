import type { Role } from "@/types";

export const ROLE_DASHBOARD: Record<Role, string> = {
  ADMIN: "/admin",
  ASSET_MANAGER: "/asset-manager",
  DEPARTMENT_HEAD: "/department-head",
  EMPLOYEE: "/employee",
};

const allRoles: Role[] = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"];

/** Central route policy used by route guards and navigation. */
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/admin": ["ADMIN"],
  "/asset-manager": ["ASSET_MANAGER"],
  "/department-head": ["DEPARTMENT_HEAD"],
  "/employee": ["EMPLOYEE"],
  "/copilot": ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  "/assets": allRoles,
  "/assets/new": ["ADMIN", "ASSET_MANAGER"],
  "/employees": ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  "/departments": ["ADMIN", "DEPARTMENT_HEAD"],
  "/locations": ["ADMIN", "ASSET_MANAGER"],
  "/allocations": ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  "/bookings": allRoles,
  "/maintenance": ["ADMIN", "ASSET_MANAGER"],
  "/audits": ["ADMIN", "ASSET_MANAGER"],
  "/reports": ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  "/settings": ["ADMIN"],
  "/notifications": allRoles,
};

export function canAccessRoute(role: Role, path: string): boolean {
  return role === "ADMIN" || (ROUTE_ACCESS[path] ?? []).includes(role);
}
