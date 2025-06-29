/**
 * Session Persistence Utilities for Mobile Field Sales
 * Optimized for offline-capable authentication state management
 */

import { User } from '../types';
import { getAuthState, setAuthState, clearAuthState } from './jwtUtils';

export interface SessionInfo {
    user: User;
    lastActivity: number;
    deviceInfo: DeviceInfo;
    sessionId: string;
    loginLocation?: GeolocationCoordinates;
}

export interface DeviceInfo {
    userAgent: string;
    platform: string;
    vendor: string;
    isMobile: boolean;
    isStandalone: boolean; // PWA mode
    screenResolution: string;
    timezone: string;
}

const SESSION_STORAGE_KEY = 'forkflow_session';
const ACTIVITY_STORAGE_KEY = 'forkflow_last_activity';
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days for mobile users
const ACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours of inactivity

/**
 * Get current device information for session tracking
 */
export const getDeviceInfo = (): DeviceInfo => {
    const nav = navigator;
    const screen = window.screen;
    
    return {
        userAgent: nav.userAgent,
        platform: nav.platform,
        vendor: nav.vendor || 'unknown',
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(nav.userAgent),
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
};

/**
 * Generate unique session ID
 */
export const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
};

/**
 * Get current location for session tracking (optional)
 */
export const getCurrentLocation = (): Promise<GeolocationCoordinates | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            () => resolve(null), // Fail silently for location
            {
                timeout: 10000,
                enableHighAccuracy: false,
                maximumAge: 60000, // 1 minute cache
            }
        );
    });
};

/**
 * Save session information for persistence
 */
export const saveSession = async (user: User): Promise<void> => {
    try {
        const deviceInfo = getDeviceInfo();
        const sessionId = generateSessionId();
        const loginLocation = await getCurrentLocation();
        
        const sessionInfo: SessionInfo = {
            user,
            lastActivity: Date.now(),
            deviceInfo,
            sessionId,
            loginLocation: loginLocation || undefined,
        };

        // Save to appropriate storage based on remember me preference
        const authState = getAuthState();
        const useLocalStorage = authState?.rememberMe !== false;
        
        if (useLocalStorage) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
        } else {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
        }

        console.log('📱 Session saved:', {
            userId: user.id,
            sessionId,
            isMobile: deviceInfo.isMobile,
            isStandalone: deviceInfo.isStandalone,
            hasLocation: !!loginLocation,
        });
    } catch (error) {
        console.error('Failed to save session:', error);
    }
};

/**
 * Load session information from storage
 */
export const loadSession = (): SessionInfo | null => {
    try {
        // Check localStorage first (remember me), then sessionStorage
        let stored = localStorage.getItem(SESSION_STORAGE_KEY);
        let isRemembered = true;
        
        if (!stored) {
            stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
            isRemembered = false;
        }

        if (!stored) {
            return null;
        }

        const sessionInfo: SessionInfo = JSON.parse(stored);
        const now = Date.now();

        // Check session timeout
        if (now - sessionInfo.lastActivity > SESSION_TIMEOUT) {
            clearSession();
            return null;
        }

        // Check activity timeout for non-remembered sessions
        if (!isRemembered && now - sessionInfo.lastActivity > ACTIVITY_TIMEOUT) {
            clearSession();
            return null;
        }

        return sessionInfo;
    } catch (error) {
        console.error('Failed to load session:', error);
        clearSession();
        return null;
    }
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = (): void => {
    try {
        const now = Date.now();
        
        // Update in session info
        const sessionInfo = loadSession();
        if (sessionInfo) {
            sessionInfo.lastActivity = now;
            
            const authState = getAuthState();
            const useLocalStorage = authState?.rememberMe !== false;
            
            if (useLocalStorage) {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
            } else {
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
            }
        }

        // Also update standalone activity tracker
        localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
    } catch (error) {
        console.error('Failed to update activity:', error);
    }
};

/**
 * Clear session information
 */
export const clearSession = (): void => {
    try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(ACTIVITY_STORAGE_KEY);
        clearAuthState();
        
        console.log('📱 Session cleared');
    } catch (error) {
        console.error('Failed to clear session:', error);
    }
};

/**
 * Check if session is valid and active
 */
export const isSessionValid = (): boolean => {
    const sessionInfo = loadSession();
    return sessionInfo !== null;
};

/**
 * Get session summary for debugging
 */
export const getSessionSummary = (): {
    isValid: boolean;
    user?: string;
    lastActivity?: string;
    sessionAge?: string;
    deviceInfo?: DeviceInfo;
} => {
    const sessionInfo = loadSession();
    
    if (!sessionInfo) {
        return { isValid: false };
    }

    const now = Date.now();
    const sessionAge = now - (sessionInfo.lastActivity || 0);
    
    return {
        isValid: true,
        user: `${sessionInfo.user.firstName} ${sessionInfo.user.lastName} (${sessionInfo.user.role})`,
        lastActivity: new Date(sessionInfo.lastActivity).toLocaleString(),
        sessionAge: `${Math.round(sessionAge / (1000 * 60))} minutes ago`,
        deviceInfo: sessionInfo.deviceInfo,
    };
};

/**
 * Setup automatic activity tracking
 */
export const setupActivityTracking = (): (() => void) => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
        // Throttle activity updates to every 30 seconds
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(updateLastActivity, 30000);
    };

    // Add event listeners
    events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
    });

    // Update activity on visibility change (app becomes visible)
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            updateLastActivity();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial activity update
    updateLastActivity();

    // Return cleanup function
    return () => {
        clearTimeout(activityTimeout);
        events.forEach(event => {
            document.removeEventListener(event, handleActivity);
        });
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
};

/**
 * Check for session conflicts (multiple devices/tabs)
 */
export const checkSessionConflict = (): boolean => {
    try {
        const currentSession = loadSession();
        if (!currentSession) return false;

        const currentDeviceInfo = getDeviceInfo();
        
        // Check if device info has changed significantly
        const deviceChanged = 
            currentSession.deviceInfo.userAgent !== currentDeviceInfo.userAgent ||
            currentSession.deviceInfo.screenResolution !== currentDeviceInfo.screenResolution;

        if (deviceChanged) {
            console.warn('📱 Device change detected in session');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to check session conflict:', error);
        return false;
    }
};