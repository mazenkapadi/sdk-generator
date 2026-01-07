type EndpointInfo = {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  parameters?: any[];
  request_body_schema?: any;
  responses?: Record<string, any>;
};

type EnrichmentResult = {
  summary?: string;
  exampleRequest?: any;
  exampleResponse?: any;
};

export async function enrichEndpoint(endpoint: EndpointInfo): Promise<EnrichmentResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not configured. Skipping AI enrichment.');
    return {};
  }

  try {
    const prompt = buildPrompt(endpoint);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an API documentation assistant. Generate concise, helpful endpoint summaries and realistic example request/response data for API endpoints.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {};
    }

    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary,
      exampleRequest: parsed.example_request,
      exampleResponse: parsed.example_response,
    };
  } catch (error) {
    console.error('AI enrichment error:', error);
    return {};
  }
}

function buildPrompt(endpoint: EndpointInfo): string {
  const parts = [
    `Generate a JSON object with enrichment data for this API endpoint:`,
    ``,
    `Method: ${endpoint.method}`,
    `Path: ${endpoint.path}`,
  ];

  if (endpoint.summary) {
    parts.push(`Current Summary: ${endpoint.summary}`);
  }

  if (endpoint.description) {
    parts.push(`Description: ${endpoint.description}`);
  }

  if (endpoint.parameters && endpoint.parameters.length > 0) {
    parts.push(`Parameters: ${JSON.stringify(endpoint.parameters, null, 2)}`);
  }

  if (endpoint.request_body_schema) {
    parts.push(`Request Body Schema: ${JSON.stringify(endpoint.request_body_schema, null, 2)}`);
  }

  if (endpoint.responses) {
    parts.push(`Response Schemas: ${JSON.stringify(endpoint.responses, null, 2)}`);
  }

  parts.push(``);
  parts.push(`Please provide:`);
  parts.push(`1. A concise, human-friendly summary (1 sentence) if one doesn't exist or if the current summary can be improved`);
  parts.push(`2. A realistic example request body (if the endpoint accepts a request body)`);
  parts.push(`3. A realistic example response (based on the 200/201 response schema if available)`);
  parts.push(``);
  parts.push(`Return your response as a JSON object with this structure:`);
  parts.push(`{`);
  parts.push(`  "summary": "improved or generated summary",`);
  parts.push(`  "example_request": { /* realistic example request body if applicable */ },`);
  parts.push(`  "example_response": { /* realistic example response */ }`);
  parts.push(`}`);

  return parts.join('\n');
}
