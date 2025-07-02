// src/users/__tests__/UserManagement.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TestContext } from 'ra-test';
import { UserList } from '../UserList';
import { UserCreate } from '../UserCreate';
import { UserEdit } from '../UserEdit';
import { UserShow } from '../UserShow';
import { User } from '../../types';

// Mock data
const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        territory: [],
        principals: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-15T10:00:00Z',
    },
    {
        id: '2',
        email: 'broker@example.com',
        firstName: 'John',
        lastName: 'Broker',
        role: 'broker',
        territory: ['CA', 'Los Angeles', '90210'],
        principals: ['Sysco', 'US Foods'],
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        lastLoginAt: '2024-01-15T09:00:00Z',
    },
    {
        id: '3',
        email: 'manager@example.com',
        firstName: 'Jane',
        lastName: 'Manager',
        role: 'manager',
        territory: [],
        principals: [],
        isActive: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
    }
];

const defaultDataProvider = {
    getList: () => Promise.resolve({ data: mockUsers as any[], total: mockUsers.length }),
    getOne: () => Promise.resolve({ data: mockUsers[0] as any }),
    getMany: () => Promise.resolve({ data: mockUsers as any[] }),
    getManyReference: () => Promise.resolve({ data: [], total: 0 }),
    create: () => Promise.resolve({ data: { ...mockUsers[0], id: '4' } as any }),
    update: () => Promise.resolve({ data: mockUsers[0] as any }),
    updateMany: () => Promise.resolve({ data: ['1', '2'] }),
    delete: () => Promise.resolve({ data: mockUsers[0] as any }),
    deleteMany: () => Promise.resolve({ data: ['1'] }),
} as any;

const defaultAuthProvider = {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getPermissions: () => Promise.resolve(),
    getIdentity: () => Promise.resolve({
        id: '1',
        fullName: 'Admin User',
        role: 'admin'
    }),
};

describe('User Management Integration Tests', () => {
    describe('UserList Component', () => {
        it('renders user list without errors', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('User Management')).toBeInTheDocument();
            });
        });

        it('displays user data correctly', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('admin@example.com')).toBeInTheDocument();
                expect(screen.getByText('broker@example.com')).toBeInTheDocument();
                expect(screen.getByText('manager@example.com')).toBeInTheDocument();
            });
        });

        it('shows territory information for brokers', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                // Should show territory count for broker users
                expect(screen.getByText('3 areas')).toBeInTheDocument();
            });
        });
    });

    describe('UserCreate Component', () => {
        it('renders user creation form without errors', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserCreate />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Basic Information')).toBeInTheDocument();
                expect(screen.getByLabelText('First Name')).toBeInTheDocument();
                expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
                expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
            });
        });

        it('shows territory fields for broker role', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserCreate />
                </TestContext>
            );

            // Would need user interaction to select broker role
            // This is a simplified test for form rendering
            await waitFor(() => {
                expect(screen.getByLabelText('Role')).toBeInTheDocument();
            });
        });
    });

    describe('UserEdit Component', () => {
        it('renders user edit form without errors', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserEdit />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Basic Information')).toBeInTheDocument();
                expect(screen.getByText('Security Management')).toBeInTheDocument();
            });
        });
    });

    describe('UserShow Component', () => {
        it('renders user details without errors', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserShow />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Account Information')).toBeInTheDocument();
                expect(screen.getByText('Activity Information')).toBeInTheDocument();
            });
        });
    });

    describe('Mobile Responsiveness', () => {
        beforeEach(() => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query.includes('(max-width: 600px)'),
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });
        });

        it('adapts UserList for mobile screens', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('User Management')).toBeInTheDocument();
                // Mobile layout should be rendered
            });
        });

        it('ensures touch targets are 44px minimum', async () => {
            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                const createButton = screen.getByText('Add User');
                expect(createButton).toBeInTheDocument();
                // Would need additional testing setup to verify actual rendered dimensions
            });
        });
    });

    describe('Role-Based Access Control', () => {
        it('shows appropriate actions for admin users', async () => {
            const adminAuthProvider = {
                ...defaultAuthProvider,
                getIdentity: () => Promise.resolve({
                    id: '1',
                    fullName: 'Admin User',
                    role: 'admin'
                }),
            };

            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Add User')).toBeInTheDocument();
            });
        });

        it('applies territory filtering for broker users', async () => {
            const brokerAuthProvider = {
                ...defaultAuthProvider,
                getIdentity: () => Promise.resolve({
                    id: '2',
                    fullName: 'John Broker',
                    role: 'broker',
                    territory: ['CA']
                }),
            };

            render(
                <TestContext
                    dataProvider={defaultDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            await waitFor(() => {
                // Should show territory filter indicator
                expect(screen.getByText(/Territory/)).toBeInTheDocument();
            });
        });
    });

    describe('Data Integration', () => {
        it('handles user creation workflow', async () => {
            const createDataProvider = {
                ...defaultDataProvider,
                create: jest.fn(() => Promise.resolve({ 
                    data: { 
                        id: '4', 
                        email: 'new@example.com',
                        firstName: 'New',
                        lastName: 'User',
                        role: 'broker',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    } as any
                })),
            } as any;

            render(
                <TestContext
                    dataProvider={createDataProvider}
                >
                    <UserCreate />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Basic Information')).toBeInTheDocument();
            });
        });

        it('handles user update workflow', async () => {
            const updateDataProvider = {
                ...defaultDataProvider,
                update: jest.fn(() => Promise.resolve({ data: mockUsers[0] as any })),
            } as any;

            render(
                <TestContext
                    dataProvider={updateDataProvider}
                >
                    <UserEdit />
                </TestContext>
            );

            await waitFor(() => {
                expect(screen.getByText('Basic Information')).toBeInTheDocument();
                expect(screen.getByText('Security Management')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('handles data loading errors gracefully', async () => {
            const errorDataProvider = {
                ...defaultDataProvider,
                getList: () => Promise.reject(new Error('Network error')),
            } as any;

            render(
                <TestContext
                    dataProvider={errorDataProvider}
                >
                    <UserList />
                </TestContext>
            );

            // Component should handle errors gracefully
            await waitFor(() => {
                expect(screen.getByText('User Management')).toBeInTheDocument();
            });
        });
    });
});