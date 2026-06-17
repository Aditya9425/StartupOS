"use client";

import { useState } from "react";
import {
  Crown,
  Package,
  Megaphone,
  DollarSign,
  Cpu,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type AgentStatus = "idle" | "thinking" | "done";

const AGENT_ICONS: Record<string, typeof Crown> = {
  ceo: Crown,
  product: Package,
  marketing: Megaphone,
  finance: DollarSign,
  engineering: Cpu,
};

const AGENT_COLORS: Record<string, { hex: string; bg: string; border: string; text: string }> = {
  ceo: { hex: "#FFFFFF", bg: "bg-zinc-900", border: "border-zinc-800", text: "text-white" },
  product: { hex: "#FFFFFF", bg: "bg-zinc-900", border: "border-zinc-800", text: "text-white" },
  marketing: { hex: "#FFFFFF", bg: "bg-zinc-900", border: "border-zinc-800", text: "text-white" },
  finance: { hex: "#FFFFFF", bg: "bg-zinc-900", border: "border-zinc-800", text: "text-white" },
  engineering: { hex: "#FFFFFF", bg: "bg-zinc-900", border: "border-zinc-800", text: "text-white" },
};

const STATUS_STYLES: Record<AgentStatus, { label: string; wrapper: string; text: string; }> = {
  idle: { label: "Idle", wrapper: "border border-zinc-800", text: "text-zinc-600" },
  thinking: { label: "Thinking", wrapper: "border border-zinc-700", text: "text-zinc-400" },
  done: { label: "Complete", wrapper: "border border-zinc-600", text: "text-zinc-300" },
};

interface AgentCardProps {
  agentKey: string;
  name: string;
  role: string;
  status: AgentStatus;
  output?: string;
}

export default function AgentCard({ agentKey, name, role, status, output }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = AGENT_ICONS[agentKey] || Crown;
  const colors = AGENT_COLORS[agentKey] || AGENT_COLORS.ceo;
  const statusStyle = STATUS_STYLES[status];

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors duration-150 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30 transition-colors"
        onClick={() => output && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}
          >
            {status === "thinking" ? (
              <Loader2 size={18} className={`${colors.text} animate-spin`} />
            ) : (
              <Icon size={18} className={colors.text} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">{name}</p>
            <p className="text-xs text-zinc-500">{role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div className={`px-2 py-0.5 rounded-full text-xs flex items-center justify-center ${statusStyle.wrapper}`}>
            <span className={`${statusStyle.text}`}>{statusStyle.label}</span>
          </div>

          {/* Expand toggle */}
          {output && (
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable content */}
      {expanded && output && (
        <div className="px-4 pb-4 border-t border-zinc-800/50">
          <div className="mt-3 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
