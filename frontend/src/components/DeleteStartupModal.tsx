import React, { useState, useRef, useEffect } from "react";
import { Trash2, Loader2, Check } from "lucide-react";

interface DeleteStartupModalProps {
  isOpen: boolean;
  startupName: string;
  startupId: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteStartupModal({
  isOpen,
  startupName,
  startupId,
  onClose,
  onDeleted,
}: DeleteStartupModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setIsDeleting(false);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = inputValue === startupName;

  const handleDelete = async () => {
    if (!isMatch || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const { supabase } = await import("@/lib/auth");
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${API_URL}/api/startup/${startupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        onDeleted();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError("Failed to delete. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-auto">
        {!success ? (
          <>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-zinc-400 w-5 h-5" />
            </div>

            <h2 className="text-base font-medium text-white text-center mb-2">
              Delete startup?
            </h2>

            <p className="text-sm text-zinc-400 text-center leading-relaxed mb-4">
              This will permanently delete this startup and all its data including blueprint, debates, memories, competitor analysis, pitch deck, and all conversations.
            </p>

            <div className="bg-zinc-950 border border-zinc-800 p-2 rounded text-center text-sm font-medium text-white mb-6">
              {startupName}
            </div>

            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-zinc-500">
                Type the startup name to confirm:
              </label>
              {isMatch && (
                <span className="text-zinc-400 text-xs flex items-center gap-1">
                  <Check size={12} /> Name confirmed
                </span>
              )}
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isDeleting}
              placeholder="Enter startup name..."
              className={`bg-zinc-950 border ${isMatch ? "border-zinc-600" : "border-zinc-800"} text-white text-sm rounded-lg p-3 w-full placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none transition-colors mb-4`}
            />

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isMatch || isDeleting}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                  ${!isMatch || isDeleting 
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-zinc-100"
                  }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Startup"
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-zinc-500 text-center mt-3">
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center">
            <p className="text-sm text-zinc-400 text-center flex items-center gap-2">
              <Check size={16} className="text-emerald-500" /> Startup deleted
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
