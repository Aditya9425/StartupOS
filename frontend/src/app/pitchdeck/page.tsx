"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PitchDeckViewer from "@/components/PitchDeckViewer";
import PitchDeckPDF from "@/components/PitchDeckPDF";
import { formatDistanceToNow } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/auth";
import { completeStep } from "@/lib/steps";
import InvestorTargetModal, { InvestorTargetData } from "@/components/InvestorTargetModal";

function PitchDeckPageContent() {
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [validationScore, setValidationScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetData, setTargetData] = useState<InvestorTargetData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!startupId) {
        setLoading(false);
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        // Fetch startup details for PDF cover
        const startupRes = await fetch(`${API_URL}/api/startup/${startupId}`);
        if (startupRes.ok) {
          const s = await startupRes.json();
          setStartup(s);
          setValidationScore(s.validation_score || 0);
        }

        // Fetch blueprint to check if exists
        const bpRes = await fetch(`${API_URL}/api/blueprint/${startupId}`);
        if (bpRes.ok) {
          setBlueprint(await bpRes.json());
        }
        
        // Fetch deck
        const res = await fetch(`${API_URL}/api/pitchdeck/${startupId}`);
        if (res.ok) {
          const result = await res.json();
          if (result) {
            setData(result);
            if (result.investor_type) {
              setTargetData({
                investor_type: result.investor_type,
                funding_amount: result.funding_amount || "",
                current_stage: result.current_stage || "",
                traction: result.traction || "",
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startupId]);

  const handleGenerate = async (tData: InvestorTargetData) => {
    if (!startupId) return;
    setShowTargetModal(false);
    setGenerating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const payload = {
        startup_id: startupId,
        investor_type: tData.investor_type,
        funding_amount: tData.funding_amount,
        current_stage: tData.current_stage,
        traction: tData.traction
      };
      const res = await fetch(`${API_URL}/api/pitchdeck/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        setData({ ...result, created_at: new Date().toISOString() });
        setTargetData(tData);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await completeStep(startupId, "pitchdeck", session.access_token);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!data || !startup) return;
    setDownloading(true);
    try {
      const tagline = blueprint?.blueprint?.ceo?.mission_statement?.split('.')[0] || "We are building the future.";
      
      const doc = <PitchDeckPDF 
        startupName={startup.name} 
        tagline={tagline} 
        validationScore={validationScore} 
        slides={data.slides} 
      />;
      
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${startup.name.replace(/\s+/g, '-').toLowerCase()}-pitch-deck.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      
    } catch (e) {
      console.error("Error generating PDF:", e);
    } finally {
      setDownloading(false);
    }
  };

  const triggerRegenerateConfirm = () => {
    setShowTargetModal(true);
  };

  if (!startupId) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeRoute="pitchdeck" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No startup selected</h2>
            <p className="text-[#666666]">Please select a startup from the dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeRoute="pitchdeck" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse w-12 h-12 rounded-xl bg-zinc-800" />
        </main>
      </div>
    );
  }

  const timeAgo = data?.created_at ? formatDistanceToNow(new Date(data.created_at), { addSuffix: true }) : null;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar activeRoute="pitchdeck" />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-[rgba(255,255,255,0.07)] px-8 flex items-center justify-between shrink-0 bg-[#0A0A0A]">
          <div>
            <h1 className="font-semibold flex items-center gap-3">
              Investor Pitch Deck
              {timeAgo && <span className="text-[#666666] text-xs font-normal">Last generated {timeAgo}</span>}
            </h1>
            {targetData && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-zinc-500">
                  Optimized for: {targetData.investor_type} · Raising: {targetData.funding_amount} · Stage: {targetData.current_stage}
                </p>
                <button 
                  onClick={() => setShowTargetModal(true)}
                  className="text-xs text-[#aaaaaa] hover:text-white transition-colors"
                >
                  Retarget &rarr;
                </button>
              </div>
            )}
          </div>
          
          {data && (
            <div className="flex items-center gap-3">
              <button 
                onClick={triggerRegenerateConfirm} 
                disabled={generating || downloading}
                className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#aaaaaa] hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
              <button 
                onClick={handleDownload} 
                disabled={generating || downloading}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <PitchDeckViewer 
              slides={data?.slides || null} 
              onGenerate={async () => { setShowTargetModal(true); }} 
              isGenerating={generating} 
              hasBlueprint={!!blueprint}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-black font-medium px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2"
          >
            <span>Pitch deck downloaded — good luck with your investors! 🚀</span>
          </motion.div>
        )}
      </AnimatePresence>

      <InvestorTargetModal 
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        onGenerate={handleGenerate}
        initialData={targetData || undefined}
      />

    </div>
  );
}

import { AuthGuard } from "@/components/AuthGuard";

export default function PitchDeckPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <PitchDeckPageContent />
      </Suspense>
    </AuthGuard>
  );
}
