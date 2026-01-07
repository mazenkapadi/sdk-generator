'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EndpointSidebar from '@/components/EndpointSidebar';
import EndpointDetails from '@/components/EndpointDetails';
import TryItPanel from '@/components/TryItPanel';
import ThemeToggle from '@/components/ThemeToggle';
import GuidesViewer from '@/components/GuidesViewer';
import type { ApiRecord, EndpointRecord } from '@/types/database';

export default function DocsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const [api, setApi] = useState<ApiRecord | null>(null);
  const [endpoints, setEndpoints] = useState<EndpointRecord[]>([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState<EndpointRecord[]>([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichmentMessage, setEnrichmentMessage] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'guides'>('endpoints');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch API details
        const apiRes = await fetch(`/api/docs/${id}`);
        if (!apiRes.ok) throw new Error('Failed to fetch API');
        const apiData = await apiRes.json();
        setApi(apiData);

        // Fetch endpoints
        const endpointsRes = await fetch(`/api/docs/${id}/endpoints`);
        if (!endpointsRes.ok) throw new Error('Failed to fetch endpoints');
        const endpointsData = await endpointsRes.json();
        const allEndpoints = endpointsData.data || [];
        setEndpoints(allEndpoints);
        setFilteredEndpoints(allEndpoints);

        // Check URL for endpoint parameter
        const urlEndpoint = searchParams.get('endpoint');
        if (urlEndpoint && allEndpoints.some((e: EndpointRecord) => e.id === urlEndpoint)) {
          setSelectedEndpointId(urlEndpoint);
        } else if (allEndpoints.length > 0) {
          setSelectedEndpointId(allEndpoints[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, searchParams]);

  const handleEnrich = async () => {
    setEnriching(true);
    setEnrichmentMessage('');

    try {
      const res = await fetch(`/api/docs/${id}/enrich`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Enrichment failed');
      }

      setEnrichmentMessage(
        `✓ Enriched ${data.enriched} of ${data.total} endpoints`
      );

      // Refresh endpoints to show new data
      const endpointsRes = await fetch(`/api/docs/${id}/endpoints`);
      if (endpointsRes.ok) {
        const endpointsData = await endpointsRes.json();
        const allEndpoints = endpointsData.data || [];
        setEndpoints(allEndpoints);
        setFilteredEndpoints(allEndpoints);
      }
    } catch (err) {
      setEnrichmentMessage(`Error: ${err instanceof Error ? err.message : 'Enrichment failed'}`);
    } finally {
      setEnriching(false);
    }
  };

  const handleExport = (format: 'markdown' | 'html') => {
    window.open(`/api/docs/${id}/export/${format}`, '_blank');
    setExportDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }

    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportDropdownOpen]);

  // Update URL when endpoint changes
  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    const url = new URL(window.location.href);
    url.searchParams.set('endpoint', endpointId);
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Filter endpoints based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEndpoints(endpoints);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = endpoints.filter((endpoint) => {
      return (
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.method.toLowerCase().includes(query) ||
        endpoint.tag?.toLowerCase().includes(query) ||
        endpoint.summary?.toLowerCase().includes(query) ||
        endpoint.description?.toLowerCase().includes(query)
      );
    });

    setFilteredEndpoints(filtered);
  }, [searchQuery, endpoints]);

  const selectedEndpoint = filteredEndpoints.find((e) => e.id === selectedEndpointId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading documentation...</p>
      </div>
    );
  }

  if (error || !api) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-400">{error || 'API not found'}</p>
          <Link
            href="/"
            className="inline-block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const accentColor = api.accent_color || '#3b82f6';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm shadow-sm" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <div className="max-w-[1800px] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Back
            </Link>
            {api.logo_url && (
              <img
                src={api.logo_url}
                alt={api.name}
                className="h-6 w-6 rounded object-cover"
              />
            )}
            <h1 className="text-base font-semibold text-[var(--text-primary)]">
              {api.name}
            </h1>
            {api.version && (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
                v{api.version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {process.env.NEXT_PUBLIC_ENABLE_AI !== 'false' && (
              <button
                onClick={handleEnrich}
                disabled={enriching}
                className="rounded-md px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Use AI to generate examples and improve summaries"
              >
                {enriching ? 'Enriching...' : 'AI Enrich'}
              </button>
            )}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="rounded-md px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Export documentation"
                aria-expanded={exportDropdownOpen}
                aria-haspopup="true"
              >
                Export
              </button>
              {exportDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--background)] shadow-lg z-50"
                  role="menu"
                  aria-orientation="vertical"
                  style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('markdown')}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as Markdown
                    </button>
                    <button
                      onClick={() => handleExport('html')}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Export as HTML
                    </button>
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto">
        {/* Tabs */}
        <div className="px-8 py-3">
          <nav className="flex gap-6" role="tablist" aria-label="Documentation sections">
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-2 text-sm font-medium transition-all rounded-md ${
                activeTab === 'endpoints'
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
              }`}
              role="tab"
              aria-selected={activeTab === 'endpoints'}
              aria-controls="endpoints-panel"
            >
              API Reference
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-3 py-2 text-sm font-medium transition-all rounded-md ${
                activeTab === 'guides'
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
              }`}
              role="tab"
              aria-selected={activeTab === 'guides'}
              aria-controls="guides-panel"
            >
              Guides
            </button>
          </nav>
        </div>

        {activeTab === 'endpoints' && (
          <div className="px-8 py-4 bg-[var(--surface)]">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full rounded-md bg-[var(--background)] px-4 py-2 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                style={{ boxShadow: 'inset 0 0 0 1px var(--border-subtle)' }}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3-Column Layout */}
        {activeTab === 'endpoints' ? (
          <div className="flex h-[calc(100vh-180px)]" role="tabpanel" id="endpoints-panel" aria-labelledby="endpoints-tab">
            {/* Left Sidebar - Navigation */}
            <EndpointSidebar
              endpoints={filteredEndpoints}
              selectedEndpointId={selectedEndpointId || undefined}
              onSelectEndpoint={handleSelectEndpoint}
            />

            {/* Central Column - Main Content */}
            <main className="flex-1 overflow-y-auto px-12 py-8 bg-[var(--background)]">
              {selectedEndpoint ? (
                <div className="max-w-[900px]">
                  <EndpointDetails endpoint={selectedEndpoint} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <svg className="w-12 h-12 mx-auto text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Select an endpoint to view details
                    </p>
                  </div>
                </div>
              )}
            </main>

            {/* Right Column - Code Examples & Try It */}
            {selectedEndpoint && (
              <TryItPanel endpoint={selectedEndpoint} baseUrl={api.base_url} />
            )}
          </div>
        ) : (
          <div role="tabpanel" id="guides-panel" aria-labelledby="guides-tab">
            <GuidesViewer apiId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
