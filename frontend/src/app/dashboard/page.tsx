"use client";
import Sidebar from "@/components/Sidebar";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Database,
  Search,
  Settings,
  Bell,
  Sparkles,
  Loader2,
  DollarSign,
  TrendingUp,
  Zap,
  ArrowRight,
  MonitorPlay,
  Presentation,
  CheckCircle,
  Check
} from "lucide-react";
import AgentCard from "@/components/AgentCard";
import type { AgentStatus } from "@/components/AgentOrgChart";
import EventTrigger from "@/components/EventTrigger";
import DebatePanel from "@/components/DebatePanel";
import ValidationScore from "@/components/ValidationScore";
import ExportBar from "@/components/ExportBar";
import ChatPreview from "@/components/ChatPreview";
import DeleteStartupModal from "@/components/DeleteStartupModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';
import { Copy } from "lucide-react";

import { AuthGuard } from "@/components/AuthGuard";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { completeStep } from "@/lib/steps";

// Dynamic imports (no SSR for chart/reactflow)
const AgentOrgChart = dynamic(() => import("@/components/AgentOrgChart"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Blueprint {
  ceo: string;
  product: string;
  marketing: string;
  finance: string;
  engineering: string;
}



const AGENT_ORDER = ["ceo", "product", "marketing", "finance", "engineering"] as const;

const AGENT_META: Record<string, { name: string; role: string }> = {
  ceo: { name: "CEO", role: "Mission, Vision & Strategy" },
  product: { name: "Product", role: "Features, Personas & MVP" },
  marketing: { name: "Marketing", role: "Go-to-Market & Channels" },
  finance: { name: "Finance", role: "Revenue Model & Pricing" },
  engineering: { name: "Engineering", role: "Tech Stack & Architecture" },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [generateError, setGenerateError] = useState("");
  const [toast, setToast] = useState("");
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, startupName: "", startupId: "" });

  const statusMessages = [
    "Assembling your AI team...",
    "CEO is defining your vision...",
    "Product team planning roadmap...",
    "Marketing strategy in progress...",
    "Finance model being built...",
    "Engineering architecture planned...",
    "Validating your startup idea...",
    "Finalizing your blueprint..."
  ];

  const agentSteps = [
    "CEO Agent",
    "Product Agent", 
    "Marketing Agent",
    "Finance Agent",
    "Engineering Agent"
  ];
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const [activeDebate, setActiveDebate] = useState<any>(null);
  const [loadingDebate, setLoadingDebate] = useState(false);
  const [validating, setValidating] = useState(false);
  const [pitchDeck, setPitchDeck] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<{ token: string; views: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);



  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setGeneratingStep(prev => 
        prev < statusMessages.length - 1 
          ? prev + 1 : prev
      );
    }, 3500);
    
    return () => clearInterval(interval);
  }, [isGenerating]);

  const showSuccessToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (startupId) {
      setLoading(true);
      fetch(`${API_URL}/api/startup/${startupId}`, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch startup");
          return res.json();
        })
        .then((data) => {
          setStartup(data);
          if (data.completed_steps) {
            setCompletedSteps(data.completed_steps);
          }
          if (data.blueprint) {
            setBlueprint(data.blueprint);
            setCompletedAgents(new Set(AGENT_ORDER));
          }
          
          fetch(`${API_URL}/api/pitchdeck/${startupId}`)
            .then((pdRes) => pdRes.json())
            .then((pdData) => {
              if (pdData && pdData.slides) {
                setPitchDeck(pdData);
              }
              setLoading(false);
            })
            .catch(() => setLoading(false));
            
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          router.push("/my-startups");
        });
    } else {
      // Fetch user's startups from my-startups to auto-redirect
      fetch(`${API_URL}/api/startup/my-startups`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch startups");
          return res.json();
        })
        .then((data) => {
          if (data && data.length > 0) {
            router.push(`/dashboard?id=${data[0].id}`);
          } else {
            router.push("/onboarding");
          }
        })
        .catch((err) => {
          console.error("Redirect check failed:", err);
          router.push("/onboarding");
        });
    }
  }, [startupId, router]);

  const handleDeleteClick = () => {
    if (!startupId || !startup) return;
    setDeleteModal({ isOpen: true, startupName: startup.name || "Untitled Startup", startupId });
  };

  const handleGenerateBlueprint = async () => {
    if (!startupId || !startup) return;
    setIsGenerating(true);
    setGeneratingStep(0);
    setGenerateError("");
    setActiveAgent("ceo");
    setCompletedAgents(new Set());
    
    try {
      const response = await fetch(`${API_URL}/api/generate-blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId, idea: startup.idea }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setGenerateError(error.detail?.message || "Generation failed. Please try again.");
        return;
      }
      
      const data = await response.json();
      setBlueprint(data.blueprint);
      setStartup({ ...startup, status: "blueprint_generated", validation_score: data.validation_score });
      setCompletedAgents(new Set(AGENT_ORDER));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const result = await completeStep(startupId, "blueprint", session.access_token);
        setCompletedSteps(result.completed_steps);
      }
      
      showSuccessToast("Blueprint generated ✓");
      
    } catch (err) {
      setGenerateError("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingStep(0);
      setActiveAgent(null);
    }
  };

  const handleValidateStartup = async () => {
    if (!startupId) return;
    setValidating(true);
    try {
      const res = await fetch(`${API_URL}/api/validate-startup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStartup({ ...startup, validation_score: data.validation_score });
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setValidating(false);
    }
  };

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
        const data = await res.json();
        setStartup({ ...startup, validation_score: data.validation_score });
        showSuccessToast("Score updated ✓");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleShare = async () => {
    if (!startupId) return;
    setIsSharing(true);
    console.log('Sharing startup:', startupId);
    try {
      const res = await fetch(`${API_URL}/api/share/${startupId}`, {
        method: "POST"
      });
      console.log('Share response:', res);
      if (res.ok) {
        const data = await res.json();
        setShareData({ token: data.share_token, views: data.view_count });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  const shareUrl = shareData ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blueprint/${shareData.token}` : "";
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=Check out my AI-generated startup blueprint! ${encodeURIComponent(shareUrl)}`);

  const handleTrigger = async (event: string, type: string) => {
    if (!startupId) return;
    setLoadingDebate(true);
    setActiveDebate(null);
    try {
      const res = await fetch(`${API_URL}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId, event, event_type: type }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDebate(data);
      } else {
        console.error("Debate failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDebate(false);
    }
  };



  // Compute agent statuses
  const agentStatuses: Record<string, AgentStatus> = {};
  AGENT_ORDER.forEach((key) => {
    if (isGenerating && activeAgent === key) {
      agentStatuses[key] = "thinking";
    } else if (completedAgents.has(key) || blueprint?.[key as keyof Blueprint]) {
      agentStatuses[key] = "done";
    } else {
      agentStatuses[key] = "idle";
    }
  });



  const steps = [
    { key: "blueprint", label: "Generate Blueprint", action: "Generate", route: null },
    { key: "competitors", label: "Analyze Competitors", action: "Analyze", route: "/competitors" },
    { key: "debate", label: "Run your first Debate", action: "Go to Debates", route: "/debates" },
    { key: "pitchdeck", label: "Generate Pitch Deck", action: "Generate", route: "/pitchdeck" },
    { key: "shared", label: "Share your Blueprint", action: "Share", route: null }
  ];

  const currentStepIndex = steps.findIndex(s => !completedSteps.includes(s.key));

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      <Sidebar activeRoute="dashboard" />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-medium text-lg flex items-center gap-2">
              {loading ? (
                <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded"></div>
              ) : (
                <span>{startup?.name || "Untitled Startup"}</span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-zinc-500 hover:text-white transition-colors cursor-pointer outline-none">
                <Settings size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-1">
                <DropdownMenuItem disabled className="text-sm text-zinc-500 cursor-not-allowed px-3 py-1.5 focus:bg-transparent data-[disabled]:opacity-50">
                  Rename Startup
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-sm text-zinc-400 hover:text-white cursor-pointer px-3 py-1.5 focus:bg-zinc-800 focus:text-white"
                >
                  Delete Startup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400">
              U
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Checklist & Metrics & Logs */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* ZONE 1: Checklist */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-zinc-400" />
                    Onboarding Progress
                  </h3>
                  <div className="space-y-4">
                    {steps.map((step, index) => {
                      const isCompleted = completedSteps.includes(step.key);
                      const isNext = index === currentStepIndex;
                      const isFuture = index > currentStepIndex;
                      
                      return (
                        <div key={step.key} className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 
                              ${isCompleted ? 'bg-white border-white text-black' : isNext ? 'border-white' : 'border-zinc-700'}`}>
                              {isCompleted && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className={`text-sm ${isCompleted ? 'text-zinc-600 line-through' : isNext ? 'text-white font-medium' : 'text-zinc-600'}`}>
                              {step.label}
                            </span>
                          </div>
                          {isNext && (
                            <div className="ml-8 mt-1">
                              {step.route ? (
                                <Link href={`${step.route}?id=${startupId}`}>
                                  <button className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors">
                                    {step.action}
                                  </button>
                                </Link>
                              ) : (
                                <button 
                                  onClick={step.key === "blueprint" ? handleGenerateBlueprint : undefined}
                                  disabled={step.key === "blueprint" && isGenerating}
                                  className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                  {step.key === "blueprint" && isGenerating ? 'Processing...' : step.action}
                                </button>
                              )}
                              {step.key === 'blueprint' && generateError && (
                                <p className="text-xs text-zinc-400 mt-2">
                                  {generateError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ZONE 3: Metrics Grid */}
                {blueprint && (() => {
                  let defaultMetrics = {
                    revenue: 0,
                    users: 0,
                    burnRate: 0,
                    marketShare: 0
                  };
                  let subtitles = {
                    revenue: "No revenue yet — pre-launch",
                    users: "No users yet — idea stage",
                    burnRate: "Track your expenses once you start",
                    marketShare: "Pre-launch"
                  };
                  
                  if (startup?.stage === 'Building MVP') {
                    defaultMetrics = {
                      revenue: 5000,
                      users: 25,
                      burnRate: 40000,
                      marketShare: 0.1
                    };
                    subtitles.revenue = "";
                    subtitles.users = "";
                    subtitles.burnRate = "Update as you spend";
                    subtitles.marketShare = "";
                  } else if (startup?.stage === 'Already launched') {
                    defaultMetrics = {
                      revenue: 30000,
                      users: 150,
                      burnRate: 60000,
                      marketShare: 0.5
                    };
                    subtitles.revenue = "";
                    subtitles.users = "";
                    subtitles.burnRate = "Update as you spend";
                    subtitles.marketShare = "";
                  }
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <LiveMetricCard 
                        title="Monthly Revenue" 
                        value={`₹${defaultMetrics.revenue.toLocaleString('en-IN')}`} 
                        delta={null} 
                        subtitle={subtitles.revenue || undefined}
                      />
                      <LiveMetricCard 
                        title="Total Users" 
                        value={defaultMetrics.users.toLocaleString('en-IN')} 
                        delta={null} 
                        subtitle={subtitles.users || undefined}
                      />
                      <LiveMetricCard 
                        title="Monthly Burn" 
                        value={`₹${defaultMetrics.burnRate.toLocaleString('en-IN')}`} 
                        delta={null} 
                        subtitle={subtitles.burnRate || undefined}
                      />
                      <LiveMetricCard 
                        title="Market Share" 
                        value={`${defaultMetrics.marketShare}%`} 
                        delta={null} 
                        subtitle={subtitles.marketShare || undefined}
                      />
                    </div>
                  );
                })()}



              </div>

              {/* Right Column: Validation & Chart */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* ZONE 2: Validation Score */}
                {startup?.validation_score ? (
                  <ValidationScore 
                    score={startup.validation_score} 
                    onRecalculate={handleRecalculateScore}
                    isRecalculating={isRecalculating}
                  />
                ) : blueprint ? (
                  <div className="w-full rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl p-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">AI Validation Score</h3>
                      <p className="text-zinc-500 text-sm">Analyze your generated blueprint to get an objective score.</p>
                    </div>
                    <button 
                      onClick={handleValidateStartup}
                      disabled={validating}
                      className="px-5 py-2.5 bg-white text-black font-medium rounded-full transition-all disabled:opacity-50 hover:bg-neutral-200"
                    >
                      {validating ? "Analyzing..." : "Analyze this startup"}
                    </button>
                  </div>
                ) : (
                  <div className="w-full rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
                    <h3 className="text-white font-medium mb-1">Generate Blueprint first</h3>
                    <p className="text-zinc-500 text-sm">You need a completed blueprint before the AI can validate your startup idea.</p>
                  </div>
                )}



                {/* Additional Section: Active Debates */}
                {activeDebate && (
                  <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
                      <h2 className="text-sm font-medium text-white flex items-center gap-2">
                        <MessageSquare size={16} className="text-zinc-400" />
                        Latest Executive Debate
                      </h2>
                    </div>
                    <div className="p-6">
                      <DebatePanel debate={activeDebate} loading={loadingDebate} />
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Loading Overlay inside content area */}
          {isGenerating && (
            <div className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 rounded-lg">
              {/* Spinner */}
              <div className="w-8 h-8 rounded-full border border-zinc-700 border-t-white animate-spin" />
              
              {/* Status text */}
              <div className="text-center">
                <p className="text-sm text-white">
                  {statusMessages[generatingStep]}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  This takes about 20-30 seconds
                </p>
              </div>
              
              {/* Agent progress list */}
              <div className="flex flex-col gap-2">
                {agentSteps.map((agent, index) => (
                  <div key={agent} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      generatingStep >= index + 1
                        ? 'bg-white' 
                        : 'bg-zinc-700'
                    }`} />
                    <span className={`text-xs ${
                      generatingStep >= index + 1
                        ? 'text-white'
                        : 'text-zinc-600'
                    }`}>
                      {agent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <DeleteStartupModal
        isOpen={deleteModal.isOpen}
        startupName={deleteModal.startupName}
        startupId={deleteModal.startupId}
        onClose={() => setDeleteModal({ isOpen: false, startupName: '', startupId: '' })}
        onDeleted={() => router.push("/my-startups")}
      />

        {toast && (
          <div className="fixed bottom-6 right-6 bg-[#111111] border border-white/[0.07] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium">{toast}</p>
          </div>
        )}

        {/* Share Modal */}
        {shareData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button onClick={() => setShareData(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">✕</button>
              <h3 className="text-xl font-semibold text-white mb-2">Share your Blueprint</h3>
              <p className="text-[#666666] text-sm mb-6">Anyone with this link can view your startup's validation score and AI-generated blueprint.</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 bg-black border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-sm text-[#aaaaaa] truncate select-all">
                  {shareUrl}
                </div>
                <button onClick={handleCopy} className="bg-white text-black hover:bg-neutral-200 rounded-xl px-4 py-3 h-auto">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] font-medium py-3 text-white rounded-xl">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-sans">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  );
}

// Subcomponents

function LiveMetricCard({
  title,
  value,
  delta,
  subtitle,
}: {
  title: string;
  value: string;
  delta: { value: string; positive: boolean } | null;
  subtitle?: string;
}) {
  return (
    <div className="p-4 border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl rounded-xl flex flex-col justify-between h-28">
      <span className="text-xs text-zinc-400 font-medium">{title}</span>
      <div>
        <div className="text-xl font-semibold text-white tracking-tight">{value}</div>
        {delta && (
          <div className={`text-xs mt-1 ${delta.positive ? "text-zinc-300" : "text-zinc-500"}`}>
            {delta.value}
          </div>
        )}
        {subtitle && !delta && (
          <div className="text-xs mt-1 text-zinc-500">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
