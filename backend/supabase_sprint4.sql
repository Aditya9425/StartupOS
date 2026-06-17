-- Sprint 4: Add debates table
CREATE TABLE IF NOT EXISTS public.debates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    event_type TEXT NOT NULL,
    marketing_argument TEXT,
    finance_argument TEXT,
    product_argument TEXT,
    engineering_argument TEXT,
    ceo_decision TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create an index for faster queries by startup_id
CREATE INDEX IF NOT EXISTS idx_debates_startup_id ON public.debates(startup_id);

-- Disable Row Level Security (RLS) so the API can insert/read records using the anon key
ALTER TABLE public.debates DISABLE ROW LEVEL SECURITY;
