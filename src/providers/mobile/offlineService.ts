import { Interaction } from '../../types';

export interface OfflineAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    resource: 'interactions';
    data: any;
    timestamp: string;
    retryCount: number;
    maxRetries: number;
}

export interface OfflineStatus {
    isOnline: boolean;
    pendingActions: number;
    lastSync: string | null;
    syncInProgress: boolean;
}

export interface SyncResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
}

/**
 * Offline service for mobile interaction tracking
 * Handles offline storage, sync queues, and conflict resolution
 */
export class OfflineService {
    private static instance: OfflineService;
    private isOnline: boolean = navigator.onLine;
    private syncInProgress: boolean = false;
    private pendingActions: OfflineAction[] = [];
    private lastSyncTime: string | null = null;
    private syncCallbacks: Set<(status: OfflineStatus) => void> = new Set();

    // Storage keys
    private readonly PENDING_ACTIONS_KEY = 'forkflow_pending_actions';
    private readonly LAST_SYNC_KEY = 'forkflow_last_sync';
    private readonly OFFLINE_INTERACTIONS_KEY = 'forkflow_offline_interactions';

    // Sync configuration
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 5000; // 5 seconds
    private readonly SYNC_INTERVAL = 30000; // 30 seconds

    private constructor() {
        this.initializeService();
        this.setupEventListeners();
        this.startPeriodicSync();
    }

    static getInstance(): OfflineService {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }

    /**
     * Get current offline status
     */
    getStatus(): OfflineStatus {
        return {
            isOnline: this.isOnline,
            pendingActions: this.pendingActions.length,
            lastSync: this.lastSyncTime,
            syncInProgress: this.syncInProgress,
        };
    }

