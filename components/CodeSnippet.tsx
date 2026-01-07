'use client';

import { useState } from 'react';
import type { EndpointRecord } from '@/types/database';

type Props = {
  endpoint: EndpointRecord;
  baseUrl?: string;
  queryParams?: Record<string, string>;
  body?: string;
};

export default function CodeSnippet({ endpoint, baseUrl, queryParams = {}, body = '' }: Props) {
  const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const generateUrl = () => {
    let url = `${baseUrl || 'https://api.example.com'}${endpoint.path}`;
    const queryString = Object.entries(queryParams)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  };

  const generateCurl = () => {
    const url = generateUrl();
    let cmd = `curl -X ${endpoint.method} "${url}"`;
    
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && body) {
      cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`;
    }
    
    return cmd;
  };

  const generateJavaScript = () => {
    const url = generateUrl();
    const options: any = {
      method: endpoint.method,
    };

    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = body;
    }

    return `fetch("${url}", ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generatePython = () => {
    const url = generateUrl();
    let code = `import requests\n\n`;
    
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && body) {
      code += `headers = {"Content-Type": "application/json"}\n`;
      code += `data = ${body}\n\n`;
      code += `response = requests.${endpoint.method.toLowerCase()}(\n    "${url}",\n    headers=headers,\n    json=data\n)`;
    } else {
      code += `response = requests.${endpoint.method.toLowerCase()}("${url}")`;
    }
    
    code += `\nprint(response.json())`;
    return code;
  };

  const snippets = {
    curl: generateCurl(),
    javascript: generateJavaScript(),
    python: generatePython(),
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['curl', 'javascript', 'python'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === lang
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]'
              }`}
            >
              {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-md transition-all"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-lg bg-[var(--code-bg)] p-4 relative">
        <pre className="text-[13px] leading-relaxed font-mono text-[var(--code-text)] overflow-auto" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {snippets[activeTab]}
        </pre>
      </div>
    </div>
  );
}
