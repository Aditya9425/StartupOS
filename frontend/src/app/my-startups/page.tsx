"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, ShieldCheck, HelpCircle, LayoutGrid, LogOut, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/auth";
import DeleteStartupModal from "@/components/DeleteStartupModal";

interface Startup {
  id: string;
  name: string;
  idea: string;
  status: string;
  validation_score: {
    score?: number;
    explanation?: string;
  } | null;
  created_at: string;
}

export default function MyStartups() {
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    startupName: '',
    startupId: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth");
          return;
        }

        const user = session.user;
        if (user) {
          setUserEmail(user.email || null);
        }

        const token = session.access_token;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/startup/my-startups`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStartups(data || []);
        }
      } catch (err) {
        console.error("Failed to load startups:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleDeleteClick = (e: React.MouseEvent, startup: Startup) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      startupName: startup.name || 'Untitled Startup',
      startupId: startup.id
    });
  };

  const handleDeleted = () => {
    setStartups(prev => prev.filter(s => s.id !== deleteModal.startupId));
    setDeleteModal({ isOpen: false, startupName: '', startupId: '' });
    setToast("Startup deleted successfully");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 border-b border-neutral-900 bg-black/60 backdrop-blur-md sticky top-0">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-neutral-800 flex items-center justify-center font-bold text-sm bg-neutral-900">
                S
              </div>
              <span className="font-semibold text-sm tracking-wide font-mono uppercase">StartupOS</span>
            </div>
            <div className="flex items-center gap-4">
              {userEmail && (
                <span className="text-xs text-neutral-500 font-mono hidden md:inline">{userEmail}</span>
              )}
              <button 
                onClick={handleSignOut}
                className="text-neutral-400 hover:text-white p-2 rounded-lg border border-transparent hover:border-neutral-800 hover:bg-neutral-900/50 transition-all"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">My Startups</h1>
              <p className="text-sm text-neutral-500 mt-1">Select an active workspace or launch a new venture.</p>
            </div>
            {startups.length > 0 && (
              <Button 
                onClick={() => router.push("/onboarding")}
                className="bg-white hover:bg-neutral-200 text-black rounded-xl font-medium text-sm gap-2 h-11 px-5"
              >
                <Plus size={16} />
                Launch New Startup
              </Button>
            )}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border border-neutral-900"></div>
                <div className="absolute inset-0 rounded-full border border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
            </div>
          ) : startups.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-12 text-center max-w-lg mx-auto mt-12 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-center mx-auto mb-6 text-neutral-400">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-lg font-medium text-white">No startups yet</h3>
              <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">
                Launch your first one to configure your AI executive team.
              </p>
              <Button 
                onClick={() => router.push("/onboarding")}
                className="bg-white hover:bg-neutral-200 text-black rounded-xl font-medium text-sm mt-8 gap-2 h-11 px-6"
              >
                Launch your first one
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startups.map((startup, idx) => {
                const score = startup.validation_score?.score;
                return (
                  <motion.div
                    key={startup.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group border border-neutral-900 bg-neutral-950/40 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-all backdrop-blur-sm relative cursor-pointer"
                    onClick={() => router.push(`/dashboard?id=${startup.id}`)}
                  >
                    {/* Delete button top right */}
                    <button
                      className="absolute top-3 right-3 text-zinc-700 hover:text-zinc-400 transition-colors z-10"
                      title="Delete startup"
                      onClick={(e) => handleDeleteClick(e, startup)}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4 pr-6">
                        <h2 className="font-semibold text-lg text-white group-hover:text-neutral-200 transition-colors">
                          {startup.name || "Untitled Startup"}
                        </h2>
                      </div>
                      
                      {/* Score moved below title to make room for trash icon */}
                      <div className="mb-4">
                        {score !== undefined ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono">
                            <ShieldCheck size={13} className={score >= 70 ? "text-emerald-400" : "text-amber-400"} />
                            <span>Score: {score}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-900 bg-neutral-900/10 text-xs text-neutral-500 font-mono">
                            <HelpCircle size={13} />
                            <span>No Score</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-neutral-400 line-clamp-3 mb-6 font-sans leading-relaxed">
                        {startup.idea}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="border-t border-neutral-900/80 pt-4 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">
                          {startup.status.replace("_", " ")}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-xs font-medium text-white group-hover:text-neutral-300 transition-all">
                          Open Dashboard
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <DeleteStartupModal
        isOpen={deleteModal.isOpen}
        startupName={deleteModal.startupName}
        startupId={deleteModal.startupId}
        onClose={() => setDeleteModal({ isOpen: false, startupName: '', startupId: '' })}
        onDeleted={handleDeleted}
      />

      {/* Success Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 border border-zinc-800 text-white text-xs px-4 py-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}
    </AuthGuard>
  );
}
