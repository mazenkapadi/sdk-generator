import Link from 'next/link';
import type { ApiRecord } from '@/types/database';

type Props = {
  apis: ApiRecord[];
};

export default function ApiList({ apis }: Props) {
  if (apis.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-[#08080b] px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">
          No APIs uploaded yet. Upload your first OpenAPI spec to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {apis.map((api) => (
        <Link
          key={api.id}
          href={`/docs/${api.id}`}
          className="group rounded-xl border border-zinc-800 bg-[#08080b] px-5 py-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-zinc-50 group-hover:text-white">
                {api.name}
              </h3>
              {api.version && (
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  v{api.version}
                </span>
              )}
            </div>
            
            {api.base_url && (
              <p className="text-xs font-mono text-zinc-500 truncate">
                {api.base_url}
              </p>
            )}
            
            <p className="text-[11px] text-zinc-600">
              Created {new Date(api.created_at).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
