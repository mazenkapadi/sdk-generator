import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import { parseOpenApiSpecEnhanced } from '@/lib/openapi/parseEnhanced';

export const runtime = 'nodejs';

// POST - Upload and parse OpenAPI spec
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const baseUrl = formData.get('base_url') as string | null;
    const logoUrl = formData.get('logo_url') as string | null;
    const primaryColor = formData.get('primary_color') as string | null;
    const accentColor = formData.get('accent_color') as string | null;
    const tagsRaw = formData.get('tags') as string | null;
    const description = formData.get('description') as string | null;
    const environment = formData.get('environment') as string | null;
    
    // Parse tags from comma-separated string
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    const specText = buffer.toString('utf-8');

    // Parse the OpenAPI spec with enhanced metadata
    const parsed = await parseOpenApiSpecEnhanced(specText);

    // Store raw spec file in Supabase Storage
    let storagePath: string | null = null;
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabaseServiceClient.storage
        .from('api-specs')
        .upload(fileName, buffer, {
          contentType: file.type || 'application/json',
          upsert: false,
        });

      if (uploadError) {
        console.warn('Failed to upload spec to storage:', uploadError);
      } else {
        storagePath = uploadData.path;
      }
    } catch (storageErr) {
      console.warn('Storage upload error:', storageErr);
      // Continue even if storage fails
    }

    // Insert API record
    const { data: api, error: apiError } = await supabaseServiceClient
      .from('apis')
      // @ts-ignore - Supabase type inference issue with insert
      .insert({
        name: name || parsed.info.title,
        version: parsed.info.version,
        base_url: baseUrl || parsed.baseUrl,
        spec_storage_path: storagePath,
        logo_url: logoUrl,
        primary_color: primaryColor,
        accent_color: accentColor,
        tags: tags,
        description: description,
        environment: environment,
      })
      .select('id')
      .single();

    if (apiError) {
      console.error('API insert error:', apiError);
      throw new Error(apiError.message);
    }

    // Insert endpoints with enhanced metadata
    const endpointsToInsert = parsed.endpoints.map((e: any) => ({
      api_id: (api as { id: string }).id,
      tag: e.tag,
      method: e.method,
      path: e.path,
      operation_id: e.operation_id,
      summary: e.summary,
      description: e.description,
      parameters: e.parameters,
      request_body_schema: e.request_body_schema,
      responses: e.responses,
      deprecated: e.deprecated,
      experimental: e.experimental,
      internal: e.internal,
      stability: e.stability,
      rate_limit: e.rate_limit,
      examples: e.examples,
      extensions: e.extensions,
    }));

    const { error: endpointsError } = await supabaseServiceClient
      .from('endpoints')
      // @ts-ignore - Supabase type inference issue with insert
      .insert(endpointsToInsert);

    if (endpointsError) {
      console.error('Endpoints insert error:', endpointsError);
      throw new Error(endpointsError.message);
    }

    return NextResponse.json({ apiId: (api as { id: string }).id, message: 'API documentation uploaded successfully' });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to parse or save specification' },
      { status: 400 }
    );
  }
}

// GET - List all APIs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabaseServiceClient
      .from('apis')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch APIs' },
      { status: 500 }
    );
  }
}
