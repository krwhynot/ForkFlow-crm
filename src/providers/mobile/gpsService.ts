import { GPSCoordinates, LocationPermission } from '../../types';

export type { GPSCoordinates } from '../../types';

export interface GPSLocationResult {
    coordinates?: GPSCoordinates;
    error?: string;
    permission: LocationPermission;
}

export interface GPSOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

/**
 * Mobile-optimized GPS service for interaction tracking
 * Handles location permissions and provides fallback for desktop users
 */
export class GPSService {
    private static instance: GPSService;
    private currentPosition: GPSCoordinates | null = null;
    private permissionStatus: LocationPermission = 'prompt';
    private locationWatchers: Map<string, number> = new Map();

    // Default GPS options optimized for mobile battery life
    private defaultOptions: GPSOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 60000, // 1 minute cache
    };

    private constructor() {
        this.checkInitialPermission();
    }

    static getInstance(): GPSService {
        if (!GPSService.instance) {
            GPSService.instance = new GPSService();
        }
        return GPSService.instance;
    }

    /**
     * Check if geolocation is available
     */
    isAvailable(): boolean {
        return 'geolocation' in navigator;
    }

    /**
     * Get current location with mobile optimization
     */
    async getCurrentLocation(options?: GPSOptions): Promise<GPSLocationResult> {
        if (!this.isAvailable()) {
            return {
                error: 'Geolocation is not supported by this browser',
                permission: 'denied',
            };
        }

        const mergedOptions = { ...this.defaultOptions, ...options };

        try {
            const position = await this.getPositionPromise(mergedOptions);

            const coordinates: GPSCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(position.timestamp).toISOString(),
            };

            this.currentPosition = coordinates;
            this.permissionStatus = 'granted';

            return {
                coordinates,
                permission: 'granted',
            };
        } catch (error: any) {
            const gpsError = this.handleLocationError(error);
            return {
                error: gpsError.message,
                permission: gpsError.permission,
            };
        }
    }

    /**
     * Get cached location if available and recent
     */
    getCachedLocation(): GPSCoordinates | null {
        if (!this.currentPosition) {
            return null;
        }

        // Check if cached location is still fresh (within 5 minutes)
        const cacheTime = new Date(this.currentPosition.timestamp!).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - cacheTime > fiveMinutes) {
            return null;
        }

        return this.currentPosition;
    }

    /**
     * Watch position changes for real-time tracking
     */
    watchPosition(
        callback: (result: GPSLocationResult) => void,
        options?: GPSOptions,
        watchId?: string
    ): string {
        if (!this.isAvailable()) {
            callback({
                error: 'Geolocation is not supported by this browser',
                permission: 'denied',
            });
            return '';
        }

        const id = watchId || `watch_${Date.now()}`;
        const mergedOptions = { ...this.defaultOptions, ...options };

        const watcherId = navigator.geolocation.watchPosition(
            position => {
                const coordinates: GPSCoordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp).toISOString(),
                };

                this.currentPosition = coordinates;
                this.permissionStatus = 'granted';

                callback({
                    coordinates,
                    permission: 'granted',
                });
            },
            error => {
                const gpsError = this.handleLocationError(error);
                callback({
                    error: gpsError.message,
                    permission: gpsError.permission,
                });
            },
            mergedOptions
        );

        this.locationWatchers.set(id, watcherId);
        return id;
    }

    /**
     * Stop watching position
     */
    clearWatch(watchId: string): void {
        const watcherId = this.locationWatchers.get(watchId);
        if (watcherId) {
            navigator.geolocation.clearWatch(watcherId);
            this.locationWatchers.delete(watchId);
        }
    }

    /**
     * Clear all position watches
     */
    clearAllWatches(): void {
        this.locationWatchers.forEach(watcherId => {
            navigator.geolocation.clearWatch(watcherId);
        });
        this.locationWatchers.clear();
    }

    /**
     * Check permission status
     */
    async checkPermission(): Promise<LocationPermission> {
        if (!this.isAvailable()) {
            return 'denied';
        }

        // Try to use the Permissions API if available
        if ('permissions' in navigator) {
            try {
                const permission = await navigator.permissions.query({
                    name: 'geolocation',
                });
                switch (permission.state) {
                    case 'granted':
                        this.permissionStatus = 'granted';
                        return 'granted';
                    case 'denied':
                        this.permissionStatus = 'denied';
                        return 'denied';
                    case 'prompt':
                    default:
                        this.permissionStatus = 'prompt';
                        return 'prompt';
                }
            } catch (error) {
                // Fallback for browsers that don't support permissions API
                return this.permissionStatus;
            }
        }

        return this.permissionStatus;
    }

    /**
     * Request permission explicitly
     */
    async requestPermission(): Promise<LocationPermission> {
        try {
            // Try to get position to trigger permission request
            await this.getCurrentLocation({ timeout: 5000 });
            return 'granted';
        } catch (error) {
            return 'denied';
        }
    }

    /**
     * Calculate distance between two coordinates (in meters)
     */
    calculateDistance(
        coords1: GPSCoordinates,
        coords2: GPSCoordinates
    ): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (coords1.latitude * Math.PI) / 180;
        const φ2 = (coords2.latitude * Math.PI) / 180;
        const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
        const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Check if coordinates are within reasonable accuracy bounds
     */
    isLocationAccurate(
        coordinates: GPSCoordinates,
        maxAccuracy: number = 50
    ): boolean {
        return (
            coordinates.accuracy !== undefined &&
            coordinates.accuracy <= maxAccuracy
        );
    }

    /**
     * Format coordinates for display
     */
    formatCoordinates(
        coordinates: GPSCoordinates,
        precision: number = 6
    ): string {
        return `${coordinates.latitude.toFixed(precision)}, ${coordinates.longitude.toFixed(precision)}`;
    }

    private async checkInitialPermission(): Promise<void> {
        this.permissionStatus = await this.checkPermission();
    }

    private getPositionPromise(
        options: GPSOptions
    ): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }

    private handleLocationError(error: GeolocationPositionError): {
        message: string;
        permission: LocationPermission;
    } {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.permissionStatus = 'denied';
                return {
                    message:
                        'Location access denied. Please enable location services in your browser settings.',
                    permission: 'denied',
                };
            case error.POSITION_UNAVAILABLE:
                return {
                    message:
                        'Location information is unavailable. Please check your connection and try again.',
                    permission: this.permissionStatus,
                };
            case error.TIMEOUT:
                return {
                    message: 'Location request timed out. Please try again.',
                    permission: this.permissionStatus,
                };
            default:
                return {
                    message:
                        'An unknown error occurred while retrieving location.',
                    permission: this.permissionStatus,
                };
        }
    }
}

// Singleton instance for use across the application
export const gpsService = GPSService.getInstance();

// Hook for React components
export const useGPSService = () => {
    return gpsService;
};
