"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/my-startups";

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      try {
        // Wait a small moment to let Supabase client process the URL hash fragments
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!active) return;

        if (session) {
          const token = session.access_token;
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          
          const res = await fetch(`${API_URL}/api/startup/my-startups`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!active) return;

          if (res.ok) {
            const startups = await res.json();
            if (startups && startups.length > 0) {
              router.push(redirectUrl);
            } else {
              router.push("/onboarding");
            }
          } else {
            router.push(redirectUrl);
          }
        } else {
          // If no session after delay, listen to auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!active) return;
            if (session) {
              subscription.unsubscribe();
              const token = session.access_token;
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const res = await fetch(`${API_URL}/api/startup/my-startups`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (!active) return;

              if (res.ok) {
                const startups = await res.json();
                if (startups && startups.length > 0) {
                  router.push(redirectUrl);
                } else {
                  router.push("/onboarding");
                }
              } else {
                router.push(redirectUrl);
              }
            }
          });

          // Timeout after 8 seconds
          setTimeout(() => {
            if (active) {
              subscription.unsubscribe();
              router.push("/auth");
            }
          }, 8000);
        }
      } catch (error) {
        console.error("Callback processing failed:", error);
        if (active) {
          router.push("/auth");
        }
      }
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-10 h-10 mb-4">
          <div className="absolute inset-0 rounded-full border border-neutral-800"></div>
          <div className="absolute inset-0 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
          Authenticating session...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-neutral-800"></div>
          <div className="absolute inset-0 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
