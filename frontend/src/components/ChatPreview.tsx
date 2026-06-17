"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

interface ChatPreviewProps {
  startupId: string;
}

export default function ChatPreview({ startupId }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/chat/${startupId}`);
        if (res.ok) {
          const data = await res.json();
          // Get the last 2 messages from history
          const history = data.history || [];
          setMessages(history.slice(-2));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (startupId) fetchHistory();
  }, [startupId]);

  if (messages.length === 0) {
    return (
      <div className="w-full bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <MessageCircle size={18} className="text-[#888888]" />
          </div>
          <div>
            <h3 className="text-white font-medium">Ask your agents</h3>
            <p className="text-[#666666] text-sm">Have follow-up questions about your blueprint?</p>
          </div>
        </div>
        <Link href={`/chat?id=${startupId}`} className="flex items-center gap-2 text-sm text-white hover:text-[#aaaaaa] transition-colors">
          Start conversation <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center bg-[#0A0A0A]">
        <h2 className="font-medium text-white flex items-center gap-2 text-sm">
          <MessageCircle size={16} className="text-[#888888]" />
          Recent Chat
        </h2>
        <Link href={`/chat?id=${startupId}`} className="flex items-center gap-1 text-xs text-[#888888] hover:text-white transition-colors">
          Continue conversation <ArrowRight size={12} />
        </Link>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] text-[#666666] font-medium uppercase tracking-wider">
              {msg.role === "user" ? "You" : msg.agent_name}
            </span>
            <div className={`text-sm ${msg.role === "user" ? "text-[#aaaaaa]" : "text-white"} truncate`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
