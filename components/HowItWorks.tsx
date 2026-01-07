'use client';

import { useState } from 'react';

export default function HowItWorks() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const architectureSteps = [
    {
      title: 'Upload & Parse',
      icon: '📤',
      description: 'Upload your OpenAPI v3 spec (JSON or YAML)',
      details: [
        'Supports drag-and-drop file upload',
        'Validates OpenAPI v3 specification',
        'Parses endpoints, schemas, and parameters',
        'Extracts metadata (title, version, base URL)',
        'Raw spec stored in Supabase Storage for versioning',
      ],
      tech: 'Next.js API Routes, Zod validation',
    },
    {
      title: 'Storage & Database',
      icon: '💾',
      description: 'Store structured data in Supabase PostgreSQL',
      details: [
        'APIs table stores metadata and branding',
        'Endpoints table stores normalized endpoint data',
        'Relationships maintained for efficient queries',
        'Full-text search capabilities',
        'File storage for raw OpenAPI specs',
      ],
      tech: 'Supabase PostgreSQL, Storage buckets',
    },
    {
      title: 'AI Enrichment',
      icon: '✨',
      description: 'Enhance docs with AI-generated content',
      details: [
        'Auto-generate endpoint summaries',
        'Create example request bodies',
        'Generate example response data',
        'Improve descriptions for clarity',
        'Optional - works without API key',
      ],
      tech: 'OpenAI GPT-4o-mini, Async processing',
    },
    {
      title: 'Documentation',
      icon: '📚',
      description: 'Beautiful, interactive API documentation',
      details: [
        'Three-panel layout (sidebar, details, try-it)',
        'Real-time endpoint search',
        'Interactive request testing',
        'Code snippets (cURL, JS, Python)',
        'Export to Markdown or HTML',
      ],
      tech: 'React, TypeScript, Tailwind CSS',
    },
  ];

  return (
    <div className="space-y-8">
      {/* How to Use Section */}
      <div className="rounded-xl border border-zinc-800 bg-[#08080b] p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-50 mb-2">
              How to Use
            </h2>
            <p className="text-sm text-zinc-500">
              Get your API documentation up and running in minutes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h3 className="font-medium text-zinc-200">Upload Your Spec</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Upload an OpenAPI v3 specification file (JSON or YAML). Use the upload form on the right or drag and drop your file.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h3 className="font-medium text-zinc-200">
                  Customize & Enrich
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Add your branding (logo, colors) and optionally use AI to generate examples and improve descriptions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h3 className="font-medium text-zinc-200">View & Share</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Browse your interactive docs, test endpoints, and export as Markdown or HTML for offline use.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-50 mb-2">
            How It Works
          </h2>
          <p className="text-sm text-zinc-500">
            Under the hood: from OpenAPI spec to interactive documentation
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {architectureSteps.map((step, index) => (
            <div
              key={index}
              className="group rounded-xl border border-zinc-800 bg-[#08080b] hover:border-zinc-700 transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedCard(expandedCard === index ? null : index)
                }
                className="w-full p-6 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{step.icon}</div>
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {step.description}
                      </p>
                      <div className="text-[10px] text-zinc-600 font-mono">
                        {step.tech}
                      </div>
                    </div>
                  </div>
                  <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    <svg
                      className={`h-5 w-5 transition-transform duration-200 ${
                        expandedCard === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedCard === index && (
                <div className="px-6 pb-6 pt-2 space-y-2 border-t border-zinc-800/50 mt-2">
                  <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                    What Happens
                  </h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-zinc-500"
                      >
                        <svg
                          className="h-4 w-4 text-zinc-600 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats or Features */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-[#08080b] p-4 text-center">
          <div className="text-2xl font-bold text-zinc-50">3</div>
          <div className="text-xs text-zinc-500 mt-1">Languages</div>
          <div className="text-[10px] text-zinc-600 mt-1">
            cURL, JS, Python
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#08080b] p-4 text-center">
          <div className="text-2xl font-bold text-zinc-50">2</div>
          <div className="text-xs text-zinc-500 mt-1">Export Formats</div>
          <div className="text-[10px] text-zinc-600 mt-1">Markdown, HTML</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#08080b] p-4 text-center">
          <div className="text-2xl font-bold text-zinc-50">AI</div>
          <div className="text-xs text-zinc-500 mt-1">Powered</div>
          <div className="text-[10px] text-zinc-600 mt-1">GPT-4o-mini</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-[#08080b] p-4 text-center">
          <div className="text-2xl font-bold text-zinc-50">∞</div>
          <div className="text-xs text-zinc-500 mt-1">APIs</div>
          <div className="text-[10px] text-zinc-600 mt-1">No limits</div>
        </div>
      </div>
    </div>
  );
}
