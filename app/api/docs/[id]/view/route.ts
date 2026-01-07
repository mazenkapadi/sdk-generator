import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';
import type { ApiRecord } from '@/types/database';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Increment view count and update last viewed
    const { data: currentApi } = await supabaseServiceClient
      .from('apis')
      .select('view_count')
      .eq('id', id)
      .single<Pick<ApiRecord, 'view_count'>>();

    const newViewCount = (currentApi?.view_count || 0) + 1;

    const { error } = await supabaseServiceClient
      .from('apis')
      // @ts-ignore - Supabase type inference issue
      .update({
        last_viewed_at: new Date().toISOString(),
        view_count: newViewCount
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, view_count: newViewCount });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track view' },
      { status: 500 }
    );
  }
}
