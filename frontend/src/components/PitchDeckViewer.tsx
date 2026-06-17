"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, MonitorPlay, MessageSquareText, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PitchDeckSlide, { SlideData } from "./PitchDeckSlide";

interface PitchDeckViewerProps {
  slides: SlideData[] | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  hasBlueprint: boolean;
}

export default function PitchDeckViewer({ slides, onGenerate, isGenerating, hasBlueprint }: PitchDeckViewerProps) {
  const [mode, setMode] = useState<"slideshow" | "grid">("slideshow");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Swipe support
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "slideshow" || !slides) return;
      if (e.key === "ArrowRight") {
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, slides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !slides) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (diff > 50) { // Swipe left (next)
      setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
    } else if (diff < -50) { // Swipe right (prev)
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    touchStartX.current = null;
  };

  const handleConfirmRegenerate = async () => {
    setShowConfirmModal(false);
    setCurrentIndex(0);
    await onGenerate();
  };

  if (isGenerating) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center border border-[rgba(255,255,255,0.07)] bg-[#111111] rounded-2xl">
        <Loader2 size={32} className="text-white animate-spin mb-4" />
        <h3 className="text-white font-medium text-lg mb-2">Generating Pitch Deck...</h3>
        <p className="text-[#666666] text-sm text-center max-w-sm">
          Our agents are analyzing your blueprint, formatting investor narrative, and crafting 10 professional slides.
        </p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.07)] bg-[#111111] rounded-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
          <MonitorPlay size={28} className="text-[#888888]" />
        </div>
        <h2 className="text-white font-bold text-2xl mb-2">Investor Pitch Deck</h2>
        <p className="text-[#888888] mb-8 text-center max-w-md">
          Our agents will create a 10-slide investor-ready deck from your blueprint.
        </p>
        
        {hasBlueprint ? (
          <button 
            onClick={onGenerate}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Generate Pitch Deck &rarr;
          </button>
        ) : (
          <div className="px-6 py-3 bg-zinc-800/50 border border-zinc-700 text-zinc-400 font-semibold rounded-lg cursor-not-allowed">
            Generate blueprint first
          </div>
        )}
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full flex flex-col gap-6 relative">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-lg p-1">
          <button
            onClick={() => setMode("slideshow")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "slideshow" ? "bg-white text-black shadow-sm" : "text-[#888888] hover:text-white"
            }`}
          >
            <MonitorPlay size={16} /> Slideshow
          </button>
          <button
            onClick={() => setMode("grid")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "grid" ? "bg-white text-black shadow-sm" : "text-[#888888] hover:text-white"
            }`}
          >
            <LayoutGrid size={16} /> Overview
          </button>
        </div>
        
        {mode === "slideshow" && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                showNotes ? "bg-white/10 text-white border-white/20" : "bg-[#111111] text-[#888888] border-[rgba(255,255,255,0.07)] hover:text-white"
              }`}
            >
              <MessageSquareText size={16} /> {showNotes ? "Hide Notes" : "Show Notes"}
            </button>
            <div className="text-white font-mono text-sm bg-[#111111] border border-[rgba(255,255,255,0.07)] px-3 py-1.5 rounded-md">
              {currentIndex + 1} / {slides.length}
            </div>
          </div>
        )}
      </div>

      {mode === "slideshow" ? (
        <div className="flex flex-col gap-4">
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
            />
          </div>

          <div 
            className="relative flex items-center justify-center min-h-[400px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="absolute left-0 z-10 p-3 rounded-full bg-black/50 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:border-white/30 transition-all -ml-4 md:-ml-6"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="w-full px-8 md:px-12">
              <PitchDeckSlide slide={currentSlide} />
            </div>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))}
              disabled={currentIndex === slides.length - 1}
              className="absolute right-0 z-10 p-3 rounded-full bg-black/50 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:border-white/30 transition-all -mr-4 md:-mr-6"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Speaker Notes Drawer */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="bg-[#111111] border-l-2 border-[#444444] p-6 rounded-r-xl max-w-4xl mx-auto mt-4 w-full">
                  <div className="text-[10px] uppercase tracking-widest text-[#888888] font-bold mb-2">Speaker Note</div>
                  <p className="text-[#aaaaaa] italic text-sm leading-relaxed">{currentSlide.speaker_note || "No speaker notes provided for this slide."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 mt-8 overflow-x-auto pb-4">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-20 h-14 shrink-0 rounded-md border-2 overflow-hidden transition-all bg-[#111111] flex items-center justify-center ${
                  currentIndex === i ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-500">{s.number}</span>
              </button>
            ))}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {slides.map((s, i) => (
            <div key={i} onClick={() => { setCurrentIndex(i); setMode("slideshow"); }}>
              <PitchDeckSlide slide={s} isGridMode />
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[rgba(255,255,255,0.1)] p-8 rounded-2xl max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Regenerate pitch deck?</h3>
              <p className="text-[#888888] mb-8 text-sm leading-relaxed">
                This will replace your current deck using your latest blueprint and competitor data.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-[#aaaaaa] hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRegenerate}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors text-sm font-medium rounded-lg shadow-sm"
                >
                  Regenerate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden button exposed via ref/props for the topbar to trigger regeneration */}
      <button 
        id="trigger-regenerate-modal" 
        className="hidden" 
        onClick={() => setShowConfirmModal(true)}
      />

    </div>
  );
}
