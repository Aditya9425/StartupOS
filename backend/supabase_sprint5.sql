-- Sprint 5: Add metrics and events tables for simulation engine

-- Metrics table: stores snapshots of startup KPIs at each tick
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    revenue FLOAT DEFAULT 0,
    users INTEGER DEFAULT 0,
    burn_rate FLOAT DEFAULT 5000,
    market_share FLOAT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_startup_id ON public.metrics(startup_id);
ALTER TABLE public.metrics DISABLE ROW LEVEL SECURITY;

-- Events table: stores simulation events that have fired
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    impact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_startup_id ON public.events(startup_id);
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
