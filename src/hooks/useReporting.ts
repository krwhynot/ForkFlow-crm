/**
 * React hooks for accessing reporting functionality
 * Provides easy integration with the reporting API endpoints
 */

import { useState, useCallback } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { 
    DashboardSummary, 
    InteractionMetrics, 
    OrganizationNeedsVisit,
    CSVExportData 
} from '../providers/reporting/reportingProvider';
import { 
    createReportingApi, 
    InteractionReportParams, 
    ExportParams,
    downloadCSV 
} from '../api/reports';

/**
 * Hook for dashboard reporting
 */
export function useDashboardReport() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const reportingApi = createReportingApi(dataProvider);
            const result = await reportingApi.dashboard();
            setData(result);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch dashboard report';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    return {
        data,
        loading,
        error,
        fetch,
        refetch: fetch,
    };
}

/**
 * Hook for interaction analytics reporting
 */
export function useInteractionReport() {
    const [data, setData] = useState<InteractionMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const fetch = useCallback(async (params?: InteractionReportParams) => {
        setLoading(true);
        setError(null);
        try {
            const reportingApi = createReportingApi(dataProvider);
            const result = await reportingApi.interactions(params);
            setData(result);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch interaction report';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    return {
        data,
        loading,
        error,
        fetch,
        refetch: fetch,
    };
}

/**
 * Hook for organizations needing visit reporting
 */
export function useOrganizationsNeedingVisit() {
    const [data, setData] = useState<OrganizationNeedsVisit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const reportingApi = createReportingApi(dataProvider);
            const result = await reportingApi.organizationsNeedsVisit();
            setData(result);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch organizations needing visits';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    return {
        data,
        loading,
        error,
        fetch,
        refetch: fetch,
    };
}

/**
 * Hook for CSV exports
 */
export function useCSVExport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const exportOrganizations = useCallback(async (params?: ExportParams) => {
        setLoading(true);
        setError(null);
        try {
            const reportingApi = createReportingApi(dataProvider);
            const result = await reportingApi.exportOrganizations(params);
            downloadCSV(result);
            notify('Organizations exported successfully', { type: 'success' });
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to export organizations';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    const exportInteractions = useCallback(async (params?: ExportParams) => {
        setLoading(true);
        setError(null);
        try {
            const reportingApi = createReportingApi(dataProvider);
            const result = await reportingApi.exportInteractions(params);
            downloadCSV(result);
            notify('Interactions exported successfully', { type: 'success' });
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to export interactions';
            setError(errorMsg);
            notify(errorMsg, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    return {
        loading,
        error,
        exportOrganizations,
        exportInteractions,
    };
}

/**
 * Combined hook for all reporting functionality
 */
export function useReporting() {
    const dashboard = useDashboardReport();
    const interactions = useInteractionReport();
    const needsVisit = useOrganizationsNeedingVisit();
    const csvExport = useCSVExport();

    return {
        dashboard,
        interactions,
        needsVisit,
        csvExport,
    };
}

/**
 * Hook for date range filtering
 */
export function useDateRangeFilter() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const setDateRange = useCallback((start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    }, []);

    const clearDateRange = useCallback(() => {
        setStartDate('');
        setEndDate('');
    }, []);

    const setLastDays = useCallback((days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    }, []);

    const setCurrentMonth = useCallback(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    const setCurrentWeek = useCallback(() => {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        // Get start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        
        // Get end of week (Sunday)
        end.setDate(diff + 6);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, []);

    return {
        startDate,
        endDate,
        setDateRange,
        clearDateRange,
        setLastDays,
        setCurrentMonth,
        setCurrentWeek,
        hasDateRange: startDate && endDate,
        dateRangeParams: startDate && endDate ? { start_date: startDate, end_date: endDate } : undefined,
    };
}

/**
 * Hook for report caching and performance optimization
 */
export function useReportCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMinutes: number = 5
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);

    const fetch = useCallback(async (force: boolean = false) => {
        const now = Date.now();
        const cacheExpired = (now - lastFetch) > (ttlMinutes * 60 * 1000);
        
        if (!force && data && !cacheExpired) {
            return data;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
            setLastFetch(now);
            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [data, lastFetch, ttlMinutes, fetchFn]);

    const invalidate = useCallback(() => {
        setData(null);
        setLastFetch(0);
    }, []);

    return {
        data,
        loading,
        error,
        fetch,
        invalidate,
        isCached: data !== null && (Date.now() - lastFetch) < (ttlMinutes * 60 * 1000),
    };
}