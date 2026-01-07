export type ApiRecord = {
  id: string;
  name: string;
  version?: string;
  base_url?: string;
  spec_storage_path?: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  tags?: string[];
  is_favorite?: boolean;
  last_viewed_at?: string;
  view_count?: number;
  description?: string;
  environment?: string;
  created_at: string;
};

export type EndpointRecord = {
  id: string;
  api_id: string;
  tag?: string;
  method: string;
  path: string;
  operation_id?: string;
  summary?: string;
  description?: string;
  parameters: any[];
  request_body_schema?: any;
  responses: Record<string, any>;
  ai_example_request?: any;
  ai_example_response?: any;
  deprecated?: boolean;
  experimental?: boolean;
  internal?: boolean;
  stability?: string;
  rate_limit?: string;
  examples?: any;
  extensions?: any;
  embedding?: number[];
  created_at: string;
};

export type ApiVersionRecord = {
  id: string;
  api_id: string;
  version: string;
  spec_data: any;
  changelog?: string;
  is_current?: boolean;
  created_at: string;
  created_by?: string;
};

export type GuideRecord = {
  id: string;
  api_id: string;
  guide_type: string;
  title: string;
  content: string;
  generated_at: string;
  is_ai_generated?: boolean;
};

export type Database = {
  public: {
    Tables: {
      apis: {
        Row: ApiRecord;
        Insert: Omit<ApiRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<ApiRecord, 'id' | 'created_at'>>;
      };
      endpoints: {
        Row: EndpointRecord;
        Insert: Omit<EndpointRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<EndpointRecord, 'id' | 'created_at'>>;
      };
      api_versions: {
        Row: ApiVersionRecord;
        Insert: Omit<ApiVersionRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<ApiVersionRecord, 'id' | 'created_at'>>;
      };
      guides: {
        Row: GuideRecord;
        Insert: Omit<GuideRecord, 'id' | 'generated_at'>;
        Update: Partial<Omit<GuideRecord, 'id' | 'generated_at'>>;
      };
    };
  };
};
