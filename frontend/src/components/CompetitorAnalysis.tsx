"use client";

import React, { useState } from "react";
import { ArrowRight, ShieldAlert, Zap, Target, Search, Loader2, RefreshCw, Globe, MapPin } from "lucide-react";
import CompetitorCard, { Competitor } from "./CompetitorCard";

interface MarketGap {
  gap: string;
  opportunity: string;
  market_size: string;
}

interface GlobalLearning {
  company: string;
  learning: string;
  how_to_apply: string;
}

interface CompetitorAnalysisData {
  competitors?: Competitor[];
  indian_competitors?: Competitor[];
  global_competitors?: Competitor[];
  market_gaps?: string[];
  india_market_gaps?: MarketGap[];
  global_learnings?: GlobalLearning[];
  competitive_advantage: string;
  threat_level: string;
  threat_reasoning: string;
  moat: string;
  india_moat?: string;
  strategy: string;
}

interface CompetitorAnalysisProps {
  startupId: string;
  data: CompetitorAnalysisData | null;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
}

export default function CompetitorAnalysis({ startupId, data, onAnalyze, isAnalyzing }: CompetitorAnalysisProps) {
  
  if (isAnalyzing) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.07)] bg-[#111111] rounded-2xl">
        <Loader2 size={32} className="text-white animate-spin mb-4" />
        <h3 className="text-white font-medium text-lg mb-2">Researching competitors...</h3>
        <p className="text-[#666666] text-sm text-center max-w-sm">
          Our agents are scanning the market, analyzing rivals, and synthesizing your competitive strategy. This takes about 15 seconds.
        </p>
      </div>
    );
  }

  // Use either new specific arrays or fallback to combined 'competitors' array if legacy
  const indianCompetitors = data?.indian_competitors?.length ? data.indian_competitors : (data?.competitors?.filter(c => c.type === "Indian") || []);
  const globalCompetitors = data?.global_competitors?.length ? data.global_competitors : (data?.competitors?.filter(c => c.type === "Global") || []);
  
  const hasCompetitors = indianCompetitors.length > 0 || globalCompetitors.length > 0 || (data?.competitors && data.competitors.length > 0);

  if (!data || !hasCompetitors) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.07)] bg-[#111111] rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
          <Search size={28} className="text-[#888888]" />
        </div>
        <h2 className="text-white font-bold text-2xl mb-2">Know your enemies</h2>
        <p className="text-[#888888] mb-8 text-center max-w-md">
          Our agents will research your real competitors, identify market gaps, and write a tactical CEO playbook for you.
        </p>
        <button 
          onClick={onAnalyze}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Analyze Competitors <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  const getThreatColor = (level: string) => {
    const l = level.toLowerCase();
    if (l === "high") return "text-white font-bold tracking-tight shadow-sm";
    if (l === "medium") return "text-[#cccccc]";
    return "text-[#666666]";
  };

  const getThreatIndicator = (level: string) => {
    const l = level.toLowerCase();
    if (l === "high") return <div className="w-3 h-3 rounded-full bg-white animate-pulse" />;
    if (l === "medium") return <div className="w-3 h-3 rounded-full bg-[#aaaaaa]" />;
    return <div className="w-3 h-3 rounded-full bg-[#444444]" />;
  };

  const displayMoat = data.india_moat || data.moat;
  const legacyGaps = data.market_gaps || [];
  const indiaGaps = data.india_market_gaps || [];
  const globalLearnings = data.global_learnings || [];

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Threat Overview */}
      <section className="p-8 rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.07)] grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
        <div className="flex flex-col justify-center">
          <h2 className="text-[#888888] text-xs font-semibold uppercase tracking-wider mb-2">Competitive Advantage</h2>
          <p className="text-white text-xl md:text-2xl font-semibold leading-tight mb-4">
            {data.competitive_advantage || "Analyzing unique advantage based on identified gaps."}
          </p>
          <div className="flex items-center gap-2 mt-auto pt-4">
            <div className="px-4 py-2 bg-zinc-900/50 border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-[#aaaaaa] flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" /> 
              <span><strong className="text-white">Recommended Moat:</strong> {displayMoat}</span>
            </div>
          </div>
        </div>
        
        <div className="md:border-l border-[rgba(255,255,255,0.07)] md:pl-8 flex flex-col justify-center">
          <h2 className="text-[#888888] text-xs font-semibold uppercase tracking-wider mb-2">Threat Level</h2>
          <div className="flex items-center gap-3 mb-2">
            {getThreatIndicator(data.threat_level)}
            <span className={`text-4xl leading-none ${getThreatColor(data.threat_level)}`}>
              {data.threat_level}
            </span>
          </div>
          <p className="text-[#666666] text-sm mt-2">{data.threat_reasoning}</p>
        </div>
      </section>

      {/* Indian Competitors */}
      {indianCompetitors.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-zinc-400" />
              🇮🇳 Indian Competitors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {indianCompetitors.map((c, i) => (
              <CompetitorCard key={`ind-${i}`} competitor={c} />
            ))}
          </div>
        </section>
      )}

      {/* Global Competitors */}
      {globalCompetitors.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} className="text-zinc-400" />
              🌍 Global Competitors
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {globalCompetitors.map((c, i) => (
              <CompetitorCard key={`glob-${i}`} competitor={c} />
            ))}
          </div>
        </section>
      )}

      {/* Market Gaps */}
      <section>
        <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <Zap size={20} className="text-[#888888]" />
          Market Gaps in India
        </h2>
        
        {indiaGaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indiaGaps.map((gap, i) => (
              <div key={i} className="flex flex-col p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap size={100} />
                </div>
                <h3 className="text-white font-semibold mb-2 z-10">{gap.gap}</h3>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed z-10">{gap.market_size}</p>
                <div className="mt-auto flex items-center justify-between text-white font-medium text-sm z-10 pt-4 border-t border-zinc-800/50">
                  <span className="text-zinc-400 text-xs flex-1 pr-2">{gap.opportunity}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    Your opportunity <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback for legacy gaps format */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {legacyGaps.map((gap, i) => (
              <div key={i} className="flex flex-col p-6 rounded-2xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.07)] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5">
                  <Zap size={100} />
                </div>
                <p className="text-[#aaaaaa] text-sm mb-4 leading-relaxed z-10">"{gap}"</p>
                <div className="mt-auto flex items-center gap-2 text-white font-medium text-sm z-10">
                  <ArrowRight size={14} className="text-white" />
                  Your opportunity
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Global Learnings */}
      {globalLearnings.length > 0 && (
        <section>
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <Globe size={20} className="text-[#888888]" />
            What to Learn From Global Players
          </h2>
          <div className="bg-[#111111] rounded-2xl border border-[rgba(255,255,255,0.07)] overflow-hidden">
            {globalLearnings.map((learning, i) => (
              <div key={i} className={`p-6 flex flex-col md:flex-row gap-4 items-start ${i !== globalLearnings.length - 1 ? "border-b border-[rgba(255,255,255,0.07)]" : ""}`}>
                <div className="shrink-0 w-32">
                  <span className="px-2 py-1 text-xs rounded border border-zinc-700 bg-zinc-800 text-zinc-300 font-medium">
                    {learning.company}
                  </span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-zinc-400 text-sm leading-relaxed">{learning.learning}</p>
                  <p className="text-zinc-600 text-xs italic">
                    How to apply in India: {learning.how_to_apply}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CEO Strategy */}
      <section className="mb-12">
        <div className="p-8 rounded-2xl bg-black border border-[rgba(255,255,255,0.1)] relative">
          <h2 className="text-white font-bold text-xl mb-6">CEO Strategy Playbook</h2>
          
          <div className="text-[#cccccc] text-sm leading-relaxed whitespace-pre-wrap max-w-4xl">
            {data.strategy || "Strategy generation in progress..."}
          </div>
          
          <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.07)] flex justify-end">
            <button 
              onClick={onAnalyze}
              className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] text-[#aaaaaa] hover:text-white rounded-lg transition-colors text-sm"
            >
              <RefreshCw size={14} /> Re-analyze Market
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
