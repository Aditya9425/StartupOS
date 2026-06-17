"use client";

import { useState, useEffect } from "react";
import { Search, Brain, Zap, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Users, Activity } from "lucide-react";

interface Memory {
  id: string;
  content: string;
  memory_type: string;
  metadata: any;
  created_at: string;
  similarity?: number;
}

export default function MemoryPanel({ startupId }: { startupId: string }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchMemories();
  }, [startupId]);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/memory/${startupId}`);
      if (res.ok) {
        setMemories(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMemories();
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/memory/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId, query: searchQuery }),
      });
      if (res.ok) {
        setMemories(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "decision": return <Brain size={14} className="text-zinc-300" />;
      case "outcome": return <CheckCircle2 size={14} className="text-zinc-300" />;
      case "event": return <AlertCircle size={14} className="text-zinc-300" />;
      default: return <Zap size={14} className="text-zinc-300" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "decision": return "bg-zinc-900 text-zinc-300 border-zinc-700";
      case "outcome": return "bg-zinc-900 text-zinc-300 border-zinc-700";
      case "event": return "bg-zinc-900 text-zinc-300 border-zinc-700";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const formatImpact = (impact: any) => {
    if (!impact) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(impact).map(([key, val]) => {
          const num = Number(val);
          const positive = num >= 0;
          let label = "";
          let icon = null;
          let formatted = "";

          if (key === "revenue") { label = "Rev"; icon = <DollarSign size={12} />; formatted = `$${Math.abs(num)}`; }
          else if (key === "users") { label = "Users"; icon = <Users size={12} />; formatted = `${Math.abs(num)}`; }
          else if (key === "burn_rate") { label = "Burn"; icon = <TrendingUp size={12} />; formatted = `$${Math.abs(num)}`; }
          else if (key === "market_share") { label = "Share"; icon = <Activity size={12} />; formatted = `${Math.abs(num)}%`; }

          return (
            <div key={key} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300`}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {icon}
              {formatted} {label}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-zinc-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search past decisions, events, or outcomes..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Memory Grid */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800/50 border-dashed rounded-xl bg-zinc-900/20">
          <Brain className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="text-zinc-400 text-sm">No memories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((mem) => (
            <div key={mem.id} className="p-5 border border-zinc-800 bg-zinc-900/30 rounded-xl flex flex-col relative overflow-hidden group hover:border-zinc-700 transition-colors">
              {mem.similarity && (
                <div className="absolute top-0 right-0 bg-zinc-900 border-b border-l border-zinc-800 px-2 py-1 rounded-bl-lg text-[10px] font-medium text-zinc-400">
                  {(mem.similarity * 100).toFixed(0)}% Match
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${getColor(mem.memory_type)}`}>
                  {getIcon(mem.memory_type)}
                  <span className="capitalize">{mem.memory_type}</span>
                </span>
                <span className="text-xs text-zinc-500 ml-auto">
                  {new Date(mem.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-zinc-300 leading-relaxed flex-1">
                {mem.content}
              </p>

              {mem.metadata?.impact && formatImpact(mem.metadata.impact)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
