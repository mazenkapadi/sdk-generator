import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Endpoint {
  id: string
  path: string
  method: string
  summary?: string
  description?: string
  tag?: string
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}

function createSearchableText(endpoint: Endpoint): string {
  const parts = [
    `${endpoint.method} ${endpoint.path}`,
    endpoint.summary || '',
    endpoint.description || '',
    endpoint.tag || '',
  ]
  return parts.filter(Boolean).join(' ')
}

serve(async (req) => {
  try {
    // Verify this is a scheduled request or authorized call
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.includes(supabaseServiceKey.slice(0, 20))) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all endpoints without embeddings
    const { data: endpoints, error: fetchError } = await supabase
      .from('endpoints')
      .select('id, path, method, summary, description, tag')
      .is('embedding', null)
      .limit(100)

    if (fetchError) {
      throw new Error(`Failed to fetch endpoints: ${fetchError.message}`)
    }

    if (!endpoints || endpoints.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No endpoints to process', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0
    let failed = 0

    // Process each endpoint
    for (const endpoint of endpoints) {
      try {
        const searchableText = createSearchableText(endpoint)
        const embedding = await generateEmbedding(searchableText)

        // Update endpoint with embedding
        const { error: updateError } = await supabase
          .from('endpoints')
          .update({ embedding })
          .eq('id', endpoint.id)

        if (updateError) {
          console.error(`Failed to update endpoint ${endpoint.id}:`, updateError)
          failed++
        } else {
          processed++
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing endpoint ${endpoint.id}:`, error)
        failed++
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Embedding generation completed',
        processed,
        failed,
        total: endpoints.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
