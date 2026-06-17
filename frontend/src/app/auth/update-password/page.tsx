"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verify that the user has a valid active session (which is set by Supabase Auth reset redirection)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Invalid or expired session. Please request a new password reset link.");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccessMessage("Your password has been updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
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
            Update password
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-mono">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-xs text-red-400 font-mono">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-mono">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">New Password</label>
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
            {loading ? "Updating..." : "Save Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
