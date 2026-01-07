import {NextRequest, NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {generateGuides} from '@/lib/ai/generateGuides';

export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const {id} = await params;

        // Fetch the API record with its spec
        const {data: api, error: apiError} = await supabase
            .from('apis')
            .select('*')
            .eq('id', id)
            .single();

        if (apiError || !api) {
            return NextResponse.json(
                {error: 'API not found'},
                {status: 404}
            );
        }

        // Type assertion to help TypeScript understand the api object
        const apiData = api as any;

        // Check if AI is enabled
        if (process.env.NEXT_PUBLIC_ENABLE_AI === 'false') {
            return NextResponse.json(
                {error: 'AI features are disabled'},
                {status: 403}
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                {error: 'OpenAI API key not configured'},
                {status: 500}
            );
        }

        // Generate guides using AI
        const guides = await generateGuides(apiData.spec_data, apiData.name);

        if (guides.length === 0) {
            return NextResponse.json(
                {error: 'Failed to generate any guides'},
                {status: 500}
            );
        }

        // Insert generated guides into the guides table
        const guidesToInsert = guides.map(guide => ({
            api_id: id,
            title: guide.title,
            content: guide.content,
            guide_type: guide.guide_type,
            is_ai_generated: true,
        }));

        const {data: insertedGuides, error: insertError} = await (supabase
            .from('guides') as any)
            .upsert(guidesToInsert, {
                onConflict: 'api_id,guide_type',
                ignoreDuplicates: false,
            })
            .select();

        if (insertError) {
            console.error('Error inserting guides:', insertError);
            return NextResponse.json(
                {error: 'Failed to save generated guides', details: insertError.message},
                {status: 500}
            );
        }

        return NextResponse.json({
            success: true,
            generated: guides.length,
            guides: insertedGuides,
        });
    } catch (error: any) {
        console.error('Error generating guides:', error);
        return NextResponse.json(
            {error: 'Failed to generate guides', details: error.message},
            {status: 500}
        );
    }
}
