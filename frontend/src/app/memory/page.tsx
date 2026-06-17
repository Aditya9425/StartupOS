"use client";
import Sidebar from "@/components/Sidebar";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Database,
  Settings,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Hash
} from "lucide-react";
import MemoryPanel from "@/components/MemoryPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function MemoryPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [stats, setStats] = useState({
    total: 0,
    mostCommonType: "—",
    bestDecision: null as any,
    worstDecision: null as any
  });

  useEffect(() => {
    if (startupId) {
      fetchMemoriesForStats();
    }
  }, [startupId]);

  const fetchMemoriesForStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/memory/${startupId}`);
      if (res.ok) {
        const memories = await res.json();
        
        let best = null;
        let worst = null;
        let maxImpact = -Infinity;
        let minImpact = Infinity;
        
        const typeCounts: Record<string, number> = {};

        memories.forEach((mem: any) => {
          // Count types
          const type = mem.metadata?.event_type || "unknown";
          typeCounts[type] = (typeCounts[type] || 0) + 1;

          // Check impact
          if (mem.metadata?.impact) {
            const impact = mem.metadata.impact;
            // simple heuristic: score = (revenue / 100) + (users)
            // fallback: just sum the values
            let score = 0;
            if (impact.revenue) score += impact.revenue / 100;
            if (impact.users) score += impact.users;
            if (impact.market_share) score += impact.market_share * 10;
            
            if (score > maxImpact) {
              maxImpact = score;
              best = mem;
            }
            if (score < minImpact) {
              minImpact = score;
              worst = mem;
            }
          }
        });

        let mostCommon = "—";
        if (Object.keys(typeCounts).length > 0) {
          mostCommon = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
          mostCommon = mostCommon.replace(/_/g, " ");
        }

        setStats({
          total: memories.length,
          mostCommonType: mostCommon,
          bestDecision: best,
          worstDecision: worst
        });
      }
    } catch (e) {
      console.error("Failed to fetch memory stats", e);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeRoute="memory" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Database size={20} className="text-zinc-400" />
            Agent Memory
          </h1>
          <span className="text-xs text-zinc-400 font-medium px-2.5 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            Vector Similarity Enabled
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">What your startup has learned</h2>
              <p className="text-zinc-400 text-sm">
                Agents autonomously remember past decisions and use cosine similarity to retrieve relevant experiences during future debates.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Memories" value={stats.total.toString()} icon={<Hash size={16} />} color="text-zinc-400" />
              <StatCard title="Common Event" value={<span className="capitalize">{stats.mostCommonType}</span>} icon={<Activity size={16} />} color="text-blue-400" />
              <StatCard 
                title="Best Decision" 
                value={stats.bestDecision ? "Positive Impact" : "—"} 
                subtext={stats.bestDecision ? "Highest metric gain" : ""}
                icon={<TrendingUp size={16} />} 
                color="text-emerald-400" 
              />
              <StatCard 
                title="Worst Decision" 
                value={stats.worstDecision ? "Negative Impact" : "—"} 
                subtext={stats.worstDecision ? "Highest metric loss" : ""}
                icon={<TrendingDown size={16} />} 
                color="text-rose-400" 
              />
            </div>

            {/* Memory Panel */}
            <div className="pt-4">
              {startupId ? (
                <MemoryPanel startupId={startupId} />
              ) : (
                <div className="text-center py-12 text-zinc-500">Please select a startup first.</div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtext, icon, color }: any) {
  return (
    <div className="p-5 border border-zinc-800 bg-zinc-900/30 rounded-xl flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-sm text-zinc-400 font-medium">{title}</span>
      </div>
      <span className="text-xl font-semibold">{value}</span>
      {subtext && <span className="text-xs text-zinc-500 mt-1">{subtext}</span>}
    </div>
  );
}

import { AuthGuard } from "@/components/AuthGuard";

export default function MemoryPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>}>
        <MemoryPageContent />
      </Suspense>
    </AuthGuard>
  );
}
