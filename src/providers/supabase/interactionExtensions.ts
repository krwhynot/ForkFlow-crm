/**
 * Supabase Data Provider Extensions for Interactions
 * Adds mobile-optimized interaction management with GPS and file upload capabilities
 */

import {
    DataProvider,
    Identifier,
    CreateParams,
    UpdateParams,
    GetListParams,
} from 'react-admin';
import { Interaction, GPSCoordinates } from '../../types';
import { supabase } from './supabase';
import { logAuditEvent } from '../../utils/auditLogging';

// File attachment metadata interface
export interface FileAttachment {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
}

// GPS location interface for interactions
export interface InteractionLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    notes?: string;
}

// Offline sync result interface
export interface SyncResult {
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
}

/**
 * Get current GPS location with high accuracy for field sales
 */
export const getCurrentLocation = (): Promise<GPSCoordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                });
            },
            error => {
                let errorMessage = 'Unknown GPS error';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'GPS access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'GPS position unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'GPS request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // 15 seconds timeout for field conditions
                maximumAge: 30000, // Cache for 30 seconds
            }
        );
    });
};

/**
 * Validate file for interaction attachment
 */
export const validateFileAttachment = async (file: File): Promise<boolean> => {
    // Maximum file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;

    // Allowed file types
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (file.size > MAX_SIZE) {
        throw new Error(
            `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`
        );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
    }

    return true;
};

/**
 * Compress image for mobile upload
 */
export const compressImageForMobile = async (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file); // Not an image, return as-is
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                blob => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Image compression failed'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () =>
            reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Create image thumbnail
 */
export const createImageThumbnail = async (
    file: File,
    size: number = 150
): Promise<File> => {
    return compressImageForMobile(file, size, size, 0.7);
};

/**
 * Upload interaction attachment to Supabase Storage
 */
