# Supabase Edge Functions

## Setup

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Set secrets

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

### 5. Deploy the function

```bash
supabase functions deploy generate-embeddings
```

## Scheduling with pg_cron

To run the embedding generation automatically, you can use pg_cron in Supabase.

### Enable pg_cron extension

In your Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the edge function to run every hour
SELECT cron.schedule(
  'generate-embeddings-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-embeddings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    ) as request_id;
  $$
);
```

### View scheduled jobs

```sql
SELECT * FROM cron.job;
```

### Unschedule a job

```sql
SELECT cron.unschedule('generate-embeddings-hourly');
```

## Manual Invocation

You can also trigger the function manually:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-embeddings \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Testing Locally

```bash
supabase functions serve generate-embeddings --env-file .env.local
```

Then invoke:

```bash
curl -X POST http://localhost:54321/functions/v1/generate-embeddings \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```
