"use client";

import { motion } from "framer-motion";
import { MessageSquare, Radio, Brain } from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Multi-Agent Debates",
    body: "Specialized agents argue strategy, challenge assumptions, and reach consensus — just like a real founding team.",
  },
  {
    icon: Radio,
    title: "Live Execution",
    body: "Watch your company evolve in real time as agents execute decisions, ship features, and respond to the market.",
  },
  {
    icon: Brain,
    title: "Adaptive Memory",
    body: "Every decision is remembered. Agents learn from past outcomes and adapt their strategy as your startup grows.",
  }
];

export function Features() {
  return (
    <section className="px-6 py-24 mx-auto max-w-6xl">
      <div className="max-w-2xl mb-16 mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Built to run on its own.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          A complete autonomous operating system for your startup, powered by coordinated AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl border border-border/60 p-6 backdrop-blur-xl group hover:border-foreground/25 transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="w-11 h-11 rounded-xl border border-border/40 bg-secondary/50 flex items-center justify-center mb-6">
              <feature.icon size={20} className="text-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
