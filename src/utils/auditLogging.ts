/**
 * Security Audit Logging for ForkFlow CRM
 * Comprehensive logging system for security events and user activities
 */

import { User } from '../types';
import { getDeviceInfo, getCurrentLocation } from './sessionPersistence';

export interface AuditEvent {
    id: string;
    timestamp: number;
    type: AuditEventType;
    category: AuditCategory;
    severity: AuditSeverity;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    sessionId?: string;
    deviceInfo?: any;
    location?: GeolocationCoordinates;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, any>;
    outcome: 'success' | 'failure' | 'warning';
    message: string;
}

export type AuditEventType = 
    // Authentication Events
    | 'auth.login'
    | 'auth.logout'
    | 'auth.login_failed'
    | 'auth.token_refresh'
    | 'auth.session_expired'
    | 'auth.password_change'
    | 'auth.password_reset_request'
    | 'auth.password_reset_confirm'
    | 'auth.offline_login'
    | 'auth.session_conflict'
    | 'auth.session_restored'
    
    // API Authentication Events
    | 'api.auth.login'
    | 'api.auth.logout'
    | 'api.auth.login_failed'
    | 'api.auth.logout_error'
    | 'api.auth.password_reset_request'
    | 'api.auth.password_reset_confirm'
    | 'api.auth.password_reset_confirm_failed'
    | 'api.auth.password_update'
    
    // Authorization Events
    | 'authz.access_denied'
    | 'authz.permission_check'
    | 'authz.role_change'
    
    // Data Access Events
    | 'data.create'
    | 'data.read'
    | 'data.update'
    | 'data.delete'
    | 'data.export'
    | 'data.import'
    | 'data.bulk_operation'
    
    // API User Management Events
    | 'api.users.list'
    | 'api.users.create'
    | 'api.users.create_failed'
    | 'api.users.update'
    | 'api.users.profile_update'
    | 'api.users.delete'
    | 'api.users.permissions_update'
    | 'api.users.force_password_reset'
    
    // User Management Events
    | 'users.create_attempt'
    | 'users.update_attempt'
    | 'users.delete_attempt'
    
    // Security Events
    | 'security.rate_limit_exceeded'
    | 'security.suspicious_activity'
    | 'security.csrf_violation'
    | 'security.xss_attempt'
    | 'security.sql_injection_attempt'
    | 'security.malformed_request'
    | 'security.device_change'
    | 'security.location_change'
    | 'security.https_enforcement'
    | 'security.https_verified'
    | 'security.hsts_configured'
    | 'security.headers_configured'
    | 'security.csp_configured'
    | 'security.mixed_content_detected'
    | 'security.certificate_transparency_configured'
    | 'security.https_initialized'
    
    // System Events
    | 'system.startup'
    | 'system.shutdown'
    | 'system.error'
    | 'system.performance_issue'
    | 'system.offline_mode'
    | 'system.online_mode'
    
    // Business Events
    | 'business.customer_visit'
    | 'business.deal_stage_change'
    | 'business.order_created'
    | 'business.territory_change'
    | 'business.interaction_completed'
    | 'business.follow_up_scheduled';

export type AuditCategory = 
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'security'
    | 'system'
    | 'business';

export type AuditSeverity = 
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';

const AUDIT_STORAGE_KEY = 'forkflow_audit_log';
const MAX_LOCAL_EVENTS = 1000; // Keep last 1000 events locally
const BATCH_SIZE = 50; // Send events in batches of 50
const FLUSH_INTERVAL = 60000; // Flush every minute

// Local event buffer
let eventBuffer: AuditEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Generate unique audit event ID
 */
const generateEventId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `audit_${timestamp}_${random}`;
};

/**
 * Get client IP address (best effort)
 */
const getClientIP = async (): Promise<string | undefined> => {
    try {
        // In a real application, this would be provided by the server
        // For now, we'll use a placeholder
        return 'client-ip-unknown';
    } catch {
        return undefined;
    }
};

/**
 * Create audit event
 */