export const uploadInteractionAttachment = async (
    interactionId: Identifier,
    file: File
): Promise<FileAttachment> => {
    await validateFileAttachment(file);

    // Compress images for mobile
    const processedFile = await compressImageForMobile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${interactionId}/${timestamp}_${randomSuffix}_${processedFile.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('interaction-attachments')
        .upload(filename, processedFile, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('interaction-attachments')
        .getPublicUrl(filename);

    // Create attachment metadata
    const attachment: FileAttachment = {
        id: randomSuffix,
        filename: data.path,
        originalName: file.name,
        size: processedFile.size,
        mimeType: processedFile.type,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
    };

    // Log audit event
    await logAuditEvent(
        'data.create',
        {
            resource: 'interaction_attachment',
            interactionId,
            filename: file.name,
            size: processedFile.size,
            mimeType: processedFile.type,
        },
        {
            outcome: 'success',
            message: 'Interaction attachment uploaded successfully',
        }
    );

    return attachment;
};

/**
 * Delete interaction attachment from Supabase Storage
 */
export const deleteInteractionAttachment = async (
    interactionId: Identifier,
    filename: string
): Promise<boolean> => {
    const { error } = await supabase.storage
        .from('interaction-attachments')
        .remove([filename]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }

    // Log audit event
    await logAuditEvent(
        'data.delete',
        {
            resource: 'interaction_attachment',
            interactionId,
            filename,
        },
        {
            outcome: 'success',
            message: 'Interaction attachment deleted successfully',
        }
    );

    return true;
};

/**
 * Process interaction data to auto-capture GPS if needed
 */
export const processInteractionLocation = async (
    params: CreateParams<Interaction> | UpdateParams<Interaction>,
    autoCapture: boolean = true
): Promise<CreateParams<Interaction> | UpdateParams<Interaction>> => {
    const { data } = params;

    // Auto-capture GPS coordinates if not provided and requested
    if (autoCapture && (!data.latitude || !data.longitude)) {
        try {
            const location = await getCurrentLocation();
            return {
                ...params,
                data: {
                    ...data,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    locationNotes:
                        data.locationNotes ||
                        `Auto-captured at ${location.timestamp}`,
                },
            };
        } catch (error) {
            console.warn('Could not get GPS location:', error);
            // Continue without GPS coordinates
        }
    }

    return params;
};

/**
 * Add location to existing interaction
 */
export const addLocationToInteraction = async (
    dataProvider: DataProvider,
    interactionId: Identifier,
    forceRefresh: boolean = false
): Promise<Interaction> => {
    try {
        const location = await getCurrentLocation();

        const updatedInteraction = await dataProvider.update('interactions', {
            id: interactionId,
            data: {
                latitude: location.latitude,
                longitude: location.longitude,
                locationNotes: `Location added at ${location.timestamp}`,
            },
            previousData: {} as Interaction, // Will be populated by react-admin
        });

        // Log audit event
        await logAuditEvent(
            'data.update',
            {
                resource: 'interaction',
                interactionId,
                action: 'location_added',
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
            },
            {
                outcome: 'success',
                message: 'GPS location added to interaction',
            }
        );

        return updatedInteraction.data;
    } catch (error: any) {
        // Log audit event for failure
        await logAuditEvent(
            'data.update',
            {
                resource: 'interaction',
                interactionId,
                action: 'location_add_failed',
                error: error.message,
            },
            {
                outcome: 'failure',
                message: 'Failed to add GPS location to interaction',
            }
        );

        throw error;
    }
};

/**
 * Get interaction timeline with filtering
 */
export const getInteractionTimeline = async (
    dataProvider: DataProvider,
    params: {
        startDate?: string;
        endDate?: string;
        organizationId?: Identifier;
        contactId?: Identifier;
        typeIds?: Identifier[];
    }
): Promise<{ data: Interaction[]; total?: number }> => {
    const filters: Record<string, any> = {};

    if (params.organizationId) {
        filters.organizationId = params.organizationId;
    }

    if (params.contactId) {
        filters.contactId = params.contactId;
    }

    if (params.typeIds && params.typeIds.length > 0) {
        filters.typeId = params.typeIds;
    }

    if (params.startDate) {
        filters.scheduledDate_gte = params.startDate;
    }

    if (params.endDate) {
        filters.scheduledDate_lte = params.endDate;
    }

    return dataProvider.getList('interactions', {
        pagination: { page: 1, perPage: 1000 }, // Get all for timeline
        sort: { field: 'scheduledDate', order: 'DESC' },
        filter: filters,
    });
};

/**
 * Get follow-up reminders
 */
export const getFollowUpReminders = async (
    dataProvider: DataProvider,
    params: {
        overdue?: boolean;
        upcoming?: boolean;
        days?: number;
    }
): Promise<{ data: Interaction[]; total?: number }> => {
    const filters: Record<string, any> = {
        followUpRequired: true,
        isCompleted: false,
    };

    const now = new Date();
    const daysAhead = params.days || 7;

    if (params.overdue) {
        filters.followUpDate_lt = now.toISOString();
    } else if (params.upcoming) {
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + daysAhead);
        filters.followUpDate_gte = now.toISOString();
        filters.followUpDate_lte = futureDate.toISOString();
    }

    return dataProvider.getList('interactions', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'followUpDate', order: 'ASC' },
        filter: filters,
    });
};

/**
 * Complete interaction with outcome and duration
 */
export const completeInteraction = async (
    dataProvider: DataProvider,
    id: Identifier,
    completionData: { duration?: number; outcome?: string; [key: string]: any }
): Promise<Interaction> => {
    const updatedInteraction = await dataProvider.update('interactions', {
        id,
        data: {
            isCompleted: true,
            completedDate: new Date().toISOString(),
            ...completionData,
        },
        previousData: {} as Interaction,
    });

    // Log audit event
    await logAuditEvent(
        'business.interaction_completed',
        {
            interactionId: id,
            duration: completionData.duration,
            outcome: completionData.outcome,
        },
        {
            outcome: 'success',
            message: 'Interaction marked as completed',
        }
    );

    return updatedInteraction.data;
};

/**
 * Schedule follow-up for interaction
 */
export const scheduleFollowUp = async (
    dataProvider: DataProvider,
    id: Identifier,
    followUpData: { followUpDate: string; followUpNotes?: string }
): Promise<Interaction> => {
    const updatedInteraction = await dataProvider.update('interactions', {
        id,
        data: {
            followUpRequired: true,
            ...followUpData,
        },
        previousData: {} as Interaction,
    });

    // Log audit event
    await logAuditEvent(
        'business.follow_up_scheduled',
        {
            interactionId: id,
            followUpDate: followUpData.followUpDate,
            followUpNotes: followUpData.followUpNotes,
        },
        {
            outcome: 'success',
            message: 'Follow-up scheduled for interaction',
        }
    );

    return updatedInteraction.data;
};

