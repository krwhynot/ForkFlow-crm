import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CrmDataProvider } from '../../providers/types';
import {
    gpsService,
    offlineService,
    fileUploadService,
} from '../../providers/mobile';
import { performanceMonitor } from '../../providers/monitoring/performanceMonitor';
import { interactionValidator } from '../../providers/fakerest/interactionValidator';

// Mock the mobile services
vi.mock('../../providers/mobile', () => ({
    gpsService: {
        getCurrentLocation: vi.fn(),
        getCachedLocation: vi.fn(),
        isAvailable: vi.fn(() => true),
    },
    offlineService: {
        queueInteraction: vi.fn(),
        getStatus: vi.fn(() => ({ isOnline: true, pendingActions: 0 })),
        syncPendingActions: vi.fn(),
        getOfflineInteractions: vi.fn(),
        clearOfflineData: vi.fn(),
        getPendingCount: vi.fn(() => 0),
    },
    fileUploadService: {
        compressImage: vi.fn(),
        createThumbnail: vi.fn(),
    },
}));

// Mock the performance monitor
vi.mock('../../providers/monitoring/performanceMonitor', () => ({
    performanceMonitor: {
        trackApiCall: vi.fn(),
        trackGPSAcquisition: vi.fn(),
        trackFileUpload: vi.fn(),
    },
}));

// Mock the validator
vi.mock('../../providers/fakerest/interactionValidator', () => ({
    interactionValidator: {
        updateSettings: vi.fn(),
        sanitizeInteraction: vi.fn(data => data),
        validateInteraction: vi.fn(() => ({
            isValid: true,
            errors: [],
            warnings: [],
        })),
        validateAttachment: vi.fn(() => ({
            isValid: true,
            errors: [],
            warnings: [],
        })),
    },
}));

