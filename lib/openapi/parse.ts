import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

const OpenApiInfoSchema = z.object({
  title: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
});

export type ParsedEndpoint = {
  method: string;
  path: string;
  tag?: string;
  operation_id?: string;
  summary?: string;
  description?: string;
  parameters: any[];
  request_body_schema?: any;
  responses: Record<string, any>;
};

export type ParsedApiSpec = {
  info: {
    title: string;
    version?: string;
    description?: string;
  };
  baseUrl?: string;
  endpoints: ParsedEndpoint[];
};

export async function parseOpenApiSpec(specText: string): Promise<ParsedApiSpec> {
  let spec: any;
  
  // Try parsing as JSON first, then YAML
  try {
    spec = JSON.parse(specText);
  } catch {
    try {
      spec = parseYaml(specText);
    } catch (yamlError) {
      throw new Error('Invalid JSON or YAML format');
    }
  }

  // Validate OpenAPI version
  if (!spec.openapi || !String(spec.openapi).startsWith('3.')) {
    throw new Error('OpenAPI v3 specification required');
  }

  // Validate and extract info
  const info = OpenApiInfoSchema.parse(spec.info);

  // Extract base URL from servers
  const baseUrl = spec.servers?.[0]?.url ?? null;

  // Parse endpoints
  const endpoints: ParsedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem as any)) {
      // Only process HTTP methods
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        continue;
      }

      const op = operation as any;
      const tags = Array.isArray(op.tags) ? op.tags : [];

      endpoints.push({
        method: method.toUpperCase(),
        path,
        tag: tags[0] ?? null,
        operation_id: op.operationId ?? null,
        summary: op.summary ?? null,
        description: op.description ?? null,
        parameters: op.parameters ?? [],
        request_body_schema:
          op.requestBody?.content?.['application/json']?.schema ?? null,
        responses: op.responses ?? {},
      });
    }
  }

  return {
    info: {
      title: info.title,
      version: info.version,
      description: info.description,
    },
    baseUrl: baseUrl ?? undefined,
    endpoints,
  };
}
