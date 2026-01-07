import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServiceClient
      .from('apis')
      // @ts-ignore - Supabase type inference issue
      .update({ is_favorite: true })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, is_favorite: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to favorite API' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServiceClient
      .from('apis')
      // @ts-ignore - Supabase type inference issue
      .update({ is_favorite: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, is_favorite: false });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unfavorite API' },
      { status: 500 }
    );
  }
}
