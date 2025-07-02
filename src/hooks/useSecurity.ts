// src/hooks/useSecurity.ts
import { useState, useEffect, useCallback } from 'react';
import { useGetIdentity, useNotify } from 'react-admin';
import { User } from '../types';

export interface SecurityContext {
    user: User | null;
    isAuthenticated: boolean;
    securityScore: number;
    mfaEnabled: boolean;
    sessionTimeoutMinutes: number;
    lastActivity: Date;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    permissions: string[];
    deviceTrusted: boolean;
    requiresMFA: boolean;
}

export interface SecurityEvent {
    type: 'login' | 'logout' | 'session_timeout' | 'suspicious_activity' | 'mfa_required' | 'permission_denied';
    details?: any;
    riskScore?: number;
}

export interface SecuritySettings {
    sessionTimeoutMinutes: number;
    maxConcurrentSessions: number;
    requireMFAForAdmin: boolean;
    requireMFAForAll: boolean;
    passwordExpiryDays: number;
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
}

export const useSecurity = () => {
    const { data: identity } = useGetIdentity();
    const notify = useNotify();

    const [securityContext, setSecurityContext] = useState<SecurityContext>({
        user: null,
        isAuthenticated: false,
        securityScore: 0,
        mfaEnabled: false,
        sessionTimeoutMinutes: 30,
        lastActivity: new Date(),
        riskLevel: 'low',
        permissions: [],
        deviceTrusted: false,
        requiresMFA: false
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        sessionTimeoutMinutes: 30,
        maxConcurrentSessions: 3,
        requireMFAForAdmin: true,
        requireMFAForAll: false,
        passwordExpiryDays: 90,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15
    });

    const [sessionTimeoutId, setSessionTimeoutId] = useState<NodeJS.Timeout | null>(null);

    // Initialize security context when user identity changes
    useEffect(() => {
        if (identity && typeof identity === 'object' && 'id' in identity) {
            // Convert UserIdentity to User type with safe defaults
            const user: User = {
                id: String(identity.id),
                email: identity.email || '',
                firstName: identity.firstName || '',
                lastName: identity.lastName || '',
                role: identity.role || 'broker',
                territory: identity.territory || [],
                principals: identity.principals || [],
                avatar: identity.avatar,
                isActive: identity.isActive ?? true,
                lastLoginAt: identity.lastLoginAt,
                createdAt: identity.createdAt || new Date().toISOString(),
                updatedAt: identity.updatedAt || new Date().toISOString(),
            };
            updateSecurityContext(user);
        }
    }, [identity]);

    // Set up session timeout monitoring
    useEffect(() => {
        if (securityContext.isAuthenticated) {
            setupSessionTimeout();
        }

        return () => {
            if (sessionTimeoutId) {
                clearTimeout(sessionTimeoutId);
            }
        };
    }, [securityContext.isAuthenticated, securityContext.sessionTimeoutMinutes]);

    const updateSecurityContext = useCallback((user: User) => {
        const userPermissions = getUserPermissions(user);
        const riskLevel = calculateRiskLevel(user);
        const securityScore = calculateSecurityScore(user);
        const mfaEnabled = checkMFAStatus(user);
        const requiresMFA = checkMFARequirement(user);

        setSecurityContext(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            securityScore,
            mfaEnabled,
            riskLevel,
            permissions: userPermissions,
            deviceTrusted: checkDeviceTrust(),
            requiresMFA,
            lastActivity: new Date()
        }));
    }, []);

    const getUserPermissions = (user: User): string[] => {
        // Role-based permissions
        const rolePermissions: { [key: string]: string[] } = {
            admin: ['*'], // Full access
            manager: [
                'users:read', 'users:create', 'settings:read',
                'organizations:*', 'contacts:*', 'interactions:*',
                'opportunities:*', 'products:*', 'deals:*',
                'analytics:read', 'reports:*'
            ],
            broker: [
                'organizations:read', 'organizations:update',
                'contacts:*', 'interactions:*', 'opportunities:*',
                'deals:*', 'products:read', 'visits:*', 'tasks:*'
            ]
        };

        return rolePermissions[user.role] || [];
    };

    const calculateRiskLevel = (user: User): 'low' | 'medium' | 'high' | 'critical' => {
        let riskScore = 0;

        // Check various risk factors
        if (!checkMFAStatus(user)) riskScore += 30;
        if (user.role === 'admin' && !checkMFAStatus(user)) riskScore += 40;
        if (!checkDeviceTrust()) riskScore += 20;
        if (checkSuspiciousActivity()) riskScore += 50;
        if (checkPasswordAge(user)) riskScore += 15;

        if (riskScore >= 80) return 'critical';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 30) return 'medium';
        return 'low';
    };

    const calculateSecurityScore = (user: User): number => {
        let score = 100;

        // Deduct points for security issues
        if (!checkMFAStatus(user)) score -= 25;
        if (user.role === 'admin' && !checkMFAStatus(user)) score -= 15;
        if (!checkDeviceTrust()) score -= 10;
        if (checkPasswordAge(user)) score -= 10;
        if (checkSuspiciousActivity()) score -= 30;

        return Math.max(0, score);
    };

    const checkMFAStatus = (user: User): boolean => {
        // In production, check if user has MFA enabled
        // For now, assume email MFA is always enabled
        return true;
    };

    const checkMFARequirement = (user: User): boolean => {
        // Check if MFA is required based on role and settings
        if (user.role === 'admin' && securitySettings.requireMFAForAdmin) return true;
        if (securitySettings.requireMFAForAll) return true;
        return false;
    };

    const checkDeviceTrust = (): boolean => {
        // In production, check device fingerprint and history
        const deviceId = localStorage.getItem('deviceId');
        const trustedDevices = JSON.parse(localStorage.getItem('trustedDevices') || '[]');
        return trustedDevices.includes(deviceId);
    };

    const checkSuspiciousActivity = (): boolean => {
        // In production, check for suspicious patterns
        // For now, randomly return false
        return Math.random() < 0.1; // 10% chance of suspicious activity
    };

    const checkPasswordAge = (user: User): boolean => {
        // In production, check password age against policy
        // For now, assume password is never too old
        return false;
    };

    const setupSessionTimeout = useCallback(() => {
        if (sessionTimeoutId) {
            clearTimeout(sessionTimeoutId);
        }

        const timeoutMs = securityContext.sessionTimeoutMinutes * 60 * 1000;
        const newTimeoutId = setTimeout(() => {
            logSecurityEvent({
                type: 'session_timeout',
                details: { reason: 'idle_timeout' }
            });
            handleSessionTimeout();
        }, timeoutMs);

        setSessionTimeoutId(newTimeoutId);
    }, [securityContext.sessionTimeoutMinutes, sessionTimeoutId]);

    const handleSessionTimeout = useCallback(() => {
        notify('Your session has expired due to inactivity', { type: 'warning' });
        // In production, trigger logout
        window.location.href = '/login';
    }, [notify]);

    const updateLastActivity = useCallback(() => {
        setSecurityContext(prev => ({
            ...prev,
            lastActivity: new Date()
        }));

        // Reset session timeout
        if (securityContext.isAuthenticated) {
            setupSessionTimeout();
        }
    }, [securityContext.isAuthenticated, setupSessionTimeout]);

    const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
        try {
            // In production, send to security logging API
            const securityEventData = {
                userId: securityContext.user?.id,
                userEmail: securityContext.user?.email,
                eventType: event.type,
                eventCategory: getEventCategory(event.type),
                action: event.type,
                ipAddress: await getClientIP(),
                userAgent: navigator.userAgent,
                deviceFingerprint: getDeviceFingerprint(),
                riskScore: event.riskScore || 0,
                details: event.details || {},
                success: true,
                timestamp: new Date().toISOString()
            };

            console.log('Security event logged:', securityEventData);
            // API call would go here
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }, [securityContext.user]);

    const getEventCategory = (eventType: string): string => {
        const categoryMap: { [key: string]: string } = {
            login: 'authentication',
            logout: 'authentication',
            session_timeout: 'authentication',
            suspicious_activity: 'security_violation',
            mfa_required: 'authentication',
            permission_denied: 'authorization'
        };

        return categoryMap[eventType] || 'security_violation';
    };

    const getClientIP = async (): Promise<string> => {
        try {
            // In production, use a proper IP detection service
            return '127.0.0.1';
        } catch {
            return 'unknown';
        }
    };

    const getDeviceFingerprint = (): string => {
        // Generate a simple device fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint', 2, 2);
        }

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16);
    };

    const checkPermission = useCallback((permission: string): boolean => {
        if (!securityContext.isAuthenticated) return false;
        
        const userPermissions = securityContext.permissions;
        
        // Check for wildcard permission (admin)
        if (userPermissions.includes('*')) return true;
        
        // Check for exact permission match
        if (userPermissions.includes(permission)) return true;
        
        // Check for resource wildcard (e.g., "organizations:*")
        const [resource] = permission.split(':');
        if (userPermissions.includes(`${resource}:*`)) return true;
        
        return false;
    }, [securityContext.isAuthenticated, securityContext.permissions]);

    const requireMFA = useCallback(async (): Promise<boolean> => {
        if (!securityContext.requiresMFA) return true;
        if (securityContext.mfaEnabled) return true;

        logSecurityEvent({
            type: 'mfa_required',
            details: { reason: 'mfa_required_for_role' },
            riskScore: 60
        });

        notify('Multi-factor authentication is required for your account', { type: 'error' });
        return false;
    }, [securityContext.requiresMFA, securityContext.mfaEnabled, logSecurityEvent, notify]);

    const validateAccess = useCallback(async (resource: string, action: string): Promise<boolean> => {
        const permission = `${resource}:${action}`;
        
        // Check basic permission
        if (!checkPermission(permission)) {
            logSecurityEvent({
                type: 'permission_denied',
                details: { 
                    resource, 
                    action, 
                    permission,
                    userRole: securityContext.user?.role 
                },
                riskScore: 30
            });
            return false;
        }

        // Check MFA requirement for sensitive operations
        if (['delete', 'admin'].includes(action)) {
            return await requireMFA();
        }

        // Update activity tracking
        updateLastActivity();

        return true;
    }, [checkPermission, requireMFA, updateLastActivity, logSecurityEvent, securityContext.user]);

    const loadSecuritySettings = useCallback(async () => {
        try {
            // In production, load from API
            // For now, use defaults
            const defaultSettings: SecuritySettings = {
                sessionTimeoutMinutes: 30,
                maxConcurrentSessions: 3,
                requireMFAForAdmin: true,
                requireMFAForAll: false,
                passwordExpiryDays: 90,
                maxFailedAttempts: 5,
                lockoutDurationMinutes: 15
            };

            setSecuritySettings(defaultSettings);
            
            // Update security context with new settings
            setSecurityContext(prev => ({
                ...prev,
                sessionTimeoutMinutes: defaultSettings.sessionTimeoutMinutes,
                requiresMFA: identity ? checkMFARequirement({
                    id: String(identity.id),
                    email: identity.email || '',
                    firstName: identity.firstName || '',
                    lastName: identity.lastName || '',
                    role: identity.role || 'broker',
                    territory: identity.territory || [],
                    principals: identity.principals || [],
                    avatar: identity.avatar,
                    isActive: identity.isActive ?? true,
                    lastLoginAt: identity.lastLoginAt,
                    createdAt: identity.createdAt || new Date().toISOString(),
                    updatedAt: identity.updatedAt || new Date().toISOString(),
                }) : false
            }));
        } catch (error) {
            console.error('Failed to load security settings:', error);
        }
    }, [identity]);

    // Load security settings on hook initialization
    useEffect(() => {
        loadSecuritySettings();
    }, [loadSecuritySettings]);

    return {
        securityContext,
        securitySettings,
        checkPermission,
        validateAccess,
        requireMFA,
        updateLastActivity,
        logSecurityEvent,
        loadSecuritySettings
    };
};

export default useSecurity;