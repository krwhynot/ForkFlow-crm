/**
 * Universal Login Page for ForkFlow CRM
 * Handles all authentication modes: Demo, JWT, and Supabase
 */

import React, { useState, useEffect } from 'react';
import { useLogin, useNotify, useAuthState } from 'react-admin';
import { Navigate } from 'react-router-dom';
import { LoginCredentials } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Button } from '../components/ui-kit/Button';
import { Input } from '../components/ui-kit/Input';
import { Checkbox } from '../components/ui-kit/Checkbox';
import { Spinner } from '../components/ui-kit/Spinner';

interface QuickLoginUser {
    email: string;
    label: string;
    role: string;
}

const DEMO_USERS: QuickLoginUser[] = [
    { email: 'admin@forkflow.com', label: 'Admin', role: 'admin' },
    { email: 'manager@forkflow.com', label: 'Manager', role: 'manager' },
    { email: 'broker@forkflow.com', label: 'Broker', role: 'broker' },
    { email: 'demo@forkflow.com', label: 'Demo', role: 'broker' },
];

export const UniversalLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useLogin();
    const notify = useNotify();
    const { authenticated } = useAuthState();

    // Redirect if already authenticated
    if (authenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError('');

        const credentials: LoginCredentials = {
            email,
            password,
        };

        try {
            await login(credentials);
            // React-Admin authProvider will handle redirect automatically
        } catch (loginError: any) {
            setError(
                loginError?.message ||
                    'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 font-sans p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            ForkFlow CRM
                        </h1>
                        <p className="text-gray-600">Food Broker CRM</p>
                    </div>

                    {error && (
                        <div
                            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                            role="alert"
                        >
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={loading}
                        />

                        <div className="flex items-center">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={() =>
                                    setRememberMe(!rememberMe)
                                }
                                disabled={loading}
                            />
                            <label
                                htmlFor="rememberMe"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full !h-12 text-lg"
                        >
                            {loading ? (
                                <Spinner className="w-6 h-6" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </ErrorBoundary>
    );
};
