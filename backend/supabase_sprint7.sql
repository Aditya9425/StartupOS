-- Sprint 7: Competitor Analysis Overhaul

-- Add Indian and Global competitors columns
ALTER TABLE public.competitor_analysis 
  ADD COLUMN IF NOT EXISTS indian_competitors JSONB DEFAULT '[]'::jsonb;
  
ALTER TABLE public.competitor_analysis 
  ADD COLUMN IF NOT EXISTS global_competitors JSONB DEFAULT '[]'::jsonb;

-- Add new analysis columns
ALTER TABLE public.competitor_analysis 
  ADD COLUMN IF NOT EXISTS india_market_gaps JSONB DEFAULT '[]'::jsonb;
  
ALTER TABLE public.competitor_analysis 
  ADD COLUMN IF NOT EXISTS global_learnings JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.competitor_analysis 
  ADD COLUMN IF NOT EXISTS india_moat TEXT;
