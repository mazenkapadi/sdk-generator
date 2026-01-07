import type { EndpointRecord } from '@/types/database';
import { getEndpointHealth, getHealthBadge, getRateLimitBadge } from '@/lib/endpoint-health';

interface EndpointStatusBadgesProps {
  endpoint: EndpointRecord;
  size?: 'sm' | 'md';
}

export default function EndpointStatusBadges({ endpoint, size = 'sm' }: EndpointStatusBadgesProps) {
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  const health = getEndpointHealth(endpoint);
  const healthBadge = getHealthBadge(health.status);
  const rateLimitBadge = getRateLimitBadge(health.rateLimit);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {/* Health Status Badge */}
        {healthBadge && (
          <span 
            className={`${padding} ${textSize} rounded border font-medium flex items-center gap-1 ${healthBadge.color} ${healthBadge.bgColor} ${healthBadge.borderColor}`}
            title={healthBadge.label}
          >
            <span>{healthBadge.icon}</span>
            <span>{healthBadge.label}</span>
          </span>
        )}
        
        {/* Rate Limit Badge */}
        {rateLimitBadge && (
          <span 
            className={`${padding} ${textSize} rounded border font-medium flex items-center gap-1 ${rateLimitBadge.color} ${rateLimitBadge.bgColor} ${rateLimitBadge.borderColor}`}
            title={`Rate limit: ${health.rateLimit?.requests} requests per ${health.rateLimit?.period}`}
          >
            <span>{rateLimitBadge.icon}</span>
            <span>{rateLimitBadge.label}</span>
          </span>
        )}
        
        {/* Legacy badges for backward compatibility */}
        {endpoint.internal && (
          <span className={`${padding} ${textSize} rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium flex items-center gap-1`}>
            <span>🔒</span>
            <span>Internal</span>
          </span>
        )}
      </div>

      {/* Deprecation Details */}
      {health.isDeprecated && health.deprecationInfo && size === 'md' && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-sm">⚠️</span>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold text-red-400">This endpoint is deprecated</p>
              {health.deprecationInfo.deprecationDate && (
                <p className="text-xs text-zinc-400">
                  <strong>Deprecated:</strong> {new Date(health.deprecationInfo.deprecationDate).toLocaleDateString()}
                </p>
              )}
              {health.deprecationInfo.sunsetDate && (
                <p className="text-xs text-zinc-400">
                  <strong>Sunset Date:</strong> {new Date(health.deprecationInfo.sunsetDate).toLocaleDateString()}
                </p>
              )}
              {health.deprecationInfo.migrationGuide && (
                <div className="mt-2 pt-2 border-t border-red-500/20">
                  <p className="text-xs text-zinc-300 mb-1"><strong>Migration Guide:</strong></p>
                  <p className="text-xs text-zinc-400">{health.deprecationInfo.migrationGuide}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
