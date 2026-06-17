import React from "react";
import { ArrowRight } from "lucide-react";

export interface SlideData {
  number: number;
  title: string;
  headline: string;
  content: string;
  bullets: string[];
  speaker_note: string;
}

interface PitchDeckSlideProps {
  slide: SlideData;
  isGridMode?: boolean;
}

export default function PitchDeckSlide({ slide, isGridMode = false }: PitchDeckSlideProps) {
  if (isGridMode) {
    return (
      <div className="flex flex-col p-6 rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.07)] transition-all duration-300 hover:border-[rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer h-full min-h-[160px] group relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#666666] font-mono text-xs">{slide.number < 10 ? `0${slide.number}` : slide.number}</span>
          <span className="text-[#888888] text-xs font-semibold uppercase tracking-wider">{slide.title}</span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{slide.headline}</h3>
        
        <div className="mt-auto pt-4 flex items-center text-xs font-medium text-transparent group-hover:text-white transition-colors">
          View full slide <ArrowRight size={14} className="ml-1" />
        </div>
        
        {/* Tooltip on hover for full headline */}
        <div className="absolute inset-0 bg-[#111111] p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center border border-[rgba(255,255,255,0.2)] rounded-2xl z-10 pointer-events-none">
          <p className="text-white font-medium text-sm leading-relaxed">{slide.headline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 md:p-12 rounded-3xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.07)] transition-all duration-300 hover:border-[rgba(255,255,255,0.15)] min-h-[280px] w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[#666666] font-mono text-sm">{slide.number < 10 ? `0${slide.number}` : slide.number}</span>
        <div className="w-1 h-1 rounded-full bg-[#444444]" />
        <span className="text-[#888888] text-sm font-semibold uppercase tracking-wider">{slide.title}</span>
      </div>
      
      <h2 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-6">
        {slide.headline}
      </h2>
      
      {slide.content && (
        <p className="text-[#aaaaaa] text-lg leading-relaxed mb-8 max-w-3xl">
          {slide.content}
        </p>
      )}
      
      {slide.bullets && slide.bullets.length > 0 && (
        <div className="mt-auto">
          <ul className="flex flex-col gap-4">
            {slide.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ArrowRight size={20} className="text-white shrink-0 mt-0.5" />
                <span className="text-white text-lg">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
