import { NextResponse } from 'next/server';
import { supabaseServiceClient } from '@/lib/supabase/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseServiceClient
      .from('apis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'API not found' },
          { status: 404 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch API' },
      { status: 500 }
    );
  }
}
