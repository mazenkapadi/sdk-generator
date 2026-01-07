import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import { generateGuides } from '@/lib/ai/generateGuides';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = supabaseServiceClient;
  
  const { data: guides, error } = await supabase
    .from('guides')
    .select('*')
    .eq('api_id', id)
    .order('guide_type');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(guides);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = supabaseServiceClient;

  // Fetch API and spec
  const { data: api, error: apiError } = await supabase
    .from('apis')
    .select('*')
    .eq('id', id)
    .single();

  if (apiError || !api) {
    return NextResponse.json({ error: 'API not found' }, { status: 404 });
  }

  try {
    // Generate guides using AI
    // @ts-ignore - Supabase type inference issue
    const guides = await generateGuides(api.spec, api.name);

    // Delete existing guides for this API
    await supabase
      .from('guides')
      .delete()
      .eq('api_id', id);

    // Insert new guides
    const guidesToInsert = guides.map(guide => ({
      api_id: id,
      guide_type: guide.guide_type,
      title: guide.title,
      content: guide.content,
      is_ai_generated: true,
    }));
    
    // @ts-ignore - Supabase type inference issue with insert
    const { data: insertedGuides, error: insertError } = await supabase
      .from('guides')
      .insert(guidesToInsert as any)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: guides.length,
      guides: insertedGuides 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to generate guides' 
    }, { status: 500 });
  }
}
