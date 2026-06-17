-- Sprint 7: Onboarding Wizard

ALTER TABLE startups ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS challenges TEXT[];
ALTER TABLE startups ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE startups ADD COLUMN IF NOT EXISTS problem_statement TEXT;
