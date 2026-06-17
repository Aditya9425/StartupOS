"use client";

import { useState } from "react";
import { Zap, AlertTriangle, TrendingUp, ShieldAlert, Send } from "lucide-react";

interface EventTriggerProps {
  startupId: string;
  onTrigger: (event: string, type: string) => void;
  disabled: boolean;
}

const PRESET_EVENTS = [
  { label: "Competitor launched 50% discount", type: "competitor_action", icon: Zap, color: "text-zinc-300 bg-zinc-900 border-zinc-700 hover:border-zinc-500" },
  { label: "Server costs doubled unexpectedly", type: "internal_issue", icon: AlertTriangle, color: "text-zinc-300 bg-zinc-900 border-zinc-700 hover:border-zinc-500" },
  { label: "Viral social media mention", type: "opportunity", icon: TrendingUp, color: "text-zinc-300 bg-zinc-900 border-zinc-700 hover:border-zinc-500" },
  { label: "New strict data privacy regulation", type: "market_change", icon: ShieldAlert, color: "text-zinc-300 bg-zinc-900 border-zinc-700 hover:border-zinc-500" },
];

export default function EventTrigger({ startupId, onTrigger, disabled }: EventTriggerProps) {
  const [customEvent, setCustomEvent] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEvent.trim()) return;
    onTrigger(customEvent, "custom");
    setCustomEvent("");
  };

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="font-semibold text-zinc-100">Trigger Market Event</h2>
        <p className="text-xs text-zinc-500 mt-1">Force your agents to debate a crisis or opportunity.</p>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="space-y-2">
          {PRESET_EVENTS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onTrigger(preset.label, preset.type)}
              disabled={disabled}
              className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
              } ${preset.color}`}
            >
              <preset.icon size={18} />
              <span className="text-sm font-medium">{preset.label}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-zinc-900/50 text-xs text-zinc-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type custom event..."
            value={customEvent}
            onChange={(e) => setCustomEvent(e.target.value)}
            disabled={disabled}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <button
            type="submit"
            disabled={disabled || !customEvent.trim()}
            className="p-2 bg-white hover:bg-zinc-100 text-black rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
