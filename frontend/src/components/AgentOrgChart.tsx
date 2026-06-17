"use client";

import { memo, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Position,
  Handle,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Crown,
  Package,
  Megaphone,
  DollarSign,
  Cpu,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export type AgentStatus = "idle" | "thinking" | "done";

interface AgentNodeData {
  agentKey: string;
  name: string;
  role: string;
  status: AgentStatus;
  color: string;
  lastAction?: string;
  onClick?: (agentKey: string) => void;
}

const AGENT_COLORS: Record<string, string> = {
  ceo: "#FFFFFF",
  product: "#FFFFFF",
  marketing: "#FFFFFF",
  finance: "#FFFFFF",
  engineering: "#FFFFFF",
};

const AGENT_ICONS: Record<string, typeof Crown> = {
  ceo: Crown,
  product: Package,
  marketing: Megaphone,
  finance: DollarSign,
  engineering: Cpu,
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; wrapper: string; text: string; }> = {
  idle: { label: "Idle", wrapper: "border border-zinc-800", text: "text-zinc-600" },
  thinking: { label: "Thinking", wrapper: "border border-zinc-700", text: "text-zinc-400" },
  done: { label: "Done", wrapper: "border border-zinc-600", text: "text-zinc-300" },
};

// Custom React Flow node for each agent
const AgentNode = memo(({ data }: { data: AgentNodeData }) => {
  const Icon = AGENT_ICONS[data.agentKey] || Crown;
  const color = AGENT_COLORS[data.agentKey] || "#A1A1AA";
  const statusCfg = STATUS_CONFIG[data.status];

  return (
    <div
      onClick={() => data.onClick?.(data.agentKey)}
      className="cursor-pointer group"
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2" />

      <div
        className={`relative rounded-xl border bg-zinc-900 p-4 w-[180px] transition-all duration-300 ${
          data.status === "thinking"
            ? "border-white"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        {/* Agent avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-black border border-zinc-800"
          >
            {data.status === "thinking" ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : data.status === "done" ? (
              <CheckCircle2 size={18} className="text-zinc-300" />
            ) : (
              <Icon size={18} className="text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{data.name}</p>
            <p className="text-xs text-zinc-500 truncate">{data.role}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`px-2 py-0.5 rounded-full text-xs flex items-center justify-center ${statusCfg.wrapper} w-fit`}>
          <span className={`${statusCfg.text}`}>{statusCfg.label}</span>
        </div>

        {/* Last action text */}
        {data.lastAction && (
          <p className="text-xs text-zinc-500 mt-2 truncate">{data.lastAction}</p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";

interface AgentOrgChartProps {
  agentStatuses: Record<string, AgentStatus>;
  className?: string;
  height?: string;
  onAgentClick?: (agentKey: string) => void;
}

export default function AgentOrgChart({
  agentStatuses,
  className = "",
  height = "300px",
  onAgentClick,
}: AgentOrgChartProps) {
  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);
  const initialNodes: Node[] = useMemo(() => [
    {
      id: "ceo",
      type: "agentNode",
      position: { x: 300, y: 0 },
      data: {
        agentKey: "ceo",
        name: "CEO",
        role: "Strategy & Vision",
        status: agentStatuses.ceo || "idle",
        color: AGENT_COLORS.ceo,
        lastAction: agentStatuses.ceo === "done" ? "Blueprint complete" : agentStatuses.ceo === "thinking" ? "Generating strategy..." : undefined,
        onClick: onAgentClick,
      },
    },
    {
      id: "product",
      type: "agentNode",
      position: { x: 0, y: 160 },
      data: {
        agentKey: "product",
        name: "Product",
        role: "Features & MVP",
        status: agentStatuses.product || "idle",
        color: AGENT_COLORS.product,
        lastAction: agentStatuses.product === "done" ? "MVP planned" : agentStatuses.product === "thinking" ? "Defining features..." : undefined,
        onClick: onAgentClick,
      },
    },
    {
      id: "marketing",
      type: "agentNode",
      position: { x: 200, y: 160 },
      data: {
        agentKey: "marketing",
        name: "Marketing",
        role: "Go-to-Market",
        status: agentStatuses.marketing || "idle",
        color: AGENT_COLORS.marketing,
        lastAction: agentStatuses.marketing === "done" ? "GTM planned" : agentStatuses.marketing === "thinking" ? "Planning channels..." : undefined,
        onClick: onAgentClick,
      },
    },
    {
      id: "finance",
      type: "agentNode",
      position: { x: 400, y: 160 },
      data: {
        agentKey: "finance",
        name: "Finance",
        role: "Revenue & Pricing",
        status: agentStatuses.finance || "idle",
        color: AGENT_COLORS.finance,
        lastAction: agentStatuses.finance === "done" ? "Budget set" : agentStatuses.finance === "thinking" ? "Modeling revenue..." : undefined,
        onClick: onAgentClick,
      },
    },
    {
      id: "engineering",
      type: "agentNode",
      position: { x: 600, y: 160 },
      data: {
        agentKey: "engineering",
        name: "Engineering",
        role: "Tech & Architecture",
        status: agentStatuses.engineering || "idle",
        color: AGENT_COLORS.engineering,
        lastAction: agentStatuses.engineering === "done" ? "Stack chosen" : agentStatuses.engineering === "thinking" ? "Designing system..." : undefined,
        onClick: onAgentClick,
      },
    },
  ], [agentStatuses, onAgentClick]);

  const initialEdges: Edge[] = useMemo(() => {
    const makeEdge = (source: string, target: string): Edge => {
      const targetStatus = agentStatuses[target] || "idle";
      const sourceStatus = agentStatuses[source] || "idle";
      const isActive = targetStatus === "thinking" || sourceStatus === "thinking";
      const isDone = sourceStatus === "done" && targetStatus === "done";

      return {
        id: `${source}-${target}`,
        source,
        target,
        animated: isActive,
        style: {
          stroke: isActive ? "#FFFFFF" : "#3F3F46",
          strokeWidth: isActive ? 2 : 1.5,
          strokeDasharray: isActive ? "5 5" : "none",
        },
      };
    };

    return [
      makeEdge("ceo", "product"),
      makeEdge("ceo", "marketing"),
      makeEdge("ceo", "finance"),
      makeEdge("ceo", "engineering"),
    ];
  }, [agentStatuses]);

  return (
    <div className={`border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
