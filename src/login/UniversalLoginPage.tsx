/**
 * Universal Login Page for ForkFlow CRM
 * Handles all authentication modes: Demo, JWT, and Supabase
 */

import React, { useState, useEffect } from 'react';
import { useLogin, useNotify, useAuthState } from 'react-admin';
import { Navigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Typography,
    Alert,
    Box,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoginCredentials } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PREFIX = 'UniversalLoginPage';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Roboto, sans-serif',
    padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: '400px',
    [`& .${PREFIX}-header`]: {
        textAlign: 'center',
        marginBottom: theme.spacing(3),
    },
    [`& .${PREFIX}-logo`]: {
        fontSize: '3rem',
        marginBottom: theme.spacing(2),
    },
    [`& .${PREFIX}-title`]: {
        color: '#333',
        marginBottom: theme.spacing(1),
    },
    [`& .${PREFIX}-subtitle`]: {
        color: '#666',
    },
    [`& .${PREFIX}-form`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    [`& .${PREFIX}-loginButton`]: {
        minHeight: '48px',
        fontSize: '1.1rem',
        fontWeight: 600,
    },
    [`& .${PREFIX}-quickLogin`]: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(1),
        marginTop: theme.spacing(2),
    },
    [`& .${PREFIX}-status`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: '#f5f5f5',
        borderRadius: theme.spacing(1),
        fontSize: '0.875rem',
    },
}));

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
    console.log('🔐 ENHANCED DEBUG: UniversalLoginPage component is rendering! Timestamp:', new Date().toISOString());
    console.log('🧪 UniversalLoginPage: Testing hook availability');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authMode, setAuthMode] = useState<'detecting' | 'demo' | 'jwt' | 'supabase'>('detecting');

    console.log('✅ UniversalLoginPage: All useState hooks initialized successfully');
    console.log('🎯 UniversalLoginPage: Initial state:', { email, rememberMe, loading, error, authMode });

    console.log('🧪 UniversalLoginPage: Testing react-admin hooks');
    
    const login = useLogin();
    console.log('✅ UniversalLoginPage: useLogin hook successful', typeof login);
    
    const notify = useNotify();
    console.log('✅ UniversalLoginPage: useNotify hook successful', typeof notify);
    
    const { authenticated } = useAuthState();
    console.log('✅ UniversalLoginPage: useAuthState hook successful', { authenticated });
    
    const theme = useTheme();
    console.log('✅ UniversalLoginPage: useTheme hook successful');
    
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    console.log('✅ UniversalLoginPage: useMediaQuery hook successful', { isMobile });

    console.log('🎉 UniversalLoginPage: All hooks initialized successfully - component is working!');

    // Detect authentication mode
    useEffect(() => {
        const detectAuthMode = () => {
            if (typeof window === 'undefined') return 'jwt';

            // Check URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'demo') return 'demo';
            if (urlParams.get('mode') === 'jwt') return 'jwt';
            if (urlParams.get('auth') === 'jwt') return 'jwt';

            // Check environment variables
            if (import.meta.env.VITE_IS_DEMO === 'true') return 'demo';
            if (process.env.REACT_APP_AUTH_PROVIDER === 'jwt') return 'jwt';

            // Check localStorage
            if (localStorage.getItem('auth-provider') === 'jwt') return 'jwt';
            if (localStorage.getItem('test-mode') === 'true') return 'demo';

            // Default to JWT for production
            return 'jwt';
        };

        const mode = detectAuthMode();
        console.log(`🔍 DEBUG: Detected auth mode: ${mode.toUpperCase()}`);
        setAuthMode(mode);
        console.log(`🔐 Universal Login Page - Auth Mode: ${mode.toUpperCase()}`);
    }, []);

    // Enhanced auth state checking workaround for Supabase redirectTo bug
    useEffect(() => {
        if (authenticated) {
            console.log('🔄 Auth state changed to authenticated - triggering redirect');
            // Small delay to ensure React-Admin state is fully updated
            setTimeout(() => {
                if (window.location.pathname.includes('login')) {
                    console.log('🔄 Still on login page after auth - using Navigate');
                    // This will be handled by the Navigate component below
                }
            }, 50);
        }
    }, [authenticated]);

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
            rememberMe,
        };

        console.log(`🚀 Login attempt in ${authMode} mode:`, { email, rememberMe });

        try {
            await login(credentials);
            console.log('✅ Login successful - React-Admin will handle redirect');
            // React-Admin authProvider will handle redirect automatically
        } catch (loginError: any) {
            console.error('❌ Login failed:', loginError);
            
            // In demo mode, try fallback credentials
            if (authMode === 'demo') {
                console.log('🔄 Trying demo mode fallback login...');
                try {
                    await login({ email, password: 'demo123', rememberMe });
                    console.log('✅ Demo fallback login successful - React-Admin will handle redirect');
                    // React-Admin authProvider will handle redirect automatically
                } catch (fallbackError: any) {
                    console.error('❌ Demo fallback also failed:', fallbackError);
                    setError('Demo login failed. Try using quick login buttons or any test credentials.');
                }
            } else {
                setError(loginError?.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (user: QuickLoginUser) => {
        setLoading(true);
        setError('');

        const password = user.email.includes('admin') ? 'Admin123!' :
                        user.email.includes('manager') ? 'Manager123!' :
                        user.email.includes('broker') ? 'Broker123!' : 'Demo123!';

        const credentials: LoginCredentials = {
            email: user.email,
            password,
            rememberMe: true,
        };

        console.log(`🚀 Quick login as ${user.role}:`, user.email);

        try {
            await login(credentials);
            console.log('✅ Quick login successful - React-Admin will handle redirect');
            // React-Admin authProvider will handle redirect automatically
        } catch (quickError: any) {
            console.error('❌ Quick login failed:', quickError);
            
            // Try with simple demo password
            try {
                await login({ email: user.email, password: 'demo123', rememberMe: true });
                console.log('✅ Quick login fallback successful - React-Admin will handle redirect');
                // React-Admin authProvider will handle redirect automatically
            } catch (fallbackError: any) {
                console.error('❌ Quick login fallback failed:', fallbackError);
                setError(`Quick login as ${user.role} failed. Try manual login.`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (authMode === 'detecting') {
        console.log('🔍 DEBUG: Showing "detecting" mode screen');
        return (
            <StyledContainer>
                <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" style={{ marginTop: '16px' }}>
                        Detecting authentication mode...
                    </Typography>
                </Card>
            </StyledContainer>
        );
    }
    
    console.log('🔐 DEBUG: About to render login form for authMode:', authMode);

    const getModeTitle = () => {
        switch (authMode) {
            case 'demo': return 'Demo Mode';
            case 'jwt': return 'JWT Authentication';
            case 'supabase': return 'Supabase Authentication';
            default: return 'Authentication';
        }
    };

    const getModeColor = () => {
        switch (authMode) {
            case 'demo': return '#ff9800';
            case 'jwt': return '#2196f3';
            case 'supabase': return '#4caf50';
            default: return '#666';
        }
    };

    return (
        <ErrorBoundary>
            <StyledContainer>
                <StyledCard>
                    <CardContent style={{ padding: '40px' }}>
                        <div className={`${PREFIX}-header`}>
                            <div className={`${PREFIX}-logo`}>🍽️</div>
                            <Typography variant="h4" component="h1" className={`${PREFIX}-title`}>
                                ForkFlow CRM
                            </Typography>
                            <Typography 
                                variant="subtitle1" 
                                className={`${PREFIX}-subtitle`}
                                style={{ color: getModeColor() }}
                            >
                                {getModeTitle()}
                            </Typography>
                        </div>

                        {error && (
                            <Alert severity="error" style={{ marginBottom: '20px' }}>
                                {error}
                            </Alert>
                        )}

                        {authMode === 'demo' && (
                            <Alert severity="info" style={{ marginBottom: '20px' }}>
                                <strong>Demo Mode Active</strong><br />
                                Use any credentials or quick login buttons below.
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className={`${PREFIX}-form`}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant="outlined"
                                autoComplete="email"
                                disabled={loading}
                                inputProps={{
                                    style: { fontSize: isMobile ? '16px' : '14px' }
                                }}
                            />
                            
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined"
                                autoComplete="current-password"
                                disabled={loading}
                                inputProps={{
                                    style: { fontSize: isMobile ? '16px' : '14px' }
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                        disabled={loading}
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Remember me
                                        {isMobile && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Recommended for field use
                                            </Typography>
                                        )}
                                    </Typography>
                                }
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                className={`${PREFIX}-loginButton`}
                                fullWidth
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {authMode === 'demo' && (
                            <>
                                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', margin: '16px 0 8px 0', color: '#666' }}>
                                    Quick Demo Login:
                                </Typography>
                                <div className={`${PREFIX}-quickLogin`}>
                                    {DEMO_USERS.map((user) => (
                                        <Button
                                            key={user.email}
                                            variant="outlined"
                                            size="small"
                                            disabled={loading}
                                            onClick={() => handleQuickLogin(user)}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            {user.label}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className={`${PREFIX}-status`}>
                            <Typography variant="body2" style={{ fontWeight: 'bold', color: getModeColor() }}>
                                Status: {getModeTitle()}
                            </Typography>
                            {authMode === 'demo' && (
                                <Typography variant="caption" display="block" style={{ marginTop: '4px' }}>
                                    ✅ No white screen • ✅ Error boundaries • ✅ Universal login
                                </Typography>
                            )}
                        </div>
                    </CardContent>
                </StyledCard>
            </StyledContainer>
        </ErrorBoundary>
    );
};