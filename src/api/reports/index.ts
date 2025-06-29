/**
 * Reporting API Endpoints
 * Provides REST-like endpoints for reporting functionality
 */

import { DataProvider } from 'react-admin';
import { DashboardSummary, InteractionMetrics, OrganizationNeedsVisit, CSVExportData } from '../../providers/reporting/reportingProvider';

export interface ReportingApiEndpoints {
    dashboard: () => Promise<DashboardSummary>;
    interactions: (params?: InteractionReportParams) => Promise<InteractionMetrics>;
    organizationsNeedsVisit: () => Promise<OrganizationNeedsVisit[]>;
    exportOrganizations: (params?: ExportParams) => Promise<CSVExportData>;
    exportInteractions: (params?: ExportParams) => Promise<CSVExportData>;
}

export interface InteractionReportParams {
    start_date?: string;
    end_date?: string;
    organizationId?: number;
    typeId?: number;
    contactId?: number;
}

export interface ExportParams {
    format?: 'csv' | 'json';
    filters?: Record<string, any>;
    dateRange?: {
        start: string;
        end: string;
    };
}

/**
 * Creates REST-like API endpoints for reporting
 * These endpoints follow the planned API structure:
 * - GET /api/reports/dashboard
 * - GET /api/reports/interactions?start_date&end_date
 * - GET /api/reports/organizations/needs-visit
 * - GET /api/exports/organizations
 * - GET /api/exports/interactions
 */
export function createReportingApi(dataProvider: DataProvider): ReportingApiEndpoints {
    return {
        /**
         * GET /api/reports/dashboard
         * Returns dashboard summary with key metrics and trends
         */
        async dashboard(): Promise<DashboardSummary> {
            // Type assertion for the extended data provider
            const reportingProvider = dataProvider as any;
            
            if (!reportingProvider.getDashboardReport) {
                throw new Error('Dashboard reporting not available in data provider');
            }
            
            return reportingProvider.getDashboardReport();
        },

        /**
         * GET /api/reports/interactions?start_date&end_date
         * Returns detailed interaction analytics with filtering
         */
        async interactions(params?: InteractionReportParams): Promise<InteractionMetrics> {
            const reportingProvider = dataProvider as any;
            
            if (!reportingProvider.getInteractionReport) {
                throw new Error('Interaction reporting not available in data provider');
            }
            
            return reportingProvider.getInteractionReport(
                params?.start_date,
                params?.end_date,
                {
                    organizationId: params?.organizationId,
                    typeId: params?.typeId,
                    contactId: params?.contactId,
                }
            );
        },

        /**
         * GET /api/reports/organizations/needs-visit
         * Returns organizations that haven't been contacted in 30+ days
         */
        async organizationsNeedsVisit(): Promise<OrganizationNeedsVisit[]> {
            const reportingProvider = dataProvider as any;
            
            if (!reportingProvider.getOrganizationsNeedingVisit) {
                throw new Error('Organizations needs visit reporting not available in data provider');
            }
            
            return reportingProvider.getOrganizationsNeedingVisit();
        },

        /**
         * GET /api/exports/organizations
         * Exports organizations data as CSV
         */
        async exportOrganizations(params?: ExportParams): Promise<CSVExportData> {
            const reportingProvider = dataProvider as any;
            
            if (!reportingProvider.exportOrganizations) {
                throw new Error('Organizations export not available in data provider');
            }
            
            return reportingProvider.exportOrganizations(params?.filters);
        },

        /**
         * GET /api/exports/interactions
         * Exports interactions data as CSV
         */
        async exportInteractions(params?: ExportParams): Promise<CSVExportData> {
            const reportingProvider = dataProvider as any;
            
            if (!reportingProvider.exportInteractions) {
                throw new Error('Interactions export not available in data provider');
            }
            
            return reportingProvider.exportInteractions(params?.filters);
        },
    };
}

/**
 * React hook for accessing reporting API endpoints
 */
export function useReportingApi(dataProvider: DataProvider): ReportingApiEndpoints {
    return createReportingApi(dataProvider);
}

/**
 * Helper function to download CSV data as a file
 */
export function downloadCSV(csvData: CSVExportData): void {
    try {
        // Create blob with CSV data
        const blob = new Blob([csvData.data], { type: csvData.mimeType });
        
        // Create download URL
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = csvData.filename;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw new Error('Failed to download CSV file');
    }
}

/**
 * Helper function to format API responses for frontend consumption
 */
export function formatApiResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message: message || 'Request successful',
        timestamp: new Date().toISOString(),
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
    error?: string;
}

/**
 * Error handler for API endpoints
 */
export function handleApiError(error: any): ApiResponse<null> {
    console.error('API Error:', error);
    
    return {
        success: false,
        data: null,
        message: 'Request failed',
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
    };
}