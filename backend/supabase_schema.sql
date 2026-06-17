-- Supabase Schema for StartupOS

-- Create startups table
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    idea TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'created' NOT NULL
);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (can restrict later when auth is added)
CREATE POLICY "Allow all operations for now" ON public.startups FOR ALL USING (true);
