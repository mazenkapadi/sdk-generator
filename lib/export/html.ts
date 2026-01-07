import type { ApiRecord, EndpointRecord } from '@/types/database';

const METHOD_COLORS: Record<string, string> = {
  GET: '#3b82f6',
  POST: '#10b981',
  PUT: '#f59e0b',
  PATCH: '#f97316',
  DELETE: '#ef4444',
};

export function generateHTML(api: ApiRecord, endpoints: EndpointRecord[]): string {
  const grouped = groupByTag(endpoints);
  const brandColor = api.primary_color || '#3b82f6';
  const accentColor = api.accent_color || '#8b5cf6';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(api.name)} - API Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #050507;
      --bg-secondary: #08080b;
      --border-color: #27272a;
      --text-primary: #e4e4e7;
      --text-secondary: #a1a1aa;
      --text-muted: #52525b;
      --brand-color: ${brandColor};
      --accent-color: ${accentColor};
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    ${api.logo_url ? `.logo {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
    }` : ''}

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .version {
      background: ${accentColor}20;
      color: ${accentColor};
      border: 1px solid ${accentColor}40;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
    }

    .base-url {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-family: ui-monospace, monospace;
      margin-top: 0.5rem;
    }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    /* Sidebar */
    .sidebar {
      position: sticky;
      top: 120px;
      height: fit-content;
      max-height: calc(100vh - 140px);
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .method-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      border: 1px solid;
    }

    ${Object.entries(METHOD_COLORS).map(([method, color]) => `
    .method-${method.toLowerCase()} {
      background: ${color}20;
      color: ${color};
      border-color: ${color}40;
    }`).join('\n')}

    /* Main content */
    .content {
      max-width: 900px;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .endpoint {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .endpoint-method {
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      border: 1px solid;
    }

    .endpoint-path {
      font-size: 1.125rem;
      font-family: ui-monospace, monospace;
      color: var(--text-primary);
    }

    .endpoint-summary {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .endpoint-description {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .subsection-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }

    th {
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    td {
      padding: 0.75rem 0.5rem;
      font-size: 0.875rem;
      border-bottom: 1px solid var(--border-color);
    }

    code {
      font-family: ui-monospace, monospace;
      background: var(--bg-primary);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    pre {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    pre code {
      background: none;
      padding: 0;
    }

    .code-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .code-tab {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
    }

    .code-tab.active {
      color: var(--text-primary);
      background: var(--bg-secondary);
    }

    .code-example {
      display: none;
    }

    .code-example.active {
      display: block;
    }

    .badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      color: #ef4444;
      background: #ef444420;
      border: 1px solid #ef444440;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-content">
        ${api.logo_url ? `<img src="${escapeHtml(api.logo_url)}" alt="${escapeHtml(api.name)}" class="logo">` : ''}
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h1>${escapeHtml(api.name)}</h1>
            ${api.version ? `<span class="version">v${escapeHtml(api.version)}</span>` : ''}
          </div>
          ${api.base_url ? `<div class="base-url">${escapeHtml(api.base_url)}</div>` : ''}
        </div>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="layout">
      <nav class="sidebar">
        ${Object.entries(grouped).map(([tag, tagEndpoints]) => `
          <div class="nav-section">
            <div class="nav-section-title">${escapeHtml(tag)}</div>
            ${tagEndpoints.map(endpoint => `
              <a href="#${slugify(endpoint.method + '-' + endpoint.path)}" class="nav-link">
                <span class="method-badge method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span style="font-family: ui-monospace, monospace; font-size: 0.75rem;">${escapeHtml(endpoint.path)}</span>
              </a>
            `).join('')}
          </div>
        `).join('')}
      </nav>

      <main class="content">
        ${Object.entries(grouped).map(([tag, tagEndpoints]) => `
          <section class="section">
            <h2 class="section-title">${escapeHtml(tag)}</h2>
            ${tagEndpoints.map(endpoint => generateEndpointHTML(endpoint, api)).join('')}
          </section>
        `).join('')}
      </main>
    </div>
  </div>

  <script>
    // Code tab switching
    document.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const parent = tab.parentElement.parentElement;
        const lang = tab.dataset.lang;
        
        parent.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        parent.querySelectorAll('.code-example').forEach(e => e.classList.remove('active'));
        
        tab.classList.add('active');
        parent.querySelector(\`.code-example[data-lang="\${lang}"]\`).classList.add('active');
      });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`;
}

function generateEndpointHTML(endpoint: EndpointRecord, api: ApiRecord): string {
  const methodColor = METHOD_COLORS[endpoint.method] || '#6b7280';
  
  return `
    <div class="endpoint" id="${slugify(endpoint.method + '-' + endpoint.path)}">
      <div class="endpoint-header">
        <span class="endpoint-method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
        <code class="endpoint-path">${escapeHtml(endpoint.path)}</code>
      </div>

      ${endpoint.summary ? `<div class="endpoint-summary">${escapeHtml(endpoint.summary)}</div>` : ''}
      ${endpoint.description ? `<div class="endpoint-description">${escapeHtml(endpoint.description)}</div>` : ''}

      ${endpoint.parameters && endpoint.parameters.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <div class="subsection-title">Parameters</div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>In</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${endpoint.parameters.map(param => `
                <tr>
                  <td><code>${escapeHtml(param.name || '')}</code></td>
                  <td>${escapeHtml(param.schema?.type || 'string')}</td>
                  <td>${escapeHtml(param.in || '')}</td>
                  <td>${param.required ? '<span class="badge">required</span>' : ''}</td>
                  <td>${escapeHtml(param.description || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${endpoint.request_body_schema ? `
        <div style="margin-bottom: 1.5rem;">
          <div class="subsection-title">Request Body</div>
          <pre><code>${escapeHtml(JSON.stringify(endpoint.request_body_schema, null, 2))}</code></pre>
        </div>
      ` : ''}

      ${endpoint.responses && Object.keys(endpoint.responses).length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <div class="subsection-title">Responses</div>
          ${Object.entries(endpoint.responses).map(([status, response]) => {
            const schema = (response as any).content?.['application/json']?.schema;
            return `
              <div style="margin-bottom: 1rem;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">
                  ${status} - ${escapeHtml((response as any).description || 'Success')}
                </div>
                ${schema ? `<pre><code>${escapeHtml(JSON.stringify(schema, null, 2))}</code></pre>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <div>
        <div class="subsection-title">Code Examples</div>
        <div class="code-tabs">
          <button class="code-tab active" data-lang="curl">cURL</button>
          <button class="code-tab" data-lang="javascript">JavaScript</button>
          <button class="code-tab" data-lang="python">Python</button>
        </div>
        <div class="code-example active" data-lang="curl">
          <pre><code>${escapeHtml(generateCurlExample(endpoint, api.base_url))}</code></pre>
        </div>
        <div class="code-example" data-lang="javascript">
          <pre><code>${escapeHtml(generateJavaScriptExample(endpoint, api.base_url))}</code></pre>
        </div>
        <div class="code-example" data-lang="python">
          <pre><code>${escapeHtml(generatePythonExample(endpoint, api.base_url))}</code></pre>
        </div>
      </div>
    </div>
  `;
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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
