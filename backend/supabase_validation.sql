-- Sprint 8: Validation Score

ALTER TABLE startups ADD COLUMN IF NOT EXISTS validation_score JSONB;
