import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandMenu } from "@/components/command/command-menu";
import { AICopilot } from "@/components/ai-copilot";
import { Toaster } from "@/components/ui/toaster";

export function AppShell() {
  const { pathname } = useLocation();
  const isDashboard = pathname === "/";

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <main><Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>}><Outlet /></Suspense></main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandMenu />
      <AICopilot />
      <Toaster />
    </div>
  );
}
