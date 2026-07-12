import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import type { Role } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/role-access";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  return <>{children}</>;
}
