/**
 * Enhanced JWT AuthProvider for react-admin
 * Implements secure JWT + refresh token authentication for Food Service CRM
 */

import { AuthProvider } from 'react-admin';
import {
    login as apiLogin,
    logout as apiLogout,
    getCurrentUser,
    getUserPermissions,
    initializeAuth,
    setupTokenRefresh
} from '../../api/auth/authService';
import { LoginCredentials, User } from '../../types';
import {
    initializeAuditLogging,
    logAuditEvent,
} from '../../utils/auditLogging';
import { initializeHTTPSSecurity } from '../../utils/httpsEnforcement';
import {
    clearAccessToken,
    clearAuthState,
    getAccessToken,
    getAuthState,
    getUserFromToken,
} from '../../utils/jwtUtils';
import {
    initializeSecurity
} from '../../utils/securityMiddleware';
import {
    checkSessionConflict,
    clearSession,
    isSessionValid,
    loadSession,
    saveSession,
    setupActivityTracking,
} from '../../utils/sessionPersistence';

// Authentication state management
type AuthState = 'initializing' | 'authenticated' | 'unauthenticated';
let authenticationState: AuthState = 'initializing';
let authInitializationPromise: Promise<User | null> | null = null;

/**
 * Wait for authentication to be initialized before proceeding
 */
const waitForAuthInitialization = async (): Promise<User | null> => {
    if (authInitializationPromise) {
        return authInitializationPromise;
    }

    // If already initialized, return current state
    if (authenticationState !== 'initializing') {
        return authenticationState === 'authenticated'
            ? getCurrentUser()
            : null;
    }

    // Start initialization
    authInitializationPromise = initializeAuth()
        .then(user => {
            authenticationState = user ? 'authenticated' : 'unauthenticated';
            console.debug(
                '🔐 Authentication state initialized:',
                authenticationState
            );
            return user;
        })
        .catch(error => {
            authenticationState = 'unauthenticated';
            console.debug('🔐 Authentication initialization failed:', error);
            return null;
        });

    return authInitializationPromise;
};

/**
 * Update authentication state
 */
const setAuthenticationState = (state: AuthState) => {
    authenticationState = state;
    console.debug('🔐 Authentication state changed to:', state);
};

/**
 * Food Service CRM Role-based permissions
 */
const getRolePermissions = (role: string): string[] => {
    switch (role) {
        case 'admin':
            return [
                'organizations.*',
                'contacts.*',
                'products.*',
                'opportunities.*',
                'interactions.*',
                'users.*',
                'settings.*',
                'reports.*',
            ];
        case 'manager':
            return [
                'organizations.*',
                'contacts.*',
                'products.*',
                'opportunities.*',
                'interactions.*',
                'reports.view',
                'settings.view',
            ];
        case 'broker':
            return [
                'organizations.view',
                'organizations.edit',
                'contacts.*',
                'products.view',
                'opportunities.*',
                'interactions.*',
            ];
        default:
            return [];
    }
};

/**
 * Check if user can access a specific resource/action
 */
const canAccess = (
    permissions: string[],
    resource: string,
    action: string
): boolean => {
    const fullPermission = `${resource}.${action}`;
    const wildcardPermission = `${resource}.*`;

    return (
        permissions.includes(fullPermission) ||
        permissions.includes(wildcardPermission) ||
        permissions.includes('*')
    );
};

