-- Sprint 6: Add Memory System

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL, -- 'decision', 'outcome', 'event'
    content TEXT NOT NULL,
    embedding vector(384), -- using sentence-transformers all-MiniLM-L6-v2
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON public.memories 
USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_memories_startup_id ON public.memories(startup_id);

-- Disable Row Level Security (RLS) so the API can insert/read records using the anon key
ALTER TABLE public.memories DISABLE ROW LEVEL SECURITY;

-- Create the RPC function for similarity search
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(384),
  match_startup_id uuid,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  memory_type text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.content,
    memories.memory_type,
    memories.metadata,
    1 - (memories.embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE memories.startup_id = match_startup_id
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
