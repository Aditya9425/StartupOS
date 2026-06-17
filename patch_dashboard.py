import re

with open("frontend/src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    '} from "@/components/ui/dropdown-menu";',
    '} from "@/components/ui/dropdown-menu";\nimport ReactMarkdown from \'react-markdown\';\nimport { Copy, Check } from "lucide-react";'
)

# 2. States
content = content.replace(
    '  const [completedSteps, setCompletedSteps] = useState<string[]>([]);',
    '  const [completedSteps, setCompletedSteps] = useState<string[]>([]);\n  const [isSharing, setIsSharing] = useState(false);\n  const [shareData, setShareData] = useState<{ token: string; views: number } | null>(null);\n  const [copied, setCopied] = useState(false);\n  const [isRecalculating, setIsRecalculating] = useState(false);'
)

# 3. useEffect cache
content = content.replace(
    'fetch(`${API_URL}/api/startup/${startupId}`)',
    'fetch(`${API_URL}/api/startup/${startupId}`, { cache: \'no-store\' })'
)

# 4. handleGenerateBlueprint refetch
refetch_logic = """      const data = await response.json();
      setBlueprint(data.blueprint);
      
      const refetchRes = await fetch(`${API_URL}/api/startup/${startupId}`, { cache: 'no-store' });
      if (refetchRes.ok) {
        const freshData = await refetchRes.json();
        setStartup(freshData);
      } else {
        setStartup({ ...startup, status: "blueprint_generated", validation_score: data.validation_score });
      }
      
      setCompletedAgents(new Set(AGENT_ORDER));
      setIsGenerating(false);
      showSuccessToast("Blueprint generated successfully!");"""

content = content.replace(
    """      const data = await response.json();
      setBlueprint(data.blueprint);
      setStartup({ ...startup, status: "blueprint_generated", validation_score: data.validation_score });
      setCompletedAgents(new Set(AGENT_ORDER));
      setIsGenerating(false);
      showSuccessToast("Blueprint generated ✓");""",
    refetch_logic
)

# 5. Add new handlers
handlers = """    } finally {
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
  const handleWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=Check out my AI-generated startup blueprint! ${encodeURIComponent(shareUrl)}`);"""

content = content.replace(
    """    } finally {
      setValidating(false);
    }
  };""",
    handlers
)

# 6. Share button
share_btn = """                                  <button 
                                    onClick={
                                      step.key === "blueprint" ? handleGenerateBlueprint : 
                                      step.key === "shared" ? handleShare : undefined
                                    }
                                    disabled={(step.key === "blueprint" && isGenerating) || (step.key === "shared" && isSharing)}
                                    className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                  >
                                    {step.key === "blueprint" && isGenerating ? 'Processing...' : 
                                     step.key === "shared" && isSharing ? 'Sharing...' : step.action}
                                  </button>"""
content = content.replace(
    """                                  <button 
                                    onClick={step.key === "blueprint" ? handleGenerateBlueprint : undefined}
                                    disabled={step.key === "blueprint" && isGenerating}
                                    className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                  >
                                    {step.key === "blueprint" && isGenerating ? 'Processing...' : step.action}
                                  </button>""",
    share_btn
)

# 7. ValidationScore props
val_score = """                  <ValidationScore 
                    score={startup.validation_score} 
                    onRecalculate={handleRecalculateScore}
                    isRecalculating={isRecalculating}
                  />"""
content = content.replace(
    """                  <ValidationScore score={startup.validation_score} />""",
    val_score
)

# 8. ReactMarkdown
md_preview = """                    <div className="text-sm text-zinc-300 leading-relaxed line-clamp-3 mb-6 prose prose-invert prose-sm max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-medium prose-li:text-zinc-400 prose-headings:text-white prose-headings:font-medium">
                      {blueprint.ceo ? (
                        <ReactMarkdown>{blueprint.ceo}</ReactMarkdown>
                      ) : (
                        "Blueprint is being generated..."
                      )}
                    </div>"""
content = content.replace(
    """                    <div className="text-sm text-zinc-300 leading-relaxed line-clamp-3 mb-6">
                      {blueprint.ceo || "Blueprint is being generated..."}
                    </div>""",
    md_preview
)

# 9. Share Modal
share_modal = """        {toast && (
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
      </main>"""
content = content.replace(
    """      {/* Success Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 border border-zinc-800 text-white text-xs px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}
    </div>""",
    share_modal + "\n    </div>"
)

with open("frontend/src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