export const createAuditEvent = async (
    type: AuditEventType,
    details: Record<string, any>,
    options: {
        outcome?: 'success' | 'failure' | 'warning';
        message?: string;
        userId?: string;
        userEmail?: string;
        userRole?: string;
        sessionId?: string;
        severity?: AuditSeverity;
    } = {}
): Promise<AuditEvent> => {
    const deviceInfo = getDeviceInfo();
    const location = await getCurrentLocation();
    const ipAddress = await getClientIP();

    const event: AuditEvent = {
        id: generateEventId(),
        timestamp: Date.now(),
        type,
        category: getCategoryFromType(type),
        severity: options.severity || getSeverityFromType(type),
        userId: options.userId,
        userEmail: options.userEmail,
        userRole: options.userRole,
        sessionId: options.sessionId,
        deviceInfo,
        location: location || undefined,
        ipAddress,
        userAgent: navigator.userAgent,
        details,
        outcome: options.outcome || 'success',
        message: options.message || generateDefaultMessage(type, options.outcome || 'success'),
    };

    return event;
};

/**
 * Log audit event
 */
export const logAuditEvent = async (
    type: AuditEventType,
    details: Record<string, any>,
    options: Parameters<typeof createAuditEvent>[2] = {}
): Promise<void> => {
    try {
        const event = await createAuditEvent(type, details, options);
        
        // Add to buffer
        eventBuffer.push(event);
        
        // Store locally for persistence
        storeEventLocally(event);
        
        // Schedule flush if not already scheduled
        scheduleFlush();
        
        // Log to console for development
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Audit Event:', {
                type: event.type,
                severity: event.severity,
                outcome: event.outcome,
                message: event.message,
                details: event.details,
            });
        }
        
        // Immediate flush for critical events
        if (event.severity === 'critical') {
            await flushEvents();
        }
    } catch (error) {
        console.error('Failed to log audit event:', error);
    }
};

/**
 * Get category from event type
 */
const getCategoryFromType = (type: AuditEventType): AuditCategory => {
    if (type.startsWith('auth.')) return 'authentication';
    if (type.startsWith('authz.')) return 'authorization';
    if (type.startsWith('data.')) return 'data_access';
    if (type.startsWith('security.')) return 'security';
    if (type.startsWith('system.')) return 'system';
    if (type.startsWith('business.')) return 'business';
    return 'system';
};

/**
 * Get severity from event type
 */
const getSeverityFromType = (type: AuditEventType): AuditSeverity => {
    const criticalEvents = [
        'security.csrf_violation',
        'security.xss_attempt',
        'security.sql_injection_attempt',
        'auth.session_conflict',
        'security.suspicious_activity',
    ];
    
    const highEvents = [
        'auth.login_failed',
        'security.rate_limit_exceeded',
        'authz.access_denied',
        'security.device_change',
        'auth.password_change',
    ];
    
    const mediumEvents = [
        'auth.login',
        'auth.logout',
        'data.delete',
        'data.export',
        'security.location_change',
    ];
    
    if (criticalEvents.includes(type)) return 'critical';
    if (highEvents.includes(type)) return 'high';
    if (mediumEvents.includes(type)) return 'medium';
    return 'low';
};

/**
 * Generate default message for event type
 */
const generateDefaultMessage = (type: AuditEventType, outcome: string): string => {
    const messages: Record<string, string> = {
        'auth.login': 'User logged in successfully',
        'auth.logout': 'User logged out',
        'auth.login_failed': 'Failed login attempt',
        'auth.offline_login': 'User logged in offline',
        'security.rate_limit_exceeded': 'Rate limit exceeded',
        'security.csrf_violation': 'CSRF token violation detected',
        'data.create': 'Data record created',
        'data.update': 'Data record updated',
        'data.delete': 'Data record deleted',
        'business.customer_visit': 'Customer visit logged',
        'business.interaction_completed': 'Interaction completed successfully',
        'business.follow_up_scheduled': 'Follow-up scheduled',
    };
    
    const baseMessage = messages[type] || `Event: ${type}`;
    return outcome === 'failure' ? `${baseMessage} (failed)` : baseMessage;
};

/**
 * Store event locally for persistence
 */
const storeEventLocally = (event: AuditEvent): void => {
    try {
        const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
        const events: AuditEvent[] = stored ? JSON.parse(stored) : [];
        
        events.push(event);
        
        // Keep only last MAX_LOCAL_EVENTS
        if (events.length > MAX_LOCAL_EVENTS) {
            events.splice(0, events.length - MAX_LOCAL_EVENTS);
        }
        
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
        console.error('Failed to store audit event locally:', error);
    }
};

/**
 * Schedule event flush
 */
const scheduleFlush = (): void => {
    if (flushTimer) return;
    
    flushTimer = setTimeout(async () => {
        await flushEvents();
        flushTimer = null;
    }, FLUSH_INTERVAL);
};

/**
 * Flush events to server
 */
