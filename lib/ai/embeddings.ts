import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export function createSearchableText(endpoint: {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tag?: string;
}): string {
  const parts = [
    `${endpoint.method} ${endpoint.path}`,
    endpoint.summary || '',
    endpoint.description || '',
    endpoint.tag || '',
  ];

  return parts.filter(Boolean).join(' ');
}

export async function generateEndpointEmbedding(endpoint: {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tag?: string;
}): Promise<number[]> {
  const searchableText = createSearchableText(endpoint);
  return generateEmbedding(searchableText);
}
