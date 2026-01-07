# Endpoint Health Info & AI-Generated Guides

This document explains the two major features that have been implemented:

## 1. Endpoint Health Information

### Overview
The system now displays visual health indicators for all endpoints based on OpenAPI specifications and custom extensions.

### Supported Health Statuses

#### **Deprecated** ⚠️
- **Color**: Red
- **Badge**: "Deprecated" with warning icon
- **Detection**: Standard OpenAPI `deprecated: true` field
- **Additional Info**: When viewing endpoint details, shows:
  - Deprecation date
  - Sunset date (when endpoint will be removed)
  - Migration guide with instructions

#### **Experimental** 🧪
- **Color**: Purple  
- **Badge**: "Experimental" with test tube icon
- **Detection**: Custom extension `x-status: "experimental"`
- **Meaning**: Feature is under development, may change

#### **Beta** 🚀
- **Color**: Blue
- **Badge**: "Beta" with rocket icon  
- **Detection**: Custom extension `x-status: "beta"`
- **Meaning**: Feature is stable but still being tested

#### **Rate Limited** ⏱️
- **Color**: Amber
- **Badge**: Shows limit (e.g., "1000/hour")
- **Detection**: Custom extension `x-rate-limit`
- **Format**: 
  ```json
  "x-rate-limit": {
    "requests": 1000,
    "period": "hour"
  }
  ```

### Where Health Info Appears

1. **Endpoint Sidebar**
   - Small icon badges next to endpoint names
   - Hover to see status label

2. **Endpoint Details Page**
   - Full badges with labels and icons
   - Deprecation details panel (if deprecated)
     - Shows all deprecation metadata
     - Migration instructions
     - Important dates

### Example OpenAPI Extensions

```json
{
  "paths": {
    "/users/{id}": {
      "get": {
        "deprecated": true,
        "x-deprecation-info": {
          "deprecation_date": "2024-06-01",
          "sunset_date": "2025-01-01",
          "migration_guide": "Use GET /v2/users/{id} instead"
        }
      }
    },
    "/products/search/semantic": {
      "post": {
        "x-status": "beta",
        "x-rate-limit": {
          "requests": 100,
          "period": "hour"
        }
      }
    }
  }
}
```

### Implementation Files

- **Utility**: `lib/endpoint-health.ts` - Extracts health data from endpoints
- **Component**: `components/EndpointStatusBadges.tsx` - Displays health badges
- **Sidebar**: `components/EndpointSidebar.tsx` - Shows icons in list
- **Details**: `components/EndpointDetails.tsx` - Full health info display

---

## 2. AI-Generated Guides

### Overview
The system can automatically generate comprehensive documentation guides by analyzing your OpenAPI specification using GPT-4.

### Generated Guide Types

#### **1. Getting Started** 📚
Automatically creates:
- Introduction to your API
- Prerequisites and setup instructions
- Basic "Hello World" example using a simple endpoint
- Next steps for developers

#### **2. Authentication** 🔐
Automatically creates:
- Overview of supported authentication methods
- How to obtain credentials
- Code examples showing authentication in requests
- Common authentication errors and solutions
- Examples in multiple languages (curl, JavaScript, Python)

#### **3. Common Workflows** 🔄
Automatically creates:
- 3-5 real-world use cases
- Step-by-step endpoint calling sequences
- Example request/response flows
- Best practices and considerations

### How It Works

1. **Spec Analysis**: AI scans your OpenAPI spec to understand:
   - Available endpoints and their purposes
   - Security schemes and authentication
   - Endpoint tags/categories
   - Common patterns and relationships

2. **Guide Generation**: For each guide type:
   - Extracts relevant information from spec
   - Generates developer-friendly markdown content
   - Includes practical code examples
   - Focuses on real-world scenarios

3. **Storage**: Generated guides are:
   - Saved to the `guides` table in Supabase
   - Marked with `is_ai_generated: true`
   - Linked to the API via `api_id`
   - Can be regenerated/updated anytime

### How to Use

#### Via UI (Guides Tab)

1. Navigate to your API documentation
2. Click on the "Guides" tab
3. Click the "✨ AI" button in the sidebar
4. Wait for generation (usually 10-30 seconds)
5. Generated guides appear automatically

#### Via API

