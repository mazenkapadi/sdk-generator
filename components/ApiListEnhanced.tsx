'use client';

import {useState} from 'react';
import Link from 'next/link';
import type {ApiRecord} from '@/types/database';

interface ApiListEnhancedProps {
    apis: ApiRecord[];
    onFavoriteToggle?: (apiId: string, isFavorite: boolean) => Promise<void>;
    onViewApi?: (apiId: string) => void;
}

export default function ApiListEnhanced({apis, onFavoriteToggle, onViewApi}: ApiListEnhancedProps) {
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [showFavorites, setShowFavorites] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'recent' | 'views'>('recent');

    // Get all unique tags
    const allTags = Array.from(
        new Set(apis.flatMap((api) => api.tags || []))
    ).sort();

    // Filter and sort APIs
    let filteredApis = apis;

    if (showFavorites) {
        filteredApis = filteredApis.filter((api) => api.is_favorite);
    }

    if (filterTag) {
        filteredApis = filteredApis.filter((api) => api.tags?.includes(filterTag));
    }

    // Sort
    filteredApis = [...filteredApis].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'recent') {
            return new Date(b.last_viewed_at || b.created_at).getTime() -
                new Date(a.last_viewed_at || a.created_at).getTime();
        } else if (sortBy === 'views') {
            return (b.view_count || 0) - (a.view_count || 0);
        }
        return 0;
    });

    // Recently viewed (top 5)
    const recentlyViewed = [...apis]
        .filter((api) => api.last_viewed_at)
        .sort((a, b) => new Date(b.last_viewed_at!).getTime() - new Date(a.last_viewed_at!).getTime())
        .slice(0, 5);

    const handleFavorite = async (e: React.MouseEvent, apiId: string, currentFavorite: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (onFavoriteToggle) {
            await onFavoriteToggle(apiId, !currentFavorite);
        }
    };

    return (
        <div className="space-y-6">

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Favorites Toggle */}
                <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        showFavorites
                            ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                            : 'border-zinc-800 bg-[#08080b] text-zinc-400 hover:text-zinc-300'
                    }`}
                >
                    <svg className="h-4 w-4" fill={showFavorites ? 'currentColor' : 'none'} stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    Favorites
                </button>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilterTag(null)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                !filterTag
                                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                                    : 'border-zinc-800 bg-[#08080b] text-zinc-400 hover:text-zinc-300'
                            }`}
                        >
                            All
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setFilterTag(tag)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                    filterTag === tag
                                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                                        : 'border-zinc-800 bg-[#08080b] text-zinc-400 hover:text-zinc-300'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sort */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-zinc-600">Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#08080b] text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    >
                        <option value="recent">Recently Viewed</option>
                        <option value="name">Name</option>
                        <option value="views">Most Viewed</option>
                    </select>
                </div>
            </div>

            {/* API Grid */}
            {filteredApis.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-[#08080b] p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">
                        No APIs Found
                    </h3>
                    <p className="text-sm text-zinc-500">
                        {showFavorites && 'No favorite APIs yet. '}
                        {filterTag && `No APIs with tag "${filterTag}". `}
                        Try adjusting your filters.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredApis.map((api) => (
                        <Link
                            key={api.id}
                            href={`/docs/${api.id}`}
                            onClick={() => onViewApi?.(api.id)}
                            className="group relative rounded-xl border border-zinc-800 bg-[#08080b] p-5 hover:border-zinc-700 transition-all duration-200"
                            style={{
                                background: api.primary_color
                                    ? `linear-gradient(135deg, ${api.primary_color}08, #08080b)`
                                    : undefined,
                            }}
                        >
                            {/* Favorite Star */}
                            <button
                                onClick={(e) => handleFavorite(e, api.id, api.is_favorite || false)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <svg
                                    className={`h-4 w-4 ${api.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-zinc-600'}`}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>
                            </button>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    {api.logo_url && (
                                        <img
                                            src={api.logo_url}
                                            alt={api.name}
                                            className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-zinc-50 group-hover:text-white transition-colors truncate">
                                            {api.name}
                                        </h3>
                                        {api.version && (
                                            <p className="text-xs text-zinc-600 font-mono mt-0.5">
                                                v{api.version}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {api.description && (
                                    <p className="text-xs text-zinc-500 line-clamp-2">
                                        {api.description}
                                    </p>
                                )}

                                {api.tags && api.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {api.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 font-medium"
                                            >
                        {tag}
                      </span>
                                        ))}
                                        {api.tags.length > 3 && (
                                            <span className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-600">
                        +{api.tags.length - 3}
                      </span>
                                        )}
                                    </div>
                                )}

                                <div
                                    className="flex items-center gap-4 text-[10px] text-zinc-600 pt-2 border-t border-zinc-800/50">
                                    {api.environment && (
                                        <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                          api.environment === 'prod' ? 'bg-green-500' :
                              api.environment === 'staging' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                      }`}/>
                                            {api.environment}
                    </span>
                                    )}
                                    {api.view_count && api.view_count > 0 && (
                                        <span>{api.view_count} views</span>
                                    )}
                                    {api.last_viewed_at && (
                                        <span className="ml-auto">
                      {new Date(api.last_viewed_at).toLocaleDateString()}
                    </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
