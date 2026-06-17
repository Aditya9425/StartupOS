"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";

interface AgentChatProps {
  startupId: string;
  startupName: string;
  targetAudience: string;
  triggerMsg?: string;
  onTriggerProcessed?: () => void;
}

interface Message {
  id: string;
  role: "user" | "agent";
  agent_name?: string;
  message: string;
  created_at: string;
}

export default function AgentChat({ startupId, startupName, targetAudience, triggerMsg, onTriggerProcessed }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/chat/${startupId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    if (startupId) fetchHistory();
  }, [startupId]);

  // Scroll to bottom on load or new message
  useEffect(() => {
    if (!initialLoading) {
      scrollToBottom(messages.length <= 50 ? "smooth" : "auto");
    }
  }, [messages, initialLoading]);

  // Keep input focused after agent responds
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Handle external trigger
  useEffect(() => {
    if (triggerMsg) {
      handleSend(triggerMsg);
      onTriggerProcessed?.();
    }
  }, [triggerMsg]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading || !startupId) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      message: text,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId, message: text })
      });
      
      if (res.ok) {
        const data = await res.json();
        const agentResponses = data.responses || [];
        
        const newMessages = agentResponses.map((r: Record<string, string>, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          role: "agent",
          agent_name: r.agent,
          message: r.message,
          created_at: new Date().toISOString()
        }));
        
        setMessages(prev => [...prev, ...newMessages]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handlePillClick = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const name = startupName || "your startup";
  const audience = targetAudience || "your target audience";

  const suggestions = [
    `Should ${name} target B2B or B2C?`,
    `What's the right price for ${audience}?`,
    `Who are ${name}'s biggest competitors?`,
    `What should ${name} build first?`
  ];

  return (
    <div className="flex flex-col h-full min-h-[500px] w-full bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.07)] bg-[#0A0A0A]">
        <h2 className="text-white font-medium text-lg">Ask your agents</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
        {initialLoading ? (
          <div className="flex-1 flex items-center justify-center text-[#666666]">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-[#666666]" />
            </div>
            <h3 className="text-white font-medium mb-6">Ask your AI team anything</h3>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handlePillClick(s)}
                  className="px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-black text-[#aaaaaa] text-sm hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              // Stack check: if previous message was also an agent, we don't need top margin
              const isStacked = idx > 0 && messages[idx-1].role === "agent" && !isUser;
              
              if (isUser) {
                return (
                  <div key={msg.id} className="flex flex-col items-end w-full">
                    <span className="text-xs text-[#666666] mb-1 mr-1">You</span>
                    <div className="max-w-[85%] bg-black border border-[rgba(255,255,255,0.1)] rounded-2xl rounded-tr-sm px-5 py-3 text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isStacked ? "mt-[-12px]" : ""}`}>
                    {!isStacked ? (
                      <div className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] bg-zinc-800 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          {(msg.agent_name || "A")[0].toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" /> // Spacer for alignment
                    )}
                    
                    <div className="flex flex-col">
                      {!isStacked && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{msg.agent_name}</span>
                          <span className="text-xs text-[#666666]">Agent</span>
                        </div>
                      )}
                      <div className="bg-[#1A1A1A] rounded-2xl rounded-tl-sm px-5 py-3 text-[#cccccc] text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] bg-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-white">Your agents are thinking</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-2xl rounded-tl-sm px-5 py-4 w-fit">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#666666]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.07)] bg-[#0A0A0A]">
        <div className="relative flex items-end w-full max-w-3xl mx-auto bg-black border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden focus-within:border-white transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask your agents anything... (Shift+Enter for new line)"
            className="flex-1 max-h-32 min-h-[56px] py-4 pl-4 pr-12 bg-transparent text-white text-sm focus:outline-none resize-none disabled:opacity-50"
            rows={1}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 p-2 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-[#666666] transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
