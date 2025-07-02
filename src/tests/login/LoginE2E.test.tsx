/**
 * Comprehensive E2E Tests for ForkFlow CRM Login System
 * Tests all authentication modes and scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UniversalLoginPage } from '../../login/UniversalLoginPage';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Mock react-admin hooks
const mockLogin = vi.fn();
const mockNotify = vi.fn();
const mockAuthState = { authenticated: false, loading: false };

vi.mock('react-admin', () => ({
    useLogin: () => mockLogin,
    useNotify: () => mockNotify,
    useAuthState: () => mockAuthState,
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>,
    };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('ForkFlow CRM Login E2E Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Reset localStorage and environment
        localStorage.clear();
        delete (window as any).location;
        (window as any).location = { search: '' };
        
        // Reset import.meta.env mock
        vi.stubGlobal('import.meta', {
            env: {
                VITE_IS_DEMO: 'false'
            }
        });
    });

    describe('Authentication Mode Detection', () => {
        it('should detect demo mode from environment variable', async () => {
            vi.stubGlobal('import.meta', {
                env: { VITE_IS_DEMO: 'true' }
            });

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Demo Mode')).toBeInTheDocument();
                expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
            });
        });

        it('should detect demo mode from URL parameter', async () => {
            (window as any).location.search = '?mode=demo';

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Demo Mode')).toBeInTheDocument();
            });
        });

        it('should detect JWT mode from URL parameter', async () => {
            (window as any).location.search = '?mode=jwt';

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
            });
        });

        it('should default to JWT mode', async () => {
            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
            });
        });
    });

    describe('Demo Mode Login', () => {
        beforeEach(() => {
            vi.stubGlobal('import.meta', {
                env: { VITE_IS_DEMO: 'true' }
            });
        });

        it('should display demo mode UI elements', async () => {
            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Demo Mode')).toBeInTheDocument();
                expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument();
                expect(screen.getByText('Quick Demo Login:')).toBeInTheDocument();
                expect(screen.getByText('Admin')).toBeInTheDocument();
                expect(screen.getByText('Manager')).toBeInTheDocument();
                expect(screen.getByText('Broker')).toBeInTheDocument();
                expect(screen.getByText('Demo')).toBeInTheDocument();
            });
        });

        it('should handle manual demo login', async () => {
            mockLogin.mockResolvedValue(undefined);

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Demo Mode')).toBeInTheDocument();
            });

            // Fill in credentials
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(emailInput, { target: { value: 'test@demo.com' } });
            fireEvent.change(passwordInput, { target: { value: 'demo123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'test@demo.com',
                    password: 'demo123',
                    rememberMe: true,
                });
            });
        });

        it('should handle quick login buttons', async () => {
            mockLogin.mockResolvedValue(undefined);

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Admin')).toBeInTheDocument();
            });

            // Click admin quick login
            const adminButton = screen.getByText('Admin');
            fireEvent.click(adminButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'admin@forkflow.com',
                    password: 'Admin123!',
                    rememberMe: true,
                });
            });
        });

        it('should handle demo login failure with fallback', async () => {
            mockLogin
                .mockRejectedValueOnce(new Error('Primary login failed'))
                .mockResolvedValueOnce(undefined);

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Demo Mode')).toBeInTheDocument();
            });

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(emailInput, { target: { value: 'test@demo.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledTimes(2);
                expect(mockLogin).toHaveBeenNthCalledWith(1, {
                    email: 'test@demo.com',
                    password: 'wrongpassword',
                    rememberMe: true,
                });
                expect(mockLogin).toHaveBeenNthCalledWith(2, {
                    email: 'test@demo.com',
                    password: 'demo123',
                    rememberMe: true,
                });
            });
        });
    });

    describe('JWT Mode Login', () => {
        beforeEach(() => {
            (window as any).location.search = '?mode=jwt';
        });

        it('should display JWT mode UI', async () => {
            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
                expect(screen.queryByText('Quick Demo Login:')).not.toBeInTheDocument();
            });
        });

        it('should handle JWT login', async () => {
            mockLogin.mockResolvedValue(undefined);

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
            });

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(emailInput, { target: { value: 'user@company.com' } });
            fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'user@company.com',
                    password: 'securepassword',
                    rememberMe: true,
                });
            });
        });

        it('should handle JWT login failure', async () => {
            const loginError = new Error('Invalid credentials');
            mockLogin.mockRejectedValue(loginError);

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
            });

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const submitButton = screen.getByRole('button', { name: /sign in/i });

            fireEvent.change(emailInput, { target: { value: 'user@company.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation', () => {
        it('should require email and password', async () => {
            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Please enter both email and password')).toBeInTheDocument();
            });

            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Mobile Optimization', () => {
        it('should apply mobile-specific styles', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query === '(max-width:600px)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            vi.stubGlobal('import.meta', {
                env: { VITE_IS_DEMO: 'true' }
            });

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Recommended for field use')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should render error boundary on component crash', () => {
            // Force an error by making useLogin throw
            mockLogin.mockImplementation(() => {
                throw new Error('Test component error');
            });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            expect(screen.getByText(/ForkFlow CRM Error/)).toBeInTheDocument();
            expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

            consoleSpy.mockRestore();
        });
    });

    describe('Authentication State', () => {
        it('should redirect when already authenticated', () => {
            vi.mocked(mockAuthState).authenticated = true;

            render(
                <TestWrapper>
                    <UniversalLoginPage />
                </TestWrapper>
            );

            expect(screen.getByTestId('navigate-to')).toHaveTextContent('/');
        });
    });
});

export {};