```bash
POST /api/docs/{api_id}/guides/generate
```

**Response:**
```json
{
  "success": true,
  "generated": 3,
  "guides": [
    {
      "id": "...",
      "api_id": "...",
      "title": "Getting Started",
      "guide_type": "getting_started",
      "content": "...",
      "is_ai_generated": true
    },
    // ... more guides
  ]
}
```

### Requirements

- **OpenAI API Key**: Must be set in `.env`
  ```env
  OPENAI_API_KEY=sk-...
  ```

- **AI Features Enabled**: 
  ```env
  NEXT_PUBLIC_ENABLE_AI=true
  ```

### Database Schema

The `guides` table requires these fields:
- `id` (uuid, primary key)
- `api_id` (uuid, foreign key)
- `title` (text)
- `content` (text, markdown)
- `guide_type` (text: getting_started | authentication | common_workflows)
- `is_ai_generated` (boolean)
- `created_at` (timestamp)

### Customization

You can modify guide generation by editing `lib/ai/generateGuides.ts`:

- **Change AI Model**: Update model in completion calls
- **Adjust Prompts**: Modify prompts for different guide styles
- **Add Guide Types**: Create new generation functions
- **Change Tokens**: Adjust `max_tokens` for longer/shorter guides

### Example Generated Content

**Getting Started Guide** might include:
```markdown
# Getting Started with E-Commerce API

## Prerequisites
- API credentials (sign up at...)
- Node.js 16+ or Python 3.8+

## Quick Start

1. Get your API key...
2. Make your first request:

\`\`\`bash
curl -X GET "https://api.example.com/products" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

3. Next steps...
```

### Best Practices

1. **Review Generated Content**: AI guides are starting points - review and customize as needed

2. **Regenerate After Updates**: If your API spec changes significantly, regenerate guides

3. **Combine with Manual Guides**: Use AI guides as foundation, add manual guides for specialized topics

4. **Version Control**: Consider storing guide markdown in git alongside your spec

### Implementation Files

- **Generator**: `lib/ai/generateGuides.ts` - Core AI generation logic
- **API Route**: `app/api/docs/[id]/guides/generate/route.ts` - HTTP endpoint
- **UI Component**: `components/GuidesViewer.tsx` - Guide display and generation UI
- **Database**: Supabase `guides` table

---

## Testing with example-api.json

The included `example-api.json` demonstrates all these features:

### Deprecated Endpoint
```json
"/orders/{orderId}/tracking/legacy": {
  "get": {
    "deprecated": true,
    "x-deprecation-info": {
      "deprecation_date": "2024-06-01",
      "sunset_date": "2025-01-01",
      "migration_guide": "Use GET /orders/{orderId} instead"
    }
  }
}
```

### Experimental Feature
```json
"/products/{productId}/images": {
  "post": {
    "x-status": "experimental"
  }
}
```

### Beta Feature with Rate Limit
```json
"/products/search/semantic": {
  "post": {
    "x-status": "beta",
    "x-rate-limit": {
      "requests": 100,
      "period": "hour"
    }
  }
}
```

### Stable Endpoint with Rate Limit
```json
"/analytics/sales": {
  "get": {
    "x-rate-limit": {
      "requests": 1000,
      "period": "hour"
    }
  }
}
```

## Quick Test

1. Upload `example-api.json` to your application
2. View the documentation - notice health badges on endpoints
3. Click on deprecated endpoint to see migration guide
4. Go to Guides tab and click "✨ AI" to generate guides
5. Review generated Getting Started, Authentication, and Workflows guides

---

## Troubleshooting

### Health badges not showing
- Check that `spec_data` field in database contains the full OpenAPI spec
- Verify extensions are at the operation level (under HTTP method)

### Guide generation fails
- Confirm `OPENAI_API_KEY` is set correctly
- Check that `NEXT_PUBLIC_ENABLE_AI` is not set to 'false'
- Verify Supabase guides table exists with correct schema

### Guides not appearing in UI
- Check browser console for errors
- Verify guides were inserted into database
- Refresh the guides list

---

## Future Enhancements

Potential improvements:
- Add more health statuses (alpha, preview, etc.)
- Support custom health indicators via extensions
- Generate guides in multiple languages
- Add guide templates for specific API types
- Support guide versioning
- Add guide search functionality
