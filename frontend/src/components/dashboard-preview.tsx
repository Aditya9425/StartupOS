"use client";

import { TrendingUp, Users, Activity, Circle } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-border/60 p-2 backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 sm:p-6 overflow-hidden relative">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full border border-border/60 bg-secondary/50" />
            <div className="w-2.5 h-2.5 rounded-full border border-border/60 bg-secondary/50" />
            <div className="w-2.5 h-2.5 rounded-full border border-border/60 bg-secondary/50" />
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            startupos / live-dashboard
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Runway" value="18 mo" icon={TrendingUp} />
          <MetricCard label="Active Users" value="12.4k" icon={Users} />
          <MetricCard label="Burn Rate" value="$48k/mo" icon={Activity} />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          {/* Chart card */}
          <div className="md:col-span-3 rounded-xl border border-border/40 bg-secondary/30 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium">Revenue trajectory</h3>
              <span className="text-xs text-muted-foreground font-medium">+24% MoM</span>
            </div>
            <div className="h-28 flex items-end gap-1.5 w-full">
              {[38,52,44,66,58,74,62,88,80,96,84,100].map((val, i, arr) => (
                <div 
                  key={i} 
                  className="flex-1 rounded-sm bg-foreground/70"
                  style={{ 
                    height: `${val}%`,
                    opacity: 0.25 + (0.75 * (i / (arr.length - 1)))
                  }}
                />
              ))}
            </div>
          </div>

          {/* Agents card */}
          <div className="md:col-span-2 rounded-xl border border-border/40 bg-secondary/30 p-5">
            <h3 className="text-sm font-medium mb-4">Agents</h3>
            <div className="space-y-4">
              <AgentRow name="CEO Agent" status="Setting Q3 priorities" active />
              <AgentRow name="Product Agent" status="Refining roadmap" active />
              <AgentRow name="Growth Agent" status="Modeling CAC" />
              <AgentRow name="Finance Agent" status="Reviewing burn" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string, value: string, icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border/40 bg-secondary/30 p-5 flex flex-col justify-between h-32">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{label}</span>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function AgentRow({ name, status, active = false }: { name: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Circle size={10} className={active ? "fill-foreground text-foreground" : "text-muted-foreground/40"} />
      <div>
        <div className="text-xs font-medium text-foreground">{name}</div>
        <div className="text-[11px] text-muted-foreground">{status}</div>
      </div>
    </div>
  );
}
