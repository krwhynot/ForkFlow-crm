import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GPSService } from '../gpsService';

// Mock geolocation API
const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
});

describe('GPSService', () => {
    let gpsService: GPSService;

    beforeEach(() => {
        gpsService = GPSService.getInstance();
        vi.clearAllMocks();
        
        // Clear localStorage
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('isAvailable', () => {
        it('should return true when geolocation is available', () => {
            expect(gpsService.isAvailable()).toBe(true);
        });

        it('should return false when geolocation is not available', () => {
            Object.defineProperty(global.navigator, 'geolocation', {
                value: undefined,
                writable: true,
            });
            
            const service = GPSService.getInstance();
            expect(service.isAvailable()).toBe(false);
        });
    });

    describe('getCurrentLocation', () => {
        it('should get current location successfully', async () => {
            const mockPosition = {
                coords: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                },
                timestamp: Date.now(),
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success(mockPosition);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            });
            expect(result.error).toBeUndefined();
        });

        it('should handle permission denied error', async () => {
            const mockError = {
                code: 1, // PERMISSION_DENIED
                message: 'User denied the request for Geolocation.',
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
                error(mockError);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toBe('Location access denied by user');
        });

        it('should handle position unavailable error', async () => {
            const mockError = {
                code: 2, // POSITION_UNAVAILABLE
                message: 'Location information is unavailable.',
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
                error(mockError);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toBe('Location information unavailable');
        });

        it('should handle timeout error', async () => {
            const mockError = {
                code: 3, // TIMEOUT
                message: 'The request to get user location timed out.',
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
                error(mockError);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toBe('Location request timed out');
        });

        it('should handle unknown error', async () => {
            const mockError = {
                code: 999,
                message: 'Unknown error occurred.',
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
                error(mockError);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toBe('Unknown location error: Unknown error occurred.');
        });

        it('should use custom options', async () => {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 30000,
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success({
                    coords: {
                        latitude: 37.7749,
                        longitude: -122.4194,
                        accuracy: 5,
                    },
                    timestamp: Date.now(),
                });
            });

            await gpsService.getCurrentLocation(options);

            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function),
                options
            );
        });

        it('should reject when geolocation is not available', async () => {
            Object.defineProperty(global.navigator, 'geolocation', {
                value: undefined,
                writable: true,
            });

            const service = GPSService.getInstance();
            
            await expect(service.getCurrentLocation()).rejects.toThrow(
                'Geolocation is not supported by this browser'
            );
        });
    });

    describe('caching', () => {
        it('should cache location data', async () => {
            const mockPosition = {
                coords: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    accuracy: 10,
                },
                timestamp: Date.now(),
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success(mockPosition);
            });

            await gpsService.getCurrentLocation();

            const cached = gpsService.getCachedLocation();
            expect(cached).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            });
        });

        it('should return null for expired cache', () => {
            // Set an old cached location
            const oldLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
                timestamp: Date.now() - (10 * 60 * 1000), // 10 minutes ago
            };

            localStorage.setItem('gps_cache', JSON.stringify(oldLocation));

            const cached = gpsService.getCachedLocation();
            expect(cached).toBeNull();
        });

        it('should return cached location if still valid', () => {
            // Set a recent cached location
            const recentLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
                timestamp: Date.now() - (30 * 1000), // 30 seconds ago
            };

            localStorage.setItem('gps_cache', JSON.stringify(recentLocation));

            const cached = gpsService.getCachedLocation();
            expect(cached).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            });
        });

        it('should handle corrupted cache data', () => {
            localStorage.setItem('gps_cache', 'invalid json');

            const cached = gpsService.getCachedLocation();
            expect(cached).toBeNull();
        });
    });

    describe('formatting', () => {
        it('should format coordinates correctly', () => {
            const coordinates = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            };

            const formatted = gpsService.formatCoordinates(coordinates);
            expect(formatted).toBe('37.7749, -122.4194');
        });

        it('should handle coordinates without accuracy', () => {
            const coordinates = {
                latitude: 37.7749,
                longitude: -122.4194,
            };

            const formatted = gpsService.formatCoordinates(coordinates);
            expect(formatted).toBe('37.7749, -122.4194');
        });

        it('should round coordinates to reasonable precision', () => {
            const coordinates = {
                latitude: 37.77491234567,
                longitude: -122.41941234567,
                accuracy: 10,
            };

            const formatted = gpsService.formatCoordinates(coordinates);
            expect(formatted).toBe('37.7749, -122.4194');
        });
    });

    describe('error handling', () => {
        it('should handle getCurrentPosition throwing an exception', async () => {
            mockGeolocation.getCurrentPosition.mockImplementation(() => {
                throw new Error('Geolocation API error');
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toContain('Geolocation API error');
        });

        it('should handle promise timeout', async () => {
            // Mock a scenario where getCurrentPosition never calls success or error
            mockGeolocation.getCurrentPosition.mockImplementation(() => {
                // Never call success or error callbacks
            });

            const options = { timeout: 100 }; // Very short timeout
            
            const result = await gpsService.getCurrentLocation(options);

            expect(result.coordinates).toBeNull();
            expect(result.error).toContain('timeout');
        });
    });

    describe('performance optimization', () => {
        it('should not make redundant calls for recent cache', async () => {
            // Set a very recent cached location
            const recentLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
                timestamp: Date.now() - 1000, // 1 second ago
            };

            localStorage.setItem('gps_cache', JSON.stringify(recentLocation));

            // Configure options to use cache
            const options = { maximumAge: 60000 }; // 1 minute cache

            const result = await gpsService.getCurrentLocation(options);

            // Should return cached result without calling geolocation API
            expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
            expect(result.coordinates).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            });
        });

        it('should make fresh call when cache is older than maximumAge', async () => {
            // Set an old cached location
            const oldLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
                timestamp: Date.now() - 120000, // 2 minutes ago
            };

            localStorage.setItem('gps_cache', JSON.stringify(oldLocation));

            const options = { maximumAge: 60000 }; // 1 minute cache

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success({
                    coords: {
                        latitude: 40.7128,
                        longitude: -74.0060,
                        accuracy: 15,
                    },
                    timestamp: Date.now(),
                });
            });

            const result = await gpsService.getCurrentLocation(options);

            // Should make fresh call and return new location
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
            expect(result.coordinates).toEqual({
                latitude: 40.7128,
                longitude: -74.0060,
                accuracy: 15,
            });
        });
    });

    describe('mobile optimization', () => {
        it('should handle low accuracy gracefully', async () => {
            const mockPosition = {
                coords: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    accuracy: 500, // Very low accuracy
                },
                timestamp: Date.now(),
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success(mockPosition);
            });

            const result = await gpsService.getCurrentLocation();

            expect(result.coordinates).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 500,
            });
            expect(result.error).toBeUndefined();
        });

        it('should handle high accuracy mode', async () => {
            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            };

            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
                success({
                    coords: {
                        latitude: 37.7749,
                        longitude: -122.4194,
                        accuracy: 3, // High accuracy
                    },
                    timestamp: Date.now(),
                });
            });

            const result = await gpsService.getCurrentLocation(options);

            expect(result.coordinates?.accuracy).toBe(3);
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function),
                options
            );
        });
    });
});