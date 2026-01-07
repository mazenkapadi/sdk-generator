import type { EndpointRecord } from '@/types/database';
import EndpointStatusBadges from './EndpointStatusBadges';
import SchemaViewer from './SchemaViewer';

type Props = {
  endpoint: EndpointRecord;
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  POST: 'bg-green-500/10 text-green-400 border-green-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function EndpointDetails({ endpoint }: Props) {
  // Auto-generate endpoint information
  const pathSegments = endpoint.path.split('/').filter(Boolean);
  const hasPathParams = endpoint.path.includes('{');
  const hasQueryParams = endpoint.parameters?.some((p: any) => p.in === 'query');
  const hasRequestBody = endpoint.request_body_schema !== null && endpoint.request_body_schema !== undefined;
  const responseStatuses = endpoint.responses ? Object.keys(endpoint.responses) : [];
  const successResponses = responseStatuses.filter(s => s.startsWith('2'));
  const errorResponses = responseStatuses.filter(s => !s.startsWith('2'));
  
  return (
    <article className="space-y-8">
      {/* Header Section */}
      <header className="space-y-3 pb-6">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-mono font-semibold uppercase ${
              METHOD_COLORS[endpoint.method] || 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {endpoint.method}
          </span>
          <code className="flex-1 text-lg font-mono text-[var(--text-primary)] font-medium">
            {endpoint.path}
          </code>
        </div>

        {endpoint.summary && (
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] leading-tight">
            {endpoint.summary}
          </h1>
        )}

        {endpoint.description && (
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            {endpoint.description}
          </p>
        )}

        {/* Auto-generated endpoint info */}
        {!endpoint.description && (
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            {endpoint.method === 'GET' && 'Retrieves'}
            {endpoint.method === 'POST' && 'Creates'}
            {endpoint.method === 'PUT' && 'Updates'}
            {endpoint.method === 'PATCH' && 'Partially updates'}
            {endpoint.method === 'DELETE' && 'Deletes'}
            {' '}
            {pathSegments.length > 0 ? pathSegments[pathSegments.length - 1].replace(/[{}]/g, '') : 'resource'}
            {hasPathParams && ' by identifier'}.
            {hasRequestBody && ' Requires a request body with the specified fields.'}
            {successResponses.length > 0 && ` Returns ${successResponses.join(', ')} on success.`}
          </p>
        )}
        
        <EndpointStatusBadges endpoint={endpoint} size="md" />

        {/* Quick Info Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {hasPathParams && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
              Path parameters required
            </span>
          )}
          {hasQueryParams && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
              Query parameters supported
            </span>
          )}
          {hasRequestBody && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
              Request body required
            </span>
          )}
          {errorResponses.length > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--text-secondary)]">
              {errorResponses.length} error response{errorResponses.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* Parameters */}
      {endpoint.parameters && endpoint.parameters.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Parameters</h2>
          <div className="space-y-2">
            {endpoint.parameters.map((param: any, idx: number) => {
              // Auto-generate description if missing
              let autoDescription = '';
              if (!param.description) {
                if (param.in === 'path') {
                  autoDescription = `Unique identifier for the ${param.name.replace(/[_-]/g, ' ').replace(/id$/i, '').trim() || 'resource'}`;
                } else if (param.in === 'query') {
                  if (param.name.toLowerCase().includes('limit')) {
                    autoDescription = 'Maximum number of results to return';
                  } else if (param.name.toLowerCase().includes('offset') || param.name.toLowerCase().includes('skip')) {
                    autoDescription = 'Number of results to skip for pagination';
                  } else if (param.name.toLowerCase().includes('page')) {
                    autoDescription = 'Page number for pagination';
                  } else if (param.name.toLowerCase().includes('sort')) {
                    autoDescription = 'Field to sort results by';
                  } else if (param.name.toLowerCase().includes('order')) {
                    autoDescription = 'Sort order (ascending or descending)';
                  } else if (param.name.toLowerCase().includes('filter') || param.name.toLowerCase().includes('search') || param.name.toLowerCase().includes('query')) {
                    autoDescription = 'Filter or search criteria for results';
                  } else {
                    autoDescription = `${param.name.replace(/[_-]/g, ' ')} parameter`;
                  }
                }
              }

              return (
                <div key={idx} className="rounded-lg bg-[var(--surface)] px-6 py-4 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <code className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-600 uppercase tracking-wide">
                        required
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--code-bg)] text-[var(--text-muted)] uppercase tracking-wide">
                      {param.in}
                    </span>
                    {param.schema?.type && (
                      <span className="text-xs font-mono text-[var(--text-tertiary)]">
                        {param.schema.type}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {param.description || autoDescription}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Request Body */}
      {endpoint.request_body_schema && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Request Body</h2>
          <SchemaViewer 
            schema={endpoint.request_body_schema} 
            examples={endpoint.examples?.request}
          />
        </section>
      )}

      {/* Responses */}
      {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Responses</h2>
          <div className="space-y-4">
            {Object.entries(endpoint.responses).map(([status, response]: [string, any]) => (
              <div key={status} className="rounded-lg bg-[var(--surface)] overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                      {status}
                    </span>
                    {response.description && (
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        {response.description}
                      </span>
                    )}
                  </div>
                </div>
                {response.content?.['application/json']?.schema && (
                  <div className="px-6 py-5">
                    <SchemaViewer 
                      schema={response.content['application/json'].schema}
                      examples={endpoint.examples?.responses?.[status]}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
