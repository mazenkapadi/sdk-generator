import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(request: Request) {
  const supabase = supabaseServiceClient;
  const { query, apiId, limit = 10 } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Build the filter condition
    // @ts-ignore - Supabase RPC function not typed
    let rpcCall = supabase.rpc('search_endpoints', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
    });

    // If apiId is provided, filter by it
    if (apiId) {
      rpcCall = rpcCall.eq('api_id', apiId);
    }

    const { data, error } = await rpcCall;

    if (error) {
      console.error('Semantic search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error: any) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
