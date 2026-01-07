import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface GeneratedGuide {
  guide_type: 'getting_started' | 'authentication' | 'common_workflows';
  title: string;
  content: string;
}

export async function generateGuides(spec: any, apiName: string): Promise<GeneratedGuide[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const guides: GeneratedGuide[] = [];

  // Generate Getting Started guide
  try {
    const gettingStarted = await generateGettingStartedGuide(spec, apiName);
    guides.push(gettingStarted);
  } catch (error) {
    console.error('Failed to generate Getting Started guide:', error);
  }

  // Generate Authentication guide
  try {
    const auth = await generateAuthenticationGuide(spec, apiName);
    guides.push(auth);
  } catch (error) {
    console.error('Failed to generate Authentication guide:', error);
  }

  // Generate Common Workflows guide
  try {
    const workflows = await generateCommonWorkflowsGuide(spec, apiName);
    guides.push(workflows);
  } catch (error) {
    console.error('Failed to generate Common Workflows guide:', error);
  }

  return guides;
}

async function generateGettingStartedGuide(spec: any, apiName: string): Promise<GeneratedGuide> {
  const endpoints = extractEndpointInfo(spec);
  
  const prompt = `Generate a "Getting Started" guide for the ${apiName} API.

API Info:
- Base URL: ${spec.servers?.[0]?.url || 'N/A'}
- Available endpoints: ${endpoints.slice(0, 10).join(', ')}

Create a markdown guide that includes:
1. A brief introduction to the API
2. Prerequisites
3. Basic setup/installation steps
4. A simple "Hello World" example using one of the simplest GET endpoints
5. Next steps

Keep it concise and developer-friendly. Use code examples.`;

  const completion = await openai!.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a technical writer creating API documentation. Write clear, concise guides with practical code examples.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return {
    guide_type: 'getting_started',
    title: 'Getting Started',
    content: completion.choices[0].message.content || '',
  };
}

async function generateAuthenticationGuide(spec: any, apiName: string): Promise<GeneratedGuide> {
  const securitySchemes = spec.components?.securitySchemes || {};
  const securityInfo = JSON.stringify(securitySchemes, null, 2);

  const prompt = `Generate an "Authentication" guide for the ${apiName} API.

Security Schemes:
${securityInfo || 'No security schemes defined'}

Create a markdown guide that explains:
1. What authentication methods are supported
2. How to obtain credentials (if applicable)
3. How to include authentication in requests with code examples
4. Common authentication errors and how to resolve them

Keep it practical with code examples in multiple languages if possible (curl, JavaScript, Python).`;

  const completion = await openai!.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a technical writer creating API documentation. Write clear, concise guides with practical code examples.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return {
    guide_type: 'authentication',
    title: 'Authentication',
    content: completion.choices[0].message.content || '',
  };
}

async function generateCommonWorkflowsGuide(spec: any, apiName: string): Promise<GeneratedGuide> {
  const tags = extractTags(spec);
  const endpoints = extractEndpointInfo(spec);

  const prompt = `Generate a "Common Workflows" guide for the ${apiName} API.

Available tags/categories: ${tags.join(', ')}
Sample endpoints: ${endpoints.slice(0, 15).join(', ')}

Create a markdown guide that describes:
1. 3-5 common use cases or workflows
2. For each workflow, explain which endpoints to call and in what order
3. Include example request/response flows
4. Mention any important considerations or best practices

Focus on practical, real-world scenarios.`;

  const completion = await openai!.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a technical writer creating API documentation. Write clear, concise guides with practical code examples.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return {
    guide_type: 'common_workflows',
    title: 'Common Workflows',
    content: completion.choices[0].message.content || '',
  };
}

function extractEndpointInfo(spec: any): string[] {
  const endpoints: string[] = [];
  
  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
      Object.keys(methods).forEach(method => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          endpoints.push(`${method.toUpperCase()} ${path}`);
        }
      });
    });
  }

  return endpoints;
}

function extractTags(spec: any): string[] {
  const tags = new Set<string>();
  
  if (spec.paths) {
    Object.values(spec.paths).forEach((methods: any) => {
      Object.values(methods).forEach((operation: any) => {
        if (operation.tags && Array.isArray(operation.tags)) {
          operation.tags.forEach((tag: string) => tags.add(tag));
        }
      });
    });
  }

  return Array.from(tags);
}
