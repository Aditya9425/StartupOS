"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lightbulb, Hammer, Rocket, Target, Megaphone, DollarSign, Cpu, Users, Coins } from "lucide-react";

const STAGES = [
  { id: "idea", title: "Just an idea", desc: "Haven't built anything yet", icon: Lightbulb },
  { id: "mvp", title: "Building MVP", desc: "Currently in development", icon: Hammer },
  { id: "launched", title: "Already launched", desc: "Have real users", icon: Rocket },
];

const CHALLENGES = [
  { id: "validation", title: "Idea validation", icon: Target },
  { id: "gtm", title: "Go-to-market strategy", icon: Megaphone },
  { id: "revenue", title: "Revenue model", icon: DollarSign },
  { id: "tech", title: "Technical architecture", icon: Cpu },
  { id: "customers", title: "Finding customers", icon: Users },
  { id: "funding", title: "Fundraising strategy", icon: Coins },
];

const LOADING_TEXTS = [
  "Assembling your AI team...",
  "Analyzing your market...",
  "Building your blueprint...",
  "Your startup is ready."
];

import { AuthGuard } from "@/components/AuthGuard";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validatingIdea, setValidatingIdea] = useState(false);



  useEffect(() => {
    if (!loading) return;
    
    // Cycle text every 800ms
    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        if (prev < LOADING_TEXTS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, [loading]);

  const toggleChallenge = (id: string) => {
    if (challenges.includes(id)) {
      setChallenges(challenges.filter(c => c !== id));
    } else if (challenges.length < 2) {
      setChallenges([...challenges, id]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (idea.trim().length < 20) {
        setError("Please describe your idea in at least a few sentences.");
        return;
      }
      
      setValidatingIdea(true);
      setError(null);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      try {
        const res = await fetch(`${API_URL}/api/startup/validate-idea`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.detail?.message || "Invalid idea.");
          setValidatingIdea(false);
          return;
        }
        
        const data = await res.json();
        if (!data.is_valid) {
          setError(data.reason || "Invalid idea.");
          setValidatingIdea(false);
          return;
        }
      } catch (err) {
        console.error("Validation failed", err);
      }
      setValidatingIdea(false);
    }
    
    if (step === 2 && !stage) return;
    if (step === 3 && challenges.length === 0) return;
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!audience.trim() || !problem.trim()) return;
    setLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // We start a timer to ensure minimum 3 seconds loading screen
    const minLoadPromise = new Promise(resolve => setTimeout(resolve, 3200));
    
    try {
      const apiPromise = fetch(`${API_URL}/api/create-startup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idea, 
          user_id: "default_user",
          stage,
          challenges,
          target_audience: audience,
          problem_statement: problem
        }),
      });

      const [res] = await Promise.all([apiPromise, minLoadPromise]);

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard?id=${data.startup_id}`);
      } else {
        console.error("Failed to launch startup");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center font-bold text-xl bg-secondary/50 mb-8 animate-pulse">
          S
        </div>
        <div className="h-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg text-foreground font-medium"
            >
              {LOADING_TEXTS[loadingIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar & Progress */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="h-16 flex items-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-6 h-6 rounded-md border border-border flex items-center justify-center font-bold text-xs bg-secondary/50">
              S
            </div>
            <span className="text-sm font-semibold hidden sm:inline">StartupOS</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-secondary">
          <motion.div 
            className="h-full bg-foreground" 
            initial={{ width: `${((step - 1) / 4) * 100}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-semibold tracking-tight">What's your idea?</h1>
                  <p className="text-muted-foreground text-sm">Describe your startup idea in detail so the AI team understands the vision.</p>
                  <textarea
                    value={idea}
                    onChange={(e) => {
                      setIdea(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. AI-powered food delivery for tier 2 Indian cities"
                    className="w-full h-40 p-4 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none placeholder:text-muted-foreground"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{idea.length} characters</span>
                  </div>
                  {error && (
                    <div className="text-xs text-zinc-400 mt-2">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-semibold tracking-tight">Where are you?</h1>
                  <p className="text-muted-foreground text-sm">Select the current stage of your startup.</p>
                  <div className="flex flex-col gap-3">
                    {STAGES.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setStage(s.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          stage === s.id 
                            ? "border-foreground bg-secondary/50" 
                            : "border-border bg-secondary/10 hover:bg-secondary/30"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center bg-background">
                          <s.icon size={18} className={stage === s.id ? "text-foreground" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-semibold tracking-tight">Biggest challenge?</h1>
                  <p className="text-muted-foreground text-sm">What are the main hurdles you're facing right now?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CHALLENGES.map((c) => {
                      const isSelected = challenges.includes(c.id);
                      const isDisabled = challenges.length >= 2 && !isSelected;
                      return (
                        <div
                          key={c.id}
                          onClick={() => !isDisabled && toggleChallenge(c.id)}
                          className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                            isSelected 
                              ? "border-foreground bg-secondary/50" 
                              : "border-border bg-secondary/10"
                          } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/30"}`}
                        >
                          <c.icon size={18} className={isSelected ? "text-foreground" : "text-muted-foreground"} />
                          <span className="font-medium text-sm">{c.title}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Select up to 2 challenges (max 2)</div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-semibold tracking-tight">Who are your customers?</h1>
                  <p className="text-muted-foreground text-sm">Help the AI tailor your go-to-market strategy.</p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Audience</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Urban millennials, 22-35, smartphone users in metro cities"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Main problem you're solving</label>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="Food delivery is too expensive and slow in smaller cities"
                      className="w-full h-24 p-4 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:border-foreground/40 transition-colors resize-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-border bg-background/80 backdrop-blur-md p-4 sticky bottom-0">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button 
              onClick={handleNext} 
              disabled={
                validatingIdea ||
                (step === 1 && idea.trim().length < 20) || 
                (step === 2 && !stage) || 
                (step === 3 && challenges.length === 0)
              }
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
            >
              {validatingIdea ? "Validating..." : "Continue"}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!audience.trim() || !problem.trim()}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
            >
              Launch Startup
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function Onboarding() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="h-screen w-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>}>
        <OnboardingContent />
      </Suspense>
    </AuthGuard>
  );
}
