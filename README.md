# API Documentation Generator

A beautiful, Fern-inspired API documentation generator that transforms OpenAPI v3 specifications into interactive, searchable documentation with a dark, minimal UI.

## Features

### Core Features
- 📝 **OpenAPI v3 Support**: Upload JSON or YAML OpenAPI specifications
- 🎨 **Beautiful Dark/Light UI**: Inspired by modern developer tools with a minimal aesthetic
- 🔍 **Smart Search**: Real-time client-side search across endpoints, paths, methods, and descriptions
- 🧪 **Try It Panel**: Test API endpoints directly from the documentation with live requests
- 💻 **Code Snippets**: Auto-generated examples in cURL, JavaScript, and Python
- 📊 **Database-Backed**: Fast, searchable documentation stored in Supabase
- 🚀 **Production Ready**: Built with Next.js App Router and TypeScript

### Advanced Features
- ✨ **AI-Powered Enrichment**: Automatically generate example requests/responses and improve endpoint summaries using OpenAI
- 🎨 **Custom Branding**: Add your logo and brand colors to personalize documentation
- 📤 **Drag & Drop Upload**: Easy file upload with drag-and-drop support
- 🌓 **Theme Toggle**: Switch between dark and light modes with persistent preferences
- 💾 **Supabase Storage**: Raw OpenAPI files stored securely in cloud storage
- 📥 **Export Documentation**: Export complete documentation as Markdown or self-contained HTML for offline use

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Setup

1. **Clone and install dependencies**

```bash
cd sdk-generator
npm install
```

2. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to your project's SQL Editor
   - Run the migration script from `supabase/migrations/001_initial_schema.sql`

3. **Configure environment variables**

```bash
cp .env.local .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Uploading an API Spec

1. Navigate to the dashboard
2. Use the upload form on the right side
3. Select your OpenAPI v3 JSON or YAML file
4. Optionally provide a custom name and base URL
5. Click "Upload & Generate Docs"

### Viewing Documentation

1. Click on any API from the dashboard
2. Browse endpoints in the left sidebar (organized by tags)
3. View detailed endpoint information in the center panel
4. Use the "Try It" panel on the right to test endpoints
5. Copy code snippets in your preferred language
6. Use the "Export" button to download documentation as Markdown or HTML

## Project Structure

```
sdk-generator/
├── app/
│   ├── api/
│   │   └── docs/          # API routes for CRUD operations
│   ├── docs/[id]/         # Documentation viewer page
│   ├── page.tsx           # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ApiList.tsx        # API listing grid
│   ├── UploadForm.tsx     # File upload form
│   ├── EndpointSidebar.tsx # Endpoint navigation
│   ├── EndpointDetails.tsx # Endpoint information
│   ├── TryItPanel.tsx     # Interactive API tester
│   └── CodeSnippet.tsx    # Code generation
├── lib/
│   ├── openapi/
│   │   └── parse.ts       # OpenAPI parser
│   ├── export/
│   │   ├── markdown.ts    # Markdown export generator
│   │   └── html.ts        # HTML export generator
│   └── supabase/
│       └── client.ts      # Supabase client
├── types/
│   └── database.ts        # TypeScript types
└── supabase/
    └── migrations/        # Database schema
```

## Database Schema

### `apis` Table

Stores API metadata:
- `id` - Unique identifier
- `name` - API name
- `version` - API version
- `base_url` - Base URL for requests
- `logo_url`, `primary_color`, `accent_color` - Branding (future)

### `endpoints` Table

Stores parsed endpoints:
- `id` - Unique identifier
- `api_id` - Foreign key to apis
- `tag` - Endpoint tag for grouping
- `method` - HTTP method (GET, POST, etc.)
- `path` - Endpoint path
- `summary`, `description` - Documentation
- `parameters`, `request_body_schema`, `responses` - OpenAPI schema data

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Future Enhancements

- 🔍 Semantic search with pgvector
- 🔐 Authentication and multi-tenant support
- 📱 Mobile-responsive improvements
- 🔗 API versioning support

## Design Philosophy

This project follows a minimal, developer-focused design inspired by modern tools like Fern, Linear, and GitHub's UI. The dark color scheme (`#050507` background) with zinc accents creates a professional, distraction-free environment for API exploration.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
