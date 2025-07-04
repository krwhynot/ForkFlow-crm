import { useDataProvider, useNotify } from 'react-admin';
import { Identifier } from 'react-admin';
import { Interaction } from '../../types';

/**
 * Custom hook to interact with the enhanced Interaction API
 * Provides mobile-optimized methods for interaction management
 */
export const useInteractionAPI = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();

    // Create interaction with automatic GPS capture
    const createWithLocation = async (
        data: Partial<Interaction>,
        autoCapture: boolean = true
    ) => {
        try {
            const result = await dataProvider.createInteractionWithLocation(
                { data },
                autoCapture
            );

            if (result.data._offline) {
                notify('Interaction saved offline. Will sync when online.', {
                    type: 'info',
                });
            } else {
                notify('Interaction created successfully!', {
                    type: 'success',
                });
            }

            return result;
        } catch (error: any) {
            notify(`Failed to create interaction: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Get current GPS location
    const getCurrentLocation = async () => {
        try {
            return await dataProvider.getCurrentLocation();
        } catch (error: any) {
            notify(`GPS error: ${error.message}`, { type: 'error' });
            throw error;
        }
    };

    // Add location to existing interaction
    const addLocationToInteraction = async (
        interactionId: Identifier,
        forceRefresh: boolean = false
    ) => {
        try {
            const result = await dataProvider.addLocationToInteraction(
                interactionId,
                forceRefresh
            );
            notify('Location added to interaction!', { type: 'success' });
            return result;
        } catch (error: any) {
            notify(`Failed to add location: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Sync offline interactions
    const syncOfflineData = async () => {
        try {
            const result = await dataProvider.syncOfflineInteractions();

            if (result.success) {
                notify(
                    `Synced ${result.processed} interactions successfully!`,
                    { type: 'success' }
                );

                if (result.failed > 0) {
                    notify(`${result.failed} interactions failed to sync`, {
                        type: 'warning',
                    });
                }
            } else {
                notify('Sync failed. Will retry automatically.', {
                    type: 'error',
                });
            }

            return result;
        } catch (error: any) {
            notify(`Sync failed: ${error.message}`, { type: 'error' });
            throw error;
        }
    };

    // Get offline status
    const getOfflineStatus = () => {
        return dataProvider.getOfflineStatus();
    };

    // Get offline interactions
    const getOfflineInteractions = async () => {
        try {
            return await dataProvider.getOfflineInteractions();
        } catch (error: any) {
            notify(`Failed to get offline interactions: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Clear offline data
    const clearOfflineData = async () => {
        try {
            await dataProvider.clearOfflineData();
            notify('Offline data cleared!', { type: 'success' });
        } catch (error: any) {
            notify(`Failed to clear offline data: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Validate file attachment
    const validateFileAttachment = async (file: File) => {
        try {
            return await dataProvider.validateFileAttachment(file);
        } catch (error: any) {
            notify(`File validation failed: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Compress image for mobile upload
    const compressImageForMobile = async (
        file: File,
        maxWidth: number = 1920,
        maxHeight: number = 1080,
        quality: number = 0.8
    ) => {
        try {
            return await dataProvider.compressImageForMobile(
                file,
                maxWidth,
                maxHeight,
                quality
            );
        } catch (error: any) {
            notify(`Image compression failed: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Create image thumbnail
    const createImageThumbnail = async (file: File, size: number = 150) => {
        try {
            return await dataProvider.createImageThumbnail(file, size);
        } catch (error: any) {
            notify(`Thumbnail creation failed: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Get interaction timeline
    const getInteractionTimeline = async (params: {
        startDate?: string;
        endDate?: string;
        organizationId?: Identifier;
        contactId?: Identifier;
        typeIds?: Identifier[];
    }) => {
        try {
            return await dataProvider.getInteractionTimeline(params);
        } catch (error: any) {
            notify(`Failed to get interaction timeline: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Get follow-up reminders
    const getFollowUpReminders = async (params: {
        overdue?: boolean;
        upcoming?: boolean;
        days?: number;
    }) => {
        try {
            return await dataProvider.getFollowUpReminders(params);
        } catch (error: any) {
            notify(`Failed to get follow-up reminders: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Complete interaction
    const completeInteraction = async (
        id: Identifier,
        completionData: {
            duration?: number;
            outcome?: string;
            [key: string]: any;
        }
    ) => {
        try {
            const result = await dataProvider.completeInteraction(
                id,
                completionData
            );
            notify('Interaction marked as completed!', { type: 'success' });
            return result;
        } catch (error: any) {
            notify(`Failed to complete interaction: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Schedule follow-up
    const scheduleFollowUp = async (
        id: Identifier,
        followUpData: { followUpDate: string; followUpNotes?: string }
    ) => {
        try {
            const result = await dataProvider.scheduleFollowUp(
                id,
                followUpData
            );
            notify('Follow-up scheduled!', { type: 'success' });
            return result;
        } catch (error: any) {
            notify(`Failed to schedule follow-up: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    // Upload interaction attachment
    const uploadAttachment = async (interactionId: Identifier, file: File) => {
        try {
            const result = await dataProvider.uploadInteractionAttachment(
                interactionId,
                file
            );
            notify('File uploaded successfully!', { type: 'success' });
            return result;
        } catch (error: any) {
            notify(`File upload failed: ${error.message}`, { type: 'error' });
            throw error;
        }
    };

    // Delete interaction attachment
    const deleteAttachment = async (
        interactionId: Identifier,
        fileName: string
    ) => {
        try {
            const result = await dataProvider.deleteInteractionAttachment(
                interactionId,
                fileName
            );
            notify('File deleted successfully!', { type: 'success' });
            return result;
        } catch (error: any) {
            notify(`Failed to delete file: ${error.message}`, {
                type: 'error',
            });
            throw error;
        }
    };

    return {
        // Core interaction methods
        createWithLocation,
        completeInteraction,
        scheduleFollowUp,

        // GPS methods
        getCurrentLocation,
        addLocationToInteraction,

        // Offline methods
        syncOfflineData,
        getOfflineStatus,
        getOfflineInteractions,
        clearOfflineData,

        // File methods
        validateFileAttachment,
        compressImageForMobile,
        createImageThumbnail,
        uploadAttachment,
        deleteAttachment,

        // Query methods
        getInteractionTimeline,
        getFollowUpReminders,
    };
};
