'use client';

import { useState, useEffect } from 'react';
import type { ApiVersionRecord } from '@/types/database';

interface VersionSelectorProps {
  apiId: string;
  currentVersion?: string;
  onVersionChange?: (versionId: string, specData: any) => void;
}

export default function VersionSelector({ 
  apiId, 
  currentVersion,
  onVersionChange 
}: VersionSelectorProps) {
  const [versions, setVersions] = useState<ApiVersionRecord[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [showChangelog, setShowChangelog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [apiId]);

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/docs/${apiId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        const current = data.find((v: ApiVersionRecord) => v.is_current);
        if (current) {
          setSelectedVersion(current.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    const version = versions.find(v => v.id === versionId);
    if (version && onVersionChange) {
      onVersionChange(versionId, version.spec_data);
    }
  };

  if (loading) {
    return (
      <div className="text-xs text-zinc-600">Loading versions...</div>
    );
  }

  if (versions.length === 0) {
    return null;
  }

  const currentVersionData = versions.find(v => v.id === selectedVersion);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={selectedVersion}
          onChange={(e) => handleVersionChange(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-[#08080b] px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          {versions.map(version => (
            <option key={version.id} value={version.id}>
              {version.version} {version.is_current && '(current)'}
            </option>
          ))}
        </select>

        {currentVersionData?.changelog && (
          <button
            onClick={() => setShowChangelog(!showChangelog)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showChangelog ? 'Hide' : 'View'} Changelog
          </button>
        )}
      </div>

      {showChangelog && currentVersionData?.changelog && (
        <div className="rounded-lg border border-zinc-800 bg-[#08080b] p-4">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="space-y-2">
              {currentVersionData.changelog.split('\n').map((line, i) => {
                if (line.startsWith('###')) {
                  return (
                    <h4 key={i} className="text-sm font-semibold text-zinc-300 mt-3 mb-1">
                      {line.replace('###', '').trim()}
                    </h4>
                  );
                } else if (line.startsWith('-')) {
                  return (
                    <div key={i} className="text-xs text-zinc-400 ml-4">
                      • {line.replace('-', '').trim()}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
