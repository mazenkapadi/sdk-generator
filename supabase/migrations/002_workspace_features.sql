-- Phase 2: Multi-API Workspace Features
-- Add tags, favorites, and recently viewed tracking

-- Add tags column to apis table
ALTER TABLE apis ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_apis_tags ON apis USING GIN(tags);

-- Add is_favorite column to apis (simple approach without separate table)
ALTER TABLE apis ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_apis_favorite ON apis(is_favorite) WHERE is_favorite = true;

-- Add view tracking columns
ALTER TABLE apis ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_apis_last_viewed ON apis(last_viewed_at DESC NULLS LAST);

-- Add metadata for better organization
ALTER TABLE apis ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS environment TEXT; -- dev, staging, prod
CREATE INDEX IF NOT EXISTS idx_apis_environment ON apis(environment);

-- Comments for documentation
COMMENT ON COLUMN apis.tags IS 'Array of tags for categorizing APIs (e.g., internal, public, beta)';
COMMENT ON COLUMN apis.is_favorite IS 'Whether this API is marked as favorite';
COMMENT ON COLUMN apis.last_viewed_at IS 'Timestamp of last view for recently viewed tracking';
COMMENT ON COLUMN apis.view_count IS 'Total number of views';
COMMENT ON COLUMN apis.description IS 'User-provided description for the API';
COMMENT ON COLUMN apis.environment IS 'Deployment environment (dev, staging, prod)';
