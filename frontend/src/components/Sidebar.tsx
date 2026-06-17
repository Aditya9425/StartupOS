"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, MessageSquare, Activity, Database, Settings, MessageCircle, TrendingUp, Presentation, LayoutGrid, LogOut } from "lucide-react";
import ThreatLevelWidget from "./ThreatLevelWidget";
import { supabase } from "@/lib/auth";

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-2 my-0.5 cursor-pointer transition-all duration-150 ${
          active 
            ? "bg-zinc-900 text-white font-medium border-l-2 border-white" 
            : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border-l-2 border-transparent"
        }`}
      >
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

export default function Sidebar({ activeRoute }: { activeRoute: string }) {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || null);
      }
    }).catch(err => {
      console.warn("Failed to fetch user in sidebar:", err);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const buildUrl = (path: string) => {
    return startupId ? `${path}?id=${startupId}` : path;
  };

  return (
    <aside className="w-[220px] bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex shrink-0 z-50 h-screen">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-zinc-700 flex items-center justify-center font-bold text-xs bg-zinc-800 text-white">
            S
          </div>
          <span className="font-semibold text-white tracking-tight">StartupOS</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavItem href="/my-startups" icon={<LayoutGrid size={20} />} label="My Startups" active={activeRoute === "my-startups"} />
        <div className="h-px bg-zinc-800 my-2" />
        <NavItem href={buildUrl("/dashboard")} icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeRoute === "dashboard"} />
        <NavItem href={buildUrl("/agents")} icon={<Users size={20} />} label="Agents" active={activeRoute === "agents"} />
        <NavItem href={buildUrl("/competitors")} icon={<TrendingUp size={20} />} label="Competitors" active={activeRoute === "competitors"} />
        <NavItem href={buildUrl("/pitchdeck")} icon={<Presentation size={20} />} label="Pitch Deck" active={activeRoute === "pitchdeck"} />
        <NavItem href={buildUrl("/chat")} icon={<MessageCircle size={20} />} label="Chat" active={activeRoute === "chat"} />
        <NavItem href={buildUrl("/debates")} icon={<MessageSquare size={20} />} label="Debates" active={activeRoute === "debates"} />
        <NavItem href={buildUrl("/memory")} icon={<Database size={20} />} label="Memory" active={activeRoute === "memory"} />
      </nav>

      <ThreatLevelWidget startupId={startupId} />

      {/* Bottom Settings and User Profile */}
      <div className="p-4 border-t border-zinc-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0 font-mono">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "U"}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono truncate">{userEmail || "user@startup.io"}</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
