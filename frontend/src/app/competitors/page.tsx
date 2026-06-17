"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CompetitorAnalysis from "@/components/CompetitorAnalysis";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/auth";
import { completeStep } from "@/lib/steps";

function CompetitorsPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!startupId) {
        setLoading(false);
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/competitor/${startupId}`);
        if (res.ok) {
          const result = await res.json();
          if (result) setData(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startupId]);

  const handleAnalyze = async () => {
    if (!startupId) return;
    setAnalyzing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/competitor/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId })
      });
      if (res.ok) {
        const result = await res.json();
        // Set a fresh created_at since it just completed
        setData({ ...result, created_at: new Date().toISOString() });
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await completeStep(startupId, "competitors", session.access_token);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!startupId) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeRoute="competitors" />
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
        <Sidebar activeRoute="competitors" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-12 h-12 rounded-xl bg-zinc-800" />
        </main>
      </div>
    );
  }

  const timeAgo = data?.created_at ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true }) : null;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar activeRoute="competitors" />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-[rgba(255,255,255,0.07)] px-8 flex items-center justify-between shrink-0 bg-[#0A0A0A]">
          <h1 className="font-semibold">Competitor Analysis</h1>
          {data && (
            <div className="flex items-center gap-4">
              {timeAgo && <span className="text-[#666666] text-xs">Last analyzed {timeAgo}</span>}
              <button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Re-analyze
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <CompetitorAnalysis 
              startupId={startupId} 
              data={data} 
              onAnalyze={handleAnalyze} 
              isAnalyzing={analyzing} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

import { AuthGuard } from "@/components/AuthGuard";

export default function CompetitorsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <CompetitorsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
