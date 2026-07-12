import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Building2, Bell, KeyRound, Shield, Palette, Check, Copy, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { profileSchema, type ProfileInput } from "@/schemas";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ROLES } from "@/constants";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, organization and workspace preferences." />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="profile"><User className="size-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="organization"><Building2 className="size-3.5" /> Organization</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-3.5" /> Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="api"><KeyRound className="size-3.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="size-3.5" /> Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="organization"><OrganizationTab /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="api"><ApiKeysTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, title: user?.title, phone: user?.phone },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
        <CardDescription>Update how you appear across AssetFlow.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(() => toast.success("Profile saved"))} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input {...register("title")} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email} disabled />
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function OrganizationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Workspace details and billing.</CardDescription>
      </CardHeader>
      <CardContent className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <Label>Organization name</Label>
          <Input defaultValue="AssetFlow Demo Inc." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Input value="Enterprise" disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Seats</Label>
            <Input value="Unlimited" disabled />
          </div>
        </div>
        <Button onClick={() => toast.success("Organization updated")}>Save</Button>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how AssetFlow looks to you.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(["dark", "light"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`relative overflow-hidden rounded-xl border p-4 text-left transition-colors ${theme === t ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-secondary/40"}`}
          >
            <div className={`h-16 rounded-lg ${t === "dark" ? "bg-gradient-to-br from-zinc-900 to-zinc-800" : "bg-gradient-to-br from-zinc-100 to-white border border-zinc-200"}`} />
            <p className="mt-2 flex items-center gap-1 text-sm font-medium capitalize">{t} {theme === t && <Check className="size-3.5 text-primary" />}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    assetAssigned: true,
    transferApproved: true,
    bookingReminder: true,
    maintenanceApproved: false,
    auditStarted: true,
    overdueReturn: true,
    emailDigest: false,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Control which events reach you in-app and by email.</CardDescription>
      </CardHeader>
      <CardContent className="max-w-lg divide-y divide-border">
        {Object.entries(prefs).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
              <p className="text-xs text-muted-foreground">Receive updates for {k.replace(/([A-Z])/g, " $1")}</p>
            </div>
            <Switch checked={v} onCheckedChange={() => toggle(k as keyof typeof prefs)} />
          </div>
        ))}
        <div className="pt-4">
          <Button onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeysTab() {
  const [keys] = useState([
    { id: "1", name: "Production", prefix: "af_live_8f2c", scopes: ["assets:read", "assets:write"], created: "2024-11-02" },
    { id: "2", name: "CI Pipeline", prefix: "af_test_3b9a", scopes: ["reports:read"], created: "2025-01-18" },
  ]);
  const [copied, setCopied] = useState(false);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Programmatic access to the AssetFlow API.</CardDescription>
        </div>
        <Button size="sm" onClick={() => toast.success("API key created")}><Plus className="size-3.5" /> New key</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{k.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">{k.prefix}••••••••</code>
                <button
                  onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {k.scopes.map((s) => <Badge key={s} variant="muted" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{k.created}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RolesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role management</CardTitle>
        <CardDescription>Access levels available in your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ROLES.map((r) => (
          <div key={r.value} className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
            </div>
            <Badge variant="secondary">{r.value}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
