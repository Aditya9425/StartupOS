"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/auth";

export function Navbar() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl h-16 flex items-center justify-between px-6">
        {/* Left: logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <div className="w-6 h-6 rounded-md border border-border flex items-center justify-center font-bold text-xs bg-secondary/50">
            S
          </div>
          <span className="text-base font-semibold">StartupOS</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-4">
          {hasSession === null ? (
            null
          ) : hasSession ? (
            <>
              <Button 
                variant="ghost"
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = "/my-startups"}
              >
                My Startups
              </Button>
              <Button 
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6 font-medium"
                onClick={() => window.location.href = "/my-startups"}
              >
                Go to Dashboard →
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = "/auth"}
              >
                Sign in
              </Button>
              <Button 
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6"
                onClick={() => window.location.href = "/auth"}
              >
                Launch Startup →
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
