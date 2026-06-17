"use client";

import { useState, useEffect } from "react";
import { Crown, Package, Megaphone, DollarSign, Cpu, CheckCircle } from "lucide-react";

export interface DebateData {
  event: string;
  marketing_argument: string;
  finance_argument: string;
  product_argument: string;
  engineering_argument: string;
  ceo_decision: string;
  relevant_memory_count?: number;
}

interface DebatePanelProps {
  debate: DebateData | null;
  loading: boolean;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; icon: any; name: string }> = {
  ceo: { bg: "bg-zinc-900 border-zinc-700 text-white", text: "text-zinc-500", icon: Crown, name: "CEO" },
  marketing: { bg: "bg-zinc-900 border-zinc-700 text-white", text: "text-zinc-500", icon: Megaphone, name: "Marketing" },
  finance: { bg: "bg-zinc-900 border-zinc-700 text-white", text: "text-zinc-500", icon: DollarSign, name: "Finance" },
  product: { bg: "bg-zinc-900 border-zinc-700 text-white", text: "text-zinc-500", icon: Package, name: "Product" },
  engineering: { bg: "bg-zinc-900 border-zinc-700 text-white", text: "text-zinc-500", icon: Cpu, name: "Engineering" },
};

export default function DebatePanel({ debate, loading }: DebatePanelProps) {
  const [visibleArguments, setVisibleArguments] = useState<string[]>([]);
  const [showCEO, setShowCEO] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisibleArguments([]);
      setShowCEO(false);
      setShowToast(false);
      return;
    }

    if (debate) {
      // Staggered reveal of arguments
      const args = ["marketing", "finance", "product", "engineering"];
      args.forEach((arg, index) => {
        setTimeout(() => {
          setVisibleArguments((prev) => [...prev, arg]);
        }, index * 600); // 600ms delay between bubbles
      });

      // Show CEO decision last
      setTimeout(() => {
        setShowCEO(true);
      }, args.length * 600 + 800);

      // Show memory saved toast shortly after CEO decision
      setTimeout(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000); // hide after 4s
      }, args.length * 600 + 1600);
    }
  }, [debate, loading]);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        <div className="flex space-x-6">
          {["marketing", "finance", "product", "engineering"].map((agent) => {
            const config = AGENT_COLORS[agent];
            const Icon = config.icon;
            return (
              <div key={agent} className="flex flex-col items-center space-y-2 animate-pulse">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${config.bg}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-zinc-500">{config.name} thinking...</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 p-6">
        No active debate. Trigger an event to begin.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-semibold border border-red-500/20 uppercase tracking-wide">
          Market Event
        </span>
        <h3 className="mt-4 text-xl font-medium text-zinc-100">{debate.event}</h3>
        
        {debate.relevant_memory_count && debate.relevant_memory_count > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 w-max mx-auto px-2 py-0.5 rounded-full">
            <Crown size={12} />
            Using {debate.relevant_memory_count} past memories
          </div>
        )}
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {["marketing", "finance", "product", "engineering"].map((agent) => {
          if (!visibleArguments.includes(agent)) return null;
          
          const argContent = debate[`${agent}_argument` as keyof DebateData];
          const config = AGENT_COLORS[agent];
          const Icon = config.icon;

          return (
            <div key={agent} className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${config.bg}`}>
                <Icon size={18} />
              </div>
              <div className="bg-zinc-900 rounded-lg p-3 border-l-2 border-zinc-700 flex-1">
                <div className="text-xs text-zinc-500 mb-1">{config.name}</div>
                <p className="text-sm text-white leading-relaxed">{argContent}</p>
              </div>
            </div>
          );
        })}

        {showCEO && (
          <div className="mt-8 animate-in zoom-in-95 fade-in duration-700">
            <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4 mt-3">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Final Decision</div>
              <p className="text-sm text-white font-medium">
                {debate.ceo_decision}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Memory Saved Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white text-black px-4 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2">
            <CheckCircle size={16} className="text-black" />
            Memory saved — agents will remember this
          </div>
        </div>
      )}
    </div>
  );
}
