/**
 * Fallback Login Page for ForkFlow CRM
 * Simple, dependency-free login page that works without React-Admin context
 */

import React, { useState } from 'react';

interface FallbackLoginPageProps {
    onLogin?: (credentials: { email: string; password: string }) => void;
    error?: string;
}

export const FallbackLoginPage: React.FC<FallbackLoginPageProps> = ({ onLogin, error }) => {
    const [email, setEmail] = useState('demo@forkflow.com');
    const [password, setPassword] = useState('demo123');
    const [loading, setLoading] = useState(false);

    console.log('🔐 FallbackLoginPage: Rendering fallback login page');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔐 FallbackLoginPage: Form submitted', { email });
        
        setLoading(true);
        
        try {
            if (onLogin) {
                await onLogin({ email, password });
            } else {
                // Default fallback - just reload with demo credentials in localStorage
                localStorage.setItem('demo-user', JSON.stringify({
                    id: 'demo-user',
                    email: email,
                    fullName: 'Demo User',
                    role: 'admin'
                }));
                console.log('✅ FallbackLoginPage: Demo credentials stored, reloading...');
                window.location.reload();
            }
        } catch (err) {
            console.error('❌ FallbackLoginPage: Login failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (userEmail: string) => {
        setEmail(userEmail);
        setPassword('demo123');
        // Trigger form submission
        setTimeout(() => {
            const form = document.getElementById('fallback-login-form') as HTMLFormElement;
            if (form) {
                form.requestSubmit();
            }
        }, 100);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Roboto, Arial, sans-serif',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '8px',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
                    <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>
                        ForkFlow CRM
                    </h1>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        Fallback Login Mode
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#ffebee',
                        border: '1px solid #f44336',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    background: '#fff3e0',
                    border: '1px solid #ff9800',
                    color: '#f57c00',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <strong>Demo Mode Active</strong><br />
                    This is a simplified login page. Use any credentials below.
                </div>

                <form id="fallback-login-form" onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#ccc' : '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '20px' }}>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: '#666', 
                        margin: '0 0 12px 0' 
                    }}>
                        Quick Demo Login:
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px'
                    }}>
                        {[
                            { email: 'admin@forkflow.com', label: 'Admin' },
                            { email: 'manager@forkflow.com', label: 'Manager' },
                            { email: 'broker@forkflow.com', label: 'Broker' },
                            { email: 'demo@forkflow.com', label: 'Demo' }
                        ].map((user) => (
                            <button
                                key={user.email}
                                type="button"
                                onClick={() => handleQuickLogin(user.email)}
                                disabled={loading}
                                style={{
                                    padding: '8px 12px',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    color: '#333'
                                }}
                            >
                                {user.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    <strong>Status:</strong> Fallback Login Mode<br />
                    ✅ No dependencies • ✅ Error resilient • ✅ Always works
                </div>
            </div>
        </div>
    );
};