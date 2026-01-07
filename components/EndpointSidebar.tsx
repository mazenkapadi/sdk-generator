'use client';

import { useState } from 'react';
import type { EndpointRecord } from '@/types/database';
import { getEndpointHealth, getHealthBadge } from '@/lib/endpoint-health';

type Props = {
  endpoints: EndpointRecord[];
  selectedEndpointId?: string;
  onSelectEndpoint: (id: string) => void;
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-green-500/10 text-green-400 border-green-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function EndpointSidebar({ endpoints, selectedEndpointId, onSelectEndpoint }: Props) {
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());

  // Group endpoints by tag
  const grouped = endpoints.reduce((acc, endpoint) => {
    const tag = endpoint.tag || 'General';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(endpoint);
    return acc;
  }, {} as Record<string, EndpointRecord[]>);

  const toggleTag = (tag: string) => {
    setCollapsedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  return (
    <aside className="w-64 overflow-y-auto bg-[var(--surface)] px-5 py-8">
      <div className="space-y-1 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          API Reference
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
        </p>
      </div>

      <nav className="space-y-6" aria-label="Endpoint navigation">
        {Object.entries(grouped).map(([tag, tagEndpoints]) => (
          <div key={tag} className="space-y-1.5">
            <button
              onClick={() => toggleTag(tag)}
              className="flex w-full items-center justify-between py-1 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              aria-expanded={!collapsedTags.has(tag)}
            >
              <span>{tag}</span>
              <svg 
                className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${
                  collapsedTags.has(tag) ? '-rotate-90' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!collapsedTags.has(tag) && (
              <div className="space-y-0.5 ml-0">
                {tagEndpoints.map((endpoint) => {
                  const isSelected = endpoint.id === selectedEndpointId;
                  return (
                    <button
                      key={endpoint.id}
                      onClick={() => onSelectEndpoint(endpoint.id)}
                      className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-all group ${
                        isSelected
                          ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase shrink-0 ${
                          METHOD_COLORS[endpoint.method] || 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-mono truncate leading-tight">
                          {endpoint.path}
                        </p>
                        {endpoint.summary && (
                          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 leading-tight">
                            {endpoint.summary}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
