# Developer Portal - Complete Implementation Guide

## Implementation Status

### ✅ Phase 1: Home Screen & Architecture (COMPLETE)
**Files Created:**
- `components/HowItWorks.tsx` - Welcome section with usage instructions and architecture cards
- Updated `app/page.tsx` - Enhanced dashboard layout

**Features:**
- Hero section with gradient text
- 3-step usage guide with color-coded badges
- 4 expandable architecture cards (Upload, Storage, AI, Documentation)
- Quick stats bar (languages, formats, AI powered)
- Smart layout (shows instructions for new users)

### ✅ Phase 2: Database Schema (COMPLETE)
**Migrations Created:**
- `supabase/migrations/002_workspace_features.sql`

**Schema Changes:**
- Added `tags` column (TEXT[]) to apis table
- Added `is_favorite` column (BOOLEAN) to apis
- Added `last_viewed_at` and `view_count` for tracking
- Added `description` and `environment` metadata
- Indexes for performance

### ✅ Phase 3: Versioning Schema (COMPLETE)
**Migrations Created:**
- `supabase/migrations/003_versioning_and_enhancements.sql`

**Schema Changes:**
- Created `api_versions` table (id, api_id, version, spec_data, changelog, is_current)
- Added endpoint metadata columns (deprecated, experimental, internal, stability, rate_limit)
- Added `examples` and `extensions` columns to endpoints
- Created `guides` table for AI-generated guides

### ✅ Phase 4-6: Endpoint Enhancements Schema (COMPLETE)
**Features in Schema:**
- Deprecation tracking
- Experimental/internal flags  
- Stability levels
- Rate limit information
- Multiple examples support
- Custom x-* extensions storage

### ✅ Phase 9: Semantic Search Schema (COMPLETE)
**Migrations Created:**
- `supabase/migrations/004_semantic_search.sql`

**Schema Changes:**
- Enabled pgvector extension
- Added `embedding` column (vector(1536)) to endpoints
- Created `search_endpoints_semantic()` function
- Created `search_queries` table for analytics
- IVFFlat index for fast similarity search

### ✅ Core Utilities Created
**Files:**
- `lib/openapi/parseEnhanced.ts` - Enhanced parser with extension support
- `components/ApiListEnhanced.tsx` - Full-featured API list with workspace features

### 🚧 Phase 2-10: Implementation Needed

## Implementation Guide by Phase

### Phase 2: Multi-API Workspace Features

#### 2.1 Tags System
```typescript
// app/api/docs/route.ts - Add to POST handler
tags: formData.get('tags')?.split(',').map(t => t.trim()) || []

// components/UploadForm.tsx - Add input field
<input
  name="tags"
  placeholder="e.g., internal, public, beta"
  className="..."
/>
```

#### 2.2 Favorites API Routes
```typescript
// app/api/docs/[id]/favorite/route.ts
export async function POST(req: Request, { params }) {
  const { id } = await params;
  await supabaseServiceClient
    .from('apis')
    .update({ is_favorite: true })
    .eq('id', id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }) {
  const { id } = await params;
  await supabaseServiceClient
    .from('apis')
    .update({ is_favorite: false })
    .eq('id', id);
  return NextResponse.json({ success: true });
}
```

#### 2.3 View Tracking
```typescript
// app/api/docs/[id]/view/route.ts
export async function POST(req: Request, { params }) {
  const { id } = await params;
  await supabaseServiceClient
    .from('apis')
    .update({
      last_viewed_at: new Date().toISOString(),
      view_count: supabaseServiceClient.raw('view_count + 1')
    })
    .eq('id', id);
  return NextResponse.json({ success: true });
}
```

### Phase 3: Versioning & Changelogs

#### 3.1 Version Storage
```typescript
// lib/versioning/compareVersions.ts
export function detectChanges(oldSpec: any, newSpec: any) {
  const changes = {
    added: [],
    modified: [],
    deprecated: [],
    removed: []
  };
  
  // Compare endpoints
  const oldPaths = Object.keys(oldSpec.paths || {});
  const newPaths = Object.keys(newSpec.paths || {});
  
  // Find added
  newPaths.filter(p => !oldPaths.includes(p)).forEach(path => {
    changes.added.push(path);
  });
  
  // Find removed
  oldPaths.filter(p => !newPaths.includes(p)).forEach(path => {
    changes.removed.push(path);
  });
  
  return changes;
}
```

