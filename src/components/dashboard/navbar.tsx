import { Bell, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";

export function Navbar() {
  return <header className="flex h-[77px] items-center justify-between border-b border-white/10 bg-[#111] px-3 sm:px-6"><p className="text-[28px] font-bold tracking-tight text-white">AssetFlow AI</p><div className="flex items-center gap-6"><button aria-label="Search" className="text-white transition hover:text-blue-400"><Search className="size-6" /></button><button aria-label="Notifications" className="relative text-white transition hover:text-blue-400"><Bell className="size-5" /><span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-blue-500" /></button><UserAvatar name="Olivia Rhye" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" size="sm" className="ring-1 ring-white/15" /></div></header>;
}
