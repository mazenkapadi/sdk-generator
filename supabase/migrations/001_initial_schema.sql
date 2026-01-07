-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create apis table
create table apis (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  version text,
  base_url text,
  spec_storage_path text,
  logo_url text,
  primary_color text,
  accent_color text,
  created_at timestamptz default now()
);

-- Create endpoints table
create table endpoints (
  id uuid default gen_random_uuid() primary key,
  api_id uuid references apis(id) on delete cascade,
  tag text,
  method text not null,
  path text not null,
  operation_id text,
  summary text,
  description text,
  parameters jsonb default '[]'::jsonb,
  request_body_schema jsonb,
  responses jsonb default '{}'::jsonb,
  ai_example_request jsonb,
  ai_example_response jsonb,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_endpoints_api_id on endpoints(api_id);
create index idx_endpoints_api_id_tag on endpoints(api_id, tag);
create index idx_endpoints_method_path on endpoints(method, path);

-- Enable Row Level Security (optional for now)
alter table apis enable row level security;
alter table endpoints enable row level security;

-- Create policies to allow public read access
create policy "Allow public read access on apis"
  on apis for select
  using (true);

create policy "Allow public read access on endpoints"
  on endpoints for select
  using (true);
