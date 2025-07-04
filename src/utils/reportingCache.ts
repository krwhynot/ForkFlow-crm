/**
 * Reporting Cache Utility
 * Provides caching for reporting API responses to improve performance
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class ReportingCache {
    private cache = new Map<string, CacheEntry<any>>();
    private maxSize = 50; // Maximum number of cached entries

    /**
     * Get cached data if it exists and hasn't expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache with TTL
     */
    set<T>(key: string, data: T, ttlMinutes: number = 5): void {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
        };

        this.cache.set(key, entry);
    }

    /**
     * Check if data exists in cache and is still valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Invalidate specific cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern: RegExp): void {
        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if (now - entry.timestamp <= entry.ttl) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            hitRate: validEntries / this.cache.size,
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));
    }
}

// Export a singleton instance
export const reportingCache = new ReportingCache();

/**
 * Cache key generators for different report types
 */
export const CacheKeys = {
    dashboard: () => 'dashboard-summary',
    interactions: (
        startDate?: string,
        endDate?: string,
        filters?: Record<string, any>
    ) => {
        const params = new URLSearchParams();
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);
        if (filters) params.set('filters', JSON.stringify(filters));
        return `interactions-${params.toString()}`;
    },
    needsVisit: () => 'organizations-needs-visit',
    organizationExport: (filters?: Record<string, any>) => {
        const filterStr = filters ? JSON.stringify(filters) : '';
        return `export-organizations-${filterStr}`;
    },
    interactionExport: (filters?: Record<string, any>) => {
        const filterStr = filters ? JSON.stringify(filters) : '';
        return `export-interactions-${filterStr}`;
    },
};

/**
 * Cache TTL configurations (in minutes)
 */
export const CacheTTL = {
    dashboard: 5, // 5 minutes - frequently changing data
    interactions: 10, // 10 minutes - moderately changing data
    needsVisit: 15, // 15 minutes - slowly changing data
    exports: 1, // 1 minute - always generate fresh exports
};

/**
 * Decorator function to add caching to async functions
 */
export function withCache<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string,
    ttlMinutes: number = 5
) {
    return async (...args: T): Promise<R> => {
        const cacheKey = keyGenerator(...args);

        // Try to get from cache first
        const cached = reportingCache.get<R>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        const result = await fn(...args);
        reportingCache.set(cacheKey, result, ttlMinutes);

        return result;
    };
}

/**
 * Invalidate cache when data changes
 */
export function invalidateReportingCache(
    type: 'all' | 'dashboard' | 'interactions' | 'organizations' = 'all'
): void {
    switch (type) {
        case 'all':
            reportingCache.clear();
            break;
        case 'dashboard':
            reportingCache.invalidate(CacheKeys.dashboard());
            reportingCache.invalidatePattern(/^interactions-/);
            reportingCache.invalidate(CacheKeys.needsVisit());
            break;
        case 'interactions':
            reportingCache.invalidatePattern(/^interactions-/);
            reportingCache.invalidate(CacheKeys.dashboard());
            break;
        case 'organizations':
            reportingCache.invalidate(CacheKeys.needsVisit());
            reportingCache.invalidate(CacheKeys.dashboard());
            break;
    }
}

/**
 * Auto cleanup expired entries every 10 minutes
 */
setInterval(
    () => {
        reportingCache.cleanup();
    },
    10 * 60 * 1000
);
