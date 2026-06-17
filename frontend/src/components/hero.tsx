"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";
import { supabase } from "@/lib/auth";

export function Hero() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section 
      className="relative overflow-hidden px-6 pt-36 pb-20"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        backgroundPosition: "-1px -1px"
      }}
    >
      {/* Background glow */}
      <div 
        className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
        aria-hidden="true"
        style={{
          width: "600px",
          height: "900px",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06), transparent 70%)"
        }}
      />

      <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-balance text-foreground mt-8 bg-zinc-950/50 p-2 backdrop-blur-sm rounded-3xl"
        >
          Your startup. <br /> Run by AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed bg-zinc-950/50 p-2 backdrop-blur-sm rounded-xl"
        >
          A team of AI agents that plans, debates, and executes your company strategy in real time.
        </motion.p>

        <div className="mt-10 flex flex-col items-center relative z-10">
          {hasSession === null ? (
            <div className="h-14 w-48 rounded-full bg-zinc-800 animate-pulse" />
          ) : hasSession ? (
            <Button 
              onClick={() => router.push("/my-startups")}
              className="h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 text-base font-medium group shadow-lg shadow-white/5"
            >
              Go to Dashboard
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button 
              onClick={() => router.push("/auth")}
              className="h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 text-base font-medium group shadow-lg shadow-white/5"
            >
              Launch Startup
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mx-auto max-w-5xl mt-20 relative z-10"
      >
        <DashboardPreview />
      </motion.div>
    </section>
  );
}
