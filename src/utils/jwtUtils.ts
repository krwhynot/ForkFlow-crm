/**
 * JWT Utility Functions for Food Service CRM Authentication
 * Provides secure token handling with in-memory storage and refresh capabilities
 */

import { AuthTokens, JWTPayload, User } from '../types';

// In-memory token storage (secure against XSS)
let accessToken: string | null = null;
let tokenExpirationTimer: NodeJS.Timeout | null = null;

/**
 * Store access token in memory (secure against XSS)
 */
export const setAccessToken = (token: string): void => {
    accessToken = token;
    
    // Clear existing timer
    if (tokenExpirationTimer) {
        clearTimeout(tokenExpirationTimer);
    }
    
    // Set automatic refresh timer (refresh 5 minutes before expiration)
    const payload = decodeJWT(token);
    if (payload) {
        const expiresIn = payload.exp * 1000 - Date.now();
        const refreshTime = Math.max(expiresIn - (5 * 60 * 1000), 60000); // 5 min buffer, minimum 1 min
        
        tokenExpirationTimer = setTimeout(() => {
            // Trigger token refresh
            window.dispatchEvent(new CustomEvent('tokenExpiring'));
        }, refreshTime);
    }
};

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
    return accessToken;
};

/**
 * Clear access token from memory
 */
export const clearAccessToken = (): void => {
    accessToken = null;
    if (tokenExpirationTimer) {
        clearTimeout(tokenExpirationTimer);
        tokenExpirationTimer = null;
    }
};

/**
 * Decode JWT payload without verification (client-side use only)
 */
export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        return payload as JWTPayload;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

/**
 * Check if JWT token is expired (with 1 minute buffer)
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= (now + 60); // 1 minute buffer
};

/**
 * Extract user information from JWT token
 */
export const getUserFromToken = (token: string): Partial<User> | null => {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        territory: payload.territory,
        principals: payload.principals,
    };
};

/**
 * Format token for Authorization header
 */
export const formatAuthHeader = (token: string): string => {
    return `Bearer ${token}`;
};

/**
 * Secure storage keys for refresh tokens (stored in HttpOnly cookies via server)
 */
export const REFRESH_TOKEN_COOKIE = 'refreshToken';
export const AUTH_STATE_KEY = 'authState';

/**
 * Store authentication state (non-sensitive data only)
 * Used for session persistence across browser refreshes
 */
export const setAuthState = (user: Partial<User>, rememberMe: boolean = false): void => {
    const authState = {
        user,
        rememberMe,
        timestamp: Date.now(),
    };
    
    if (rememberMe) {
        localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
    } else {
        sessionStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
    }
};

/**
 * Get authentication state from storage
 */
export const getAuthState = (): { user: Partial<User>; rememberMe: boolean; timestamp: number } | null => {
    try {
        // Check localStorage first (remember me)
        let stored = localStorage.getItem(AUTH_STATE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return { ...data, rememberMe: true };
        }
        
        // Check sessionStorage (session only)
        stored = sessionStorage.getItem(AUTH_STATE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return { ...data, rememberMe: false };
        }
        
        return null;
    } catch (error) {
        console.error('Failed to get auth state:', error);
        return null;
    }
};

/**
 * Clear authentication state from storage
 */
export const clearAuthState = (): void => {
    localStorage.removeItem(AUTH_STATE_KEY);
    sessionStorage.removeItem(AUTH_STATE_KEY);
};

/**
 * Password strength validation for food service CRM
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Generate secure random string for CSRF protection
 */
export const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Rate limiting helper for login attempts
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (email: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const attempts = loginAttempts.get(email);
    
    if (!attempts) {
        loginAttempts.set(email, { count: 1, lastAttempt: now });
        return true;
    }
    
    // Reset if window has expired
    if (now - attempts.lastAttempt > windowMs) {
        loginAttempts.set(email, { count: 1, lastAttempt: now });
        return true;
    }
    
    // Check if rate limited
    if (attempts.count >= maxAttempts) {
        return false;
    }
    
    // Increment attempts
    attempts.count += 1;
    attempts.lastAttempt = now;
    
    return true;
};

/**
 * Clear rate limiting for successful login
 */
export const clearRateLimit = (email: string): void => {
    loginAttempts.delete(email);
};