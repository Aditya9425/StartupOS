"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const isPublicRoute = 
      pathname === "/" ||
      pathname === "/auth" ||
      pathname === "/auth/reset" ||
      pathname === "/auth/update-password" ||
      pathname.startsWith("/blueprint/");

    if (isPublicRoute) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setAuthenticated(false);
            setLoading(false);
            const redirectPath = window.location.pathname + window.location.search;
            router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
          }
          return;
        }

        if (mounted) {
          setAuthenticated(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          setAuthenticated(false);
          setLoading(false);
          const redirectPath = window.location.pathname + window.location.search;
          router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
        }
      }
    }

    checkAuth();

    // Subscribe to auth state changes to handle logout/login events dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const currentPath = window.location.pathname;
      const isPublicRoute = 
        currentPath === "/" ||
        currentPath === "/auth" ||
        currentPath === "/auth/reset" ||
        currentPath === "/auth/update-password" ||
        currentPath.startsWith("/blueprint/");
        
      if (isPublicRoute) return;
      
      if (event === "SIGNED_OUT" || !session) {
        setAuthenticated(false);
        setLoading(false);
        const redirectPath = window.location.pathname + window.location.search;
        router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      } else if (session) {
        setAuthenticated(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {/* Elegant monochrome spinner */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-neutral-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono animate-pulse">
            Verifying Session
          </span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Return loading state or null while redirecting to prevent flash of content
    return null;
  }

  return <>{children}</>;
}
