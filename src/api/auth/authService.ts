/**
 * Authentication Service for Food Service CRM
 * Provides JWT-based authentication with refresh token support
 */

import { 
    LoginCredentials, 
    LoginResponse, 
    RefreshTokenRequest, 
    PasswordResetRequest, 
    PasswordResetConfirm,
    User,
    AuthTokens 
} from '../../types';
import { 
    setAccessToken, 
    getAccessToken, 
    clearAccessToken,
    setAuthState,
    clearAuthState,
    checkRateLimit,
    clearRateLimit,
    generateCSRFToken,
    getUserFromToken
} from '../../utils/jwtUtils';
import {
    performOfflineLogin,
    storeOfflineCredentials,
    clearOfflineCredentials,
    isOnline,
    setupOfflineAuth
} from '../../utils/offlineAuth';

// Import mock API for development
import {
    mockLogin,
    mockLogout,
    mockRefreshToken,
    mockGetCurrentUser,
    mockGetUserPermissions,
    mockPasswordResetRequest,
    mockPasswordResetConfirm,
    mockChangePassword,
    mockUpdateProfile
} from './mockAuthAPI';

// API base URL - would come from environment in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const USE_MOCK_API = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;

/**
 * HTTP client with automatic token injection
 */
const createHttpClient = () => {
    const httpClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
        const token = getAccessToken();
        const headers = new Headers(options.headers);
        
        // Add content type if not present
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        
        // Add authorization header if token exists
        if (token && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Add CSRF token for state-changing operations
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
            headers.set('X-CSRF-Token', generateCSRFToken());
        }
        
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Include cookies for refresh tokens
        });
        
        // Handle token expiration
        if (response.status === 401 && token) {
            // Try to refresh token
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                // Retry the original request with new token
                headers.set('Authorization', `Bearer ${getAccessToken()}`);
                return fetch(url, { ...options, headers, credentials: 'include' });
            } else {
                // Refresh failed, redirect to login
                clearAccessToken();
                clearAuthState();
                window.location.href = '/login';
                throw new Error('Session expired');
            }
        }
        
        return response;
    };
    
    return httpClient;
};

const httpClient = createHttpClient();

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Check rate limiting
    if (!checkRateLimit(credentials.email)) {
        throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }
    
    try {
        let data: LoginResponse;
        
        // Try offline login first if network is unavailable
        if (!isOnline()) {
            console.log('📱 Attempting offline login due to no network connection');
            const user = await performOfflineLogin(credentials);
            
            // Create mock token response for offline use
            data = {
                user,
                tokens: {
                    accessToken: 'offline-token-' + Date.now(),
                    refreshToken: 'offline-refresh-' + Date.now(),
                    tokenType: 'Bearer',
                    expiresIn: 24 * 60 * 60, // 24 hours for offline
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                },
            };
        } else {
            // Online login
            if (USE_MOCK_API) {
                // Use mock API for development
                data = await mockLogin(credentials);
            } else {
                // Use real API for production
                const response = await httpClient(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Login failed');
                }
                
                data = await response.json();
            }
            
            // Store credentials for offline use after successful online login
            await storeOfflineCredentials(credentials.email, credentials.password);
        }
        
        // Store tokens securely
        setAccessToken(data.tokens.accessToken);
        setAuthState(data.user, credentials.rememberMe || false);
        
        // Clear rate limiting on successful login
        clearRateLimit(credentials.email);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Logout user and clear tokens
 */
export const logout = async (): Promise<void> => {
    try {
        if (isOnline() && !USE_MOCK_API) {
            // Notify server of logout (invalidate refresh token)
            await httpClient(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
            });
        } else if (USE_MOCK_API) {
            // Use mock API for development
            await mockLogout();
        }
        // Skip server logout if offline - will sync when back online
    } catch (error) {
        console.error('Logout error:', error);
        // Continue with local logout even if server request fails
    } finally {
        // Clear local tokens and state
        clearAccessToken();
        clearAuthState();
        
        // Clear offline credentials on explicit logout
        clearOfflineCredentials();
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
    try {
        let tokens: AuthTokens | null;
        
        if (USE_MOCK_API) {
            // Use mock API for development - no refresh token needed for mock
            return null; // Mock tokens don't expire in development
        } else {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Send HttpOnly refresh token cookie
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                return null;
            }
            
            tokens = await response.json();
        }
        
        if (tokens) {
            setAccessToken(tokens.accessToken);
        }
        
        return tokens;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
};

/**
 * Internal helper to try token refresh
 */
const tryRefreshToken = async (): Promise<boolean> => {
    const tokens = await refreshAccessToken();
    return tokens !== null;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
    if (USE_MOCK_API) {
        // Get user from token for mock API
        const token = getAccessToken();
        if (token) {
            const payload = getUserFromToken(token);
            if (payload?.id) {
                return await mockGetCurrentUser(payload.id);
            }
        }
        throw new Error('No authenticated user found');
    } else {
        const response = await httpClient(`${API_BASE_URL}/auth/me`);
        
        if (!response.ok) {
            throw new Error('Failed to get user profile');
        }
        
        return response.json();
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates: Partial<User>): Promise<User> => {
    const response = await httpClient(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }
    
    return response.json();
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await httpClient(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
    }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (request: PasswordResetRequest): Promise<void> => {
    const response = await httpClient(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send password reset email');
    }
};

/**
 * Confirm password reset with token
 */
export const confirmPasswordReset = async (request: PasswordResetConfirm): Promise<void> => {
    const response = await httpClient(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
    }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    return token !== null;
};

/**
 * Get user permissions based on role
 */
export const getUserPermissions = async (): Promise<string[]> => {
    if (USE_MOCK_API) {
        // Get user from token for mock API
        const token = getAccessToken();
        if (token) {
            const payload = getUserFromToken(token);
            if (payload?.id) {
                return await mockGetUserPermissions(payload.id);
            }
        }
        return [];
    } else {
        const response = await httpClient(`${API_BASE_URL}/auth/permissions`);
        
        if (!response.ok) {
            throw new Error('Failed to get user permissions');
        }
        
        const data = await response.json();
        return data.permissions;
    }
};

/**
 * Setup automatic token refresh listener
 */
export const setupTokenRefresh = (): void => {
    // Listen for token expiring events
    window.addEventListener('tokenExpiring', async () => {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
            // Refresh failed, logout user
            await logout();
            window.location.href = '/login';
        }
    });
    
    // Listen for visibility change to refresh token when app becomes visible
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden && isAuthenticated()) {
            await tryRefreshToken();
        }
    });
    
    // Setup offline authentication listeners
    setupOfflineAuth();
};

/**
 * Initialize authentication state from storage
 */
export const initializeAuth = async (): Promise<User | null> => {
    try {
        // Try to refresh token if we have a refresh token
        const tokens = await refreshAccessToken();
        if (tokens) {
            return await getCurrentUser();
        }
        return null;
    } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthState();
        return null;
    }
};