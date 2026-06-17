"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Database,
  Settings,
  X,
  Crown,
  Package,
  Megaphone,
  DollarSign,
  Cpu,
  Loader2,
} from "lucide-react";
import type { AgentStatus } from "@/components/AgentOrgChart";
import { AuthGuard } from "@/components/AuthGuard";
import ExportBar from "@/components/ExportBar";

const AgentOrgChart = dynamic(() => import("@/components/AgentOrgChart"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Blueprint {
  ceo: string;
  product: string;
  marketing: string;
  finance: string;
  engineering: string;
}

const AGENT_META: Record<string, { name: string; role: string; icon: typeof Crown }> = {
  ceo: { name: "CEO", role: "Mission, Vision & Strategy", icon: Crown },
  product: { name: "Product", role: "Features, Personas & MVP", icon: Package },
  marketing: { name: "Marketing", role: "Go-to-Market & Channels", icon: Megaphone },
  finance: { name: "Finance", role: "Revenue Model & Pricing", icon: DollarSign },
  engineering: { name: "Engineering", role: "Tech Stack & Architecture", icon: Cpu },
};

const AGENT_COLORS: Record<string, string> = {
  ceo: "border-zinc-500/30 bg-zinc-500/5",
  product: "border-zinc-500/30 bg-zinc-500/5",
  marketing: "border-zinc-500/30 bg-zinc-500/5",
  finance: "border-zinc-500/30 bg-zinc-500/5",
  engineering: "border-zinc-500/30 bg-zinc-500/5",
};

const AGENT_TEXT_COLORS: Record<string, string> = {
  ceo: "text-zinc-400",
  product: "text-zinc-400",
  marketing: "text-zinc-400",
  finance: "text-zinc-400",
  engineering: "text-zinc-400",
};

function AgentsPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [toast, setToast] = useState("");
  const [startupName, setStartupName] = useState("Startup");

  useEffect(() => {
    if (startupId) {
      fetch(`${API_URL}/api/blueprint/${startupId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setStartupName(data.name);
          if (data.blueprint) {
            // Support both keys (e.g. "ceo" or "ceo_output")
            const bp = data.blueprint;
            setBlueprint({
              ceo: bp.ceo || bp.ceo_output || "",
              product: bp.product || bp.product_output || "",
              marketing: bp.marketing || bp.marketing_output || "",
              finance: bp.finance || bp.finance_output || "",
              engineering: bp.engineering || bp.engineering_output || ""
            });
          }
        })
        .catch(console.error);
    }
  }, [startupId]);

  useEffect(() => {
    const agent = searchParams.get("agent");
    if (agent && Object.keys(AGENT_META).includes(agent)) {
      setSelectedAgent(agent);
    }
  }, [searchParams]);

  
  const handleRecalculateScore = async () => {
    if (!startupId) return;
    setIsRecalculating(true);
    try {
      const res = await fetch(`${API_URL}/api/validate-idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId }),
      });
      if (res.ok) {
        setToast("Score updated ✓");
        setTimeout(() => setToast(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!startupId) return;
    setRegenerating(true);
    setConfirmRegenerate(false);
    try {
      const res = await fetch(`${API_URL}/api/startup/${startupId}`);
      const startupData = await res.json();
      
      const generateRes = await fetch(`${API_URL}/api/generate-blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_id: startupId,
          idea: startupData.idea || "Startup idea"
        })
      });
      if (!generateRes.ok) throw new Error("Failed to regenerate");
      const result = await generateRes.json();
      if (result.blueprint) {
        const bp = result.blueprint;
        setBlueprint({
          ceo: bp.ceo || bp.ceo_output || "",
          product: bp.product || bp.product_output || "",
          marketing: bp.marketing || bp.marketing_output || "",
          finance: bp.finance || bp.finance_output || "",
          engineering: bp.engineering || bp.engineering_output || ""
        });
      }
      setToast("Blueprint regenerated ✓");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("Error regenerating blueprint");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setRegenerating(false);
    }
  };

  const agentStatuses: Record<string, AgentStatus> = {};
  const agentKeys = ["ceo", "product", "marketing", "finance", "engineering"];
  agentKeys.forEach((key) => {
    agentStatuses[key] = blueprint?.[key as keyof Blueprint] ? "done" : "idle";
  });

  const handleAgentClick = (agentKey: string) => {
    setSelectedAgent(agentKey === selectedAgent ? null : agentKey);
  };

  const selectedMeta = selectedAgent ? AGENT_META[selectedAgent] : null;
  const selectedOutput = selectedAgent && blueprint ? blueprint[selectedAgent as keyof Blueprint] : null;
  const SelectedIcon = selectedMeta?.icon || Crown;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeRoute="agents" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with Export actions */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div>
            <h1 className="font-semibold text-lg">Agent Organization Chart</h1>
            <p className="text-sm text-zinc-400">Click any agent to view their output</p>
          </div>
          
          <div className="flex items-center gap-2">
            {toast && <span className="text-sm text-green-400 mr-2">{toast}</span>}
            
                        {isRecalculating ? (
              <button disabled className="ghost-btn border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg opacity-50 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Recalculating...
              </button>
            ) : (
              <button 
                onClick={handleRecalculateScore}
                className="ghost-btn border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Recalculate Score
              </button>
            )}
            
            {regenerating ? (
              <button disabled className="ghost-btn border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg opacity-50 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Regenerating...
              </button>
            ) : confirmRegenerate ? (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-zinc-400">Are you sure?</span>
                <button onClick={handleRegenerate} className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors">Yes, regenerate</button>
                <button onClick={() => setConfirmRegenerate(false)} className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirmRegenerate(true)}
                className="border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Regenerate Blueprint
              </button>
            )}
            
            {/* The actual PDF download and Share is handled via ExportBar */}
            <div className="-mt-6">
              <ExportBar 
                 startup={{ id: startupId, name: startupName, validation_score: null, challenges: [] }}
                 blueprint={blueprint}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Canvas */}
          <div className="w-full shrink-0">
            <AgentOrgChart
              agentStatuses={agentStatuses}
              height="360px"
              onAgentClick={handleAgentClick}
            />
          </div>

          {/* Blueprint Cards */}
          <div className="p-6">
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Blueprint Output</h2>
            {blueprint ? (
              <div className="grid grid-cols-2 gap-4">
                {/* CEO Row */}
                <div className="col-span-2 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center justify-center">CEO</div>
                    <div>
                      <p className="text-sm font-medium text-white">CEO</p>
                      <p className="text-xs text-zinc-500">Mission, Vision & Strategy</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                    {blueprint.ceo || "Generating..."}
                  </div>
                </div>

                {/* Product | Marketing */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center justify-center">PRO</div>
                    <div>
                      <p className="text-sm font-medium text-white">Product</p>
                      <p className="text-xs text-zinc-500">Features, Personas & MVP</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                    {blueprint.product || "Generating..."}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center justify-center">MKT</div>
                    <div>
                      <p className="text-sm font-medium text-white">Marketing</p>
                      <p className="text-xs text-zinc-500">Go-to-Market & Channels</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                    {blueprint.marketing || "Generating..."}
                  </div>
                </div>

                {/* Finance | Engineering */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center justify-center">FIN</div>
                    <div>
                      <p className="text-sm font-medium text-white">Finance</p>
                      <p className="text-xs text-zinc-500">Revenue Model & Pricing</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                    {blueprint.finance || "Generating..."}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-white flex items-center justify-center">ENG</div>
                    <div>
                      <p className="text-sm font-medium text-white">Engineering</p>
                      <p className="text-xs text-zinc-500">Tech Stack & Architecture</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                    {blueprint.engineering || "Generating..."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500">No blueprint generated yet. Please generate one first.</div>
            )}
          </div>
        </div>

        {/* Side Panel Overlay */}
        {selectedAgent && selectedMeta && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedAgent(null)}></div>
            <div className="fixed right-0 top-0 h-full w-96 z-50 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
              {/* Panel Header */}
              <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-900/50">
                <div>
                  <h3 className="text-base font-medium text-white">{selectedMeta.name}</h3>
                  <p className="text-xs text-zinc-500">{selectedMeta.role}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedOutput ? (
                  <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {selectedOutput}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-zinc-500 text-sm mb-4">Generate Blueprint first</p>
                    <button 
                      onClick={() => setConfirmRegenerate(true)}
                      className="px-4 py-2 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors"
                    >
                      Generate Blueprint &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* ExportBar handles its own Share Modal */}
      </main>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>}>
        <AgentsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
