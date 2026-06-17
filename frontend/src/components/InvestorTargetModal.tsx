"use client";

import React, { useState } from "react";
import { User, Building, Rocket, Briefcase, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface InvestorTargetData {
  investor_type: string;
  funding_amount: string;
  current_stage: string;
  traction: string;
}

interface InvestorTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: InvestorTargetData) => void;
  initialData?: Partial<InvestorTargetData>;
}

export default function InvestorTargetModal({ isOpen, onClose, onGenerate, initialData }: InvestorTargetModalProps) {
  const [investorType, setInvestorType] = useState(initialData?.investor_type || "");
  const [fundingAmount, setFundingAmount] = useState(initialData?.funding_amount || "Under $50,000");
  const [currentStage, setCurrentStage] = useState(initialData?.current_stage || "Idea stage");
  const [traction, setTraction] = useState(initialData?.traction || "");

  if (!isOpen) return null;

  const investorCards = [
    { id: "Angel Investor", icon: User, desc: "Individual investor, pre-seed to seed stage" },
    { id: "Venture Capital", icon: Building, desc: "Institutional fund, seed to Series A+" },
    { id: "Accelerator / Incubator", icon: Rocket, desc: "YC, Techstars, or similar program" },
    { id: "Strategic / Corporate", icon: Briefcase, desc: "Corporate investor or strategic partner" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Who are you pitching to?</h2>
            <p className="text-sm text-zinc-400 mb-6">We'll customize your deck for your specific investor type</p>

            {/* STEP 1: Investor Type */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                {investorCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setInvestorType(card.id)}
                    className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-all ${
                      investorType === card.id 
                        ? "border-white bg-white/[0.06]" 
                        : "border-zinc-700 bg-transparent hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <card.icon size={18} className={investorType === card.id ? "text-white" : "text-zinc-400"} />
                      <span className={`font-semibold text-sm ${investorType === card.id ? "text-white" : "text-zinc-300"}`}>{card.id}</span>
                    </div>
                    <span className="text-xs text-zinc-500 leading-snug">{card.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: Funding Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">How much are you raising?</label>
                <select
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="Under $50,000">Under $50,000</option>
                  <option value="$50,000 - $250,000">$50,000 - $250,000</option>
                  <option value="$250,000 - $1M">$250,000 - $1M</option>
                  <option value="$1M - $5M">$1M - $5M</option>
                  <option value="$5M+">$5M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Current stage?</label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="Pre-idea">Pre-idea</option>
                  <option value="Idea stage">Idea stage</option>
                  <option value="MVP built">MVP built</option>
                  <option value="Early revenue">Early revenue</option>
                  <option value="Scaling">Scaling</option>
                </select>
              </div>
            </div>

            {/* STEP 3: Current Traction */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Any existing traction?</label>
              <input
                type="text"
                value={traction}
                onChange={(e) => setTraction(e.target.value)}
                placeholder="e.g. 50 beta users, $2,000 MRR, 3 LOIs from customers"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors mb-1.5"
              />
              <p className="text-xs text-zinc-500">Leave blank if none yet — we'll frame it appropriately</p>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onGenerate({ investor_type: investorType || "Angel Investor", funding_amount: fundingAmount, current_stage: currentStage, traction })}
                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Generate Deck &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
