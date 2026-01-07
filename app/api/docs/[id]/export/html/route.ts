import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import { generateHTML } from '@/lib/export/html';
import type { ApiRecord, EndpointRecord } from '@/types/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = supabaseServiceClient;

  // Fetch API details
  const { data: api, error: apiError } = await supabase
    .from('apis')
    .select('*')
    .eq('id', id)
    .single<ApiRecord>();

  if (apiError || !api) {
    return NextResponse.json(
      { error: 'API not found' },
      { status: 404 }
    );
  }

  // Fetch all endpoints
  const { data: endpoints, error: endpointsError } = await supabase
    .from('endpoints')
    .select('*')
    .eq('api_id', id)
    .order('path')
    .returns<EndpointRecord[]>();

  if (endpointsError) {
    return NextResponse.json(
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    );
  }

  // Generate HTML
  const html = generateHTML(api, endpoints || []);

  // Create sanitized filename
  const filename = `${api.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-api-docs.html`;

  // Return as downloadable file
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