/**
 * Get offline status for mobile users
 */
export const getOfflineStatus = (): {
    isOnline: boolean;
    hasOfflineData: boolean;
    lastSyncTime?: string;
} => {
    const isOnline = navigator.onLine;
    const offlineData = localStorage.getItem('forkflow_offline_interactions');
    const lastSync = localStorage.getItem('forkflow_last_sync');

    return {
        isOnline,
        hasOfflineData: !!offlineData,
        lastSyncTime: lastSync || undefined,
    };
};

/**
 * Store interaction offline for later sync
 */
export const storeOfflineInteraction = async (
    interaction: Partial<Interaction>
): Promise<void> => {
    const offlineKey = 'forkflow_offline_interactions';
    const existingData = localStorage.getItem(offlineKey);
    const offlineInteractions = existingData ? JSON.parse(existingData) : [];

    const offlineInteraction = {
        ...interaction,
        _offline: true,
        _offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _offlineTimestamp: new Date().toISOString(),
    };

    offlineInteractions.push(offlineInteraction);
    localStorage.setItem(offlineKey, JSON.stringify(offlineInteractions));

    // Log audit event
    await logAuditEvent(
        'system.offline_mode',
        {
            action: 'interaction_stored_offline',
            offlineId: offlineInteraction._offlineId,
            subject: interaction.subject,
        },
        {
            outcome: 'success',
            message: 'Interaction stored offline for later sync',
        }
    );
};

/**
 * Get offline interactions
 */
export const getOfflineInteractions = async (): Promise<
    Partial<Interaction>[]
> => {
    const offlineKey = 'forkflow_offline_interactions';
    const existingData = localStorage.getItem(offlineKey);
    return existingData ? JSON.parse(existingData) : [];
};

/**
 * Sync offline interactions to server
 */
export const syncOfflineInteractions = async (
    dataProvider: DataProvider
): Promise<SyncResult> => {
    const offlineInteractions = await getOfflineInteractions();

    if (offlineInteractions.length === 0) {
        return { success: true, processed: 0, failed: 0, errors: [] };
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const interaction of offlineInteractions) {
        try {
            // Remove offline metadata before syncing
            const {
                _offline,
                _offlineId,
                _offlineTimestamp,
                ...cleanInteraction
            } = interaction as any;

            await dataProvider.create('interactions', {
                data: cleanInteraction,
            });

            processed++;

            // Log successful sync
            await logAuditEvent(
                'system.offline_mode',
                {
                    action: 'interaction_synced',
                    offlineId: _offlineId,
                    subject: interaction.subject,
                },
                {
                    outcome: 'success',
                    message: 'Offline interaction synced successfully',
                }
            );
        } catch (error: any) {
            failed++;
            errors.push(error.message);

            // Log sync failure
            await logAuditEvent(
                'system.offline_mode',
                {
                    action: 'interaction_sync_failed',
                    offlineId: (interaction as any)._offlineId,
                    error: error.message,
                },
                {
                    outcome: 'failure',
                    message: 'Failed to sync offline interaction',
                }
            );
        }
    }

    // Clear synced interactions from offline storage
    if (processed > 0) {
        const remainingInteractions = offlineInteractions.slice(processed);
        if (remainingInteractions.length === 0) {
            localStorage.removeItem('forkflow_offline_interactions');
        } else {
            localStorage.setItem(
                'forkflow_offline_interactions',
                JSON.stringify(remainingInteractions)
            );
        }

        // Update last sync time
        localStorage.setItem('forkflow_last_sync', new Date().toISOString());
    }

    return {
        success: failed === 0,
        processed,
        failed,
        errors,
    };
};

/**
 * Clear offline data
 */
export const clearOfflineData = async (): Promise<void> => {
    localStorage.removeItem('forkflow_offline_interactions');
    localStorage.removeItem('forkflow_last_sync');

    // Log audit event
    await logAuditEvent(
        'system.offline_mode',
        {
            action: 'offline_data_cleared',
        },
        {
            outcome: 'success',
            message: 'Offline interaction data cleared',
        }
    );
};
