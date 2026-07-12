import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { AssetCard, type DashboardAsset } from "@/components/dashboard/asset-card";
import { BottomNavigation } from "@/components/dashboard/bottom-navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { RecentActivity } from "@/components/dashboard/recent-activity";

const assets: DashboardAsset[] = [
  { id: "AF-20394", name: "Robot Assembly Arm", category: "Manufacturing · Line 02", image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=85", status: "Optimal" },
  { id: "AF-99321", name: "Deep Learning Node", category: "Compute infrastructure · Rack 04B", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85", status: "Check up" },
  { id: "AF-88721", name: "EV Transit 04", category: "Fleet operations · North depot", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85", status: "Active" },
];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground transition-colors">
      <Navbar />
      <main className="mx-auto max-w-[1900px] px-3 py-5 sm:px-6 md:py-7">
        <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.65fr)_minmax(600px,1.35fr)]">
          <AIInsightCard />
          <RecentActivity />
        </div>

        <section className="mt-10">
          <h2 className="text-3xl font-semibold tracking-tight">High-Value Assets</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
}
