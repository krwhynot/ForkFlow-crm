/**
 * Authentication API Endpoints for react-admin Integration
 * RESTful API layer that integrates with Supabase backend via authService
 */

import { DataProvider, Identifier } from 'react-admin';
import {
    login,
    logout,
    getCurrentUser,
    getUserPermissions,
    refreshToken,
    isAuthenticated,
    signUp,
    requestPasswordReset,
    updatePassword,
} from './authService';
import { User, LoginCredentials, BrokerFormData, PasswordResetRequest, PasswordResetConfirm, UserProfileUpdate } from '../../types';
import { supabase } from '../../providers/supabase/supabase';
import { logAuditEvent } from '../../utils/auditLogging';

export interface AuthAPI {
    // Authentication endpoints
    login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
    refreshToken(): Promise<{ accessToken: string; refreshToken: string }>;
    checkAuth(): Promise<boolean>;
    
    // User management endpoints
    getUsers(params: any): Promise<{ data: User[]; total: number }>;
    getUser(id: Identifier): Promise<User>;
    createUser(userData: BrokerFormData): Promise<User>;
    updateUser(id: Identifier, userData: Partial<BrokerFormData>): Promise<User>;
    updateUserProfile(id: Identifier, userData: UserProfileUpdate): Promise<User>;
    deleteUser(id: Identifier): Promise<void>;
    
    // Permission management
    getUserPermissions(userId?: Identifier): Promise<string[]>;
    updateUserPermissions(userId: Identifier, permissions: string[]): Promise<void>;
    
    // Password management
    requestPasswordReset(data: PasswordResetRequest): Promise<void>;
    confirmPasswordReset(data: PasswordResetConfirm): Promise<{ email: string }>;
    updatePassword(newPassword: string): Promise<void>;
    forcePasswordReset(userId: Identifier): Promise<void>;
}

/**
 * Authentication API implementation with Supabase backend
 */
export class SupabaseAuthAPI implements AuthAPI {
    
