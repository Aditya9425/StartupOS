-- Sprint 9: Shareable Blueprints

CREATE TABLE IF NOT EXISTS shared_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id),
  share_token TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0
);
