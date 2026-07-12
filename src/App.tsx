import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { NotificationsProvider } from "@/context/notifications-context";
import { CommandProvider } from "@/context/command-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProtectedRoute, PublicOnly } from "@/components/route-guard";
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
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/copilot" element={<CopilotPage />} />
                      <Route path="/assets" element={<AssetsPage />} />
                      <Route path="/assets/new" element={<NewAssetPage />} />
                      <Route path="/employees" element={<EmployeesPage />} />
                      <Route path="/departments" element={<DepartmentsPage />} />
                      <Route path="/locations" element={<LocationsPage />} />
                      <Route path="/allocations" element={<AllocationsPage />} />
                      <Route path="/bookings" element={<BookingsPage />} />
                      <Route path="/maintenance" element={<MaintenancePage />} />
                      <Route path="/audits" element={<AuditsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
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