#### 3.2 Version API
```typescript
// app/api/docs/[id]/versions/route.ts
export async function GET(req: Request, { params }) {
  const { id } = await params;
  const { data } = await supabaseServiceClient
    .from('api_versions')
    .select('*')
    .eq('api_id', id)
    .order('created_at', { ascending: false });
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }) {
  const { id } = await params;
  const { version, spec_data } = await req.json();
  
  // Mark previous version as not current
  await supabaseServiceClient
    .from('api_versions')
    .update({ is_current: false })
    .eq('api_id', id)
    .eq('is_current', true);
  
  // Insert new version
  await supabaseServiceClient
    .from('api_versions')
    .insert({
      api_id: id,
      version,
      spec_data,
      is_current: true
    });
  
  return NextResponse.json({ success: true });
}
```

### Phase 4: Enhanced Try-It Panel

#### 4.1 Multiple Content Types
```typescript
// components/TryItPanelEnhanced.tsx
const [contentType, setContentType] = useState('application/json');
const [formData, setFormData] = useState<Record<string, any>>({});
const [files, setFiles] = useState<Record<string, File>>({});

// Render based on content type
{contentType === 'application/json' && (
  <textarea value={JSON.stringify(body)} />
)}

{contentType === 'multipart/form-data' && (
  <div>
    {Object.keys(schema.properties).map(key => (
      schema.properties[key].type === 'string' && 
      schema.properties[key].format === 'binary' ? (
        <input type="file" onChange={e => setFiles({
          ...files,
          [key]: e.target.files[0]
        })} />
      ) : (
        <input type="text" value={formData[key]} />
      )
    ))}
  </div>
)}

{contentType === 'application/x-www-form-urlencoded' && (
  <div className="space-y-2">
    {Object.keys(schema.properties).map(key => (
      <input
        key={key}
        placeholder={key}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
      />
    ))}
  </div>
)}
```

### Phase 5: Rich Schema Rendering

#### 5.1 Install Dependencies
```bash
npm install react-json-view-lite
```

