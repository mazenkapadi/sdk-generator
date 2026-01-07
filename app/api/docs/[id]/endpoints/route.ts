import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    let query = supabaseServiceClient
      .from('endpoints')
      .select('*', { count: 'exact' })
      .eq('api_id', id);

    if (tag) {
      query = query.eq('tag', tag);
    }

    if (search) {
      query = query.or(
        `path.ilike.%${search}%,summary.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await query
      .order('tag', { ascending: true, nullsFirst: false })
      .order('path', { ascending: true })
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
      { error: err.message ?? 'Failed to fetch endpoints' },
      { status: 500 }
    );
  }
}
