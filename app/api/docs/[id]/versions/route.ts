import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = supabaseServiceClient;
  
  const { data: versions, error } = await supabase
    .from('api_versions')
    .select('*')
    .eq('api_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(versions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = supabaseServiceClient;
  const body = await request.json();

  const { version, spec_data, changelog, is_current } = body;

  // If this is marked as current, unmark other versions
  if (is_current) {
    // @ts-ignore - Supabase type inference issue
    const updatePayload = { is_current: false };
    // @ts-ignore
    const updateResult = await supabase.from('api_versions').update(updatePayload).eq('api_id', id);
  }

  const insertPayload = {
    api_id: id,
    version,
    spec_data,
    changelog,
    is_current: is_current ?? false,
  };
  // @ts-ignore - Supabase type inference issue with insert
  const { data, error } = await supabase.from('api_versions').insert(insertPayload as any).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
