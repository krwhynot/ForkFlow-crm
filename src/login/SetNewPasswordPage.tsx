/**
 * Set New Password Page
 * Allows users to set a new password after clicking the reset link
 */

import React from 'react';
import {
    Button,
    CircularProgress,
    Container,
    Stack,
    TextField,
    Typography,
    Alert,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useDataProvider, useLogin, useNotify } from 'react-admin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { CrmDataProvider } from '../providers/types';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { PasswordResetConfirm, LoginCredentials } from '../types';

interface SetNewPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

export const SetNewPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { logo, title } = useConfigurationContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const notify = useNotify();
    const login = useLogin();

    // If no token is provided, redirect to password reset request page
    if (!token) {
        return <Navigate to="/forgot-password" replace />;
    }

    const { isPending, mutate, error, isSuccess } = useMutation({
        mutationKey: ['password-reset-confirm'],
        mutationFn: async (data: PasswordResetConfirm) => {
            // Use the authentication API to confirm password reset
            if ('confirmPasswordReset' in dataProvider) {
                return (dataProvider as any).confirmPasswordReset(data);
            }
            throw new Error(
                'Password reset confirmation not supported by this data provider'
            );
        },
        onSuccess: async data => {
            notify('Password updated successfully! Signing you in...', {
                type: 'success',
            });

            // Attempt to auto-login the user with their new password
            try {
                const credentials: LoginCredentials = {
                    email: data.email,
                    password: getValues('newPassword'),
                    rememberMe: true,
                };
                await login(credentials);
            } catch (loginError) {
                console.error(
                    'Auto-login failed after password reset:',
                    loginError
                );
                notify(
                    'Password updated! Please log in with your new password.',
                    {
                        type: 'success',
                    }
                );
            }
        },
        onError: (error: any) => {
            const errorMessage =
                error?.message ||
                'Failed to update password. Please try again.';
            notify(errorMessage, { type: 'error' });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
        watch,
        getValues,
    } = useForm<SetNewPasswordFormData>({
        mode: 'onChange',
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Watch the new password for confirmation validation
    const newPassword = watch('newPassword');

    const onSubmit: SubmitHandler<SetNewPasswordFormData> = async data => {
        const resetData: PasswordResetConfirm = {
            token,
            newPassword: data.newPassword,
        };
        mutate(resetData);
    };

    if (isSuccess) {
        return (
            <Stack sx={{ height: '100dvh', p: 2 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{ mb: 2 }}
                >
                    <img
                        src={logo}
                        alt={title}
                        width={isMobile ? 20 : 24}
                        style={{ filter: 'invert(0.9)' }}
                    />
                    <Typography
                        component="span"
                        variant={isMobile ? 'h6' : 'h5'}
                    >
                        {title}
                    </Typography>
                </Stack>
                <Stack sx={{ height: '100%' }}>
                    <Container
                        maxWidth="xs"
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                component="h1"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                            >
                                Password Updated!
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                gutterBottom
                            >
                                Your password has been successfully updated.
                            </Typography>
                        </Box>

                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Success!</strong>
                                <br />
                                You're being signed in automatically with your
                                new password.
                            </Typography>
                        </Alert>

                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                                minHeight: 48,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                            }}
                        >
                            Continue to Sign In
                        </Button>
                    </Container>
                </Stack>
            </Stack>
        );
    }

    return (
        <Stack sx={{ height: '100dvh', p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <img
                    src={logo}
                    alt={title}
                    width={isMobile ? 20 : 24}
                    style={{ filter: 'invert(0.9)' }}
                />
                <Typography component="span" variant={isMobile ? 'h6' : 'h5'}>
                    {title}
                </Typography>
            </Stack>
            <Stack sx={{ height: '100%' }}>
                <Container
                    maxWidth="xs"
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h1"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                        >
                            Set New Password
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            gutterBottom
                        >
                            Choose a strong password for your account.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error instanceof Error
                                ? error.message
                                : 'An error occurred while updating your password'}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <TextField
                            {...register('newPassword', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message:
                                        'Password must be at least 8 characters',
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                    message:
                                        'Password must contain uppercase, lowercase, and number',
                                },
                            })}
                            label="New Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            autoComplete="new-password"
                            autoFocus={!isMobile}
                            error={!!errors.newPassword}
                            helperText={
                                errors.newPassword?.message ||
                                'Minimum 8 characters with uppercase, lowercase, and number'
                            }
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' },
                            }}
                        />

                        <TextField
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value =>
                                    value === newPassword ||
                                    'Passwords do not match',
                            })}
                            label="Confirm New Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            autoComplete="new-password"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={!isValid || isPending}
                            fullWidth
                            sx={{
                                mt: 2,
                                minHeight: 48,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                            }}
                        >
                            {isPending ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Update Password'
                            )}
                        </Button>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            Remember your password?{' '}
                            <Typography
                                component={Link}
                                to="/login"
                                variant="body2"
                                color="primary"
                                sx={{
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Back to Sign In
                            </Typography>
                        </Typography>
                    </Box>
                </Container>
            </Stack>
        </Stack>
    );
};

SetNewPasswordPage.path = '/set-password';
