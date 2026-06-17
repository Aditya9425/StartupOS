-- Sprint 2: Add blueprint JSONB column to startups table
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS blueprint JSONB;
