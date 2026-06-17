-- Sprint 10: Ask Your Agents Chat

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id),
  role TEXT,
  agent_name TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
