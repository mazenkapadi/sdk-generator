import type { EndpointRecord } from '@/types/database';

export type EndpointHealth = {
  status: 'stable' | 'beta' | 'experimental' | 'deprecated' | null;
  isDeprecated: boolean;
  deprecationInfo?: {
    deprecationDate?: string;
    sunsetDate?: string;
    migrationGuide?: string;
  };
  rateLimit?: {
    requests: number;
    period: string;
  };
};

export type HealthBadge = {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

/**
 * Extract health and status information from an endpoint's spec data
 */
export function getEndpointHealth(endpoint: EndpointRecord): EndpointHealth {
  const extensions = endpoint.extensions as any;
  
  const health: EndpointHealth = {
    status: null,
    isDeprecated: false,
  };

  // Check if endpoint is deprecated (standard OpenAPI field)
  if (endpoint.deprecated === true) {
    health.isDeprecated = true;
    health.status = 'deprecated';
  }

  // Check for x-status extension (experimental, beta, etc.)
  if (extensions?.['x-status']) {
    const xStatus = extensions['x-status'].toLowerCase();
    if (xStatus === 'experimental' || xStatus === 'beta') {
      health.status = xStatus as 'experimental' | 'beta';
    }
  }

  // Check stability field
  if (endpoint.stability) {
    const stability = endpoint.stability.toLowerCase();
    if (stability === 'experimental' || stability === 'beta') {
      health.status = stability as 'experimental' | 'beta';
    }
  }

  // Extract deprecation info from x-deprecation-info extension
  if (extensions?.['x-deprecation-info']) {
    const depInfo = extensions['x-deprecation-info'];
    health.deprecationInfo = {
      deprecationDate: depInfo.deprecation_date,
      sunsetDate: depInfo.sunset_date,
      migrationGuide: depInfo.migration_guide,
    };
  }

  // Extract rate limit info from x-rate-limit extension or rate_limit field
  if (extensions?.['x-rate-limit']) {
    const rateLimit = extensions['x-rate-limit'];
    health.rateLimit = {
      requests: rateLimit.requests,
      period: rateLimit.period,
    };
  } else if (endpoint.rate_limit) {
    // Parse rate_limit string if it exists (e.g., "100/hour")
    const match = endpoint.rate_limit.match(/(\d+)\/(\w+)/);
    if (match) {
      health.rateLimit = {
        requests: parseInt(match[1]),
        period: match[2],
      };
    }
  }

  // If no special status, it's stable
  if (!health.status) {
    health.status = 'stable';
  }

  return health;
}

/**
 * Get visual badge information for a health status
 */
export function getHealthBadge(status: EndpointHealth['status']): HealthBadge | null {
  switch (status) {
    case 'deprecated':
      return {
        label: 'Deprecated',
        icon: '⚠️',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
      };
    case 'experimental':
      return {
        label: 'Experimental',
        icon: '🧪',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
      };
    case 'beta':
      return {
        label: 'Beta',
        icon: '🚀',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
      };
    case 'stable':
    default:
      return null; // Don't show badge for stable endpoints
  }
}

/**
 * Get badge for rate limit
 */
export function getRateLimitBadge(rateLimit: EndpointHealth['rateLimit']): HealthBadge | null {
  if (!rateLimit) return null;

  return {
    label: `${rateLimit.requests}/${rateLimit.period}`,
    icon: '⏱️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  };
}
