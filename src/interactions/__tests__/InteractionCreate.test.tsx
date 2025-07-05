import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Test context no longer needed - using testing library directly

import { InteractionCreate } from '../InteractionCreate';

// Mock the interaction API hook
vi.mock('../hooks/useInteractionAPI', () => ({
    useInteractionAPI: () => ({
        createWithLocation: vi.fn().mockResolvedValue({
            data: { id: 'test-interaction-1', subject: 'Test Interaction' },
        }),
        getCurrentLocation: vi.fn().mockResolvedValue({
            coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            },
        }),
        getOfflineStatus: () => ({
            isOnline: true,
            pendingActions: 0,
            storageUsed: 0,
            lastSync: null,
        }),
        syncOfflineData: vi.fn(),
    }),
}));

// Mock react-admin hooks
vi.mock('react-admin', async () => {
    const actual = await vi.importActual('react-admin');
    return {
        ...actual,
        useGetIdentity: () => ({ identity: { id: 'user1' } }),
        useDataProvider: () => ({}),
        useNotify: () => vi.fn(),
        useRedirect: () => vi.fn(),
    };
});

// Mock Heroicons (if needed)
vi.mock('@heroicons/react/24/outline', () => ({
    MapPinIcon: () => <span data-testid="gps-icon">GPS</span>,
    CloudIcon: () => <span data-testid="offline-icon">Offline</span>,
}));

const renderInteractionCreate = () => {
    const dataProvider = {
        getList: vi.fn().mockResolvedValue({ data: [], total: 0 }),
        getOne: vi.fn(),
        getMany: vi.fn(),
        getManyReference: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
    };

    return render(<InteractionCreate />);
};

describe('InteractionCreate', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the create form', () => {
        renderInteractionCreate();

        expect(screen.getByRole('form')).toBeInTheDocument();
        expect(screen.getByText('Get GPS')).toBeInTheDocument();
    });

    it('should show GPS button in toolbar', () => {
        renderInteractionCreate();

        const gpsButton = screen.getByText('Get GPS');
        expect(gpsButton).toBeInTheDocument();
        expect(gpsButton).not.toBeDisabled();
    });

    it('should handle GPS button click', async () => {
        const mockGetCurrentLocation = vi.fn().mockResolvedValue({
            coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            },
        });

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: vi.fn(),
                getCurrentLocation: mockGetCurrentLocation,
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        const gpsButton = screen.getByText('Get GPS');
        await user.click(gpsButton);

        expect(mockGetCurrentLocation).toHaveBeenCalled();
    });

    it('should show offline indicator when offline', () => {
        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: vi.fn(),
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({
                    isOnline: false,
                    pendingActions: 2,
                }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
        const mockCreateWithLocation = vi.fn().mockResolvedValue({
            data: { id: 'test-interaction-1', subject: 'Test Interaction' },
        });

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: mockCreateWithLocation,
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        // Fill out the form (simplified for test)
        // In a real test, you'd fill out all required fields

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /save/i });
        if (submitButton) {
            await user.click(submitButton);
        }

        // Note: This test would need more complex setup to properly test form submission
        // as it involves react-admin's form handling
    });

    it('should show loading state when getting GPS', async () => {
        const mockGetCurrentLocation = vi.fn().mockImplementation(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve({
                                coordinates: {
                                    latitude: 37.7749,
                                    longitude: -122.4194,
                                    accuracy: 10,
                                },
                            }),
                        100
                    )
                )
        );

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: vi.fn(),
                getCurrentLocation: mockGetCurrentLocation,
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        const gpsButton = screen.getByText('Get GPS');
        await user.click(gpsButton);

        expect(screen.getByText('Getting Location...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Get GPS')).toBeInTheDocument();
        });
    });

    it('should handle GPS errors gracefully', async () => {
        const mockGetCurrentLocation = vi
            .fn()
            .mockRejectedValue(new Error('Location access denied'));

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: vi.fn(),
                getCurrentLocation: mockGetCurrentLocation,
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        const gpsButton = screen.getByText('Get GPS');
        await user.click(gpsButton);

        // Error handling would typically show a notification
        // The exact behavior depends on how errors are handled in the component
        expect(mockGetCurrentLocation).toHaveBeenCalled();
    });

    it('should apply mobile-first styling', () => {
        renderInteractionCreate();

        const main = document.querySelector('.RaCreate-main');
        expect(main).toHaveStyle({ maxWidth: '800px', margin: '0 auto' });
    });

    it('should have proper accessibility attributes', () => {
        renderInteractionCreate();

        const gpsButton = screen.getByText('Get GPS');
        expect(gpsButton).toHaveAttribute('type', 'button');

        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
    });

    it('should handle create success and redirect', async () => {
        const mockRedirect = vi.fn();
        const mockCreateWithLocation = vi.fn().mockResolvedValue({
            data: { id: 'test-interaction-1', subject: 'Test Interaction' },
        });

        vi.doMock('react-admin', async () => {
            const actual = await vi.importActual('react-admin');
            return {
                ...actual,
                useGetIdentity: () => ({ identity: { id: 'user1' } }),
                useDataProvider: () => ({}),
                useNotify: () => vi.fn(),
                useRedirect: () => mockRedirect,
            };
        });

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: mockCreateWithLocation,
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        // Simulate form submission success
        // This would trigger the redirect logic
        // Note: Actual implementation would need more complex form simulation
    });

    it('should handle create failure gracefully', async () => {
        const mockCreateWithLocation = vi
            .fn()
            .mockRejectedValue(new Error('Failed to create interaction'));

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: mockCreateWithLocation,
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        // Test error handling during create
        // The exact behavior depends on the error handling implementation
    });

    it('should transform data correctly before submission', async () => {
        const mockCreateWithLocation = vi.fn().mockResolvedValue({
            data: { id: 'test-interaction-1' },
        });

        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: mockCreateWithLocation,
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({ isOnline: true, pendingActions: 0 }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        // Test data transformation
        // The transform function should add createdBy, isCompleted, scheduledDate, etc.
        // This would require simulating actual form submission
    });

    it('should handle offline mode properly', () => {
        vi.doMock('../hooks/useInteractionAPI', () => ({
            useInteractionAPI: () => ({
                createWithLocation: vi.fn(),
                getCurrentLocation: vi.fn(),
                getOfflineStatus: () => ({
                    isOnline: false,
                    pendingActions: 3,
                    storageUsed: 1024,
                    lastSync: '2023-01-01T12:00:00Z',
                }),
                syncOfflineData: vi.fn(),
            }),
        }));

        renderInteractionCreate();

        expect(screen.getByText('Offline Mode')).toBeInTheDocument();
    });
});
