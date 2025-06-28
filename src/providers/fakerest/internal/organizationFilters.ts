import { Identifier } from 'react-admin';
import { Organization } from '../../../types';
import { OrganizationSearchFilters } from '../../types';

export interface OrganizationFilterOptions {
    searchQuery?: string;
    filters?: OrganizationSearchFilters;
    sort?: {
        field: keyof Organization;
        order: 'ASC' | 'DESC';
    };
    pagination?: {
        offset: number;
        limit: number;
    };
}

export class OrganizationFilterEngine {
    /**
     * Apply comprehensive filtering to organization list
     */
    applyFilters(
        organizations: Organization[],
        options: OrganizationFilterOptions = {}
    ): { data: Organization[]; total: number } {
        let filtered = [...organizations];

        // Apply search query
        if (options.searchQuery) {
            filtered = this.applyFullTextSearch(filtered, options.searchQuery);
        }

        // Apply specific filters
        if (options.filters) {
            filtered = this.applySpecificFilters(filtered, options.filters);
        }

        // Store total before pagination
        const total = filtered.length;

        // Apply sorting
        if (options.sort) {
            filtered = this.applySorting(filtered, options.sort);
        }

        // Apply pagination
        if (options.pagination) {
            filtered = this.applyPagination(filtered, options.pagination);
        }

        return { data: filtered, total };
    }

