"use client";

import { Clock, CheckCircle } from "lucide-react";

interface PastDebate {
  id: string;
  event: string;
  created_at: string;
  ceo_decision: string;
}

interface DebateHistoryProps {
  debates: PastDebate[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export default function DebateHistory({ debates, onSelect, selectedId }: DebateHistoryProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
          <Clock size={16} className="text-zinc-400" />
          Debate History
        </h2>
        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{debates.length} records</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {debates.length === 0 ? (
          <div className="p-4 text-center text-sm text-zinc-500">
            No past debates.
          </div>
        ) : (
          debates.map((debate) => (
            <button
              key={debate.id}
              onClick={() => onSelect(debate.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedId === debate.id
                  ? "bg-zinc-800 border-zinc-700"
                  : "border-transparent hover:bg-zinc-800/50 hover:border-zinc-800"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium line-clamp-1 ${selectedId === debate.id ? "text-white" : "text-zinc-300"}`}>
                  {debate.event}
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1 border-l-2 border-zinc-700 pl-2">
                <span className="text-zinc-400 mr-1 flex inline-flex items-center gap-1"><CheckCircle size={10}/>CEO:</span>
                {debate.ceo_decision}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
