"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border border-neutral-800"></div>
          <div className="absolute inset-0 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />

      {/* Closing CTA */}
      <section className="px-6 pb-32 pt-12">
        <div 
          className="mx-auto max-w-3xl rounded-3xl border border-border/60 px-8 py-16 text-center backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Launch a startup that runs itself.
          </h2>
          <p className="mt-4 mb-8 text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Spin up your autonomous founding team in seconds. No setup required.
          </p>
          <Button 
            className="h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 font-medium group"
            onClick={() => window.location.href = "/auth"}
          >
            Launch Startup
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10 mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md border border-border flex items-center justify-center font-bold text-xs bg-secondary/50">
            S
          </div>
          <span className="text-sm font-semibold">StartupOS</span>
        </div>
        <div className="text-xs text-muted-foreground">
        </div>
      </footer>
    </main>
  );
}
