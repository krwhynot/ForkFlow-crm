/**
 * Offline Authentication Support for Field Sales
 * Enables authentication when network connectivity is poor or unavailable
 */

import { User, LoginCredentials } from '../types';
import { loadSession, saveSession, getDeviceInfo } from './sessionPersistence';
import { validatePassword } from './jwtUtils';

export interface OfflineCredentials {
    email: string;
    passwordHash: string;
    lastSync: number;
    attempts: number;
    lockoutUntil?: number;
}

export interface OfflineAuthConfig {
    maxAttempts: number;
    lockoutDuration: number; // milliseconds
    syncInterval: number; // milliseconds
    enableOfflineMode: boolean;
}

const OFFLINE_CREDS_KEY = 'forkflow_offline_creds';
const OFFLINE_SYNC_KEY = 'forkflow_offline_sync';
const DEFAULT_CONFIG: OfflineAuthConfig = {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    syncInterval: 24 * 60 * 60 * 1000, // 24 hours
    enableOfflineMode: true,
};

/**
 * Simple hash function for offline password storage
 * Note: In production, use proper hashing on the server side
 */
const simpleHash = async (text: string): Promise<string> => {
    if (
        typeof window !== 'undefined' &&
        window.crypto &&
        window.crypto.subtle
    ) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hash = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // Fallback for older browsers (not secure, development only)
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
};

/**
 * Store credentials for offline use (only after successful online login)
 */
export const storeOfflineCredentials = async (
    email: string,
    password: string
): Promise<void> => {
    try {
        const config = getOfflineConfig();
        if (!config.enableOfflineMode) return;

        const passwordHash = await simpleHash(password + email); // Add email as salt
        const credentials: OfflineCredentials = {
            email,
            passwordHash,
            lastSync: Date.now(),
            attempts: 0,
        };

        localStorage.setItem(OFFLINE_CREDS_KEY, JSON.stringify(credentials));
        console.log('📱 Offline credentials stored for:', email);
    } catch (error) {
        console.error('Failed to store offline credentials:', error);
    }
};

/**
 * Verify credentials against stored offline hash
 */
export const verifyOfflineCredentials = async (
    email: string,
    password: string
): Promise<boolean> => {
    try {
        const stored = localStorage.getItem(OFFLINE_CREDS_KEY);
        if (!stored) return false;

        const credentials: OfflineCredentials = JSON.parse(stored);

        // Check if credentials match the email
        if (credentials.email !== email) return false;

        // Check lockout
        if (credentials.lockoutUntil && Date.now() < credentials.lockoutUntil) {
            throw new Error(`Account locked. Try again later.`);
        }

        // Verify password hash
        const providedHash = await simpleHash(password + email);
        const isValid = providedHash === credentials.passwordHash;

        // Update attempt count
        if (isValid) {
            credentials.attempts = 0;
            credentials.lockoutUntil = undefined;
        } else {
            credentials.attempts += 1;
            const config = getOfflineConfig();

            if (credentials.attempts >= config.maxAttempts) {
                credentials.lockoutUntil = Date.now() + config.lockoutDuration;
            }
        }

        localStorage.setItem(OFFLINE_CREDS_KEY, JSON.stringify(credentials));
        return isValid;
    } catch (error) {
        console.error('Failed to verify offline credentials:', error);
        return false;
    }
};

/**
 * Get offline authentication configuration
 */
