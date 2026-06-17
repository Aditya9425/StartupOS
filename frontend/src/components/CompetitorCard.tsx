import React from "react";
import { Check, X } from "lucide-react";

export interface Competitor {
  name: string;
  type: string;
  founded: string;
  headquarters: string;
  funding: string;
  valuation: string;
  users: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  position: string;
  funding_stage: string;
  india_specific?: string;
  india_relevance?: string;
  key_differentiator: string;
}

interface CompetitorCardProps {
  competitor: Competitor;
}

export default function CompetitorCard({ competitor }: CompetitorCardProps) {
  const isIndian = competitor.type === "Indian";

  return (
    <div className="flex flex-col p-5 rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] h-full">
      {/* Top Row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-white font-medium text-base">{competitor.name}</h3>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full border border-zinc-700 text-zinc-400">
              {isIndian ? "🇮🇳 Indian" : "🌍 Global"}
            </span>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full border border-zinc-700 text-zinc-400">
              {competitor.position}
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-tight line-clamp-2">{competitor.description}</p>
        </div>
      </div>
      
      {/* Company Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <div className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg flex flex-col">
          <span className="text-xs text-zinc-600">Founded</span>
          <span className="text-xs text-white font-medium whitespace-normal min-w-0 flex-1">{competitor.founded}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg flex flex-col">
          <span className="text-xs text-zinc-600">HQ</span>
          <span className="text-xs text-white font-medium whitespace-normal min-w-0 flex-1">{competitor.headquarters}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg flex flex-col">
          <span className="text-xs text-zinc-600">Funding</span>
          <span className="text-xs text-white font-medium whitespace-normal min-w-0 flex-1">{competitor.funding}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg flex flex-col">
          <span className="text-xs text-zinc-600">Users</span>
          <span className="text-xs text-white font-medium whitespace-normal min-w-0 flex-1">{competitor.users}</span>
        </div>
      </div>

      {/* India Specific / Relevance */}
      {(competitor.india_specific || competitor.india_relevance) && (
        <div className="bg-zinc-950 border-l-2 border-zinc-600 p-3 mb-4 rounded-r-lg">
          <p className="text-xs text-zinc-400 italic">
            {competitor.india_specific || competitor.india_relevance}
          </p>
        </div>
      )}
      
      {/* Strengths & Weaknesses */}
      <div className="flex flex-col gap-3 mb-6 flex-1">
        <div>
          <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Strengths</h4>
          <ul className="flex flex-col gap-1.5">
            {(competitor.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-xs text-white leading-tight">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Weaknesses</h4>
          <ul className="flex flex-col gap-1.5">
            {(competitor.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <X size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-400 leading-tight">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Differentiator */}
      <div className="mt-auto bg-zinc-950 p-3 rounded-lg border border-zinc-900">
        <h4 className="text-xs font-semibold text-zinc-600 mb-1">Key Differentiator</h4>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {competitor.key_differentiator || "Not specified"}
        </p>
      </div>
    </div>
  );
}