export const jwtAuthProvider: AuthProvider = {
    /**
     * Login user with JWT authentication
     */
    login: async (params: LoginCredentials) => {
        try {
            const response = await apiLogin(params);

            // Update authentication state
            setAuthenticationState('authenticated');
            authInitializationPromise = Promise.resolve(response.user);

            // Log successful authentication
            await logAuditEvent(
                'auth.login',
                {
                    userId: response.user.id,
                    userEmail: response.user.email,
                    userRole: response.user.role,
                    rememberMe: params.rememberMe,
                    loginMethod: 'jwt',
                },
                {
                    userId: response.user.id,
                    userEmail: response.user.email,
                    userRole: response.user.role,
                    outcome: 'success',
                    message: 'User login successful',
                }
            );

            // Setup automatic token refresh
            setupTokenRefresh();

            // Save session for mobile persistence
            await saveSession(response.user);

            return Promise.resolve();
        } catch (error) {
            console.error('Login failed:', error);

            // Update authentication state on failure
            setAuthenticationState('unauthenticated');
            authInitializationPromise = Promise.resolve(null);

            // Log failed authentication
            await logAuditEvent(
                'auth.login_failed',
                {
                    userEmail: params.email,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    attemptedRememberMe: params.rememberMe,
                },
                {
                    userEmail: params.email,
                    outcome: 'failure',
                    severity: 'high',
                    message: 'Login attempt failed',
                }
            );

            return Promise.reject(error);
        }
    },

    /**
     * Logout user and clear all tokens
     */
    logout: async () => {
        const sessionInfo = loadSession();

        try {
            await apiLogout();

            // Log successful logout
            await logAuditEvent(
                'auth.logout',
                {
                    userId: sessionInfo?.user.id,
                    userEmail: sessionInfo?.user.email,
                    sessionId: sessionInfo?.sessionId,
                    logoutMethod: 'explicit',
                },
                {
                    userId: sessionInfo?.user.id,
                    userEmail: sessionInfo?.user.email,
                    outcome: 'success',
                    message: 'User logout successful',
                }
            );

            // Clear session persistence
            clearSession();

            return Promise.resolve();
        } catch (error) {
            console.error('Logout error:', error);

            // Log logout attempt (even if server call failed)
            await logAuditEvent(
                'auth.logout',
                {
                    userId: sessionInfo?.user.id,
                    userEmail: sessionInfo?.user.email,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    logoutMethod: 'explicit_with_error',
                },
                {
                    userId: sessionInfo?.user.id,
                    userEmail: sessionInfo?.user.email,
                    outcome: 'warning',
                    severity: 'medium',
                    message: 'Logout completed with server error',
                }
            );

            // Even if server logout fails, clear local state
            clearAccessToken();
            clearAuthState();
            clearSession();
            return Promise.resolve();
        }
    },

    /**
     * Check if user is authenticated
     */
    checkAuth: async (params?: any) => {
        try {
            // Check for session conflicts (multiple devices)
            if (checkSessionConflict()) {
                clearSession();
                return Promise.reject(new Error('Session conflict detected'));
            }

            // Check session validity first
            if (!isSessionValid()) {
                clearSession();
                return Promise.reject(new Error('Session expired or invalid'));
            }

            const token = getAccessToken();
            const authState = getAuthState();

            // If no token and no stored auth state, user is not authenticated
            if (!token && !authState) {
                return Promise.reject(new Error('Not authenticated'));
            }

            // If we have a token, user is authenticated
            if (token) {
                return Promise.resolve();
            }

            // Try to initialize auth (refresh token)
            const user = await initializeAuth();
            if (user) {
                // Restore session for recovered authentication
                await saveSession(user);
                return Promise.resolve();
            }

            return Promise.reject(new Error('Authentication expired'));
        } catch (error) {
            console.error('Auth check failed:', error);
            clearAuthState();
            clearSession();
            return Promise.reject(error);
        }
    },

    /**
     * Check if an error requires logout
     */
    checkError: async (error: any) => {
        const status = error?.status || error?.response?.status;

        if (status === 401 || status === 403) {
            // Token expired or insufficient permissions
            clearAccessToken();
            clearAuthState();
            return Promise.reject(new Error('Session expired'));
        }

        // For other errors, don't logout
        return Promise.resolve();
    },

    /**
     * Get user identity
     */
    getIdentity: async () => {
        try {
            const token = getAccessToken();
            if (token) {
                // Get user from token (fast)
                const user = getUserFromToken(token);
                if (user && user.id) {
                    return Promise.resolve({
                        id: user.id,
                        fullName: `${user.firstName} ${user.lastName}`,
                        avatar: user.avatar,
                        email: user.email,
                        role: user.role,
                        principals: user.principals,
                    });
                }
            }

            // Fallback: get user from API
            const user = await getCurrentUser();
            if (!user) {
                return Promise.reject(new Error('No authenticated user found'));
            }

            return Promise.resolve({
                id: user.id,
                fullName: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar,
                email: user.email,
                role: user.role,
                principals: user.principals,
            });
        } catch (error) {
            console.debug('Failed to get user identity:', error);
            return Promise.reject(error);
        }
    },

    /**
     * Get user permissions based on role
     */
    getPermissions: async () => {
        try {
            const token = getAccessToken();
            if (token) {
                const user = getUserFromToken(token);
                if (user?.role) {
                    return Promise.resolve(getRolePermissions(user.role));
                }
            }

            // Fallback: get permissions from API
            const permissions = await getUserPermissions();
            return Promise.resolve(permissions);
        } catch (error) {
            console.error('Failed to get permissions:', error);
            return Promise.resolve([]); // Return empty permissions on error
        }
    },

    /**
     * Check if user can access a specific resource/action
     */
    canAccess: async ({ resource, action, record }: any) => {
        try {
            const permissions = await jwtAuthProvider.getPermissions!({});

            // Additional customer-based access control for brokers
            const token = getAccessToken();
            if (token) {
                const user = getUserFromToken(token);
                if (user?.role === 'broker' && record) {
                    // Check if record belongs to broker's customer assignments
                    // This would be implemented based on your customer assignment logic
                    // For now, allowing access to all records for brokers
                }
            }

            return canAccess(permissions as string[], resource, action);
        } catch (error) {
            console.error('Access check failed:', error);
            return false;
        }
    },
};

