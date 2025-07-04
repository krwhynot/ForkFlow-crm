/**
 * Mock Authentication API for Development
 * Simulates JWT backend for food service CRM development
 */

import {
    LoginCredentials,
    LoginResponse,
    User,
    AuthTokens,
    JWTPayload,
    UserRole,
    PasswordResetRequest,
    PasswordResetConfirm,
} from '../../types';
import { validatePassword } from '../../utils/jwtUtils';

// Mock users database
const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@forkflow.com',
        firstName: 'Jane',
        lastName: 'Admin',
        role: 'admin',
        territory: ['northeast', 'southeast'],
        principals: ['sysco', 'us-foods', 'pfg'],
        avatar: 'https://i.pravatar.cc/150?img=1',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        email: 'manager@forkflow.com',
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager',
        territory: ['northeast'],
        principals: ['sysco', 'us-foods'],
        avatar: 'https://i.pravatar.cc/150?img=2',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        email: 'broker@forkflow.com',
        firstName: 'Sarah',
        lastName: 'Broker',
        role: 'broker',
        territory: ['northeast'],
        principals: ['sysco'],
        avatar: 'https://i.pravatar.cc/150?img=3',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '4',
        email: 'demo@forkflow.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'broker',
        territory: ['west'],
        principals: ['us-foods', 'pfg'],
        avatar: 'https://i.pravatar.cc/150?img=4',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

// Mock password storage (in production, these would be hashed)
const mockPasswords: Record<string, string> = {
    'admin@forkflow.com': 'Admin123!',
    'manager@forkflow.com': 'Manager123!',
    'broker@forkflow.com': 'Broker123!',
    'demo@forkflow.com': 'Demo123!',
};

// Mock refresh tokens storage
const mockRefreshTokens = new Map<
    string,
    { userId: string; expiresAt: number }
>();

/**
 * Generate mock JWT token
 */
const generateMockJWT = (user: User): string => {
    const payload: JWTPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        territory: user.territory,
        principals: user.principals,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
        jti: Math.random().toString(36).substr(2, 9),
    };

    // Simple mock JWT (in production, this would be properly signed)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadB64 = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';

    return `${header}.${payloadB64}.${signature}`;
};

/**
 * Generate mock refresh token
 */
const generateRefreshToken = (userId: string): string => {
    const token = Math.random().toString(36).substr(2, 32);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    mockRefreshTokens.set(token, { userId, expiresAt });
    return token;
};

/**
 * Simulate network delay
 */
const delay = (ms: number = 500): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock login API
 */
export const mockLogin = async (
    credentials: LoginCredentials
): Promise<LoginResponse> => {
    await delay();

    const { email, password } = credentials;

    // Find user
    const user = mockUsers.find(u => u.email === email && u.isActive);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Check password
    const storedPassword = mockPasswords[email];
    if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateMockJWT(user);
    const refreshToken = generateRefreshToken(user.id);

    const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 8 * 60 * 60, // 8 hours in seconds
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours in ms
    };

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    return {
        user,
        tokens,
    };
};

/**
 * Mock logout API
 */
export const mockLogout = async (refreshToken?: string): Promise<void> => {
    await delay(200);

    if (refreshToken) {
        mockRefreshTokens.delete(refreshToken);
    }
};

/**
 * Mock refresh token API
 */
export const mockRefreshToken = async (
    refreshToken: string
): Promise<AuthTokens | null> => {
    await delay(300);

    const tokenData = mockRefreshTokens.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
        mockRefreshTokens.delete(refreshToken);
        return null;
    }

    const user = mockUsers.find(u => u.id === tokenData.userId);
    if (!user || !user.isActive) {
        mockRefreshTokens.delete(refreshToken);
        return null;
    }

    // Generate new tokens
    const newAccessToken = generateMockJWT(user);
    const newRefreshToken = generateRefreshToken(user.id);

    // Remove old refresh token
    mockRefreshTokens.delete(refreshToken);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 8 * 60 * 60,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };
};

/**
 * Mock get current user API
 */
export const mockGetCurrentUser = async (userId: string): Promise<User> => {
    await delay(200);

    const user = mockUsers.find(u => u.id === userId && u.isActive);
    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Mock get user permissions API
 */
export const mockGetUserPermissions = async (
    userId: string
): Promise<string[]> => {
    await delay(200);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Return permissions based on role
    switch (user.role) {
        case 'admin':
            return ['*']; // All permissions
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
 * Mock password reset request API
 */
export const mockPasswordResetRequest = async (
    request: PasswordResetRequest
): Promise<void> => {
    await delay(1000);

    const user = mockUsers.find(u => u.email === request.email && u.isActive);
    if (!user) {
        // Don't reveal if email exists for security
        return;
    }

    // In production, this would send an email with reset token
    console.log(`Password reset email sent to ${request.email}`);
};

/**
 * Mock password reset confirm API
 */
export const mockPasswordResetConfirm = async (
    request: PasswordResetConfirm
): Promise<void> => {
    await delay(500);

    // Validate password strength
    const validation = validatePassword(request.newPassword);
    if (!validation.isValid) {
        throw new Error(
            `Password requirements not met: ${validation.errors.join(', ')}`
        );
    }

    // In production, this would validate the reset token and update password
    console.log('Password reset successful');
};

/**
 * Mock change password API
 */
export const mockChangePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    await delay(500);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new Error('User not found');
    }

    const storedPassword = mockPasswords[user.email];
    if (storedPassword !== currentPassword) {
        throw new Error('Current password is incorrect');
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        throw new Error(
            `Password requirements not met: ${validation.errors.join(', ')}`
        );
    }

    // Update password
    mockPasswords[user.email] = newPassword;
    user.updatedAt = new Date().toISOString();
};

/**
 * Mock update profile API
 */
export const mockUpdateProfile = async (
    userId: string,
    updates: Partial<User>
): Promise<User> => {
    await delay(500);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('User not found');
    }

    // Update user (excluding sensitive fields)
    const allowedUpdates = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        avatar: updates.avatar,
        territory: updates.territory,
        principals: updates.principals,
    };

    Object.assign(mockUsers[userIndex], allowedUpdates, {
        updatedAt: new Date().toISOString(),
    });

    return mockUsers[userIndex];
};
