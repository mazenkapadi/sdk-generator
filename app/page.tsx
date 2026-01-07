import UploadForm from '@/components/UploadForm';
import ThemeToggle from '@/components/ThemeToggle';
import DashboardClient from '@/components/DashboardClient';
import ArchitectureCards from '@/components/ArchitectureCards';
import { createClient } from '@/lib/supabase/server';

async function fetchApis() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('apis')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching APIs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching APIs:', error);
    return [];
  }
}

export default async function Home() {
  const apis = await fetchApis();
  const hasApis = apis.length > 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">API Documentation Generator</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Generate interactive docs from OpenAPI specs</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Upload Form - Priority Section */}
        <div className="mb-8">
          <div className="bg-[var(--surface)] rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Upload OpenAPI Specification</h2>
              <p className="text-sm text-[var(--text-secondary)]">Upload a YAML or JSON file (OpenAPI v3)</p>
            </div>
            <UploadForm />
          </div>
        </div>

        {/* Your APIs Section */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your APIs</h2>
          {hasApis ? (
            <DashboardClient initialApis={apis} />
          ) : (
            <div className="bg-[var(--surface)] rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                No APIs Yet
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Upload your first OpenAPI specification above to get started
              </p>
            </div>
          )}
        </div>

        {/* Architecture & Technical Details */}
        <div className="border-t border-[var(--border-subtle)] pt-12">
          <ArchitectureCards />
        </div>

      </div>
    </div>
  );
}
