/**
 * Mobile-Optimized Login Form for Field Sales Representatives
 * Features: Remember Me, Touch-friendly UI, Quick Login Options
 */

import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Typography,
    FormControlLabel,
    Checkbox,
    Alert,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Form, useLogin, useNotify, useSafeSetState } from 'ra-core';
import { Login, TextInput } from 'react-admin';
import { SubmitHandler, FieldValues as RHFFieldValues } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { PasswordResetPage } from './PasswordResetPage';
import { LoginCredentials } from '../types';

const PREFIX = 'MobileLoginForm';

export const MobileLoginFormClasses = {
    content: `${PREFIX}-content`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
    rememberMe: `${PREFIX}-rememberMe`,
    quickLogin: `${PREFIX}-quickLogin`,
    mobileActions: `${PREFIX}-mobileActions`,
};

const StyledForm = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${MobileLoginFormClasses.content}`]: {
        width: '100%',
        maxWidth: 320,
        padding: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
        },
    },
    [`& .${MobileLoginFormClasses.button}`]: {
        marginTop: theme.spacing(2),
        minHeight: 48, // 44px minimum touch target + padding
        fontSize: '1.1rem',
        fontWeight: 600,
    },
    [`& .${MobileLoginFormClasses.icon}`]: {
        margin: theme.spacing(0.3),
    },
    [`& .${MobileLoginFormClasses.rememberMe}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        '& .MuiCheckbox-root': {
            minHeight: 44, // Touch-friendly checkbox
            minWidth: 44,
        },
    },
    [`& .${MobileLoginFormClasses.quickLogin}`]: {
        marginTop: theme.spacing(2),
        '& .MuiButton-root': {
            minHeight: 44,
            margin: theme.spacing(0.5),
        },
    },
    [`& .${MobileLoginFormClasses.mobileActions}`]: {
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        padding: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
    },
    // Enhanced mobile input styling
    '& .MuiTextField-root': {
        marginBottom: theme.spacing(2),
        '& .MuiInputBase-root': {
            minHeight: 48, // Touch-friendly inputs
            fontSize: '1rem',
            [theme.breakpoints.down('sm')]: {
                fontSize: '16px', // Prevents zoom on iOS
            },
        },
    },
}));

type FieldValues = RHFFieldValues;

interface QuickLoginUser {
    email: string;
    label: string;
    role: string;
}

const DEMO_USERS: QuickLoginUser[] = [
    { email: 'admin@forkflow.com', label: 'Admin Demo', role: 'admin' },
    { email: 'manager@forkflow.com', label: 'Manager Demo', role: 'manager' },
    { email: 'broker@forkflow.com', label: 'Broker Demo', role: 'broker' },
    { email: 'demo@forkflow.com', label: 'Quick Demo', role: 'broker' },
];

export const MobileLoginForm = () => {
    const [loading, setLoading] = useSafeSetState(false);
    const [rememberMe, setRememberMe] = React.useState(true); // Default to remember for mobile users
    const [showQuickLogin, setShowQuickLogin] = React.useState(false);
    const login = useLogin();
    const notify = useNotify();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Show demo users in development
    const isDevelopment = process.env.NODE_ENV === 'development';

    const submit: SubmitHandler<FieldValues> = values => {
        setLoading(true);
        const credentials: LoginCredentials = {
            email: values.email,
            password: values.password,
            rememberMe: rememberMe,
        };

        login(credentials)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                notify(
                    typeof error === 'string'
                        ? error
                        : typeof error === 'undefined' || !error.message
                          ? 'ra.auth.sign_in_error'
                          : error.message,
                    {
                        type: 'error',
                        messageArgs: {
                            _:
                                typeof error === 'string'
                                    ? error
                                    : error && error.message
                                      ? error.message
                                      : undefined,
                        },
                    }
                );
            });
    };

    const handleQuickLogin = (user: QuickLoginUser) => {
        setLoading(true);
        const credentials: LoginCredentials = {
            email: user.email,
            password: user.email.includes('admin') ? 'Admin123!' :
                      user.email.includes('manager') ? 'Manager123!' :
                      user.email.includes('broker') ? 'Broker123!' : 'Demo123!',
            rememberMe: true,
        };

        console.log('🚀 Quick login attempt:', { email: user.email, role: user.role });

        login(credentials)
            .then(() => {
                console.log('✅ Quick login successful');
                setLoading(false);
            })
            .catch(error => {
                console.error('❌ Quick login failed:', error);
                setLoading(false);
                notify(error?.message || 'Demo login failed - trying again...', { type: 'warning' });
                
                // Fallback: try with just email for demo mode
                login({ email: user.email, password: 'demo123' })
                    .then(() => {
                        console.log('✅ Fallback demo login successful');
                    })
                    .catch(fallbackError => {
                        console.error('❌ Fallback login failed:', fallbackError);
                        notify('Demo login failed. Please try manual login.', { type: 'error' });
                    });
            });
    };

    return (
        <Login>
            <StyledForm onSubmit={submit} mode="onChange" noValidate>
                <CardContent className={MobileLoginFormClasses.content}>
                    {isDevelopment && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Development Mode</strong><br />
                                Use quick login buttons below or enter test credentials manually.
                            </Typography>
                        </Alert>
                    )}

                    <TextInput
                        autoFocus={!isMobile} // Avoid auto-focus on mobile to prevent keyboard popup
                        source="email"
                        label="Email"
                        autoComplete="email"
                        inputMode="email"
                        fullWidth
                        variant="outlined"
                    />
                    <TextInput
                        source="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        fullWidth
                        variant="outlined"
                    />

                    <FormControlLabel
                        className={MobileLoginFormClasses.rememberMe}
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                                size={isMobile ? "medium" : "small"}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Keep me signed in
                                {isMobile && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Recommended for field use
                                    </Typography>
                                )}
                            </Typography>
                        }
                    />
                </CardContent>

                <CardActions className={MobileLoginFormClasses.mobileActions}>
                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                        fullWidth
                        size="large"
                        className={MobileLoginFormClasses.button}
                    >
                        {loading ? (
                            <CircularProgress
                                className={MobileLoginFormClasses.icon}
                                size={24}
                                thickness={3}
                                color="inherit"
                            />
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    {isDevelopment && (
                        <Box className={MobileLoginFormClasses.quickLogin}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                Quick Login (Development)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {DEMO_USERS.map((user) => (
                                    <Button
                                        key={user.email}
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                        onClick={() => handleQuickLogin(user)}
                                        sx={{
                                            minHeight: 44,
                                            fontSize: '0.875rem',
                                            textTransform: 'none',
                                        }}
                                    >
                                        {user.label}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Typography
                        component={Link}
                        to={PasswordResetPage.path}
                        variant="body2"
                        color="primary"
                        sx={{
                            textDecoration: 'none',
                            minHeight: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Forgot your password?
                    </Typography>
                </CardActions>
            </StyledForm>
        </Login>
    );
};