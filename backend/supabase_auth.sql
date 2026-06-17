-- Add auth_user_id column to startups table referencing auth.users
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- 1. Enable RLS on startups
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their own startups" ON public.startups;
CREATE POLICY "Users can only see their own startups"
ON public.startups FOR ALL
USING (auth_user_id = auth.uid() OR auth_user_id IS NULL);


-- 2. Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own conversations" ON public.conversations;
CREATE POLICY "Users own conversations"
ON public.conversations FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 3. Enable RLS on debates
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own debates" ON public.debates;
CREATE POLICY "Users own debates"
ON public.debates FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 4. Enable RLS on memories
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own memories" ON public.memories;
CREATE POLICY "Users own memories"
ON public.memories FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 5. Enable RLS on competitor_analysis
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own competitor analysis" ON public.competitor_analysis;
CREATE POLICY "Users own competitor analysis"
ON public.competitor_analysis FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 6. Enable RLS on pitch_decks
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own pitch decks" ON public.pitch_decks;
CREATE POLICY "Users own pitch decks"
ON public.pitch_decks FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 7. Enable RLS on metrics
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own metrics" ON public.metrics;
CREATE POLICY "Users own metrics"
ON public.metrics FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 8. Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own events" ON public.events;
CREATE POLICY "Users own events"
ON public.events FOR ALL
USING (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);


-- 9. Enable RLS on shared_blueprints
ALTER TABLE public.shared_blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shared blueprints" ON public.shared_blueprints;
CREATE POLICY "Anyone can view shared blueprints" ON public.shared_blueprints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create shared blueprints" ON public.shared_blueprints;
CREATE POLICY "Users can create shared blueprints" ON public.shared_blueprints FOR INSERT WITH CHECK (
  startup_id IN (
    SELECT id FROM public.startups 
    WHERE auth_user_id = auth.uid() OR auth_user_id IS NULL
  )
);

-- 10. Allow public read of startups that have a shared blueprint
DROP POLICY IF EXISTS "Allow public read of shared startups" ON public.startups;
CREATE POLICY "Allow public read of shared startups"
ON public.startups FOR SELECT
USING (
  id IN (
    SELECT startup_id FROM public.shared_blueprints
  )
);
