/**
 * Authentication Service for ForkFlow CRM
 * Handles JWT authentication with Supabase backend integration
 */

import { supabase } from '../../providers/supabase/supabase';
import { User, LoginCredentials } from '../../types';
import { logAuditEvent } from '../../utils/auditLogging';

// Types for auth responses
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const { email, password, rememberMe } = credentials;
        
        // Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Login failed');
        }

        // Get user profile from the database
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select(`
                id,
                email,
                first_name,
                last_name,
                role,
                avatar,
                territory,
                principals,
                disabled,
                last_login,
                created_at,
                updated_at
            `)
            .eq('auth_user_id', authData.user.id)
            .single();

        if (profileError || !userProfile) {
            // If no user profile exists, create one
            const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                    auth_user_id: authData.user.id,
                    email: authData.user.email,
                    first_name: authData.user.user_metadata?.first_name || '',
                    last_name: authData.user.user_metadata?.last_name || '',
                    role: 'broker', // Default role
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (createError || !newProfile) {
                throw new Error('Failed to create user profile');
            }

            // Update last login
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', newProfile.id);

            return {
                user: {
                    id: newProfile.id,
                    email: newProfile.email,
                    firstName: newProfile.first_name,
                    lastName: newProfile.last_name,
                    role: newProfile.role,
                    avatar: newProfile.avatar,
                    territory: newProfile.territory,
                    principals: newProfile.principals || [],
                    isActive: !newProfile.disabled,
                    lastLoginAt: newProfile.last_login,
                    createdAt: newProfile.created_at,
                    updatedAt: newProfile.updated_at,
                },
                accessToken: authData.session?.access_token || '',
                refreshToken: authData.session?.refresh_token || '',
                expiresIn: authData.session?.expires_in || 3600,
            };
        }

        // Update last login for existing user
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userProfile.id);

        return {
            user: {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.first_name,
                lastName: userProfile.last_name,
                role: userProfile.role,
                avatar: userProfile.avatar,
                territory: userProfile.territory,
                principals: userProfile.principals || [],
                isActive: !userProfile.disabled,
                lastLoginAt: new Date().toISOString(),
                createdAt: userProfile.created_at,
                updatedAt: userProfile.updated_at,
            },
            accessToken: authData.session?.access_token || '',
            refreshToken: authData.session?.refresh_token || '',
            expiresIn: authData.session?.expires_in || 3600,
        };
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Logout user and invalidate session
 */
export const logout = async (): Promise<void> => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            // Don't throw error for logout - always clear local state
        }
    } catch (error) {
        console.error('Logout failed:', error);
        // Don't throw error for logout - always clear local state
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
    try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
            throw new Error('User not authenticated');
        }

        // Get user profile from database
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select(`
                id,
                email,
                first_name,
                last_name,
                role,
                avatar,
                territory,
                principals,
                disabled,
                last_login,
                created_at,
                updated_at
            `)
            .eq('auth_user_id', authData.user.id)
            .single();

        if (profileError || !userProfile) {
            throw new Error('User profile not found');
        }

        return {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            role: userProfile.role,
            avatar: userProfile.avatar,
            territory: userProfile.territory,
            principals: userProfile.principals || [],
            isActive: !userProfile.disabled,
            lastLoginAt: userProfile.last_login,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at,
        };
    } catch (error) {
        console.error('Failed to get current user:', error);
        throw error;
    }
};

/**
 * Get user permissions based on role
 */
export const getUserPermissions = async (): Promise<string[]> => {
    try {
        const user = await getCurrentUser();
        
        // Return permissions based on role
        switch (user.role) {
            case 'admin':
                return [
                    'organizations.*',
                    'contacts.*', 
                    'products.*',
                    'opportunities.*',
                    'interactions.*',
                    'users.*',
                    'settings.*',
                    'reports.*'
                ];
            case 'manager':
                return [
                    'organizations.*',
                    'contacts.*',
                    'products.*',
                    'opportunities.*',
                    'interactions.*',
                    'reports.view',
                    'settings.view'
                ];
            case 'broker':
                return [
                    'organizations.view',
                    'organizations.edit',
                    'contacts.*',
                    'products.view',
                    'opportunities.*',
                    'interactions.*'
                ];
            default:
                return [];
        }
    } catch (error) {
        console.error('Failed to get user permissions:', error);
        return [];
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error || !data.session) {
            throw new Error(error?.message || 'Token refresh failed');
        }

        return {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in || 3600,
        };
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const { data, error } = await supabase.auth.getSession();
        return !error && !!data.session;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
};

/**
 * Initialize authentication on app startup
 */
export const initializeAuth = async (): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
            return null;
        }

        // Get current user profile
        const user = await getCurrentUser();
        
        // Log session restoration
        await logAuditEvent('auth.session_restored', {
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
        }, {
            userId: user.id,
            userEmail: user.email,
            outcome: 'success',
            message: 'Authentication session restored',
        });

        return user;
    } catch (error) {
        console.error('Auth initialization failed:', error);
        return null;
    }
};

/**
 * Setup automatic token refresh
 */
export const setupTokenRefresh = (): void => {
    // Supabase handles automatic token refresh internally
    // This function exists for compatibility with the JWT auth provider
    console.log('🔄 Token refresh setup complete (handled by Supabase)');
};

/**
 * Sign up new user
 */
export const signUp = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}): Promise<AuthResponse> => {
    try {
        const { email, password, firstName, lastName, role = 'broker' } = userData;
        
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                }
            }
        });

        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Sign up failed');
        }

        // Create user profile in database
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .insert({
                auth_user_id: authData.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
            })
            .select()
            .single();

        if (profileError || !userProfile) {
            throw new Error('Failed to create user profile');
        }

        return {
            user: {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.first_name,
                lastName: userProfile.last_name,
                role: userProfile.role,
                avatar: userProfile.avatar,
                territory: userProfile.territory,
                principals: userProfile.principals || [],
                isActive: !userProfile.disabled,
                lastLoginAt: userProfile.last_login,
                createdAt: userProfile.created_at,
                updatedAt: userProfile.updated_at,
            },
            accessToken: authData.session?.access_token || '',
            refreshToken: authData.session?.refresh_token || '',
            expiresIn: authData.session?.expires_in || 3600,
        };
    } catch (error) {
        console.error('Sign up failed:', error);
        throw error;
    }
};

/**
 * Reset password request
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Password reset request failed:', error);
        throw error;
    }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Password update failed:', error);
        throw error;
    }
};