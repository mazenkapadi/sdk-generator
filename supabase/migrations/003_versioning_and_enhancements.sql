-- Phase 3: Versioning & Changelogs
-- Phase 5-6: Endpoint enhancements

-- API Versions table
CREATE TABLE IF NOT EXISTS api_versions (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    spec_data JSONB NOT NULL,
    changelog TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT,
    UNIQUE(api_id, version)
    );

CREATE INDEX IF NOT EXISTS idx_versions_api_id ON api_versions(api_id);
CREATE INDEX IF NOT EXISTS idx_versions_current ON api_versions(api_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_versions_created ON api_versions(created_at DESC);

COMMENT ON TABLE api_versions IS 'Stores different versions of API specifications with changelogs';
COMMENT ON COLUMN api_versions.spec_data IS 'Full OpenAPI specification JSON for this version';
COMMENT ON COLUMN api_versions.changelog IS 'Auto-generated or manual changelog for this version';
COMMENT ON COLUMN api_versions.is_current IS 'Whether this is the current/active version';

-- Add endpoint metadata for Phase 5-6
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS experimental BOOLEAN DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS internal BOOLEAN DEFAULT false;
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS stability TEXT; -- stable, beta, alpha, deprecated
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS rate_limit TEXT; -- e.g., "100 req/min"
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS examples JSONB; -- Multiple examples from spec
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS extensions JSONB; -- x-* custom extensions

CREATE INDEX IF NOT EXISTS idx_endpoints_deprecated ON endpoints(deprecated) WHERE deprecated = true;
CREATE INDEX IF NOT EXISTS idx_endpoints_stability ON endpoints(stability);

COMMENT ON COLUMN endpoints.deprecated IS 'Whether this endpoint is deprecated (from x-deprecated)';
COMMENT ON COLUMN endpoints.experimental IS 'Whether this endpoint is experimental (from x-experimental)';
COMMENT ON COLUMN endpoints.internal IS 'Whether this endpoint is internal-only (from x-internal)';
COMMENT ON COLUMN endpoints.stability IS 'Stability level: stable, beta, alpha, deprecated';
COMMENT ON COLUMN endpoints.rate_limit IS 'Rate limit info (from x-rate-limit)';
COMMENT ON COLUMN endpoints.examples IS 'Examples from OpenAPI spec example/examples fields';
COMMENT ON COLUMN endpoints.extensions IS 'All custom x-* extensions from the spec';

-- Guides table for Phase 8
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  guide_type TEXT NOT NULL, -- getting-started, authentication, workflows
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_ai_generated BOOLEAN DEFAULT true,
  UNIQUE(api_id, guide_type)
);

CREATE INDEX IF NOT EXISTS idx_guides_api_id ON guides(api_id);
CREATE INDEX IF NOT EXISTS idx_guides_type ON guides(guide_type);

COMMENT ON TABLE guides IS 'AI-generated guides for APIs (Getting Started, Auth, Workflows)';
COMMENT ON COLUMN guides.guide_type IS 'Type of guide: getting-started, authentication, workflows, best-practices';
COMMENT ON COLUMN guides.content IS 'Markdown content of the guide';
