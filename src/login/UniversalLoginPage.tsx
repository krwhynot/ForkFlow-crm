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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useLogin();
    const notify = useNotify();
    const { authenticated } = useAuthState();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



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


        try {
            await login(credentials);
            // React-Admin authProvider will handle redirect automatically
        } catch (loginError: any) {
            setError(loginError?.message || 'Login failed. Please check your credentials.');
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


        try {
            await login(credentials);
            // React-Admin authProvider will handle redirect automatically
        } catch (quickError: any) {
            setError(`Quick login as ${user.role} failed. Try manual login.`);
        } finally {
            setLoading(false);
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
                            >
                                Food Broker CRM
                            </Typography>
                        </div>

                        {error && (
                            <Alert severity="error" style={{ marginBottom: '20px' }}>
                                {error}
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


                    </CardContent>
                </StyledCard>
            </StyledContainer>
        </ErrorBoundary>
    );
};
