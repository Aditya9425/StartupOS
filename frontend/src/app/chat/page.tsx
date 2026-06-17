"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AgentChat from "@/components/AgentChat";
import { MessageSquare, Target, RefreshCw, BarChart2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [startup, setStartup] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggerMsg, setTriggerMsg] = useState("");

  useEffect(() => {
    const fetchStartup = async () => {
      if (!startupId) {
        setLoading(false);
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/startup/${startupId}`);
        if (res.ok) {
          const data = await res.json();
          setStartup(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [startupId]);

  if (!startupId) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeRoute="chat" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No startup selected</h2>
            <p className="text-[#666666]">Please select a startup from the dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeRoute="chat" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-12 h-12 rounded-xl bg-zinc-800" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar activeRoute="chat" />

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-6 h-full overflow-hidden">
        
        {/* Left Panel - 30% */}
        <div className="hidden md:flex md:w-[30%] flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Chat with Agents</h1>
            <p className="text-[#666666] text-sm">
              Your AI team has full context of your idea and blueprints. Ask them anything to drill deeper.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
              Quick Actions
            </div>
            
            <button onClick={() => setTriggerMsg(`Who are ${startup?.name || 'my'}'s biggest competitors?`)} className="flex items-center gap-3 p-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-white/20 transition-colors text-left group">
              <Target size={18} className="text-[#666666] group-hover:text-white transition-colors" />
              <div className="flex-1 text-sm font-medium">Ask about competitors</div>
            </button>
            
            <button onClick={() => setTriggerMsg(`What's the right price for ${startup?.target_audience || 'my target audience'}?`)} className="flex items-center gap-3 p-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-white/20 transition-colors text-left group">
              <BarChart2 size={18} className="text-[#666666] group-hover:text-white transition-colors" />
              <div className="flex-1 text-sm font-medium">Help me with pricing</div>
            </button>
            
            <button onClick={() => setTriggerMsg(`Should ${startup?.name || 'I'} pivot?`)} className="flex items-center gap-3 p-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-white/20 transition-colors text-left group">
              <RefreshCw size={18} className="text-[#666666] group-hover:text-white transition-colors" />
              <div className="flex-1 text-sm font-medium">Should I pivot?</div>
            </button>
            
            <button onClick={() => setTriggerMsg(`Can you review ${startup?.name || 'my'}'s progress so far?`)} className="flex items-center gap-3 p-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-white/20 transition-colors text-left group">
              <MessageSquare size={18} className="text-[#666666] group-hover:text-white transition-colors" />
              <div className="flex-1 text-sm font-medium">Review my progress</div>
            </button>
          </div>
        </div>

        {/* Right Panel - 70% */}
        <div className="w-full md:w-[70%] h-full">
          <AgentChat 
            startupId={startupId} 
            startupName={startup?.name as string} 
            targetAudience={startup?.target_audience as string}
            triggerMsg={triggerMsg}
            onTriggerProcessed={() => setTriggerMsg("")}
          />
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <ChatPageContent />
      </Suspense>
    </AuthGuard>
  );
}
