import type { ApiRecord, EndpointRecord } from '@/types/database';

export function generateMarkdown(api: ApiRecord, endpoints: EndpointRecord[]): string {
  const lines: string[] = [];

  // Title and metadata
  lines.push(`# ${api.name}`);
  lines.push('');
  
  if (api.version) {
    lines.push(`**Version:** ${api.version}`);
    lines.push('');
  }

  if (api.base_url) {
    lines.push(`**Base URL:** \`${api.base_url}\``);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Table of contents
  lines.push('## Table of Contents');
  lines.push('');

  // Group endpoints by tag
  const grouped = groupByTag(endpoints);
  
  for (const [tag, tagEndpoints] of Object.entries(grouped)) {
    lines.push(`- [${tag}](#${slugify(tag)})`);
    for (const endpoint of tagEndpoints) {
      const linkText = `${endpoint.method} ${endpoint.path}`;
      lines.push(`  - [${linkText}](#${slugify(endpoint.method + '-' + endpoint.path)})`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // Endpoints
  for (const [tag, tagEndpoints] of Object.entries(grouped)) {
    lines.push(`## ${tag}`);
    lines.push('');

    for (const endpoint of tagEndpoints) {
      lines.push(`### ${endpoint.method} ${endpoint.path}`);
      lines.push('');

      if (endpoint.summary) {
        lines.push(`**${endpoint.summary}**`);
        lines.push('');
      }

      if (endpoint.description) {
        lines.push(endpoint.description);
        lines.push('');
      }

      // Parameters
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        lines.push('#### Parameters');
        lines.push('');
        lines.push('| Name | Type | In | Required | Description |');
        lines.push('|------|------|----| ---------|-------------|');

        for (const param of endpoint.parameters) {
          const name = param.name || '';
          const type = param.schema?.type || 'string';
          const location = param.in || '';
          const required = param.required ? 'Yes' : 'No';
          const description = (param.description || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
          
          lines.push(`| \`${name}\` | ${type} | ${location} | ${required} | ${description} |`);
        }

        lines.push('');
      }

      // Request body
      if (endpoint.request_body_schema) {
        lines.push('#### Request Body');
        lines.push('');
        lines.push('```json');
        lines.push(JSON.stringify(endpoint.request_body_schema, null, 2));
        lines.push('```');
        lines.push('');

        if (endpoint.ai_example_request) {
          lines.push('**Example Request:**');
          lines.push('');
          lines.push('```json');
          lines.push(JSON.stringify(endpoint.ai_example_request, null, 2));
          lines.push('```');
          lines.push('');
        }
      }

      // Responses
      if (endpoint.responses && Object.keys(endpoint.responses).length > 0) {
        lines.push('#### Responses');
        lines.push('');

        for (const [status, response] of Object.entries(endpoint.responses)) {
          lines.push(`**${status}** - ${(response as any).description || 'Success'}`);
          lines.push('');

          const schema = (response as any).content?.['application/json']?.schema;
          if (schema) {
            lines.push('```json');
            lines.push(JSON.stringify(schema, null, 2));
            lines.push('```');
            lines.push('');
          }

          if (endpoint.ai_example_response && status.startsWith('2')) {
            lines.push('**Example Response:**');
            lines.push('');
            lines.push('```json');
            lines.push(JSON.stringify(endpoint.ai_example_response, null, 2));
            lines.push('```');
            lines.push('');
          }
        }
      }

      // Code examples
      lines.push('#### Code Examples');
      lines.push('');
      lines.push('**cURL:**');
      lines.push('');
      lines.push('```bash');
      lines.push(generateCurlExample(endpoint, api.base_url));
      lines.push('```');
      lines.push('');

      lines.push('**JavaScript:**');
      lines.push('');
      lines.push('```javascript');
      lines.push(generateJavaScriptExample(endpoint, api.base_url));
      lines.push('```');
      lines.push('');

      lines.push('**Python:**');
      lines.push('');
      lines.push('```python');
      lines.push(generatePythonExample(endpoint, api.base_url));
      lines.push('```');
      lines.push('');

      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function groupByTag(endpoints: EndpointRecord[]): Record<string, EndpointRecord[]> {
  const grouped: Record<string, EndpointRecord[]> = {};
  
  for (const endpoint of endpoints) {
    const tag = endpoint.tag || 'General';
    if (!grouped[tag]) {
      grouped[tag] = [];
    }
    grouped[tag].push(endpoint);
  }

  return grouped;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateCurlExample(endpoint: EndpointRecord, baseUrl?: string): string {
  const url = `${baseUrl || 'https://api.example.com'}${endpoint.path}`;
  let cmd = `curl -X ${endpoint.method} "${url}"`;

  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.request_body_schema) {
    cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`;
  }

  return cmd;
}

function generateJavaScriptExample(endpoint: EndpointRecord, baseUrl?: string): string {
  const url = `${baseUrl || 'https://api.example.com'}${endpoint.path}`;
  
  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.request_body_schema) {
    return `fetch("${url}", {
  method: "${endpoint.method}",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({})
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  }

  return `fetch("${url}")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
}

function generatePythonExample(endpoint: EndpointRecord, baseUrl?: string): string {
  const url = `${baseUrl || 'https://api.example.com'}${endpoint.path}`;
  
  if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.request_body_schema) {
    return `import requests

headers = {"Content-Type": "application/json"}
data = {}

response = requests.${endpoint.method.toLowerCase()}(
    "${url}",
    headers=headers,
    json=data
)
print(response.json())`;
  }

  return `import requests

response = requests.${endpoint.method.toLowerCase()}("${url}")
print(response.json())`;
}
