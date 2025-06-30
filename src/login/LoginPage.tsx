import { useQuery } from '@tanstack/react-query';
import { useDataProvider, useAuthState } from 'react-admin';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Typography } from '@mui/material';
import { CrmDataProvider } from '../providers/types';
import { LoginForm } from './LoginForm';
import { LoginSkeleton } from './LoginSkeleton';
import { MobileLoginForm } from './MobileLoginForm';

export const LoginPage = () => {
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { isLoading: authLoading, authenticated } = useAuthState();
    
    // Detect JWT auth mode
    const isJWTMode = typeof window !== 'undefined' && (
        window.location.search.includes('auth=jwt') ||
        localStorage.getItem('auth-provider') === 'jwt' ||
        process.env.REACT_APP_AUTH_PROVIDER === 'jwt'
    );
    
    const {
        data: isInitialized,
        error,
        isPending,
    } = useQuery({
        queryKey: ['init'],
        queryFn: async () => {
            try {
                return dataProvider.isInitialized();
            } catch (err) {
                console.warn('Failed to check initialization status:', err);
                return true; // Assume initialized on error
            }
        },
        retry: 2,
        retryDelay: 1000,
    });

    // If already authenticated, redirect to dashboard
    if (authenticated) {
        return <Navigate to="/" replace />;
    }

    // Show loading skeleton while checking auth or initialization
    if (isPending || authLoading) {
        return <LoginSkeleton />;
    }

    // If there's an error checking initialization, show login form with error
    if (error) {
        return (
            <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Connection Issue</strong><br />
                        Unable to verify system status. You can still try to log in.
                    </Typography>
                </Alert>
                {isJWTMode ? <MobileLoginForm /> : <LoginForm />}
            </Box>
        );
    }

    // If system is initialized, show appropriate login form
    if (isInitialized) {
        return isJWTMode ? <MobileLoginForm /> : <LoginForm />;
    }

    // If not initialized, redirect to signup for initial setup
    return <Navigate to="/sign-up" replace />;
};
