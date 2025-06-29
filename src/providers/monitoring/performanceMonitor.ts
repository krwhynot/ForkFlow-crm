export interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count' | 'percentage';
    timestamp: string;
    category: 'api' | 'gps' | 'upload' | 'database' | 'ui';
}

export interface ApiPerformanceData {
    endpoint: string;
    method: string;
    duration: number;
    success: boolean;
    errorMessage?: string;
    timestamp: string;
}

export interface GPSPerformanceData {
    accuracy: number;
    acquisitionTime: number;
    success: boolean;
    errorType?: string;
    timestamp: string;
}

export interface UploadPerformanceData {
    fileSize: number;
    uploadTime: number;
    compressionRatio?: number;
    success: boolean;
    errorMessage?: string;
    timestamp: string;
}

/**
 * Performance monitoring service for mobile interaction tracking
 * Tracks API response times, GPS acquisition, file uploads, and UI performance
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetric[] = [];
    private apiMetrics: ApiPerformanceData[] = [];
    private gpsMetrics: GPSPerformanceData[] = [];
    private uploadMetrics: UploadPerformanceData[] = [];
    
    // Configuration
    private readonly MAX_METRICS = 1000; // Keep last 1000 metrics
    private readonly STORAGE_KEY = 'forkflow_performance_metrics';
    private readonly WARNING_THRESHOLDS = {
        apiResponseTime: 2000, // 2 seconds
        gpsAcquisitionTime: 10000, // 10 seconds
        uploadTime: 30000, // 30 seconds
        lowAccuracy: 100, // 100 meters
    };

    private constructor() {
        this.loadMetricsFromStorage();
        this.startPeriodicCleanup();
    }

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Track API performance
     */
    trackApiCall(
        endpoint: string,
        method: string,
        startTime: number,
        success: boolean,
        errorMessage?: string
    ): void {
        const duration = Date.now() - startTime;
        
        const apiData: ApiPerformanceData = {
            endpoint,
            method,
            duration,
            success,
            errorMessage,
            timestamp: new Date().toISOString(),
        };

        this.apiMetrics.push(apiData);
        
        // Add to general metrics
        this.addMetric({
            name: `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
            value: duration,
            unit: 'ms',
            timestamp: apiData.timestamp,
            category: 'api',
        });

        // Warn about slow API calls
        if (duration > this.WARNING_THRESHOLDS.apiResponseTime) {
            console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration}ms`);
        }

        this.trimMetrics();
        this.saveMetricsToStorage();
    }

    /**
     * Track GPS performance
     */
    trackGPSAcquisition(
        startTime: number,
        accuracy: number,
        success: boolean,
        errorType?: string
    ): void {
        const acquisitionTime = Date.now() - startTime;
        
        const gpsData: GPSPerformanceData = {
            accuracy,
            acquisitionTime,
            success,
            errorType,
            timestamp: new Date().toISOString(),
        };

        this.gpsMetrics.push(gpsData);
        
        // Add to general metrics
        this.addMetric({
            name: 'gps_acquisition_time',
            value: acquisitionTime,
            unit: 'ms',
            timestamp: gpsData.timestamp,
            category: 'gps',
        });

        this.addMetric({
            name: 'gps_accuracy',
            value: accuracy,
            unit: 'count',
            timestamp: gpsData.timestamp,
            category: 'gps',
        });

        // Warn about slow GPS or low accuracy
        if (acquisitionTime > this.WARNING_THRESHOLDS.gpsAcquisitionTime) {
            console.warn(`Slow GPS acquisition: ${acquisitionTime}ms`);
        }
        
        if (accuracy > this.WARNING_THRESHOLDS.lowAccuracy) {
            console.warn(`Low GPS accuracy: ±${accuracy}m`);
        }

        this.trimMetrics();
        this.saveMetricsToStorage();
    }

    /**
     * Track file upload performance
     */
    trackFileUpload(
        fileSize: number,
        startTime: number,
        success: boolean,
        compressionRatio?: number,
        errorMessage?: string
    ): void {
        const uploadTime = Date.now() - startTime;
        
        const uploadData: UploadPerformanceData = {
            fileSize,
            uploadTime,
            compressionRatio,
            success,
            errorMessage,
            timestamp: new Date().toISOString(),
        };

        this.uploadMetrics.push(uploadData);
        
        // Add to general metrics
        this.addMetric({
            name: 'file_upload_time',
            value: uploadTime,
            unit: 'ms',
            timestamp: uploadData.timestamp,
            category: 'upload',
        });

        this.addMetric({
            name: 'file_upload_size',
            value: fileSize,
            unit: 'bytes',
            timestamp: uploadData.timestamp,
            category: 'upload',
        });

        if (compressionRatio) {
            this.addMetric({
                name: 'file_compression_ratio',
                value: compressionRatio,
                unit: 'percentage',
                timestamp: uploadData.timestamp,
                category: 'upload',
            });
        }

        // Warn about slow uploads
        if (uploadTime > this.WARNING_THRESHOLDS.uploadTime) {
            console.warn(`Slow file upload: ${uploadTime}ms for ${fileSize} bytes`);
        }

        this.trimMetrics();
        this.saveMetricsToStorage();
    }

    /**
     * Track custom metric
     */
    trackCustomMetric(
        name: string,
        value: number,
        unit: 'ms' | 'bytes' | 'count' | 'percentage',
        category: 'api' | 'gps' | 'upload' | 'database' | 'ui'
    ): void {
        this.addMetric({
            name,
            value,
            unit,
            timestamp: new Date().toISOString(),
            category,
        });

        this.trimMetrics();
        this.saveMetricsToStorage();
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentMetrics = this.metrics.filter(
            metric => new Date(metric.timestamp).getTime() > oneHourAgo
        );

        // API metrics
        const recentApiMetrics = this.apiMetrics.filter(
            metric => new Date(metric.timestamp).getTime() > oneHourAgo
        );
        
        const apiSuccessRate = recentApiMetrics.length > 0 
            ? (recentApiMetrics.filter(m => m.success).length / recentApiMetrics.length) * 100 
            : 100;
        
        const avgApiResponseTime = recentApiMetrics.length > 0
            ? recentApiMetrics.reduce((sum, m) => sum + m.duration, 0) / recentApiMetrics.length
            : 0;

        // GPS metrics
        const recentGpsMetrics = this.gpsMetrics.filter(
            metric => new Date(metric.timestamp).getTime() > oneHourAgo
        );
        
        const gpsSuccessRate = recentGpsMetrics.length > 0
            ? (recentGpsMetrics.filter(m => m.success).length / recentGpsMetrics.length) * 100
            : 100;
        
        const avgGpsAcquisitionTime = recentGpsMetrics.length > 0
            ? recentGpsMetrics.reduce((sum, m) => sum + m.acquisitionTime, 0) / recentGpsMetrics.length
            : 0;

        const avgGpsAccuracy = recentGpsMetrics.length > 0
            ? recentGpsMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentGpsMetrics.length
            : 0;

        // Upload metrics
        const recentUploadMetrics = this.uploadMetrics.filter(
            metric => new Date(metric.timestamp).getTime() > oneHourAgo
        );
        
        const uploadSuccessRate = recentUploadMetrics.length > 0
            ? (recentUploadMetrics.filter(m => m.success).length / recentUploadMetrics.length) * 100
            : 100;

        return {
            timeRange: 'Last Hour',
            api: {
                totalCalls: recentApiMetrics.length,
                successRate: Math.round(apiSuccessRate),
                avgResponseTime: Math.round(avgApiResponseTime),
                slowCalls: recentApiMetrics.filter(m => m.duration > this.WARNING_THRESHOLDS.apiResponseTime).length,
            },
            gps: {
                totalAcquisitions: recentGpsMetrics.length,
                successRate: Math.round(gpsSuccessRate),
                avgAcquisitionTime: Math.round(avgGpsAcquisitionTime),
                avgAccuracy: Math.round(avgGpsAccuracy),
                lowAccuracyCount: recentGpsMetrics.filter(m => m.accuracy > this.WARNING_THRESHOLDS.lowAccuracy).length,
            },
            uploads: {
                totalUploads: recentUploadMetrics.length,
                successRate: Math.round(uploadSuccessRate),
                avgUploadTime: recentUploadMetrics.length > 0
                    ? Math.round(recentUploadMetrics.reduce((sum, m) => sum + m.uploadTime, 0) / recentUploadMetrics.length)
                    : 0,
                totalDataUploaded: recentUploadMetrics.reduce((sum, m) => sum + m.fileSize, 0),
            },
            warnings: {
                slowApiCalls: recentApiMetrics.filter(m => m.duration > this.WARNING_THRESHOLDS.apiResponseTime).length,
                slowGpsAcquisitions: recentGpsMetrics.filter(m => m.acquisitionTime > this.WARNING_THRESHOLDS.gpsAcquisitionTime).length,
                lowGpsAccuracy: recentGpsMetrics.filter(m => m.accuracy > this.WARNING_THRESHOLDS.lowAccuracy).length,
                slowUploads: recentUploadMetrics.filter(m => m.uploadTime > this.WARNING_THRESHOLDS.uploadTime).length,
            }
        };
    }

    /**
     * Get all metrics for export/analysis
     */
    getAllMetrics() {
        return {
            general: this.metrics,
            api: this.apiMetrics,
            gps: this.gpsMetrics,
            uploads: this.uploadMetrics,
        };
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.metrics = [];
        this.apiMetrics = [];
        this.gpsMetrics = [];
        this.uploadMetrics = [];
        this.saveMetricsToStorage();
    }

    /**
     * Export metrics as CSV
     */
    exportMetricsAsCSV(): string {
        const headers = ['timestamp', 'category', 'name', 'value', 'unit'];
        const rows = this.metrics.map(metric => [
            metric.timestamp,
            metric.category,
            metric.name,
            metric.value.toString(),
            metric.unit
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    private addMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);
    }

    private trimMetrics(): void {
        // Keep only the most recent metrics
        if (this.metrics.length > this.MAX_METRICS) {
            this.metrics = this.metrics.slice(-this.MAX_METRICS);
        }
        if (this.apiMetrics.length > this.MAX_METRICS) {
            this.apiMetrics = this.apiMetrics.slice(-this.MAX_METRICS);
        }
        if (this.gpsMetrics.length > this.MAX_METRICS) {
            this.gpsMetrics = this.gpsMetrics.slice(-this.MAX_METRICS);
        }
        if (this.uploadMetrics.length > this.MAX_METRICS) {
            this.uploadMetrics = this.uploadMetrics.slice(-this.MAX_METRICS);
        }
    }

    private saveMetricsToStorage(): void {
        try {
            const data = {
                metrics: this.metrics.slice(-100), // Save only last 100 general metrics
                apiMetrics: this.apiMetrics.slice(-100),
                gpsMetrics: this.gpsMetrics.slice(-50),
                uploadMetrics: this.uploadMetrics.slice(-50),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save performance metrics to storage:', error);
        }
    }

    private loadMetricsFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.metrics = data.metrics || [];
                this.apiMetrics = data.apiMetrics || [];
                this.gpsMetrics = data.gpsMetrics || [];
                this.uploadMetrics = data.uploadMetrics || [];
            }
        } catch (error) {
            console.warn('Failed to load performance metrics from storage:', error);
            this.metrics = [];
            this.apiMetrics = [];
            this.gpsMetrics = [];
            this.uploadMetrics = [];
        }
    }

    private startPeriodicCleanup(): void {
        // Clean up old metrics every hour
        setInterval(() => {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            this.metrics = this.metrics.filter(
                metric => new Date(metric.timestamp).getTime() > oneWeekAgo
            );
            this.apiMetrics = this.apiMetrics.filter(
                metric => new Date(metric.timestamp).getTime() > oneWeekAgo
            );
            this.gpsMetrics = this.gpsMetrics.filter(
                metric => new Date(metric.timestamp).getTime() > oneWeekAgo
            );
            this.uploadMetrics = this.uploadMetrics.filter(
                metric => new Date(metric.timestamp).getTime() > oneWeekAgo
            );
            
            this.saveMetricsToStorage();
        }, 60 * 60 * 1000); // 1 hour
    }
}

// Singleton instance for use across the application
export const performanceMonitor = PerformanceMonitor.getInstance();

// Hook for React components
export const usePerformanceMonitor = () => {
    return performanceMonitor;
};