    /**
     * Helper method to get current user with null safety
     */
    private async getCurrentUserRequired(): Promise<User> {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Authentication required');
        }
        return user;
    }
    
    /**
     * Authenticate user with email/password
     */
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        try {
            const response = await login(credentials);
            
            await logAuditEvent('api.auth.login', {
                endpoint: '/api/auth/login',
                method: 'POST',
                userEmail: credentials.email,
                rememberMe: credentials.rememberMe,
            }, {
                userId: response.user.id,
                userEmail: response.user.email,
                outcome: 'success',
                message: 'User authenticated via API',
            });
            
            return {
                user: response.user,
                token: response.accessToken,
            };
        } catch (error) {
            await logAuditEvent('api.auth.login_failed', {
                endpoint: '/api/auth/login',
                method: 'POST',
                userEmail: credentials.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            }, {
                userEmail: credentials.email,
                outcome: 'failure',
                severity: 'high',
                message: 'API login attempt failed',
            });
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        const user = await getCurrentUser().catch(() => null);
        
        try {
            await logout();
            
            await logAuditEvent('api.auth.logout', {
                endpoint: '/api/auth/logout',
                method: 'POST',
                userId: user?.id,
            }, {
                userId: user?.id,
                userEmail: user?.email,
                outcome: 'success',
                message: 'User logged out via API',
            });
        } catch (error) {
            await logAuditEvent('api.auth.logout_error', {
                endpoint: '/api/auth/logout',
                method: 'POST',
                userId: user?.id,
                error: error instanceof Error ? error.message : 'Unknown error',
            }, {
                userId: user?.id,
                userEmail: user?.email,
                outcome: 'warning',
                severity: 'medium',
                message: 'API logout completed with errors',
            });
            // Don't throw error for logout - always clear local state
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        return this.getCurrentUserRequired();
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
        const result = await refreshToken();
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }

    /**
     * Check if user is authenticated
     */
    async checkAuth(): Promise<boolean> {
        return isAuthenticated();
    }

    /**
     * Get list of users (admin only)
     */
    async getUsers(params: {
        pagination?: { page: number; perPage: number };
        sort?: { field: string; order: 'ASC' | 'DESC' };
        filter?: Record<string, any>;
    }): Promise<{ data: User[]; total: number }> {
        const currentUser = await this.getCurrentUserRequired();
        if (currentUser.role !== 'admin') {
            throw new Error('Insufficient permissions to list users');
        }

        const { pagination = { page: 1, perPage: 10 }, sort = { field: 'createdAt', order: 'DESC' }, filter = {} } = params;
        
        let query = supabase
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
            `, { count: 'exact' });

        // Apply filters
        if (filter.role) {
            query = query.eq('role', filter.role);
        }
        if (filter.isActive !== undefined) {
            query = query.eq('disabled', !filter.isActive);
        }
        if (filter.search) {
            query = query.or(`first_name.ilike.%${filter.search}%,last_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
        }

        // Apply sorting
        query = query.order(sort.field === 'firstName' ? 'first_name' : 
                           sort.field === 'lastName' ? 'last_name' :
                           sort.field === 'createdAt' ? 'created_at' :
                           sort.field === 'updatedAt' ? 'updated_at' :
                           sort.field === 'lastLoginAt' ? 'last_login' :
                           sort.field, { ascending: sort.order === 'ASC' });

        // Apply pagination
        const from = (pagination.page - 1) * pagination.perPage;
        const to = from + pagination.perPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        // Transform to User type
        const users: User[] = (data || []).map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            avatar: user.avatar,
            territory: user.territory,
            principals: user.principals || [],
            isActive: !user.disabled,
            lastLoginAt: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        }));

        await logAuditEvent('api.users.list', {
            endpoint: '/api/users',
            method: 'GET',
            requestedBy: currentUser.id,
            pagination,
            sort,
            filter,
            resultCount: users.length,
        }, {
            userId: currentUser.id,
            outcome: 'success',
            message: `Retrieved ${users.length} users`,
        });

        return {
            data: users,
            total: count || 0,
        };
    }

    /**
     * Get single user by ID (admin only, or current user)
     */
    async getUser(id: Identifier): Promise<User> {
        const currentUser = await this.getCurrentUserRequired();
        
        // Allow users to get their own data, or admin to get any user
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            throw new Error('Insufficient permissions to view user');
        }

        const { data, error } = await supabase
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
            .eq('id', id)
            .single();

        if (error || !data) {
            throw new Error(`User not found: ${error?.message || 'No data'}`);
        }

        const user: User = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
            avatar: data.avatar,
            territory: data.territory,
            principals: data.principals || [],
            isActive: !data.disabled,
            lastLoginAt: data.last_login,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        return user;
    }

    /**
     * Create new user (admin only)
     */
    async createUser(userData: BrokerFormData): Promise<User> {
        const currentUser = await this.getCurrentUserRequired();
        if (currentUser.role !== 'admin') {
            throw new Error('Insufficient permissions to create users');
        }

        try {
            const result = await signUp({
                email: userData.email,
                password: userData.password,
                firstName: userData.first_name,
                lastName: userData.last_name,
                role: userData.administrator ? 'admin' : 'broker',
            });

            await logAuditEvent('api.users.create', {
                endpoint: '/api/users',
                method: 'POST',
                createdBy: currentUser.id,
                newUserEmail: userData.email,
                newUserRole: userData.administrator ? 'admin' : 'broker',
            }, {
                userId: currentUser.id,
                outcome: 'success',
                message: `Created new user: ${userData.email}`,
            });

            return result.user;
        } catch (error) {
            await logAuditEvent('api.users.create_failed', {
                endpoint: '/api/users',
                method: 'POST',
                createdBy: currentUser.id,
                email: userData.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            }, {
                userId: currentUser.id,
                outcome: 'failure',
                severity: 'high',
                message: 'Failed to create user via API',
            });
            throw error;
        }
    }

    /**
     * Update user (admin only, or current user updating own profile)
     */
    async updateUser(id: Identifier, userData: Partial<BrokerFormData>): Promise<User> {
        const currentUser = await this.getCurrentUserRequired();
        
        // Allow users to update their own profile, or admin to update any user
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            throw new Error('Insufficient permissions to update user');
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (userData.email) updateData.email = userData.email;
        if (userData.first_name) updateData.first_name = userData.first_name;
        if (userData.last_name) updateData.last_name = userData.last_name;
        if (userData.avatar) updateData.avatar = userData.avatar;
        if (userData.disabled !== undefined) updateData.disabled = userData.disabled;
        
        // Only admin can change administrator status
        if (currentUser.role === 'admin' && userData.administrator !== undefined) {
            updateData.role = userData.administrator ? 'admin' : 'broker';
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
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
            .single();

        if (error || !data) {
            throw new Error(`Failed to update user: ${error?.message || 'No data'}`);
        }

        const user: User = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
            avatar: data.avatar,
            territory: data.territory,
            principals: data.principals || [],
            isActive: !data.disabled,
            lastLoginAt: data.last_login,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        await logAuditEvent('api.users.update', {
            endpoint: `/api/users/${id}`,
            method: 'PUT',
            updatedBy: currentUser.id,
            targetUserId: id,
            changes: Object.keys(updateData),
        }, {
            userId: currentUser.id,
            outcome: 'success',
            message: `Updated user: ${user.email}`,
        });

        return user;
    }

    /**
     * Update user profile (simplified profile updates)
     */
    async updateUserProfile(id: Identifier, userData: UserProfileUpdate): Promise<User> {
        const currentUser = await this.getCurrentUserRequired();
        
        // Allow users to update their own profile, or admin to update any user
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            throw new Error('Insufficient permissions to update user profile');
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (userData.firstName) updateData.first_name = userData.firstName;
        if (userData.lastName) updateData.last_name = userData.lastName;
        if (userData.territory) updateData.territory = userData.territory;
        if (userData.principals) updateData.principals = userData.principals;
        
        // Handle avatar upload if it's a File
        if (userData.avatar) {
            if (userData.avatar instanceof File) {
                // In a real implementation, you would upload the file to storage
                // For now, we'll just store a placeholder URL
                updateData.avatar = `avatar_${id}_${Date.now()}`;
            } else {
                updateData.avatar = userData.avatar;
            }
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
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
            .single();

        if (error || !data) {
            throw new Error(`Failed to update user profile: ${error?.message || 'No data'}`);
        }

        const user: User = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
            avatar: data.avatar,
            territory: data.territory,
            principals: data.principals || [],
            isActive: !data.disabled,
            lastLoginAt: data.last_login,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };

        await logAuditEvent('api.users.profile_update', {
            endpoint: `/api/users/${id}/profile`,
            method: 'PUT',
            updatedBy: currentUser.id,
            targetUserId: id,
            changes: Object.keys(updateData),
        }, {
            userId: currentUser.id,
            outcome: 'success',
            message: `Updated user profile: ${user.email}`,
        });

        return user;
    }

    /**
     * Delete user (admin only)
     */
    async deleteUser(id: Identifier): Promise<void> {
        const currentUser = await this.getCurrentUserRequired();
        if (currentUser.role !== 'admin') {
            throw new Error('Insufficient permissions to delete users');
        }

        if (currentUser.id === id) {
            throw new Error('Cannot delete your own account');
        }

        // Get user info for audit log
        const userToDelete = await this.getUser(id);

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }

        await logAuditEvent('api.users.delete', {
            endpoint: `/api/users/${id}`,
            method: 'DELETE',
            deletedBy: currentUser.id,
            deletedUserEmail: userToDelete.email,
            deletedUserRole: userToDelete.role,
        }, {
            userId: currentUser.id,
            outcome: 'success',
            severity: 'high',
            message: `Deleted user: ${userToDelete.email}`,
        });
    }

    /**
     * Get user permissions
     */
    async getUserPermissions(userId?: Identifier): Promise<string[]> {
        if (userId) {
            const user = await this.getUser(userId);
            return getUserPermissions();
        }
        return getUserPermissions();
    }

    /**
     * Update user permissions (admin only)
     */
    async updateUserPermissions(userId: Identifier, permissions: string[]): Promise<void> {
        const currentUser = await this.getCurrentUserRequired();
        if (currentUser.role !== 'admin') {
            throw new Error('Insufficient permissions to update user permissions');
        }

        // In this implementation, permissions are role-based
        // This method could be extended to support custom permissions
        await logAuditEvent('api.users.permissions_update', {
            endpoint: `/api/users/${userId}/permissions`,
            method: 'PUT',
            updatedBy: currentUser.id,
            targetUserId: userId,
            permissions,
        }, {
            userId: currentUser.id,
            outcome: 'success',
            message: `Updated permissions for user ${userId}`,
        });
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
        await requestPasswordReset(data.email);
        
        await logAuditEvent('api.auth.password_reset_request', {
            endpoint: '/api/auth/password-reset',
            method: 'POST',
            email: data.email,
        }, {
            userEmail: data.email,
            outcome: 'success',
            message: 'Password reset requested via API',
        });
    }

    /**
     * Confirm password reset with token
     */
    async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ email: string }> {
        // For now, we'll use the updatePassword method from authService
        // In a real implementation, this would verify the token and update the password
        try {
            await updatePassword(data.newPassword);
            
            // Get current user to return email (this is a simplified implementation)
            const currentUser = await this.getCurrentUserRequired();
            
            await logAuditEvent('api.auth.password_reset_confirm', {
                endpoint: '/api/auth/password-reset/confirm',
                method: 'POST',
                token: data.token.substring(0, 10) + '...', // Log partial token for security
            }, {
                userEmail: currentUser.email,
                outcome: 'success',
                message: 'Password reset confirmed via API',
            });

            return { email: currentUser.email };
        } catch (error) {
            await logAuditEvent('api.auth.password_reset_confirm_failed', {
                endpoint: '/api/auth/password-reset/confirm',
                method: 'POST',
                token: data.token.substring(0, 10) + '...',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, {
                outcome: 'failure',
                severity: 'high',
                message: 'Password reset confirmation failed',
            });
            throw error;
        }
    }

    /**
     * Update current user's password
     */
    async updatePassword(newPassword: string): Promise<void> {
        const currentUser = await this.getCurrentUserRequired();
        
        await updatePassword(newPassword);
        
        await logAuditEvent('api.auth.password_update', {
            endpoint: '/api/auth/password',
            method: 'PUT',
            userId: currentUser.id,
        }, {
            userId: currentUser.id,
            userEmail: currentUser.email,
            outcome: 'success',
            message: 'Password updated via API',
        });
    }

    /**
     * Force password reset for another user (admin only)
     */
    async forcePasswordReset(userId: Identifier): Promise<void> {
        const currentUser = await this.getCurrentUserRequired();
        if (currentUser.role !== 'admin') {
            throw new Error('Insufficient permissions to force password reset');
        }

        const targetUser = await this.getUser(userId);
        await requestPasswordReset(targetUser.email);
        
        await logAuditEvent('api.users.force_password_reset', {
            endpoint: `/api/users/${userId}/force-password-reset`,
            method: 'POST',
            requestedBy: currentUser.id,
            targetUserId: userId,
            targetUserEmail: targetUser.email,
        }, {
            userId: currentUser.id,
            outcome: 'success',
            severity: 'medium',
            message: `Forced password reset for user: ${targetUser.email}`,
        });
    }
}

