import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  Download,
  FileText,
  MapPin,
  CalendarDays,
  ShieldCheck,
  HeartPulse,
  ShieldAlert,
  User2,
  Building2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, ConditionBadge } from "@/components/common/badges";
import { AssetTimeline } from "@/components/common/asset-timeline";
import { HealthRadial } from "@/components/charts/charts";
import { lookup } from "@/hooks/use-lookups";
import type { Asset } from "@/types";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";

export function AssetDetailDrawer({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  if (!asset) return null;
  const owner = lookup.user(asset.ownerId);
  const dept = lookup.department(asset.departmentId);
  const loc = lookup.location(asset.locationId);

  const qrPayload = JSON.stringify({
    id: asset.assetId,
    name: asset.name,
    serial: asset.serialNumber,
    status: asset.status,
    holder: owner?.name,
  });

  return (
    <Sheet open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-muted-foreground">
              {asset.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{asset.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {asset.assetId} · {asset.model}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={asset.status} />
                <ConditionBadge condition={asset.condition} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="qr">QR</TabsTrigger>
            </TabsList>
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="overview" className="mt-0 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Fact icon={User2} label="Current holder" value={owner?.name ?? "Unassigned"} sub={owner?.title} />
                <Fact icon={Building2} label="Department" value={dept?.name ?? "—"} sub={dept?.code} />
                <Fact icon={MapPin} label="Location" value={`${loc?.building ?? "—"}`} sub={`${loc?.floor} · ${loc?.room}`} />
                <Fact icon={CalendarDays} label="Purchased" value={formatDate(asset.purchaseDate)} sub={formatCurrency(asset.purchasePrice)} />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Asset Health</p>
                  <div className="relative mt-2">
                    <HealthRadial score={asset.healthScore} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{asset.healthScore}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <HealthRow icon={HeartPulse} label="Next service" value={asset.nextServiceDate ? formatDate(asset.nextServiceDate) : "—"} />
                  <HealthRow icon={ShieldAlert} label="Risk score" value={`${asset.riskScore}`} danger={asset.riskScore > 50} />
                  <HealthRow icon={ShieldCheck} label="Warranty" value={asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "—"} />
                  <HealthRow icon={CalendarDays} label="Utilization" value={`${asset.utilization}%`} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/allocations">Transfer</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/maintenance">Raise maintenance</a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTab("qr")}>
                    <Printer className="size-3.5" /> Print QR
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <AssetTimeline events={asset.timeline} />
            </TabsContent>

            <TabsContent value="docs" className="mt-0 space-y-2">
              {asset.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} KB</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <a href={doc.url} download>
                      <Download className="size-4" />
                    </a>
                  </Button>
                </div>
              ))}
              {asset.documents.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No documents attached.</p>
              )}
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <div className="flex flex-col items-center">
                <div id="qr-sticker" className="rounded-2xl border border-border bg-white p-6">
                  <div className="flex items-center gap-2 text-black">
                    <div className="flex size-7 items-center justify-center rounded-md bg-black text-white">
                      <svg viewBox="0 0 32 32" className="size-4" fill="none">
                        <path d="M9 21V11l7 5 7-5v10" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold">AssetFlow</span>
                  </div>
                  <div className="mt-3 bg-white p-2">
                    <QRCodeSVG value={qrPayload} size={200} />
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-black">{asset.assetId}</p>
                  <p className="text-center text-[10px] text-neutral-500">{asset.name}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    const w = window.open("", "_blank");
                    if (w) {
                      w.document.write(
                        `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0" onload="window.print()">${document.getElementById("qr-sticker")?.outerHTML}</body></html>`
                      );
                      w.document.close();
                    }
                  }}
                >
                  <Printer className="size-4" /> Print sticker
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Fact({ icon: Icon, label, value, sub }: { icon: typeof User2; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
      {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function HealthRow({ icon: Icon, label, value, danger }: { icon: typeof HeartPulse; label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
      <Icon className={cn("size-4", danger ? "text-destructive" : "text-muted-foreground")} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  );
}
