import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import { enrichEndpoint } from '@/lib/ai/enrich';
import type { EndpointRecord } from '@/types/database';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for enriching all endpoints

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all endpoints for this API
    const { data: endpoints, error: fetchError } = await supabaseServiceClient
      .from('endpoints')
      .select('*')
      .eq('api_id', id)
      .returns<EndpointRecord[]>();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!endpoints || endpoints.length === 0) {
      return NextResponse.json({ message: 'No endpoints to enrich' });
    }

    let enrichedCount = 0;
    const errors: string[] = [];

    // Enrich each endpoint
    for (const endpoint of endpoints) {
      try {
        const enrichment = await enrichEndpoint({
          method: endpoint.method,
          path: endpoint.path,
          summary: endpoint.summary,
          description: endpoint.description,
          parameters: endpoint.parameters,
          request_body_schema: endpoint.request_body_schema,
          responses: endpoint.responses,
        });

        // Update endpoint with enrichment data
        const updates: Partial<Pick<EndpointRecord, 'summary' | 'ai_example_request' | 'ai_example_response'>> = {};
        
        if (enrichment.summary && !endpoint.summary) {
          updates.summary = enrichment.summary;
        }
        
        if (enrichment.exampleRequest) {
          updates.ai_example_request = enrichment.exampleRequest;
        }
        
        if (enrichment.exampleResponse) {
          updates.ai_example_response = enrichment.exampleResponse;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabaseServiceClient
            .from('endpoints')
            // @ts-ignore - Supabase type inference issue with dynamic updates
            .update(updates)
            .eq('id', endpoint.id);

          if (updateError) {
            errors.push(`${endpoint.method} ${endpoint.path}: ${updateError.message}`);
          } else {
            enrichedCount++;
          }
        }
      } catch (err: any) {
        errors.push(`${endpoint.method} ${endpoint.path}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message: `AI enrichment completed`,
      enriched: enrichedCount,
      total: endpoints.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Enrichment error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to enrich endpoints' },
      { status: 500 }
    );
  }
}
