'use client';

import { useState } from 'react';
import type { EndpointRecord } from '@/types/database';
import CodeSnippet from './CodeSnippet';

type Props = {
  endpoint: EndpointRecord;
  baseUrl?: string;
};

export default function TryItPanel({ endpoint, baseUrl }: Props) {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [contentType, setContentType] = useState<'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data'>('application/json');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
  });
  const [body, setBody] = useState('');
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract query parameters from endpoint
  const queryParamDefs = endpoint.parameters?.filter((p: any) => p.in === 'query') || [];
  const pathParamDefs = endpoint.parameters?.filter((p: any) => p.in === 'path') || [];

  const handleSendRequest = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Build URL with path and query params
      let url = `${baseUrl || ''}${endpoint.path}`;
      
      // Replace path params (simple implementation)
      pathParamDefs.forEach((param: any) => {
        const value = queryParams[param.name] || `{${param.name}}`;
        url = url.replace(`{${param.name}}`, encodeURIComponent(value));
      });

      // Add query params
      const queryString = Object.entries(queryParams)
        .filter(([key]) => queryParamDefs.some((p: any) => p.name === key))
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      if (queryString) {
        url += `?${queryString}`;
      }

      const startTime = Date.now();
      
      // Build request body based on content type
      let requestBody: string | FormData | undefined;
      const requestHeaders = { ...headers };

      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        if (contentType === 'application/json') {
          requestBody = body;
          requestHeaders['Content-Type'] = 'application/json';
        } else if (contentType === 'application/x-www-form-urlencoded') {
          requestBody = new URLSearchParams(formFields).toString();
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (contentType === 'multipart/form-data') {
          const formData = new FormData();
          Object.entries(formFields).forEach(([key, value]) => {
            formData.append(key, value);
          });
          Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
          requestBody = formData;
          // Remove Content-Type header to let browser set it with boundary
          delete requestHeaders['Content-Type'];
        }
      }
      
      const res = await fetch(url, {
        method: endpoint.method,
        headers: requestHeaders,
        body: requestBody,
      });

      const duration = Date.now() - startTime;
      const responseContentType = res.headers.get('content-type');
      let data;

      if (responseContentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        data,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-[420px] space-y-6 px-8 py-8 bg-[var(--surface)]">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Try it out</h3>
        
        {/* Query Parameters */}
        {queryParamDefs.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query Parameters</label>
            {queryParamDefs.map((param: any) => (
              <input
                key={param.name}
                type="text"
                placeholder={`${param.name}${param.required ? ' (required)' : ''}`}
                value={queryParams[param.name] || ''}
                onChange={(e) =>
                  setQueryParams({ ...queryParams, [param.name]: e.target.value })
                }
                className="w-full rounded-md bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            ))}
          </div>
        )}

        {/* Path Parameters */}
        {pathParamDefs.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Path Parameters</label>
            {pathParamDefs.map((param: any) => (
              <input
                key={param.name}
                type="text"
                placeholder={`${param.name}${param.required ? ' (required)' : ''}`}
                value={queryParams[param.name] || ''}
                onChange={(e) =>
                  setQueryParams({ ...queryParams, [param.name]: e.target.value })
                }
                className="w-full rounded-md bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            ))}
          </div>
        )}

        {/* Request Body */}
        {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Request Body</label>
              <select
                value={contentType}
                onChange={(e) => {
                  const newType = e.target.value as typeof contentType;
                  setContentType(newType);
                  setHeaders({ ...headers, 'Content-Type': newType });
                }}
                className="rounded-md bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              >
                <option value="application/json">JSON</option>
                <option value="application/x-www-form-urlencoded">URL Encoded</option>
                <option value="multipart/form-data">Form Data</option>
              </select>
            </div>

            {contentType === 'application/json' && (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={6}
                className="w-full rounded-md bg-[var(--code-bg)] px-3 py-2.5 text-sm font-mono text-[var(--code-text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            )}

            {contentType === 'application/x-www-form-urlencoded' && (
              <div className="space-y-2">
                {Object.keys(formFields).length === 0 && (
                  <button
                    onClick={() => setFormFields({ field1: '' })}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Add field
                  </button>
                )}
                {Object.entries(formFields).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={key}
                      onChange={(e) => {
                        const newFields = { ...formFields };
                        delete newFields[key];
                        newFields[e.target.value] = value;
                        setFormFields(newFields);
                      }}
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={value}
                      onChange={(e) => setFormFields({ ...formFields, [key]: e.target.value })}
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                    <button
                      onClick={() => {
                        const newFields = { ...formFields };
                        delete newFields[key];
                        setFormFields(newFields);
                      }}
                      className="px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {Object.keys(formFields).length > 0 && (
                  <button
                    onClick={() => setFormFields({ ...formFields, [`field${Object.keys(formFields).length + 1}`]: '' })}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Add field
                  </button>
                )}
              </div>
            )}

            {contentType === 'multipart/form-data' && (
              <div className="space-y-2">
                {Object.keys(formFields).length === 0 && Object.keys(files).length === 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormFields({ field1: '' })}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + Add text field
                    </button>
                    <button
                      onClick={() => setFiles({ file1: null })}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      + Add file field
                    </button>
                  </div>
                )}
                {Object.entries(formFields).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <span className="text-[10px] text-zinc-600">TEXT</span>
                    <input
                      type="text"
                      placeholder="Key"
                      value={key}
                      onChange={(e) => {
                        const newFields = { ...formFields };
                        delete newFields[key];
                        newFields[e.target.value] = value;
                        setFormFields(newFields);
                      }}
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={value}
                      onChange={(e) => setFormFields({ ...formFields, [key]: e.target.value })}
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                    <button
                      onClick={() => {
                        const newFields = { ...formFields };
                        delete newFields[key];
                        setFormFields(newFields);
                      }}
                      className="px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {Object.entries(files).map(([key, file]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <span className="text-[10px] text-zinc-600">FILE</span>
                    <input
                      type="text"
                      placeholder="Key"
                      value={key}
                      onChange={(e) => {
                        const newFiles = { ...files };
                        delete newFiles[key];
                        newFiles[e.target.value] = file;
                        setFiles(newFiles);
                      }}
                      className="w-24 rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    />
                    <input
                      type="file"
                      onChange={(e) => setFiles({ ...files, [key]: e.target.files?.[0] || null })}
                      className="flex-1 text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-[10px] file:text-zinc-300 hover:file:bg-zinc-700"
                    />
                    <button
                      onClick={() => {
                        const newFiles = { ...files };
                        delete newFiles[key];
                        setFiles(newFiles);
                      }}
                      className="px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(Object.keys(formFields).length > 0 || Object.keys(files).length > 0) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormFields({ ...formFields, [`field${Object.keys(formFields).length + 1}`]: '' })}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + Add text field
                    </button>
                    <button
                      onClick={() => setFiles({ ...files, [`file${Object.keys(files).length + 1}`]: null })}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      + Add file field
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="w-full rounded-md bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Response</h4>
            <div className="flex items-center gap-2.5 text-xs">
              <span
                className={`font-mono font-semibold px-2 py-0.5 rounded-full ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-[var(--text-muted)]">{response.duration}ms</span>
            </div>
          </div>
          <div className="rounded-lg bg-[var(--code-bg)] p-4">
            <pre className="text-[13px] leading-relaxed font-mono text-[var(--code-text)] overflow-auto" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Code Snippets */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Code Examples</h4>
        <CodeSnippet
          endpoint={endpoint}
          baseUrl={baseUrl}
          queryParams={queryParams}
          body={body}
        />
      </div>
    </aside>
  );
}
