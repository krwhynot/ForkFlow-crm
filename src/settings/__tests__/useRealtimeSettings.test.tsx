import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { TestContext } from 'ra-test';
import { useRealtimeSettings, useRealtimeSettingsStats } from '../hooks/useRealtimeSettings';
import { Setting } from '../../types';

// Mock Supabase client
const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockImplementation((callback) => {
        callback('SUBSCRIBED');
        return mockChannel;
    }),
};

const mockSupabaseClient = {
    channel: jest.fn().mockReturnValue(mockChannel),
    removeChannel: jest.fn(),
};

jest.mock('../../providers/supabase', () => ({
    supabaseClient: mockSupabaseClient,
}));

const mockSettings: Setting[] = [
    {
        id: 1,
        category: 'priority',
        key: 'a_priority',
        label: 'A Priority',
        color: '#22c55e',
        sortOrder: 1,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        category: 'segment',
        key: 'fine_dining',
        label: 'Fine Dining',
        color: '#8b5cf6',
        sortOrder: 1,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 3,
        category: 'priority',
        key: 'b_priority',
        label: 'B Priority',
        color: '#eab308',
        sortOrder: 2,
        active: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

const mockDataProvider = {
    getList: jest.fn().mockResolvedValue({
        data: mockSettings,
        total: mockSettings.length,
    }),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyReference: jest.fn(),
    create: jest.fn().mockResolvedValue({ data: { ...mockSettings[0], id: 4 } }),
    update: jest.fn().mockResolvedValue({ data: mockSettings[0] }),
    updateMany: jest.fn(),
    delete: jest.fn().mockResolvedValue({ data: mockSettings[0] }),
    deleteMany: jest.fn(),
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestContext dataProvider={mockDataProvider}>
        {children}
    </TestContext>
);

describe('useRealtimeSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with default options', async () => {
        const { result } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(result.current.settings).toEqual(mockSettings);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isConnected).toBe(true);
        });
    });

    it('filters settings by category when specified', async () => {
        const { result } = renderHook(() => useRealtimeSettings({ category: 'priority' }), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(mockDataProvider.getList).toHaveBeenCalledWith(
                'settings',
                expect.objectContaining({
                    filter: { category: 'priority' },
                })
            );
        });
    });

    it('sets up real-time subscription when enabled', async () => {
        renderHook(() => useRealtimeSettings({ enabled: true }), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(mockSupabaseClient.channel).toHaveBeenCalledWith('settings-changes');
            expect(mockChannel.on).toHaveBeenCalledWith(
                'postgres_changes',
                expect.objectContaining({
                    event: '*',
                    schema: 'public',
                    table: 'settings',
                }),
                expect.any(Function)
            );
            expect(mockChannel.subscribe).toHaveBeenCalled();
        });
    });

    it('does not set up subscription when disabled', async () => {
        renderHook(() => useRealtimeSettings({ enabled: false }), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
        });
    });

    it('performs optimistic create operation', async () => {
        const { result } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        const newSetting = {
            category: 'role' as const,
            key: 'test_role',
            label: 'Test Role',
            sortOrder: 1,
            active: true,
        };

        await waitFor(async () => {
            await result.current.performOptimisticUpdate('create', newSetting);
            expect(mockDataProvider.create).toHaveBeenCalledWith('settings', {
                data: newSetting,
            });
        });
    });

    it('performs optimistic update operation', async () => {
        const { result } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        const updateData = {
            id: 1,
            label: 'Updated Priority',
        };

        await waitFor(async () => {
            await result.current.performOptimisticUpdate('update', updateData);
            expect(mockDataProvider.update).toHaveBeenCalledWith('settings', {
                id: 1,
                data: updateData,
                previousData: updateData,
            });
        });
    });

    it('performs optimistic delete operation', async () => {
        const { result } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        const deleteData = { id: 1 };

        await waitFor(async () => {
            await result.current.performOptimisticUpdate('delete', deleteData);
            expect(mockDataProvider.delete).toHaveBeenCalledWith('settings', {
                id: 1,
                previousData: deleteData,
            });
        });
    });

    it('handles optimistic update errors gracefully', async () => {
        mockDataProvider.create.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        const newSetting = {
            category: 'role' as const,
            key: 'test_role',
            label: 'Test Role',
            sortOrder: 1,
            active: true,
        };

        await waitFor(async () => {
            try {
                await result.current.performOptimisticUpdate('create', newSetting);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('cleans up subscription on unmount', async () => {
        const { unmount } = renderHook(() => useRealtimeSettings(), {
            wrapper: TestWrapper,
        });

        unmount();

        expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
});

describe('useRealtimeSettingsStats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calculates statistics correctly', async () => {
        const { result } = renderHook(() => useRealtimeSettingsStats(), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(result.current.stats.total).toBe(3);
            expect(result.current.stats.active).toBe(2);
            expect(result.current.stats.inactive).toBe(1);
            expect(result.current.stats.byCategory.priority.total).toBe(2);
            expect(result.current.stats.byCategory.priority.active).toBe(1);
            expect(result.current.stats.byCategory.segment.total).toBe(1);
        });
    });

    it('updates stats when settings change', async () => {
        const { result, rerender } = renderHook(() => useRealtimeSettingsStats(), {
            wrapper: TestWrapper,
        });

        // Initially should have stats for mockSettings
        await waitFor(() => {
            expect(result.current.stats.total).toBe(3);
        });

        // Mock settings change
        const newMockSettings = [
            ...mockSettings,
            {
                id: 4,
                category: 'role' as const,
                key: 'chef',
                label: 'Chef',
                color: '#ef4444',
                sortOrder: 1,
                active: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockDataProvider.getList.mockResolvedValueOnce({
            data: newMockSettings,
            total: newMockSettings.length,
        });

        rerender();

        await waitFor(() => {
            expect(result.current.stats.total).toBe(4);
            expect(result.current.stats.active).toBe(3);
        });
    });

    it('handles empty settings array', async () => {
        mockDataProvider.getList.mockResolvedValueOnce({
            data: [],
            total: 0,
        });

        const { result } = renderHook(() => useRealtimeSettingsStats(), {
            wrapper: TestWrapper,
        });

        await waitFor(() => {
            expect(result.current.stats.total).toBe(0);
            expect(result.current.stats.active).toBe(0);
            expect(result.current.stats.inactive).toBe(0);
            expect(Object.keys(result.current.stats.byCategory)).toHaveLength(0);
        });
    });
});