#### 5.2 Schema Component
```typescript
// components/SchemaViewer.tsx
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export default function SchemaViewer({ schema, examples }) {
  const [selectedExample, setSelectedExample] = useState(0);
  
  return (
    <div>
      {examples && examples.length > 1 && (
        <div className="flex gap-2 mb-2">
          {examples.map((ex, i) => (
            <button onClick={() => setSelectedExample(i)}>
              Example {i + 1}
            </button>
          ))}
        </div>
      )}
      
      <JsonView
        data={examples?.[selectedExample] || schema}
        shouldInitiallyExpand={(level) => level < 2}
        style={{
          container: 'bg-[#08080b] rounded-lg p-4',
          key: 'text-blue-400',
          string: 'text-green-400',
          number: 'text-yellow-400',
          boolean: 'text-purple-400',
        }}
      />
      
      {/* Field badges */}
      <div className="mt-4 space-y-2">
        {Object.entries(schema.properties || {}).map(([key, prop]) => (
          <div key={key} className="flex items-center gap-2">
            <code className="text-sm">{key}</code>
            {schema.required?.includes(key) && (
              <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
                required
              </span>
            )}
            <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
              {prop.type}
            </span>
            {prop.format && (
              <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400">
                {prop.format}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Phase 6: Endpoint Metadata

#### 6.1 Status Badges Component
```typescript
// components/EndpointStatusBadges.tsx
export function EndpointStatusBadges({ endpoint }) {
  return (
    <div className="flex gap-2">
      {endpoint.deprecated && (
        <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
          ⚠️ Deprecated
        </span>
      )}
      {endpoint.experimental && (
        <span className="px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
          🧪 Experimental
        </span>
      )}
      {endpoint.internal && (
        <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
          🔒 Internal
        </span>
      )}
      {endpoint.rate_limit && (
        <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          ⏱️ {endpoint.rate_limit}
        </span>
      )}
      {endpoint.stability && endpoint.stability !== 'stable' && (
        <span className={`px-2 py-0.5 text-xs rounded border ${
          endpoint.stability === 'beta' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          endpoint.stability === 'alpha' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
          'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}>
          {endpoint.stability}
        </span>
      )}
    </div>
  );
}
```

### Phase 7: Shareable Deep Links

#### 7.1 URL State Management
```typescript
// app/docs/[id]/page.tsx - Add to component
const searchParams = useSearchParams();
const router = useRouter();

useEffect(() => {
  // Read from URL
  const endpointId = searchParams.get('endpoint');
  const method = searchParams.get('method');
  const params = searchParams.get('params');
  
  if (endpointId) {
    setSelectedEndpointId(endpointId);
  }
  
  if (params) {
    try {
      setTryItParams(JSON.parse(decodeURIComponent(params)));
    } catch {}
  }
}, [searchParams]);

// Update URL when selection changes
const updateURL = (endpointId: string, method?: string, params?: any) => {
  const url = new URL(window.location.href);
  url.searchParams.set('endpoint', endpointId);
  if (method) url.searchParams.set('method', method);
  if (params) url.searchParams.set('params', encodeURIComponent(JSON.stringify(params)));
  router.push(url.pathname + url.search);
};
```

#### 7.2 Share Button
```typescript
// components/ShareButton.tsx
export function ShareButton({ endpointId, params }) {
  const [copied, setCopied] = useState(false);
  
  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('endpoint', endpointId);
    if (params) {
      url.searchParams.set('params', encodeURIComponent(JSON.stringify(params)));
    }
    
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button onClick={handleShare} className="...">
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  );
}
```

### Phase 8: AI-Generated Guides

#### 8.1 Guide Generation Service
```typescript
// lib/ai/generateGuides.ts
export async function generateGettingStartedGuide(api: ApiRecord, endpoints: EndpointRecord[]) {
  const prompt = `Generate a "Getting Started" guide for the ${api.name} API.
  
Base URL: ${api.base_url}
Endpoints: ${endpoints.map(e => `${e.method} ${e.path}`).join(', ')}

Include:
1. Introduction
2. Authentication (if auth endpoints exist)
3. Your first API call
4. Common use cases
5. Next steps

Format as Markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return response.choices[0].message.content;
}

export async function generateAuthenticationGuide(api: ApiRecord, endpoints: EndpointRecord[]) {
  const authEndpoints = endpoints.filter(e => 
    e.path.includes('/auth') || 
    e.path.includes('/login') ||
    e.summary?.toLowerCase().includes('auth')
  );
  
  // Similar prompt for auth guide
}

export async function generateWorkflowsGuide(api: ApiRecord, endpoints: EndpointRecord[]) {
  // Analyze CRUD patterns
  // Generate common workflow examples
}
```

#### 8.2 Guides API
```typescript
// app/api/docs/[id]/guides/route.ts
export async function POST(req: Request, { params }) {
  const { id } = await params;
  const { guide_type } = await req.json();
  
  const { data: api } = await supabaseServiceClient
    .from('apis')
    .select('*')
    .eq('id', id)
    .single();
  
  const { data: endpoints } = await supabaseServiceClient
    .from('endpoints')
    .select('*')
    .eq('api_id', id);
  
  let content = '';
  let title = '';
  
  switch (guide_type) {
    case 'getting-started':
      content = await generateGettingStartedGuide(api, endpoints);
      title = 'Getting Started';
      break;
    case 'authentication':
      content = await generateAuthenticationGuide(api, endpoints);
      title = 'Authentication';
      break;
    case 'workflows':
      content = await generateWorkflowsGuide(api, endpoints);
      title = 'Common Workflows';
      break;
  }
  
  await supabaseServiceClient
    .from('guides')
    .upsert({
      api_id: id,
      guide_type,
      title,
      content
    }, { onConflict: 'api_id,guide_type' });
  
  return NextResponse.json({ content });
}
```

### Phase 9: Semantic Search

#### 9.1 Generate Embeddings
```typescript
// lib/ai/embeddings.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function generateEndpointEmbedding(endpoint: EndpointRecord): Promise<number[]> {
  const text = `${endpoint.method} ${endpoint.path} ${endpoint.summary || ''} ${endpoint.description || ''}`;
  return generateEmbedding(text);
}
```

#### 9.2 Search API
```typescript
// app/api/search/route.ts
export async function POST(req: Request) {
  const { query, api_id } = await req.json();
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // Search using pgvector
  const { data } = await supabaseServiceClient.rpc('search_endpoints_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 10
  });
  
  // Log query
  await supabaseServiceClient
    .from('search_queries')
    .insert({ query, results_count: data.length });
  
  return NextResponse.json({ results: data });
}
```

#### 9.3 Search Component
```typescript
// components/SemanticSearch.tsx
export function SemanticSearch({ apiId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, api_id: apiId })
    });
    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search endpoints naturally (e.g., 'how do I create a user?')"
      />
      {loading && <div>Searching...</div>}
      {results.map(result => (
        <div key={result.id}>
          <span className="font-mono">{result.method} {result.path}</span>
          <p>{result.summary}</p>
          <span className="text-xs">Similarity: {(result.similarity * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
```

### Phase 10: Background Jobs

#### 10.1 Supabase Edge Function
```typescript
// supabase/functions/refresh-embeddings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  // Fetch endpoints without embeddings
  const { data: endpoints } = await supabase
    .from('endpoints')
    .select('*')
    .is('embedding', null)
    .limit(100);
  
  // Generate embeddings
  for (const endpoint of endpoints) {
    const embedding = await generateEndpointEmbedding(endpoint);
    await supabase
      .from('endpoints')
      .update({ embedding })
      .eq('id', endpoint.id);
  }
  
  return new Response(JSON.stringify({ processed: endpoints.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

#### 10.2 Cron Configuration
```sql
-- supabase/migrations/005_cron_jobs.sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule embedding refresh daily at 2 AM
SELECT cron.schedule(
  'refresh-embeddings-daily',
  '0 2 * * *',
  $$
    SELECT net.http_post(
      url:='https://your-project.supabase.co/functions/v1/refresh-embeddings',
      headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
  $$
);
```

## Next Steps

1. **Run Migrations**
   ```bash
   # In Supabase SQL Editor, run migrations 002, 003, and 004
   ```

2. **Update Upload Flow**
   - Modify `app/api/docs/route.ts` to use `parseOpenApiSpecEnhanced`
   - Store enhanced endpoint data with metadata

3. **Integrate Components**
   - Replace `ApiList` with `ApiListEnhanced` in dashboard
   - Add favorite/view tracking API calls

4. **Test Each Feature**
   - Upload spec with x-* extensions
   - Verify tags and favorites work
   - Test search functionality

5. **Deploy**
   - Push migrations to production Supabase
   - Deploy Next.js app
   - Set up Edge Functions for background jobs

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js 15)                      │
├─────────────────────────────────────────────────────────────┤
│ Dashboard → ApiListEnhanced (tags, favorites, recent)       │
│ Docs Viewer → Enhanced with status badges, share links      │
│ Try-It Panel → Multi-content-type support                   │
│ Schema Viewer → Collapsible trees with examples             │
│ Semantic Search → Natural language queries                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│ /api/docs → Upload, list, CRUD (with tags, metadata)        │
│ /api/docs/[id]/favorite → Toggle favorites                  │
│ /api/docs/[id]/view → Track views                           │
│ /api/docs/[id]/versions → Version management                │
│ /api/docs/[id]/guides → AI-generated guides                 │
│ /api/search → Semantic search with pgvector                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│             Database (Supabase PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│ apis → tags, favorites, views, environment                  │
│ endpoints → status, examples, extensions, embeddings        │
│ api_versions → version history and changelogs               │
│ guides → AI-generated documentation                         │
│ search_queries → Search analytics                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
├─────────────────────────────────────────────────────────────┤
│ OpenAI API → Embeddings, guide generation, enrichment      │
│ Supabase Storage → Raw OpenAPI specs                        │
│ Edge Functions → Background jobs (cron)                     │
└─────────────────────────────────────────────────────────────┘
```

## Completion Checklist

- [x] Phase 1: Home screen with architecture cards
- [x] Database migrations created (002, 003, 004)
- [x] TypeScript types updated
- [x] Enhanced parser with extension support
- [x] ApiListEnhanced component with workspace features
- [ ] Favorite/view tracking API routes
- [ ] Version management API routes
- [ ] Enhanced Try-It panel with multi-content
- [ ] Schema viewer component
- [ ] Status badges in endpoint details
- [ ] Deep link URL management
- [ ] AI guide generation service
- [ ] Semantic search implementation
- [ ] Background job infrastructure

This document serves as the complete implementation guide for all 10 phases of the developer portal transformation.
