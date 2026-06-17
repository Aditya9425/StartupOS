"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Describe your idea",
    body: "Tell StartupOS what you want to build. A single sentence is enough to spin up your autonomous founding team.",
  },
  {
    num: "02",
    title: "Agents take over",
    body: "Your AI team plans the roadmap, debates trade-offs, and starts executing — all without you lifting a finger.",
  },
  {
    num: "03",
    title: "Watch it grow",
    body: "Track metrics, revenue, and agent decisions live. Step in to steer, or let the agents run on their own.",
  }
];

export function HowItWorks() {
  return (
    <section className="border-t border-border px-6 py-24 mx-auto max-w-6xl">
      <div className="max-w-2xl mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          How it works
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          From idea to autonomous startup in three steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border-t border-border pt-6"
          >
            <div className="text-5xl font-semibold text-muted-foreground/30 mb-4">
              {step.num}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
