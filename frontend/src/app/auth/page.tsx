"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/my-startups";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const token = session.access_token;
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${API_URL}/api/startup/my-startups`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const startups = await res.json();
          if (startups && startups.length > 0) {
            router.push("/my-startups");
          } else {
            router.push("/onboarding");
          }
        } catch {
          router.push("/my-startups");
        }
      }
    });
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // If email confirmation is off, Supabase logs user in immediately
        if (data.session) {
          router.push("/onboarding");
        } else {
          // If email confirmation is ON, notify user
          setSuccessMessage("Registration successful! Please check your email for the confirmation link.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.session) {
          const token = data.session.access_token;
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/startup/my-startups`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            const startups = await res.json();
            if (startups && startups.length > 0) {
              router.push("/my-startups");
            } else {
              router.push("/onboarding");
            }
          } catch {
            router.push("/my-startups");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred during Google sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl border border-neutral-700 flex items-center justify-center font-bold text-lg bg-neutral-900 mb-4 text-white">
            S
          </div>
          <h1 className="text-2xl font-semibold text-white font-sans tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-mono">
            {isSignUp ? "Join StartupOS" : "Access your workspace"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-xs text-red-400 font-mono"
            >
              {error}
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-mono"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founders@startup.io"
              className="w-full h-11 px-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Password</label>
              {!isSignUp && (
                <button 
                  type="button"
                  onClick={() => router.push("/auth/reset")}
                  className="text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 bg-white hover:bg-neutral-200 text-black rounded-xl font-medium text-sm transition-all mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#070707] px-2 text-neutral-500 font-mono">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full h-11 border-neutral-800 hover:border-neutral-700 bg-transparent hover:bg-neutral-900/40 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#070707] flex items-center justify-center">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border border-neutral-800"></div>
          <div className="absolute inset-0 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