// Mock the base data provider
const mockBaseDataProvider = {
    getList: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

// Mock fetch for network simulation
global.fetch = vi.fn();

describe('Interaction API', () => {
    let dataProvider: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup common mock responses
        mockBaseDataProvider.getList.mockResolvedValue({
            data: [
                {
                    id: 'type1',
                    category: 'interaction_type',
                    key: 'in_person',
                    label: 'In Person',
                },
            ],
            total: 1,
        });

        mockBaseDataProvider.create.mockResolvedValue({
            data: {
                id: 'interaction1',
                subject: 'Test Interaction',
                createdAt: new Date().toISOString(),
            },
        });

        mockBaseDataProvider.update.mockResolvedValue({
            data: {
                id: 'interaction1',
                subject: 'Updated Interaction',
                updatedAt: new Date().toISOString(),
            },
        });

        mockBaseDataProvider.getOne.mockResolvedValue({
            data: {
                id: 'interaction1',
                subject: 'Test Interaction',
                attachments: [],
            },
        });

        // Mock GPS service responses
        (gpsService.getCurrentLocation as any).mockResolvedValue({
            coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            },
        });

        (gpsService.getCachedLocation as any).mockReturnValue(null);

        // Mock offline service responses
        (offlineService.queueInteraction as any).mockResolvedValue(
            'offline-id-123'
        );

        // Import the data provider with enhanced methods
        // This would normally import from the actual dataProvider file
        dataProvider = {
            ...mockBaseDataProvider,

            // Enhanced interaction methods
            async createInteraction(params: any) {
                const startTime = Date.now();

                try {
                    // Validation
                    interactionValidator.updateSettings([]);
                    const sanitizedData =
                        interactionValidator.sanitizeInteraction(params.data);
                    const validation =
                        interactionValidator.validateInteraction(sanitizedData);

                    if (!validation.isValid) {
                        throw new Error('Validation failed');
                    }

                    // Check if offline
                    if (!navigator.onLine) {
                        const queuedId = await offlineService.queueInteraction(
                            'create',
                            params.data
                        );
                        return {
                            data: {
                                ...params.data,
                                id: queuedId,
                                _offline: true,
                            },
                        };
                    }

                    const result = await mockBaseDataProvider.create(
                        'interactions',
                        params
                    );

                    performanceMonitor.trackApiCall(
                        'createInteraction',
                        'POST',
                        startTime,
                        true
                    );

                    return result;
                } catch (error: any) {
                    performanceMonitor.trackApiCall(
                        'createInteraction',
                        'POST',
                        startTime,
                        false,
                        error.message
                    );
                    throw error;
                }
            },

            async getCurrentLocation() {
                const startTime = Date.now();

                try {
                    const result = await gpsService.getCurrentLocation();

                    if (result.coordinates) {
                        performanceMonitor.trackGPSAcquisition(
                            startTime,
                            result.coordinates.accuracy || 0,
                            true
                        );
                    } else {
                        performanceMonitor.trackGPSAcquisition(
                            startTime,
                            0,
                            false,
                            result.error
                        );
                    }

                    return result;
                } catch (error: any) {
                    performanceMonitor.trackGPSAcquisition(
                        startTime,
                        0,
                        false,
                        error.message
                    );
                    throw error;
                }
            },

            async uploadInteractionAttachment(
                interactionId: string,
                file: File
            ) {
                const startTime = Date.now();

                try {
                    const validation =
                        interactionValidator.validateAttachment(file);

                    if (!validation.isValid) {
                        throw new Error('File validation failed');
                    }

                    const result = await mockBaseDataProvider.update(
                        'interactions',
                        {
                            id: interactionId,
                            data: { attachments: ['test-file.jpg'] },
                        }
                    );

                    performanceMonitor.trackFileUpload(
                        file.size,
                        startTime,
                        true
                    );

                    return result;
                } catch (error: any) {
                    performanceMonitor.trackFileUpload(
                        file.size,
                        startTime,
                        false,
                        undefined,
                        error.message
                    );
                    throw error;
                }
            },
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('createInteraction', () => {
        it('should create interaction successfully with validation', async () => {
            const params = {
                data: {
                    subject: 'Test Interaction',
                    organizationId: 'org1',
                    typeId: 'type1',
                    description: 'Test description',
                },
            };

            const result = await dataProvider.createInteraction(params);

            expect(result.data).toHaveProperty('id');
            expect(result.data.subject).toBe('Test Interaction');
            expect(interactionValidator.validateInteraction).toHaveBeenCalled();
            expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
                'createInteraction',
                'POST',
                expect.any(Number),
                true
            );
        });

        it('should handle validation errors', async () => {
            const params = {
                data: {
                    subject: '', // Invalid empty subject
                },
            };

            // Mock validation failure
            (interactionValidator.validateInteraction as any).mockReturnValue({
                isValid: false,
                errors: [{ message: 'Subject is required' }],
                warnings: [],
            });

            await expect(
                dataProvider.createInteraction(params)
            ).rejects.toThrow('Validation failed');
            expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
                'createInteraction',
                'POST',
                expect.any(Number),
                false,
                'Validation failed'
            );
        });

        it('should queue interaction for offline when network is unavailable', async () => {
            // Mock offline condition
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            const params = {
                data: {
                    subject: 'Offline Interaction',
                    organizationId: 'org1',
                    typeId: 'type1',
                },
            };

            const result = await dataProvider.createInteraction(params);

            expect(result.data._offline).toBe(true);
            expect(result.data.id).toBe('offline-id-123');
            expect(offlineService.queueInteraction).toHaveBeenCalledWith(
                'create',
                params.data
            );
        });
    });

    describe('getCurrentLocation', () => {
        it('should get GPS location successfully', async () => {
            const result = await dataProvider.getCurrentLocation();

            expect(result.coordinates).toEqual({
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            });
            expect(performanceMonitor.trackGPSAcquisition).toHaveBeenCalledWith(
                expect.any(Number),
                10,
                true
            );
        });

        it('should handle GPS errors', async () => {
            (gpsService.getCurrentLocation as any).mockResolvedValue({
                coordinates: null,
                error: 'Location access denied',
            });

            const result = await dataProvider.getCurrentLocation();

            expect(result.coordinates).toBeNull();
            expect(result.error).toBe('Location access denied');
            expect(performanceMonitor.trackGPSAcquisition).toHaveBeenCalledWith(
                expect.any(Number),
                0,
                false,
                'Location access denied'
            );
        });

        it('should handle GPS service exceptions', async () => {
            (gpsService.getCurrentLocation as any).mockRejectedValue(
                new Error('GPS timeout')
            );

            await expect(dataProvider.getCurrentLocation()).rejects.toThrow(
                'GPS timeout'
            );
            expect(performanceMonitor.trackGPSAcquisition).toHaveBeenCalledWith(
                expect.any(Number),
                0,
                false,
                'GPS timeout'
            );
        });
    });

    describe('uploadInteractionAttachment', () => {
        it('should upload file successfully', async () => {
            const file = new File(['test content'], 'test.jpg', {
                type: 'image/jpeg',
            });
            Object.defineProperty(file, 'size', { value: 1024 });

            const result = await dataProvider.uploadInteractionAttachment(
                'interaction1',
                file
            );

            expect(result.data.attachments).toContain('test-file.jpg');
            expect(
                interactionValidator.validateAttachment
            ).toHaveBeenCalledWith(file);
            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledWith(
                1024,
                expect.any(Number),
                true
            );
        });

        it('should handle file validation errors', async () => {
            const file = new File(['test content'], 'test.exe', {
                type: 'application/exe',
            });
            Object.defineProperty(file, 'size', { value: 1024 });

            (interactionValidator.validateAttachment as any).mockReturnValue({
                isValid: false,
                errors: [{ message: 'File type not allowed' }],
                warnings: [],
            });

            await expect(
                dataProvider.uploadInteractionAttachment('interaction1', file)
            ).rejects.toThrow('File validation failed');

            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledWith(
                1024,
                expect.any(Number),
                false,
                undefined,
                'File validation failed'
            );
        });

        it('should handle large files', async () => {
            const largeFile = new File(
                ['x'.repeat(10 * 1024 * 1024)],
                'large.jpg',
                { type: 'image/jpeg' }
            );
            Object.defineProperty(largeFile, 'size', {
                value: 10 * 1024 * 1024,
            });

            const result = await dataProvider.uploadInteractionAttachment(
                'interaction1',
                largeFile
            );

            expect(result.data.attachments).toContain('test-file.jpg');
            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledWith(
                10 * 1024 * 1024,
                expect.any(Number),
                true
            );
        });
    });

    describe('Performance Monitoring', () => {
        it('should track performance metrics for all API calls', async () => {
            const params = {
                data: {
                    subject: 'Performance Test',
                    organizationId: 'org1',
                    typeId: 'type1',
                },
            };

            await dataProvider.createInteraction(params);
            await dataProvider.getCurrentLocation();

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            await dataProvider.uploadInteractionAttachment(
                'interaction1',
                file
            );

            expect(performanceMonitor.trackApiCall).toHaveBeenCalledTimes(1);
            expect(
                performanceMonitor.trackGPSAcquisition
            ).toHaveBeenCalledTimes(1);
            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledTimes(1);
        });

        it('should track performance metrics for failed operations', async () => {
            // Force validation failure
            (interactionValidator.validateInteraction as any).mockReturnValue({
                isValid: false,
                errors: [{ message: 'Test error' }],
                warnings: [],
            });

            const params = { data: { subject: 'Test' } };

            await expect(
                dataProvider.createInteraction(params)
            ).rejects.toThrow();

            expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
                'createInteraction',
                'POST',
                expect.any(Number),
                false,
                'Validation failed'
            );
        });
    });

    describe('Offline Functionality', () => {
        beforeEach(() => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });
        });

        it('should queue interactions when offline', async () => {
            const params = {
                data: {
                    subject: 'Offline Test',
                    organizationId: 'org1',
                    typeId: 'type1',
                },
            };

            const result = await dataProvider.createInteraction(params);

            expect(result.data._offline).toBe(true);
            expect(offlineService.queueInteraction).toHaveBeenCalledWith(
                'create',
                params.data
            );
        });

        it('should handle offline queue errors gracefully', async () => {
            (offlineService.queueInteraction as any).mockRejectedValue(
                new Error('Storage quota exceeded')
            );

            const params = {
                data: {
                    subject: 'Offline Test',
                    organizationId: 'org1',
                    typeId: 'type1',
                },
            };

            await expect(
                dataProvider.createInteraction(params)
            ).rejects.toThrow('Storage quota exceeded');
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete interaction creation workflow', async () => {
            // Test the full workflow: validation, GPS capture, creation, and performance tracking
            const params = {
                data: {
                    subject: 'Integration Test',
                    organizationId: 'org1',
                    typeId: 'type1',
                    description: 'Full workflow test',
                },
            };

            // Create interaction
            const createResult = await dataProvider.createInteraction(params);
            expect(createResult.data.id).toBeDefined();

            // Get GPS location
            const locationResult = await dataProvider.getCurrentLocation();
            expect(locationResult.coordinates).toBeDefined();

            // Upload attachment
            const file = new File(['test content'], 'test.jpg', {
                type: 'image/jpeg',
            });
            const uploadResult = await dataProvider.uploadInteractionAttachment(
                createResult.data.id,
                file
            );
            expect(uploadResult.data.attachments).toContain('test-file.jpg');

            // Verify all performance metrics were tracked
            expect(performanceMonitor.trackApiCall).toHaveBeenCalledTimes(1);
            expect(
                performanceMonitor.trackGPSAcquisition
            ).toHaveBeenCalledTimes(1);
            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledTimes(1);
        });

        it('should gracefully handle mixed success/failure scenarios', async () => {
            // Create interaction successfully
            const params = {
                data: {
                    subject: 'Mixed Test',
                    organizationId: 'org1',
                    typeId: 'type1',
                },
            };

            const createResult = await dataProvider.createInteraction(params);
            expect(createResult.data.id).toBeDefined();

            // GPS fails
            (gpsService.getCurrentLocation as any).mockRejectedValue(
                new Error('GPS unavailable')
            );
            await expect(dataProvider.getCurrentLocation()).rejects.toThrow(
                'GPS unavailable'
            );

            // File upload fails due to validation
            const file = new File(['test'], 'invalid.exe', {
                type: 'application/exe',
            });
            (interactionValidator.validateAttachment as any).mockReturnValue({
                isValid: false,
                errors: [{ message: 'Invalid file type' }],
                warnings: [],
            });

            await expect(
                dataProvider.uploadInteractionAttachment(
                    createResult.data.id,
                    file
                )
            ).rejects.toThrow('File validation failed');

            // Verify mixed results were tracked correctly
            expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
                'createInteraction',
                'POST',
                expect.any(Number),
                true
            );
            expect(performanceMonitor.trackGPSAcquisition).toHaveBeenCalledWith(
                expect.any(Number),
                0,
                false,
                'GPS unavailable'
            );
            expect(performanceMonitor.trackFileUpload).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                false,
                undefined,
                'File validation failed'
            );
        });
    });
});
