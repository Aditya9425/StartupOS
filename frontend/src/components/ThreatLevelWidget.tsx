"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

interface ThreatLevelWidgetProps {
  startupId: string | null;
}

export default function ThreatLevelWidget({ startupId }: ThreatLevelWidgetProps) {
  const [threatLevel, setThreatLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreat = async () => {
      if (!startupId) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/competitor/${startupId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.threat_level) {
            setThreatLevel(data.threat_level);
          }
        }
      } catch (err) {
        console.error("Failed to fetch threat level:", err);
      }
    };
    fetchThreat();
  }, [startupId]);

  if (!startupId || !threatLevel) return null;

  const renderIndicator = () => {
    const level = threatLevel.toLowerCase();
    if (level === "high") {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-white font-bold text-sm tracking-tight">High threat</span>
        </div>
      );
    }
    if (level === "medium") {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-white text-sm">Medium threat</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        <span className="text-zinc-400 text-sm">Low threat</span>
      </div>
    );
  };

  return (
    <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.07)]">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <ShieldAlert size={12} />
        Competitor Threat
      </div>
      {renderIndicator()}
      <Link 
        href={`/competitors?id=${startupId}`}
        className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 mt-2"
      >
        View full analysis <ArrowRight size={10} />
      </Link>
    </div>
  );
}
