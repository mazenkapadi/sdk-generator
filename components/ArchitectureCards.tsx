'use client';

export default function ArchitectureCards() {
  const features = [
    {
      icon: '📤',
      title: 'Upload & Parse',
      description: 'Upload your OpenAPI v3 JSON/YAML spec. The parser extracts endpoints, schemas, parameters, and metadata.',
      tech: 'Next.js API Routes + Supabase Storage'
    },
    {
      icon: '🤖',
      title: 'AI Enrichment',
      description: 'Optional AI enhancement generates examples, improves descriptions, and creates realistic test data using OpenAI.',
      tech: 'OpenAI GPT-4 + Embeddings'
    },
    {
      icon: '📚',
      title: 'Version Tracking',
      description: 'Track spec versions with changelogs. See what changed between v1.1 and v2.0, switch versions in the UI.',
      tech: 'PostgreSQL + Version Metadata'
    },
    {
      icon: '🔍',
      title: 'Semantic Search',
      description: 'Natural language search powered by vector embeddings. Find endpoints by asking "how do I update user settings?"',
      tech: 'OpenAI Embeddings + pgvector'
    },
    {
      icon: '⚡',
      title: 'Try-It Panel',
      description: 'Interactive API testing with pre-filled examples, auth configuration, and response validation.',
      tech: 'React State + Fetch API'
    },
    {
      icon: '🎨',
      title: 'Custom Branding',
      description: 'Add your logo, brand colors, and custom base URLs. Export as Markdown or standalone HTML.',
      tech: 'Dynamic Theming + Export APIs'
    },
    {
      icon: '🏷️',
      title: 'Multi-API Workspace',
      description: 'Manage multiple APIs with tags ("internal", "public beta"), favorites, recently viewed, and search across all specs.',
      tech: 'Workspace UI + Filtering'
    },
    {
      icon: '🔗',
      title: 'Shareable Links',
      description: 'Deep links with state - share exact endpoint, method, and prefilled examples. Perfect for team collaboration.',
      tech: 'URL State Management'
    },
    {
      icon: '🎯',
      title: 'Endpoint Status',
      description: 'Visual indicators for deprecated, experimental, beta, and rate-limited endpoints using OpenAPI extensions.',
      tech: 'x-status & x-rate-limit parsing'
    },
    {
      icon: '📊',
      title: 'Rich Schema Rendering',
      description: 'Collapsible JSON trees, inline examples, required/optional badges, and support for complex nested objects.',
      tech: 'Recursive Schema Parser'
    },
    {
      icon: '📝',
      title: 'Auto-Generated Guides',
      description: 'AI scans your spec to create "Getting Started", "Authentication", and common workflow guides based on tags.',
      tech: 'Pattern Recognition + GPT-4'
    },
    {
      icon: '🔄',
      title: 'Background Jobs',
      description: 'Scheduled tasks re-parse specs, refresh AI examples, validate links, and keep docs up-to-date automatically.',
      tech: 'Cron Jobs + Edge Functions'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Architecture & Technical Details</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Comprehensive feature set and technical implementation details
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group rounded-lg bg-[var(--surface)] p-4 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{feature.icon}</div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center rounded-full bg-[var(--code-bg)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)]">
                    {feature.tech}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-[var(--surface)] p-5">
        <div className="flex gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Example API Features</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The included <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)] text-[var(--text-primary)] font-mono text-[10px]">example-api.json</code> demonstrates:
            </p>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1 ml-4 list-disc">
              <li><strong className="text-[var(--text-primary)]">Version changelogs</strong> (x-changelog) tracking v1.1.0 → v2.1.0 changes</li>
              <li><strong className="text-[var(--text-primary)]">Deprecated endpoints</strong> with migration guides (x-deprecation-info)</li>
              <li><strong className="text-[var(--text-primary)]">Experimental features</strong> like semantic search (x-status: "experimental")</li>
              <li><strong className="text-[var(--text-primary)]">Beta features</strong> like webhooks (x-status: "beta")</li>
              <li><strong className="text-[var(--text-primary)]">Rate limits</strong> per endpoint (x-rate-limit)</li>
              <li><strong className="text-[var(--text-primary)]">File uploads</strong> with multipart/form-data support</li>
              <li><strong className="text-[var(--text-primary)]">Multiple content types</strong> (JSON, form-urlencoded)</li>
              <li><strong className="text-[var(--text-primary)]">Rich examples</strong> for requests and responses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
