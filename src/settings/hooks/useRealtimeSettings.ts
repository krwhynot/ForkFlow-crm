import { useEffect, useCallback, useState } from 'react';
import { useDataProvider, useNotify, useGetList } from 'react-admin';
import { Setting } from '../../types';
import { supabase as supabaseClient } from '../../providers/supabase/supabase';

interface UseRealtimeSettingsOptions {
    enabled?: boolean;
    category?: string;
}

interface RealtimeUpdate {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new?: Setting;
    old?: Setting;
    timestamp: string;
}

export const useRealtimeSettings = (options: UseRealtimeSettingsOptions = {}) => {
    const { enabled = true, category } = options;
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
    
    // Get initial settings data
    const { data: settings, refetch, isLoading } = useGetList<Setting>('settings', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'category', order: 'ASC' },
        filter: category ? { category } : {},
    });

    // Handle real-time updates
    const handleRealtimeUpdate = useCallback((payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        const update: RealtimeUpdate = {
            eventType,
            new: newRecord,
            old: oldRecord,
            timestamp: new Date().toISOString(),
        };
        
        setLastUpdate(update);

        // Show notifications for updates
        switch (eventType) {
            case 'INSERT':
                notify(`New ${newRecord.category} setting created: ${newRecord.label}`, {
                    type: 'info',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
                break;
            case 'UPDATE':
                notify(`Setting updated: ${newRecord.label}`, {
                    type: 'info',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
                break;
            case 'DELETE':
                notify(`Setting deleted: ${oldRecord.label}`, {
                    type: 'warning',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
                break;
        }

        // Refetch data to ensure consistency
        refetch();
    }, [notify, refetch]);

    // Set up real-time subscription
    useEffect(() => {
        if (!enabled || !supabaseClient) return;

        setIsConnected(false);

        const channel = supabaseClient
            .channel('settings-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'settings',
                    filter: category ? `category=eq.${category}` : undefined,
                },
                handleRealtimeUpdate
            )
            .subscribe((status: string) => {
                setIsConnected(status === 'SUBSCRIBED');
                if (status === 'SUBSCRIBED') {
                    console.log('Real-time settings subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('Real-time settings subscription error');
                    notify('Real-time updates disconnected', { type: 'warning' });
                }
            });

        return () => {
            supabaseClient.removeChannel(channel);
            setIsConnected(false);
        };
    }, [enabled, category, handleRealtimeUpdate, notify]);

    // Optimistic update helper
    const performOptimisticUpdate = useCallback(
        async (operation: 'create' | 'update' | 'delete', settingData: Partial<Setting>) => {
            try {
                let result;
                switch (operation) {
                    case 'create':
                        result = await dataProvider.create('settings', { data: settingData });
                        break;
                    case 'update':
                        result = await dataProvider.update('settings', {
                            id: settingData.id!,
                            data: settingData,
                            previousData: settingData as any,
                        });
                        break;
                    case 'delete':
                        result = await dataProvider.delete('settings', {
                            id: settingData.id!,
                            previousData: settingData as any,
                        });
                        break;
                }
                return result;
            } catch (error) {
                console.error('Optimistic update failed:', error);
                notify('Operation failed. Please try again.', { type: 'error' });
                // Refetch to restore consistent state
                refetch();
                throw error;
            }
        },
        [dataProvider, notify, refetch]
    );

    // Connection retry helper
    const reconnect = useCallback(() => {
        if (supabaseClient) {
            // Force reconnection by creating a new subscription
            window.location.reload();
        }
    }, []);

    return {
        settings: settings || [],
        isLoading,
        isConnected,
        lastUpdate,
        refetch,
        performOptimisticUpdate,
        reconnect,
    };
};

// Hook for settings statistics with real-time updates
export const useRealtimeSettingsStats = () => {
    const { settings, isLoading, isConnected } = useRealtimeSettings();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byCategory: {} as Record<string, { total: number; active: number; inactive: number }>,
    });

    useEffect(() => {
        if (settings) {
            const byCategory = settings.reduce((acc, setting) => {
                const category = setting.category;
                if (!acc[category]) {
                    acc[category] = { total: 0, active: 0, inactive: 0 };
                }
                acc[category].total++;
                if (setting.active) {
                    acc[category].active++;
                } else {
                    acc[category].inactive++;
                }
                return acc;
            }, {} as Record<string, { total: number; active: number; inactive: number }>);

            setStats({
                total: settings.length,
                active: settings.filter(s => s.active).length,
                inactive: settings.filter(s => !s.active).length,
                byCategory,
            });
        }
    }, [settings]);

    return {
        stats,
        isLoading,
        isConnected,
    };
};