# Quick Setup Guide

Follow these steps to get your API Documentation Generator running locally.

## 1. Prerequisites

Make sure you have:
- Node.js 18+ installed
- npm installed
- A Supabase account (free tier works)

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose an organization and create a new project
4. Wait for the project to be ready (takes about 2 minutes)

### Run the Database Migration

1. In your Supabase project dashboard, click "SQL Editor" in the sidebar
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd+Enter)

You should see: "Success. No rows returned"

### Create Storage Bucket

1. In your Supabase dashboard, click "Storage" in the sidebar
2. Click "New bucket"
3. Name it `api-specs`
4. Set it to **Public** (so you can download specs later)
5. Click "Create bucket"

### Get Your API Keys

1. In your Supabase dashboard, click "Project Settings" (gear icon)
2. Go to "API" section
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" → "service_role")

⚠️ **Important**: The `service_role` key is sensitive. Never commit it to version control or expose it publicly.

## 3. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Test with Example API

1. On the dashboard, find the "Upload Spec" section
2. Click "Choose File" and select `example-api.json` from the project root
3. Click "Upload & Generate Docs"
4. You'll be redirected to the documentation viewer

## Troubleshooting

### "Failed to fetch APIs" on Dashboard

- Check that your `.env.local` file exists and has the correct values
- Verify your Supabase credentials are correct
- Make sure you ran the database migration

### "Failed to parse spec" when uploading

- Ensure the file is valid JSON or YAML
- Verify it's an OpenAPI v3 specification (starts with `"openapi": "3.0.x"`)
- Check the browser console for detailed error messages

### Database Connection Errors

- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check that your `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not the anon key)
- Ensure Row Level Security policies are set up correctly (the migration handles this)

## Next Steps

- Upload your own OpenAPI specs
- Explore the interactive documentation viewer
- Test endpoints using the "Try It" panel
- Generate code snippets in multiple languages

## Production Deployment

See the main [README.md](./README.md) for deployment instructions to Vercel.
