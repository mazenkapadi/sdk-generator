import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import type { EndpointRecord } from '@/types/database';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all endpoints for this API to extract schemas
    const { data: endpoints, error } = await supabaseServiceClient
      .from('endpoints')
      .select('request_body_schema, responses')
      .eq('api_id', id)
      .returns<Pick<EndpointRecord, 'request_body_schema' | 'responses'>[]>();

    if (error) {
      throw new Error(error.message);
    }

    // Extract unique schemas from endpoints
    const schemas: Record<string, any> = {};
    
    endpoints?.forEach((endpoint) => {
      // Extract from request body schemas
      if (endpoint.request_body_schema) {
        extractSchemas(endpoint.request_body_schema, schemas);
      }

      // Extract from response schemas
      if (endpoint.responses) {
        Object.values(endpoint.responses).forEach((response: any) => {
          if (response.content?.['application/json']?.schema) {
            extractSchemas(response.content['application/json'].schema, schemas);
          }
        });
      }
    });

    return NextResponse.json({
      data: Object.entries(schemas).map(([name, schema]) => ({
        name,
        schema,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
}

function extractSchemas(obj: any, schemas: Record<string, any>) {
  if (!obj || typeof obj !== 'object') return;

  // Handle $ref references to components/schemas
  if (obj.$ref && typeof obj.$ref === 'string') {
    const match = obj.$ref.match(/#\/components\/schemas\/(.+)/);
    if (match && match[1]) {
      const schemaName = match[1];
      if (!schemas[schemaName]) {
        schemas[schemaName] = { $ref: obj.$ref };
      }
    }
  }

  // Recursively extract from properties
  if (obj.properties) {
    Object.values(obj.properties).forEach((prop: any) => {
      extractSchemas(prop, schemas);
    });
  }

  // Recursively extract from items (arrays)
  if (obj.items) {
    extractSchemas(obj.items, schemas);
  }

  // Recursively extract from allOf, anyOf, oneOf
  ['allOf', 'anyOf', 'oneOf'].forEach((key) => {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any) => extractSchemas(item, schemas));
    }
  });
}
