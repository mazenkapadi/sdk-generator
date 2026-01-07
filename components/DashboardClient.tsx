'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiListEnhanced from './ApiListEnhanced';
import type { ApiRecord } from '@/types/database';

interface DashboardClientProps {
  initialApis: ApiRecord[];
}

export default function DashboardClient({ initialApis }: DashboardClientProps) {
  const [apis, setApis] = useState(initialApis);
  const router = useRouter();

  const handleFavoriteToggle = async (apiId: string, isFavorite: boolean) => {
    try {
      const method = isFavorite ? 'POST' : 'DELETE';
      const res = await fetch(`/api/docs/${apiId}/favorite`, { method });
      
      if (!res.ok) throw new Error('Failed to toggle favorite');

      // Update local state
      setApis(prev => prev.map(api => 
        api.id === apiId ? { ...api, is_favorite: isFavorite } : api
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleViewApi = async (apiId: string) => {
    try {
      // Track view
      await fetch(`/api/docs/${apiId}/view`, { method: 'POST' });
      
      // Update local state optimistically
      const now = new Date().toISOString();
      setApis(prev => prev.map(api => 
        api.id === apiId 
          ? { 
              ...api, 
              last_viewed_at: now,
              view_count: (api.view_count || 0) + 1 
            } 
          : api
      ));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return (
    <ApiListEnhanced
      apis={apis}
      onFavoriteToggle={handleFavoriteToggle}
      onViewApi={handleViewApi}
    />
  );
}
