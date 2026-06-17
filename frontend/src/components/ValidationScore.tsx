"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreData {
  market_size: number;
  competition: number;
  execution_risk: number;
  revenue_potential: number;
  technical_feasibility: number;
  time_to_market: number;
}

interface ValidationScoreProps {
  score: {
    overall: number;
    verdict: string;
    scores: ScoreData;
    strengths: string[];
    risks: string[];
  };
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

const getBarColor = (val: number) => {
  if (val >= 8) return "bg-white";
  if (val >= 5) return "bg-neutral-500";
  return "bg-neutral-700";
};

const formatLabel = (key: string) => {
  return key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

function NumberTicker({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    const duration = 1000;
    const incrementTime = 20;
    const steps = duration / incrementTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCurrent(end);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{current}</span>;
}

export default function ValidationScore({ score, onRecalculate, isRecalculating }: ValidationScoreProps) {
  const scoreEntries = Object.entries(score.scores);

  return (
    <div className="w-full rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111111] overflow-hidden flex flex-col md:flex-row">
      {/* Left side: Overall Score & Verdict */}
      <div className="p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-[#666666] text-sm font-medium tracking-wide uppercase">
            AI Validation Score
          </div>
          {onRecalculate && (
            <button 
              onClick={onRecalculate}
              disabled={isRecalculating}
              className="text-xs text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
            >
              {isRecalculating ? "Recalculating..." : "Recalculate →"}
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-6xl font-semibold text-white tracking-tighter">
            <NumberTicker value={score.overall} />
          </span>
          <span className="text-2xl text-[#666666] font-medium">/100</span>
        </div>
        <p className="text-sm text-[#666666] leading-relaxed">
          {score.verdict}
        </p>
      </div>

      {/* Middle: Score Bars */}
      <div className="p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.07)] gap-4">
        {scoreEntries.map(([key, val], idx) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-32 text-xs font-medium text-[#666666]">
              {formatLabel(key)}
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-black overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val * 10}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`absolute top-0 left-0 h-full rounded-full ${getBarColor(val)}`}
              />
            </div>
            <div className="w-6 text-xs text-right font-medium text-white">
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Right side: Strengths & Risks */}
      <div className="p-8 md:w-1/3 flex flex-col justify-center gap-6">
        <div>
          <div className="text-xs font-medium text-white mb-3">Top Strengths</div>
          <ul className="space-y-2">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[#666666] flex items-start gap-2">
                <span className="text-white">✓</span>
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-medium text-white mb-3">Top Risks</div>
          <ul className="space-y-2">
            {score.risks.map((r, i) => (
              <li key={i} className="text-sm text-[#666666] flex items-start gap-2">
                <span className="text-[#666666]">⚠</span>
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
