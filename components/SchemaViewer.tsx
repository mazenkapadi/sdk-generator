'use client';

import { useState } from 'react';

interface SchemaViewerProps {
  schema: any;
  examples?: any;
  title?: string;
}

export default function SchemaViewer({ schema, examples, title }: SchemaViewerProps) {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showFieldBadges, setShowFieldBadges] = useState(true);
  const [copied, setCopied] = useState(false);

  // Get examples array
  const examplesList = examples 
    ? (typeof examples === 'object' && !Array.isArray(examples)
        ? Object.entries(examples).map(([key, value]) => ({ name: key, data: value }))
        : [{ name: 'Example', data: examples }])
    : [];

  const displayData = examplesList.length > 0 
    ? examplesList[selectedExample].data 
    : schema;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(displayData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      )}

      {/* Example selector */}
      {examplesList.length > 1 && (
        <div className="flex gap-1.5">
          {examplesList.map((ex, i) => (
            <button
              key={i}
              onClick={() => setSelectedExample(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedExample === i
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                  : 'bg-[var(--surface)] text-[var(--text-tertiary)] hover:bg-[var(--code-bg)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}

      {/* JSON Display with Copy Button */}
      <div className="relative">
        <div className="rounded-lg bg-[var(--code-bg)] p-4">
          <pre className="text-[13px] leading-relaxed font-mono text-[var(--code-text)] overflow-auto" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(displayData, null, 2)}
          </pre>
        </div>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-[var(--background)] hover:bg-[var(--surface)] rounded-md transition-all shadow-sm"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Field Badges */}
      {schema?.properties && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Properties
            </h4>
            <button
              onClick={() => setShowFieldBadges(!showFieldBadges)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {showFieldBadges ? 'Hide' : 'Show'}
            </button>
          </div>
          {showFieldBadges && (
          <div className="space-y-2">
            {Object.entries(schema.properties).map(([key, prop]: [string, any]) => (
              <div key={key} className="rounded-lg bg-[var(--surface)] px-6 py-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm font-mono font-semibold text-[var(--text-primary)]">{key}</code>
                  
                  {schema.required?.includes(key) ? (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-50 text-red-600 font-semibold uppercase tracking-wide">
                      required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--code-bg)] text-[var(--text-muted)] font-medium uppercase tracking-wide">
                      optional
                    </span>
                  )}
                  
                  {prop.type && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium">
                      {prop.type}
                    </span>
                  )}
                  
                  {prop.format && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-50 text-purple-600 font-medium">
                      {prop.format}
                    </span>
                  )}
                  
                  {prop.enum && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-50 text-yellow-700 font-medium">
                      enum
                    </span>
                  )}
                  
                  {prop.deprecated && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-50 text-red-600 font-semibold">
                      deprecated
                    </span>
                  )}
                </div>
                
                {prop.description && (
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{prop.description}</p>
                )}
                
                {prop.enum && (
                  <div className="mt-2">
                    <span className="text-xs text-[var(--text-muted)]">Allowed values: </span>
                    <code className="text-xs text-[var(--text-secondary)]">{prop.enum.join(', ')}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