/**
 * Initialize authentication on app startup
 */
export const initializeAuthentication = async (): Promise<User | null> => {
    try {
        // Initialize security systems
        const securityConfig = initializeSecurity({
            csrfProtection: true,
            rateLimitingEnabled: true,
            requestValidation: true,
            contentSecurityPolicy: true,
            httpSecurityHeaders: true,
            xssProtection: true,
            sqlInjectionProtection: true,
        });

        // Initialize HTTPS enforcement
        const cleanupHTTPS = initializeHTTPSSecurity({
            enforceHTTPS: process.env.NODE_ENV === 'production',
            strictTransportSecurity: true,
            upgradeInsecureRequests: true,
            blockMixedContent: true,
            allowLocalDevelopment: true,
        });

        // Initialize audit logging
        const cleanupAudit = initializeAuditLogging();

        // Setup automatic token refresh
        setupTokenRefresh();

        // Setup activity tracking for session persistence
        const cleanupActivity = setupActivityTracking();

        // Check for existing session
        const sessionInfo = loadSession();
        if (sessionInfo) {
            console.log('📱 Restoring session:', {
                user: `${sessionInfo.user.firstName} ${sessionInfo.user.lastName}`,
                sessionId: sessionInfo.sessionId,
                isMobile: sessionInfo.deviceInfo.isMobile,
                isStandalone: sessionInfo.deviceInfo.isStandalone,
            });

            // Log session restoration
            await logAuditEvent(
                'auth.session_restored',
                {
                    userId: sessionInfo.user.id,
                    userEmail: sessionInfo.user.email,
                    sessionId: sessionInfo.sessionId,
                    deviceInfo: sessionInfo.deviceInfo,
                },
                {
                    userId: sessionInfo.user.id,
                    userEmail: sessionInfo.user.email,
                    outcome: 'success',
                    message: 'Session restored from storage',
                }
            );
        }

        // Try to restore authentication state
        const user = await initializeAuth();

        // If we have a user but no session, save the session
        if (user && !sessionInfo) {
            await saveSession(user);
        }

        // Store cleanup functions globally for app shutdown
        (window as any).__forkflowCleanup = () => {
            cleanupHTTPS();
            cleanupAudit();
            cleanupActivity();
        };

        return user;
    } catch (error) {
        console.error('Authentication initialization failed:', error);

        // Log initialization failure
        await logAuditEvent(
            'system.error',
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                component: 'authentication_initialization',
            },
            {
                outcome: 'failure',
                severity: 'high',
                message: 'Authentication system initialization failed',
            }
        );

        clearSession();
        return null;
    }
};
