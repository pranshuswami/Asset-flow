import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { NotificationsProvider } from "@/context/notifications-context";
import { CommandProvider } from "@/context/command-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProtectedRoute, PublicOnly, RoleRoute } from "@/components/route-guard";
import { AppShell } from "@/components/layout/app-shell";

import { LoginPage } from "@/pages/auth/login";
import { SignupPage } from "@/pages/auth/Signup";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { AssetsPage } from "@/pages/assets/assets";
import { NewAssetPage } from "@/pages/assets/new-asset";
import { EmployeesPage } from "@/pages/employees/employees";
import { DepartmentsPage } from "@/pages/departments/departments";
import { LocationsPage } from "@/pages/locations/locations";
import { AllocationsPage } from "@/pages/allocations/allocations";
import { BookingsPage } from "@/pages/bookings/bookings";
import { MaintenancePage } from "@/pages/maintenance/maintenance";
import { AuditsPage } from "@/pages/audits/audits";
import { ReportsPage } from "@/pages/reports/reports";
import { SettingsPage } from "@/pages/settings/settings";
import { NotificationsPage } from "@/pages/notifications/notifications";
import { CopilotPage } from "@/pages/copilot/copilot";
import { RoleDashboardPage } from "@/pages/dashboard/role-dashboard";
import { useAuth } from "@/context/auth-context";
import { ROLE_DASHBOARD } from "@/lib/role-access";

function RoleDashboardRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to={ROLE_DASHBOARD[user.role]} replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <CommandProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public auth routes */}
                    <Route
                      path="/login"
                      element={
                        <PublicOnly>
                          <LoginPage />
                        </PublicOnly>
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <PublicOnly>
                          <SignupPage />
                        </PublicOnly>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <PublicOnly>
                          <ForgotPasswordPage />
                        </PublicOnly>
                      }
                    />

                    {/* Protected app */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppShell />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/" element={<RoleDashboardRedirect />} />
                      <Route path="/admin" element={<RoleRoute roles={["ADMIN"]}><DashboardPage /></RoleRoute>} />
                      <Route path="/asset-manager" element={<RoleRoute roles={["ASSET_MANAGER"]}><RoleDashboardPage role="ASSET_MANAGER" /></RoleRoute>} />
                      <Route path="/department-head" element={<RoleRoute roles={["DEPARTMENT_HEAD"]}><RoleDashboardPage role="DEPARTMENT_HEAD" /></RoleRoute>} />
                      <Route path="/employee" element={<RoleRoute roles={["EMPLOYEE"]}><RoleDashboardPage role="EMPLOYEE" /></RoleRoute>} />
                      <Route path="/copilot" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><CopilotPage /></RoleRoute>} />
                      <Route path="/assets" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]}><AssetsPage /></RoleRoute>} />
                      <Route path="/assets/new" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER"]}><NewAssetPage /></RoleRoute>} />
                      <Route path="/employees" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><EmployeesPage /></RoleRoute>} />
                      <Route path="/departments" element={<RoleRoute roles={["ADMIN", "DEPARTMENT_HEAD"]}><DepartmentsPage /></RoleRoute>} />
                      <Route path="/locations" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER"]}><LocationsPage /></RoleRoute>} />
                      <Route path="/allocations" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><AllocationsPage /></RoleRoute>} />
                      <Route path="/bookings" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]}><BookingsPage /></RoleRoute>} />
                      <Route path="/maintenance" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER"]}><MaintenancePage /></RoleRoute>} />
                      <Route path="/audits" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER"]}><AuditsPage /></RoleRoute>} />
                      <Route path="/reports" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}><ReportsPage /></RoleRoute>} />
                      <Route path="/settings" element={<RoleRoute roles={["ADMIN"]}><SettingsPage /></RoleRoute>} />
                      <Route path="/notifications" element={<RoleRoute roles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]}><NotificationsPage /></RoleRoute>} />
                    </Route>

                    <Route path="*" element={<div className="p-10 text-center text-sm text-muted-foreground">Page not found.</div>} />
                  </Routes>
                </BrowserRouter>
              </CommandProvider>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
