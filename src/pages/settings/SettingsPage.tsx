import { useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Grid2X2,
  Home,
  KeyRound,
  LockKeyhole,
  Settings as SettingsIcon,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type NotificationKey = "maintenance" | "bookings" | "critical";

const tabs = ["General", "Notifications", "Security", "Preferences", "Integrations"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    maintenance: true,
    bookings: true,
    critical: false,
  });

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="flex h-10 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-3">
        <div className="flex items-center gap-2 text-base font-bold">
          <Grid2X2 size={16} />
          <span>AssetFlow AI</span>
        </div>

        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px]">
          A
        </div>
      </header>

      <main className="mx-auto max-w-md px-3 py-5">
        <section className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="mt-1 max-w-xs text-xs leading-4 text-zinc-400">
            Manage your profile, security, and global preferences.
          </p>
        </section>

        <nav className="mb-7 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition ${
                activeTab === tab
                  ? "border-l-2 border-white bg-zinc-800 font-semibold text-white"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="space-y-7">
          <SectionTitle title="Profile" />

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-zinc-600 bg-zinc-800">
              <img
                src="https://i.pravatar.cc/160?img=47"
                alt="Alex Chen"
                className="h-full w-full object-cover grayscale"
              />
            </div>

            <div>
              <button className="rounded bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200">
                Change Avatar
              </button>
              <p className="mt-1 text-[9px] text-zinc-400">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Full Name" defaultValue="Alex Chen" />
            <Field label="Email Address" defaultValue="alex.chen@assetflow.ai" type="email" />
          </div>

          <SectionTitle title="Notifications" />

          <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
            <NotificationRow
              icon={<Wrench size={17} />}
              title="Maintenance Alerts"
              description="Get notified when assets require scheduled maintenance."
              enabled={notifications.maintenance}
              onChange={() =>
                setNotifications((current) => ({
                  ...current,
                  maintenance: !current.maintenance,
                }))
              }
            />
            <NotificationRow
              icon={<CalendarDays size={17} />}
              title="New Bookings"
              description="Instant alerts for new asset reservations and check-outs."
              enabled={notifications.bookings}
              onChange={() =>
                setNotifications((current) => ({
                  ...current,
                  bookings: !current.bookings,
                }))
              }
            />
            <NotificationRow
              icon={<ShieldCheck size={17} />}
              title="Critical Status Updates"
              description="Real-time alerts for asset failures or security incidents."
              enabled={notifications.critical}
              onChange={() =>
                setNotifications((current) => ({
                  ...current,
                  critical: !current.critical,
                }))
              }
              last
            />
          </div>

          <SectionTitle title="Security" />

          <div className="space-y-3">
            <SecurityCard
              icon={<LockKeyhole size={18} />}
              title="Password"
              detail="Last changed 4 months ago"
              action="Update"
            />
            <SecurityCard
              icon={<KeyRound size={18} />}
              title="Two-Factor Authentication"
              detail="Currently Enabled"
              action="Configure"
              success
            />
          </div>

          <SectionTitle title="System Preferences" />

          <div className="space-y-5">
            <SelectField
              label="Language"
              options={["English (US)", "English (UK)", "German", "Japanese"]}
            />
            <SelectField
              label="Unit System"
              options={["Metric (Celsius, kg, m)", "Imperial (Fahrenheit, lb, ft)"]}
            />
            <SelectField
              label="Date Format"
              options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
            />
            <SelectField
              label="Timezone"
              options={["(GMT-08:00) Pacific Time", "(GMT+00:00) UTC", "(GMT+05:30) India"]}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
            <button className="rounded border border-zinc-700 px-4 py-1.5 text-xs font-semibold hover:bg-zinc-900">
              Discard Changes
            </button>
            <button
              onClick={saveSettings}
              className={`rounded px-5 py-1.5 text-xs font-semibold transition ${
                saved ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {saved ? "Settings Saved!" : "Save Changes"}
            </button>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-zinc-800 pb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-medium text-zinc-400">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
      />
    </label>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-medium text-zinc-400">{label}</span>
      <div className="relative">
        <select className="w-full appearance-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-zinc-500">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>
    </label>
  );
}

function NotificationRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 ${!last ? "border-b border-zinc-800" : ""}`}>
      <div className="text-zinc-300">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-0.5 text-[9px] leading-3 text-zinc-400">{description}</p>
      </div>

      <button
        type="button"
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        onClick={onChange}
        className={`relative h-4 w-7 rounded-full transition ${
          enabled ? "bg-white" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full transition ${
            enabled ? "left-3.5 bg-zinc-900" : "left-0.5 bg-zinc-400"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityCard({
  icon,
  title,
  detail,
  action,
  success = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  action: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-zinc-900 p-3">
      <div className="rounded bg-zinc-800 p-2 text-white">{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-3">{title}</p>
        <p className={`text-[9px] ${success ? "font-semibold text-emerald-400" : "text-zinc-400"}`}>
          {detail}
        </p>
      </div>

      <button className="text-xs font-semibold hover:text-zinc-300">{action}</button>
    </div>
  );
}

function BottomNavigation() {
  const items = [
    { label: "Home", icon: <Home size={17} /> },
    { label: "Book", icon: <CalendarDays size={17} /> },
    { label: "Reports", icon: <BarChart3 size={17} /> },
    { label: "Settings", icon: <SettingsIcon size={17} />, active: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 flex h-16 w-full items-center justify-around border-t border-zinc-900 bg-zinc-950">
      {items.map((item) => (
        <button
          key={item.label}
          className={`flex flex-col items-center gap-1 text-[9px] ${
            item.active ? "font-bold text-white" : "text-zinc-400"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}