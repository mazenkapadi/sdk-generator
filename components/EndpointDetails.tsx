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
    <article className="space-y-12">
      {/* Header Section */}
      <header className="space-y-4 pb-8">
        {endpoint.summary && (
          <h1 className="text-xl font-medium text-[var(--text-primary)]">
            {endpoint.summary}
          </h1>
        )}

        <div className="flex items-baseline gap-2">
          <span
            className={`text-xs font-mono font-semibold uppercase ${
              endpoint.method === 'GET' ? 'text-blue-600' :
              endpoint.method === 'POST' ? 'text-green-600' :
              endpoint.method === 'PUT' ? 'text-yellow-600' :
              endpoint.method === 'PATCH' ? 'text-orange-600' :
              endpoint.method === 'DELETE' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-[var(--text-secondary)]">
            {endpoint.path}
          </code>
        </div>

        {endpoint.description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {endpoint.description}
          </p>
        )}
      </header>

      {/* Parameters */}
      {endpoint.parameters && endpoint.parameters.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] uppercase tracking-wide">Parameters</h3>
          <div className="space-y-4">
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
                <div key={idx} className="py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <code className="text-sm font-mono font-medium text-[var(--text-primary)]">
                      {param.name}
                    </code>
                    <span className="text-xs text-[var(--text-muted)]">
                      {param.schema?.type || 'string'}
                    </span>
                    {param.required && (
                      <span className="text-xs text-red-600">required</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] uppercase tracking-wide">Request Body</h3>
          <SchemaViewer 
            schema={endpoint.request_body_schema} 
            examples={endpoint.examples?.request}
          />
        </section>
      )}

      {/* Responses */}
      {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] uppercase tracking-wide">Returns</h3>
          <div className="space-y-6">
            {Object.entries(endpoint.responses).map(([status, response]: [string, any]) => (
              <div key={status}>
                <div className="mb-2">
                  <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
                    {status}
                  </span>
                  {response.description && (
                    <span className="text-sm text-[var(--text-secondary)] ml-2">
                      {response.description}
                    </span>
                  )}
                </div>
                {response.content?.['application/json']?.schema && (
                  <SchemaViewer 
                    schema={response.content['application/json'].schema}
                    examples={endpoint.examples?.responses?.[status]}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
