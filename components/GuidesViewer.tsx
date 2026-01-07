'use client';

import { useState, useEffect } from 'react';
import type { GuideRecord } from '@/types/database';

interface GuidesViewerProps {
  apiId: string;
}

export default function GuidesViewer({ apiId }: GuidesViewerProps) {
  const [guides, setGuides] = useState<GuideRecord[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuides();
  }, [apiId]);

  const fetchGuides = async () => {
    try {
      const res = await fetch(`/api/docs/${apiId}/guides`);
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
        if (data.length > 0 && !selectedGuide) {
          setSelectedGuide(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGuides = async () => {
    setGenerating(true);
    setError('');

    try {
      const res = await fetch(`/api/docs/${apiId}/guides/generate`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate guides');
      }

      // Refresh the guides list
      await fetchGuides();
      
      // Show success message
      if (data.generated > 0) {
        // If guides were generated, select the first one
        if (data.guides && data.guides.length > 0) {
          setSelectedGuide(data.guides[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-8 text-xs text-zinc-600">
        Loading guides...
      </div>
    );
  }

  const currentGuide = guides.find(g => g.id === selectedGuide);

  const guideTypeLabels: Record<string, string> = {
    getting_started: 'Getting Started',
    authentication: 'Authentication',
    common_workflows: 'Common Workflows',
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-[#08080b]">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-300">Guides</h3>
            {process.env.NEXT_PUBLIC_ENABLE_AI !== 'false' && (
              <button
                onClick={handleGenerateGuides}
                disabled={generating}
                className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-[10px] font-medium text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                title="Generate guides with AI"
              >
                {generating ? '✨...' : '✨ AI'}
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          {guides.length === 0 ? (
            <div className="text-xs text-zinc-600 space-y-3">
              <p>No guides available yet.</p>
              {process.env.NEXT_PUBLIC_ENABLE_AI !== 'false' && (
                <p>Click the ✨ AI button to generate guides automatically.</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {guides.map(guide => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedGuide === guide.id
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  {guideTypeLabels[guide.guide_type] || guide.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto px-8 py-8">
        {currentGuide ? (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-100">
                {currentGuide.title}
              </h2>
              {currentGuide.is_ai_generated && (
                <span className="px-2 py-1 text-[10px] rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  AI Generated
                </span>
              )}
            </div>

            {/* Markdown content */}
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="space-y-4">
                {currentGuide.content.split('\n').map((line, i) => {
                  // Headings
                  if (line.startsWith('###')) {
                    return (
                      <h3 key={i} className="text-lg font-semibold text-zinc-200 mt-6 mb-2">
                        {line.replace(/^###\s*/, '')}
                      </h3>
                    );
                  } else if (line.startsWith('##')) {
                    return (
                      <h2 key={i} className="text-xl font-semibold text-zinc-100 mt-8 mb-3">
                        {line.replace(/^##\s*/, '')}
                      </h2>
                    );
                  } else if (line.startsWith('# ')) {
                    return (
                      <h1 key={i} className="text-2xl font-bold text-zinc-50 mt-10 mb-4">
                        {line.replace(/^#\s*/, '')}
                      </h1>
                    );
                  }
                  // Code blocks
                  else if (line.startsWith('```')) {
                    const lang = line.replace('```', '').trim();
                    return (
                      <div key={i} className="text-[10px] text-zinc-600 font-mono">
                        {lang && `[${lang}]`}
                      </div>
                    );
                  }
                  // Lists
                  else if (line.match(/^\d+\./)) {
                    return (
                      <div key={i} className="text-sm text-zinc-300 ml-4">
                        {line}
                      </div>
                    );
                  } else if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="text-sm text-zinc-300 ml-4">
                        • {line.replace(/^-\s*/, '')}
                      </div>
                    );
                  }
                  // Inline code
                  else if (line.includes('`')) {
                    const parts = line.split('`');
                    return (
                      <p key={i} className="text-sm text-zinc-400 my-2">
                        {parts.map((part, j) =>
                          j % 2 === 0 ? (
                            <span key={j}>{part}</span>
                          ) : (
                            <code key={j} className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-200">
                              {part}
                            </code>
                          )
                        )}
                      </p>
                    );
                  }
                  // Regular paragraph
                  else if (line.trim()) {
                    return (
                      <p key={i} className="text-sm text-zinc-400 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-zinc-600">Select a guide to view</p>
          </div>
        )}
      </main>
    </div>
  );
}
