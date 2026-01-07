'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (baseUrl) formData.append('base_url', baseUrl);
    if (logoUrl) formData.append('logo_url', logoUrl);
    if (primaryColor) formData.append('primary_color', primaryColor);
    if (accentColor) formData.append('accent_color', accentColor);
    if (tags) formData.append('tags', tags);
    if (description) formData.append('description', description);
    if (environment) formData.append('environment', environment);

    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      router.push(`/docs/${data.apiId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.json') || droppedFile.name.endsWith('.yaml') || droppedFile.name.endsWith('.yml'))) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid JSON or YAML file');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          OpenAPI Spec File
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-zinc-500 bg-zinc-800/50'
              : 'border-zinc-800 bg-[#08080b]'
          }`}
        >
          {file ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-300 mb-2">📄 {file.name}</p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-400 mb-2">
                {isDragging ? 'Drop file here' : 'Drag & drop your OpenAPI spec here'}
              </p>
              <p className="text-xs text-zinc-600 mb-3">or</p>
              <label className="inline-block cursor-pointer rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700">
                <span>Browse files</span>
                <input
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-600">
          Supports JSON and YAML OpenAPI v3 specifications
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          API Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My API"
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          Base URL (optional)
        </label>
        <input
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.example.com"
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          Tags (optional)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="internal, public, beta"
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
        <p className="text-xs text-zinc-600">Comma-separated tags for organization</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this API"
          rows={2}
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-zinc-500">
          Environment (optional)
        </label>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <option value="">Select environment</option>
          <option value="dev">Development</option>
          <option value="staging">Staging</option>
          <option value="prod">Production</option>
        </select>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <span>{showAdvanced ? '▾' : '▸'}</span>
          <span>Branding (optional)</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-zinc-500">
                Logo URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-zinc-500">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor || '#3b82f6'}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 rounded border border-zinc-800 bg-[#08080b] cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-zinc-500">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor || '#8b5cf6'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-12 rounded border border-zinc-800 bg-[#08080b] cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#8b5cf6"
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#08080b] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Uploading...' : 'Upload & Generate Docs'}
      </button>
    </form>
  );
}
