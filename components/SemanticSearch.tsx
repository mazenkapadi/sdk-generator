'use client';

import { useState } from 'react';
import type { EndpointRecord } from '@/types/database';

interface SemanticSearchProps {
  apiId?: string;
  onSelectEndpoint?: (endpointId: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-green-500/10 text-green-400 border-green-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SemanticSearch({ apiId, onSelectEndpoint }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, apiId, limit: 10 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything... e.g., 'how to get user profile' or 'endpoints for authentication'"
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-3 pr-24 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-500/20 px-4 py-1.5 text-xs font-medium text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">
            Found {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
          <div className="space-y-2">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => onSelectEndpoint?.(result.id)}
                className="w-full text-left rounded-lg border border-zinc-800 bg-[#08080b] p-3 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-mono font-semibold ${
                      METHOD_COLORS[result.method] || 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {result.method}
                  </span>
                  <code className="text-sm font-mono text-zinc-300">
                    {result.path}
                  </code>
                  {result.similarity && (
                    <span className="ml-auto text-[10px] text-zinc-600">
                      {Math.round(result.similarity * 100)}% match
                    </span>
                  )}
                </div>
                {result.summary && (
                  <p className="text-xs text-zinc-500 mt-1">{result.summary}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && query && results.length === 0 && !error && (
        <div className="text-center py-8 text-sm text-zinc-500">
          No results found. Try a different query.
        </div>
      )}
    </div>
  );
}
