import { parseOpenApiSpec as parseBasic } from './parse';

export interface EnhancedEndpoint {
  tag?: string;
  method: string;
  path: string;
  operation_id?: string;
  summary?: string;
  description?: string;
  parameters: any[];
  request_body_schema?: any;
  responses: Record<string, any>;
  // New enhanced fields
  deprecated?: boolean;
  experimental?: boolean;
  internal?: boolean;
  stability?: string;
  rate_limit?: string;
  examples?: any;
  extensions?: Record<string, any>;
}

export async function parseOpenApiSpecEnhanced(specText: string) {
  // Get basic parsed data
  const basicParsed = await parseBasic(specText);
  
  // Parse the spec again to extract extensions
  let spec: any;
  try {
    spec = JSON.parse(specText);
  } catch {
    // If JSON fails, might be YAML - parseBasic already handled it
    const yaml = await import('yaml');
    spec = yaml.parse(specText);
  }

  // Enhance endpoints with extension data
  const enhancedEndpoints: EnhancedEndpoint[] = basicParsed.endpoints.map((endpoint: any) => {
    const pathItem = spec.paths?.[endpoint.path];
    const operation = pathItem?.[endpoint.method.toLowerCase()];

    if (!operation) return endpoint;

    // Extract standard extensions
    const deprecated = operation.deprecated || operation['x-deprecated'] || false;
    const experimental = operation['x-experimental'] || false;
    const internal = operation['x-internal'] || false;
    const stability = operation['x-stability'] || (deprecated ? 'deprecated' : 'stable');
    const rate_limit = operation['x-rate-limit'];

    // Extract examples
    let examples: any = null;
    if (operation.requestBody?.content?.['application/json']?.examples) {
      examples = operation.requestBody.content['application/json'].examples;
    } else if (operation.requestBody?.content?.['application/json']?.example) {
      examples = { default: operation.requestBody.content['application/json'].example };
    }

    // Extract all x-* extensions
    const extensions: Record<string, any> = {};
    Object.keys(operation).forEach((key) => {
      if (key.startsWith('x-')) {
        extensions[key] = operation[key];
      }
    });

    return {
      ...endpoint,
      deprecated,
      experimental,
      internal,
      stability,
      rate_limit,
      examples,
      extensions: Object.keys(extensions).length > 0 ? extensions : null,
    };
  });

  return {
    ...basicParsed,
    endpoints: enhancedEndpoints,
  };
}

// Extract tags from OpenAPI spec for categorization
export function extractSpecTags(spec: any): string[] {
  const tags: Set<string> = new Set();
  
  // Add global tags
  if (spec.tags && Array.isArray(spec.tags)) {
    spec.tags.forEach((tag: any) => {
      if (tag.name) tags.add(tag.name);
    });
  }

  // Add tags from endpoints
  Object.values(spec.paths || {}).forEach((pathItem: any) => {
    ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
      const operation = pathItem[method];
      if (operation?.tags) {
        operation.tags.forEach((tag: string) => tags.add(tag));
      }
    });
  });

  return Array.from(tags);
}