/**
 * Default authentication API instance
 */
export const authAPI = new SupabaseAuthAPI();

/**
 * Authentication data provider methods for react-admin integration
 */
export const authDataProviderMethods = {
    // User management for react-admin
    async getList(resource: 'users', params: any): Promise<{ data: User[]; total: number }> {
        if (resource !== 'users') {
            throw new Error(`Unsupported resource: ${resource}`);
        }
        return authAPI.getUsers(params);
    },

    async getOne(resource: 'users', params: { id: Identifier }) {
        if (resource !== 'users') {
            throw new Error(`Unsupported resource: ${resource}`);
        }
        const user = await authAPI.getUser(params.id);
        return { data: user };
    },

    async create(resource: 'users', params: { data: BrokerFormData }) {
        if (resource !== 'users') {
            throw new Error(`Unsupported resource: ${resource}`);
        }
        const user = await authAPI.createUser(params.data);
        return { data: user };
    },

    async update(resource: 'users', params: { id: Identifier; data: Partial<BrokerFormData> }) {
        if (resource !== 'users') {
            throw new Error(`Unsupported resource: ${resource}`);
        }
        const user = await authAPI.updateUser(params.id, params.data);
        return { data: user };
    },

    // Profile management
    async updateUserProfile(id: Identifier, data: UserProfileUpdate) {
        return authAPI.updateUserProfile(id, data);
    },

    async delete(resource: 'users', params: { id: Identifier }) {
        if (resource !== 'users') {
            throw new Error(`Unsupported resource: ${resource}`);
        }
        await authAPI.deleteUser(params.id);
        return { data: {} };
    },

    // Authentication methods
    async login(credentials: LoginCredentials) {
        return authAPI.login(credentials);
    },

    async logout() {
        return authAPI.logout();
    },

    async getCurrentUser() {
        return authAPI.getCurrentUser();
    },

    async checkAuth() {
        return authAPI.checkAuth();
    },

    async refreshToken() {
        return authAPI.refreshToken();
    },

    // Permission methods
    async getUserPermissions(userId?: Identifier) {
        return authAPI.getUserPermissions(userId);
    },

    // Password methods
    async requestPasswordReset(data: PasswordResetRequest) {
        return authAPI.requestPasswordReset(data);
    },

    async confirmPasswordReset(data: PasswordResetConfirm) {
        return authAPI.confirmPasswordReset(data);
    },

    async updatePassword(newPassword: string) {
        return authAPI.updatePassword(newPassword);
    },

    async forcePasswordReset(userId: Identifier) {
        return authAPI.forcePasswordReset(userId);
    },
};