    /**
     * Subscribe to status changes
     */
    onStatusChange(callback: (status: OfflineStatus) => void): () => void {
        this.syncCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.syncCallbacks.delete(callback);
        };
    }

    /**
     * Queue an interaction for offline processing
     */
    async queueInteraction(
        type: 'create' | 'update' | 'delete',
        data: Partial<Interaction>,
        localId?: string
    ): Promise<string> {
        const actionId =
            localId ||
            `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const action: OfflineAction = {
            id: actionId,
            type,
            resource: 'interactions',
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries: this.MAX_RETRIES,
        };

        // Add to pending actions
        this.pendingActions.push(action);

        // Store locally
        await this.savePendingActions();

        // Store interaction data for offline access
        if (type === 'create' || type === 'update') {
            await this.storeOfflineInteraction(actionId, data);
        }

        // Notify status change
        this.notifyStatusChange();

        // Try to sync immediately if online
        if (this.isOnline) {
            this.syncPendingActions();
        }

        return actionId;
    }

    /**
     * Get offline interactions for display
     */
    async getOfflineInteractions(): Promise<Partial<Interaction>[]> {
        try {
            const stored = localStorage.getItem(this.OFFLINE_INTERACTIONS_KEY);
            if (!stored) return [];

            const interactions = JSON.parse(stored);
            return Object.values(interactions);
        } catch (error) {
            console.error('Error loading offline interactions:', error);
            return [];
        }
    }

    /**
     * Sync pending actions with server
     */
    async syncPendingActions(dataProvider?: any): Promise<SyncResult> {
        if (this.syncInProgress || !this.isOnline) {
            return {
                success: false,
                processed: 0,
                failed: 0,
                errors: ['Sync already in progress or offline'],
            };
        }

        this.syncInProgress = true;
        this.notifyStatusChange();

        const result: SyncResult = {
            success: true,
            processed: 0,
            failed: 0,
            errors: [],
        };

        try {
            // Process actions in order
            const actionsToProcess = [...this.pendingActions];

            for (const action of actionsToProcess) {
                try {
                    if (dataProvider) {
                        await this.processAction(action, dataProvider);
                    }

                    // Remove successful action
                    this.pendingActions = this.pendingActions.filter(
                        a => a.id !== action.id
                    );
                    result.processed++;

                    // Remove from offline storage
                    await this.removeOfflineInteraction(action.id);
                } catch (error: any) {
                    console.error(`Failed to sync action ${action.id}:`, error);

                    // Increment retry count
                    action.retryCount++;

                    if (action.retryCount >= action.maxRetries) {
                        // Remove failed action after max retries
                        this.pendingActions = this.pendingActions.filter(
                            a => a.id !== action.id
                        );
                        result.failed++;
                        result.errors.push(
                            `Action ${action.id} failed after ${action.maxRetries} retries: ${error.message}`
                        );
                    }
                }
            }

            // Update last sync time
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem(this.LAST_SYNC_KEY, this.lastSyncTime);

            // Save updated pending actions
            await this.savePendingActions();
        } catch (error: any) {
            result.success = false;
            result.errors.push(`Sync failed: ${error.message}`);
        } finally {
            this.syncInProgress = false;
            this.notifyStatusChange();
        }

        return result;
    }

    /**
     * Clear all offline data
     */
    async clearOfflineData(): Promise<void> {
        this.pendingActions = [];
        this.lastSyncTime = null;

        localStorage.removeItem(this.PENDING_ACTIONS_KEY);
        localStorage.removeItem(this.LAST_SYNC_KEY);
        localStorage.removeItem(this.OFFLINE_INTERACTIONS_KEY);

        this.notifyStatusChange();
    }

    /**
     * Get pending action count
     */
    getPendingCount(): number {
        return this.pendingActions.length;
    }

    /**
     * Check if there are conflicts for a specific interaction
     */
    hasConflicts(interactionId: string): boolean {
        return this.pendingActions.some(
            action => action.data.id === interactionId && action.retryCount > 0
        );
    }

    private async initializeService(): Promise<void> {
        // Load pending actions from storage
        try {
            const stored = localStorage.getItem(this.PENDING_ACTIONS_KEY);
            if (stored) {
                this.pendingActions = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading pending actions:', error);
            this.pendingActions = [];
        }

        // Load last sync time
        this.lastSyncTime = localStorage.getItem(this.LAST_SYNC_KEY);
    }

    private setupEventListeners(): void {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyStatusChange();

            // Try to sync when coming back online
            if (this.pendingActions.length > 0) {
                setTimeout(() => this.syncPendingActions(), 1000);
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyStatusChange();
        });

        // Listen for page visibility changes to sync when app becomes visible
        document.addEventListener('visibilitychange', () => {
            if (
                !document.hidden &&
                this.isOnline &&
                this.pendingActions.length > 0
            ) {
                setTimeout(() => this.syncPendingActions(), 1000);
            }
        });
    }

    private startPeriodicSync(): void {
        setInterval(() => {
            if (
                this.isOnline &&
                this.pendingActions.length > 0 &&
                !this.syncInProgress
            ) {
                this.syncPendingActions();
            }
        }, this.SYNC_INTERVAL);
    }

    private async processAction(
        action: OfflineAction,
        dataProvider: any
    ): Promise<void> {
        switch (action.type) {
            case 'create':
                await dataProvider.create('interactions', {
                    data: action.data,
                });
                break;
            case 'update':
                const previousData = await this.getOfflineInteraction(
                    action.id
                );
                await dataProvider.update('interactions', {
                    id: action.data.id,
                    data: action.data,
                    previousData,
                });
                break;
            case 'delete':
                await dataProvider.delete('interactions', {
                    id: action.data.id,
                });
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    private async savePendingActions(): Promise<void> {
        try {
            localStorage.setItem(
                this.PENDING_ACTIONS_KEY,
                JSON.stringify(this.pendingActions)
            );
        } catch (error) {
            console.error('Error saving pending actions:', error);
        }
    }

    private async storeOfflineInteraction(
        id: string,
        data: Partial<Interaction>
    ): Promise<void> {
        try {
            const stored = localStorage.getItem(this.OFFLINE_INTERACTIONS_KEY);
            const interactions = stored ? JSON.parse(stored) : {};

            interactions[id] = {
                ...data,
                id: id,
                _offline: true,
                _timestamp: new Date().toISOString(),
            };

            localStorage.setItem(
                this.OFFLINE_INTERACTIONS_KEY,
                JSON.stringify(interactions)
            );
        } catch (error) {
            console.error('Error storing offline interaction:', error);
        }
    }

    private async getOfflineInteraction(
        id: string
    ): Promise<Partial<Interaction> | null> {
        try {
            const stored = localStorage.getItem(this.OFFLINE_INTERACTIONS_KEY);
            if (!stored) return null;

            const interactions = JSON.parse(stored);
            return interactions[id] || null;
        } catch (error) {
            console.error('Error getting offline interaction:', error);
            return null;
        }
    }

    private async removeOfflineInteraction(id: string): Promise<void> {
        try {
            const stored = localStorage.getItem(this.OFFLINE_INTERACTIONS_KEY);
            if (!stored) return;

            const interactions = JSON.parse(stored);
            delete interactions[id];

            localStorage.setItem(
                this.OFFLINE_INTERACTIONS_KEY,
                JSON.stringify(interactions)
            );
        } catch (error) {
            console.error('Error removing offline interaction:', error);
        }
    }

    private notifyStatusChange(): void {
        const status = this.getStatus();
        this.syncCallbacks.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in status change callback:', error);
            }
        });
    }
}

// Singleton instance for use across the application
export const offlineService = OfflineService.getInstance();

// Hook for React components
export const useOfflineService = () => {
    return offlineService;
};
