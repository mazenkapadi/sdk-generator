-- Phase 9: Semantic Search with pgvector
-- Enable vector similarity search using OpenAI embeddings

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to endpoints
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_endpoints_embedding ON endpoints USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

COMMENT ON COLUMN endpoints.embedding IS 'OpenAI embedding vector for semantic search (1536 dimensions)';

-- Function to search endpoints by semantic similarity
CREATE OR REPLACE FUNCTION search_endpoints_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  api_id uuid,
  method text,
  path text,
  summary text,
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.api_id,
    e.method,
    e.path,
    e.summary,
    e.description,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM endpoints e
  WHERE e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_endpoints_semantic IS 'Semantic search for endpoints using cosine similarity';

-- Table for search queries and analytics
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER,
  selected_endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_created ON search_queries(created_at DESC);

COMMENT ON TABLE search_queries IS 'Logs search queries for analytics and improvement';