export const getOfflineConfig = (): OfflineAuthConfig => {
    try {
        const stored = localStorage.getItem('forkflow_offline_config');
        if (stored) {
            return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Failed to load offline config:', error);
    }
    return DEFAULT_CONFIG;
};

/**
 * Update offline authentication configuration
 */
export const updateOfflineConfig = (
    config: Partial<OfflineAuthConfig>
): void => {
    try {
        const currentConfig = getOfflineConfig();
        const newConfig = { ...currentConfig, ...config };
        localStorage.setItem(
            'forkflow_offline_config',
            JSON.stringify(newConfig)
        );
    } catch (error) {
        console.error('Failed to update offline config:', error);
    }
};

/**
 * Check if offline authentication is available for a user
 */
export const isOfflineAuthAvailable = (email: string): boolean => {
    try {
        const stored = localStorage.getItem(OFFLINE_CREDS_KEY);
        if (!stored) return false;

        const credentials: OfflineCredentials = JSON.parse(stored);
        return credentials.email === email;
    } catch (error) {
        return false;
    }
};

/**
 * Get offline user from session (for offline identity)
 */
export const getOfflineUser = (): User | null => {
    try {
        const sessionInfo = loadSession();
        return sessionInfo?.user || null;
    } catch (error) {
        console.error('Failed to get offline user:', error);
        return null;
    }
};

/**
 * Perform offline login
 */
export const performOfflineLogin = async (
    credentials: LoginCredentials
): Promise<User> => {
    const config = getOfflineConfig();

    if (!config.enableOfflineMode) {
        throw new Error('Offline authentication is disabled');
    }

    // Check if offline credentials are available
    if (!isOfflineAuthAvailable(credentials.email)) {
        throw new Error(
            'No offline credentials available. Please login online first.'
        );
    }

    // Verify credentials
    const isValid = await verifyOfflineCredentials(
        credentials.email,
        credentials.password
    );
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    // Get user from session
    const user = getOfflineUser();
    if (!user || user.email !== credentials.email) {
        throw new Error('Offline user data not available');
    }

    console.log('📱 Offline login successful for:', credentials.email);
    return user;
};

/**
 * Check if credentials need to be synced with server
 */
export const needsCredentialSync = (): boolean => {
    try {
        const stored = localStorage.getItem(OFFLINE_CREDS_KEY);
        if (!stored) return false;

        const credentials: OfflineCredentials = JSON.parse(stored);
        const config = getOfflineConfig();

        return Date.now() - credentials.lastSync > config.syncInterval;
    } catch (error) {
        return false;
    }
};

/**
 * Clear offline credentials
 */
export const clearOfflineCredentials = (): void => {
    try {
        localStorage.removeItem(OFFLINE_CREDS_KEY);
        localStorage.removeItem(OFFLINE_SYNC_KEY);
        console.log('📱 Offline credentials cleared');
    } catch (error) {
        console.error('Failed to clear offline credentials:', error);
    }
};

/**
 * Get offline authentication status
 */
export const getOfflineAuthStatus = (): {
    isEnabled: boolean;
    hasCredentials: boolean;
    lastSync?: string;
    attemptsRemaining?: number;
    isLocked?: boolean;
    lockoutUntil?: string;
} => {
    const config = getOfflineConfig();

    if (!config.enableOfflineMode) {
        return { isEnabled: false, hasCredentials: false };
    }

    try {
        const stored = localStorage.getItem(OFFLINE_CREDS_KEY);
        if (!stored) {
            return { isEnabled: true, hasCredentials: false };
        }

        const credentials: OfflineCredentials = JSON.parse(stored);
        const isLocked = credentials.lockoutUntil
            ? Date.now() < credentials.lockoutUntil
            : false;

        return {
            isEnabled: true,
            hasCredentials: true,
            lastSync: new Date(credentials.lastSync).toLocaleString(),
            attemptsRemaining: Math.max(
                0,
                config.maxAttempts - credentials.attempts
            ),
            isLocked,
            lockoutUntil: credentials.lockoutUntil
                ? new Date(credentials.lockoutUntil).toLocaleString()
                : undefined,
        };
    } catch (error) {
        return { isEnabled: true, hasCredentials: false };
    }
};

/**
 * Network connectivity checker
 */
export const isOnline = (): boolean => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Setup offline authentication event listeners
 */
export const setupOfflineAuth = (): (() => void) => {
    const handleOnline = () => {
        console.log('📱 Network connection restored');
        // Could trigger credential sync here
    };

    const handleOffline = () => {
        console.log('📱 Network connection lost - offline mode available');
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }

    return () => {};
};