const flushEvents = async (): Promise<void> => {
    if (eventBuffer.length === 0) return;
    
    try {
        const eventsToSend = eventBuffer.splice(0, BATCH_SIZE);
        
        // In production, send to audit API endpoint
        if (process.env.NODE_ENV === 'production') {
            await sendEventsToServer(eventsToSend);
        } else {
            // In development, just log the batch
            console.log('📊 Audit Batch:', {
                count: eventsToSend.length,
                events: eventsToSend.map(e => ({
                    type: e.type,
                    severity: e.severity,
                    timestamp: new Date(e.timestamp).toISOString(),
                })),
            });
        }
    } catch (error) {
        console.error('Failed to flush audit events:', error);
        // Re-add events to buffer on failure
        eventBuffer.unshift(...eventBuffer);
    }
};

/**
 * Send events to audit server
 */
const sendEventsToServer = async (events: AuditEvent[]): Promise<void> => {
    const auditEndpoint = process.env.REACT_APP_AUDIT_ENDPOINT || '/api/audit';
    
    const response = await fetch(auditEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
    });
    
    if (!response.ok) {
        throw new Error(`Audit API error: ${response.status}`);
    }
};

/**
 * Get local audit events
 */
export const getLocalAuditEvents = (
    filters: {
        type?: AuditEventType;
        category?: AuditCategory;
        severity?: AuditSeverity;
        userId?: string;
        limit?: number;
        since?: number;
    } = {}
): AuditEvent[] => {
    try {
        const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
        if (!stored) return [];
        
        let events: AuditEvent[] = JSON.parse(stored);
        
        // Apply filters
        if (filters.type) {
            events = events.filter(e => e.type === filters.type);
        }
        if (filters.category) {
            events = events.filter(e => e.category === filters.category);
        }
        if (filters.severity) {
            events = events.filter(e => e.severity === filters.severity);
        }
        if (filters.userId) {
            events = events.filter(e => e.userId === filters.userId);
        }
        if (filters.since) {
            events = events.filter(e => e.timestamp >= filters.since!);
        }
        
        // Sort by timestamp (newest first)
        events.sort((a, b) => b.timestamp - a.timestamp);
        
        // Apply limit
        if (filters.limit) {
            events = events.slice(0, filters.limit);
        }
        
        return events;
    } catch (error) {
        console.error('Failed to get local audit events:', error);
        return [];
    }
};

/**
 * Clear local audit events
 */
export const clearLocalAuditEvents = (): void => {
    try {
        localStorage.removeItem(AUDIT_STORAGE_KEY);
        eventBuffer = [];
        console.log('🗑️ Local audit events cleared');
    } catch (error) {
        console.error('Failed to clear local audit events:', error);
    }
};

/**
 * Get audit statistics
 */
export const getAuditStatistics = (): {
    totalEvents: number;
    eventsByCategory: Record<AuditCategory, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    recentCriticalEvents: number;
    lastWeekEvents: number;
} => {
    const events = getLocalAuditEvents();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const eventsByCategory: Record<AuditCategory, number> = {
        authentication: 0,
        authorization: 0,
        data_access: 0,
        security: 0,
        system: 0,
        business: 0,
    };
    
    const eventsBySeverity: Record<AuditSeverity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
    };
    
    let recentCriticalEvents = 0;
    let lastWeekEvents = 0;
    
    events.forEach(event => {
        eventsByCategory[event.category]++;
        eventsBySeverity[event.severity]++;
        
        if (event.timestamp >= oneWeekAgo) {
            lastWeekEvents++;
        }
        
        if (event.severity === 'critical' && event.timestamp >= oneDayAgo) {
            recentCriticalEvents++;
        }
    });
    
    return {
        totalEvents: events.length,
        eventsByCategory,
        eventsBySeverity,
        recentCriticalEvents,
        lastWeekEvents,
    };
};

/**
 * Initialize audit logging system
 */
export const initializeAuditLogging = (): (() => void) => {
    // Log system startup
    logAuditEvent('system.startup', {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
    });
    
    // Setup beforeunload to flush events
    const handleBeforeUnload = () => {
        logAuditEvent('system.shutdown', {
            timestamp: Date.now(),
        });
        // Synchronous flush for shutdown
        if (eventBuffer.length > 0) {
            try {
                // Store remaining events locally
                eventBuffer.forEach(storeEventLocally);
            } catch (error) {
                console.error('Failed to store events on shutdown:', error);
            }
        }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Return cleanup function
    return () => {
        if (flushTimer) {
            clearTimeout(flushTimer);
        }
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Final flush
        flushEvents();
    };
};