"use client";
import Sidebar from "@/components/Sidebar";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Database,
  Settings,
  Zap
} from "lucide-react";
import EventTrigger from "@/components/EventTrigger";
import DebatePanel, { DebateData } from "@/components/DebatePanel";
import DebateHistory from "@/components/DebateHistory";
import { supabase } from "@/lib/auth";
import { completeStep } from "@/lib/steps";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function DebatesPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [debates, setDebates] = useState<any[]>([]);
  const [activeDebate, setActiveDebate] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchDebates = async () => {
    if (!startupId) return;
    try {
      const res = await fetch(`${API_URL}/api/debates/${startupId}`);
      if (res.ok) {
        const data = await res.json();
        setDebates(data);
        if (data.length > 0 && !activeDebate && !loading) {
          setActiveDebate(data[0]);
          setSelectedId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDebates();
  }, [startupId]);

  const handleTrigger = async (event: string, type: string) => {
    if (!startupId) return;
    setLoading(true);
    setActiveDebate(null);
    setSelectedId(null);
    try {
      const res = await fetch(`${API_URL}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId, event, event_type: type }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDebate(data);
        setSelectedId(data.id);
        fetchDebates(); // Refresh history
        
        if (debates.length === 0) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await completeStep(startupId, "debate", session.access_token);
          }
        }
      } else {
        console.error("Debate failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (id: string) => {
    const d = debates.find((d) => d.id === id);
    if (d) {
      setActiveDebate(d);
      setSelectedId(id);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeRoute="debates" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Zap size={20} className="text-zinc-400" />
            Agent Debate Engine
          </h1>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Column */}
          <div className="w-[380px] flex flex-col gap-6">
            <div className="h-1/2 min-h-[300px]">
              <EventTrigger startupId={startupId || ""} onTrigger={handleTrigger} disabled={loading || !startupId} />
            </div>
            <div className="flex-1 min-h-[250px]">
              <DebateHistory debates={debates} onSelect={handleSelectHistory} selectedId={selectedId} />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden flex flex-col relative">
            <DebatePanel debate={activeDebate} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}

import { AuthGuard } from "@/components/AuthGuard";

export default function DebatesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>}>
        <DebatesPageContent />
      </Suspense>
    </AuthGuard>
  );
}