    /**
     * Full-text search across organization fields
     */
    private applyFullTextSearch(
        organizations: Organization[],
        query: string
    ): Organization[] {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return organizations;

        const searchFields: (keyof Organization)[] = [
            'name',
            'accountManager',
            'address',
            'city',
            'state',
            'zipCode',
            'phone',
            'website',
            'notes',
        ];

        return organizations.filter(org => {
            return searchFields.some(field => {
                const value = org[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                return false;
            });
        });
    }

    /**
     * Apply specific filter criteria
     */
    private applySpecificFilters(
        organizations: Organization[],
        filters: OrganizationSearchFilters
    ): Organization[] {
        return organizations.filter(org => {
            // Priority filter
            if (
                filters.priorityId !== undefined &&
                org.priorityId !== filters.priorityId
            ) {
                return false;
            }

            // Segment filter
            if (
                filters.segmentId !== undefined &&
                org.segmentId !== filters.segmentId
            ) {
                return false;
            }

            // Distributor filter
            if (
                filters.distributorId !== undefined &&
                org.distributorId !== filters.distributorId
            ) {
                return false;
            }

            // Account manager filter
            if (
                filters.accountManager &&
                org.accountManager !== filters.accountManager
            ) {
                return false;
            }

            // City filter
            if (
                filters.city &&
                org.city?.toLowerCase() !== filters.city.toLowerCase()
            ) {
                return false;
            }

            // State filter
            if (
                filters.state &&
                org.state?.toLowerCase() !== filters.state.toLowerCase()
            ) {
                return false;
            }

            // ZIP code filter
            if (filters.zipCode && org.zipCode !== filters.zipCode) {
                return false;
            }

            // Has contacts filter
            if (filters.hasContacts !== undefined) {
                const hasContacts = (org.contactCount || 0) > 0;
                if (filters.hasContacts !== hasContacts) {
                    return false;
                }
            }

            // Has opportunities filter
            if (filters.hasOpportunities !== undefined) {
                const hasOpportunities = (org.totalOpportunities || 0) > 0;
                if (filters.hasOpportunities !== hasOpportunities) {
                    return false;
                }
            }

            // Last contact date filters
            if (filters.lastContactDateBefore || filters.lastContactDateAfter) {
                const lastContactDate = org.lastContactDate
                    ? new Date(org.lastContactDate)
                    : null;

                if (filters.lastContactDateBefore) {
                    const beforeDate = new Date(filters.lastContactDateBefore);
                    if (!lastContactDate || lastContactDate > beforeDate) {
                        return false;
                    }
                }

                if (filters.lastContactDateAfter) {
                    const afterDate = new Date(filters.lastContactDateAfter);
                    if (!lastContactDate || lastContactDate < afterDate) {
                        return false;
                    }
                }
            }

            return true;
        });
    }

    /**
     * Apply sorting to organization list
     */
    private applySorting(
        organizations: Organization[],
        sort: { field: keyof Organization; order: 'ASC' | 'DESC' }
    ): Organization[] {
        return organizations.sort((a, b) => {
            const aValue = a[sort.field];
            const bValue = b[sort.field];

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sort.order === 'ASC' ? 1 : -1;
            if (bValue == null) return sort.order === 'ASC' ? -1 : 1;

            // Compare values
            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (
                typeof aValue === 'number' &&
                typeof bValue === 'number'
            ) {
                comparison = aValue - bValue;
            } else if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else {
                // Fallback to string comparison
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sort.order === 'ASC' ? comparison : -comparison;
        });
    }

    /**
     * Apply pagination to organization list
     */
    private applyPagination(
        organizations: Organization[],
        pagination: { offset: number; limit: number }
    ): Organization[] {
        const start = pagination.offset;
        const end = start + pagination.limit;
        return organizations.slice(start, end);
    }

    /**
     * Find organizations within geographic radius
     */
    findNearbyOrganizations(
        organizations: Organization[],
        centerLat: number,
        centerLng: number,
        radiusKm: number = 10
    ): Organization[] {
        return organizations
            .filter(org => {
                if (!org.latitude || !org.longitude) return false;

                const distance = this.calculateDistance(
                    centerLat,
                    centerLng,
                    org.latitude,
                    org.longitude
                );

                return distance <= radiusKm;
            })
            .sort((a, b) => {
                // Sort by distance
                const distanceA = this.calculateDistance(
                    centerLat,
                    centerLng,
                    a.latitude!,
                    a.longitude!
                );
                const distanceB = this.calculateDistance(
                    centerLat,
                    centerLng,
                    b.latitude!,
                    b.longitude!
                );
                return distanceA - distanceB;
            });
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Create search index for faster text searches
     */
    createSearchIndex(organizations: Organization[]): Map<string, Set<number>> {
        const index = new Map<string, Set<number>>();

        organizations.forEach((org, orgIndex) => {
            const searchableText = [
                org.name,
                org.accountManager,
                org.address,
                org.city,
                org.state,
                org.zipCode,
                org.phone,
                org.website,
                org.notes,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            // Split into words and index each word
            const words = searchableText.split(/\s+/);
            words.forEach(word => {
                if (word.length >= 2) {
                    // Only index words with 2+ characters
                    if (!index.has(word)) {
                        index.set(word, new Set());
                    }
                    index.get(word)!.add(orgIndex);
                }
            });
        });

        return index;
    }

    /**
     * Search using pre-built index for better performance
     */
    searchWithIndex(
        organizations: Organization[],
        searchIndex: Map<string, Set<number>>,
        query: string
    ): Organization[] {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        if (searchTerms.length === 0) return organizations;

        // Find organizations that match all search terms
        let matchingIndices: Set<number> | null = null;

        searchTerms.forEach(term => {
            if (term.length < 2) return; // Skip very short terms

            const termMatches = new Set<number>();

            // Find all index entries that contain this term
            searchIndex.forEach((orgIndices, indexWord) => {
                if (indexWord.includes(term)) {
                    orgIndices.forEach(idx => termMatches.add(idx));
                }
            });

            if (matchingIndices === null) {
                matchingIndices = termMatches;
            } else {
                // Intersection: only keep organizations that match all terms
                const intersection = new Set<number>();
                matchingIndices.forEach(idx => {
                    if (termMatches.has(idx)) {
                        intersection.add(idx);
                    }
                });
                matchingIndices = intersection;
            }
        });

        if (!matchingIndices || matchingIndices.size === 0) {
            return [];
        }

        const result: Organization[] = [];
        matchingIndices.forEach(idx => {
            result.push(organizations[idx]);
        });
        return result;
    }
}

// Export singleton instance
export const organizationFilterEngine = new OrganizationFilterEngine();
