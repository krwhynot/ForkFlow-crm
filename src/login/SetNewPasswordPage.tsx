/**
 * Set New Password Page
 * Allows users to set a new password after clicking the reset link
 */

import React from 'react';
import {
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    Alert,
    Box,
} from '@/components/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useDataProvider, useLogin, useNotify } from 'react-admin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
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
    const isMobile = useBreakpoint('sm');
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
            <Stack className="h-screen p-4">
                <Stack
                    direction="row"
                    spacing={2}
                    className="items-center mb-4"
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
                <Stack className="h-full">
                    <div className="max-w-sm mx-auto h-full flex flex-col justify-center gap-4">
                        <Box className="text-center mb-4">
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                component="h1"
                                className="font-semibold mb-2"
                            >
                                Password Updated!
                            </Typography>
                            <Typography
                                variant="body1"
                                className="text-gray-600 mb-2"
                            >
                                Your password has been successfully updated.
                            </Typography>
                        </Box>

                        <Alert severity="success" className="mb-4">
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
                            className="min-h-12 text-lg font-semibold"
                        >
                            Continue to Sign In
                        </Button>
                    </div>
                </Stack>
            </Stack>
        );
    }

    return (
        <Stack className="h-screen p-4">
            <Stack direction="row" spacing={2} className="items-center mb-4">
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
            <Stack className="h-full">
                <div className="max-w-sm mx-auto h-full flex flex-col justify-center gap-4">
                    <Box className="text-center mb-4">
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            component="h1"
                            className="font-semibold mb-2"
                        >
                            Set New Password
                        </Typography>
                        <Typography
                            variant="body1"
                            className="text-gray-600 mb-2"
                        >
                            Choose a strong password for your account.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" className="mb-4">
                            {error instanceof Error
                                ? error.message
                                : 'An error occurred while updating your password'}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
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
                            fullWidth
                            autoComplete="new-password"
                            autoFocus={!isMobile}
                            error={!!errors.newPassword}
                            helperText={
                                errors.newPassword?.message ||
                                'Minimum 8 characters with uppercase, lowercase, and number'
                            }
                            className={isMobile ? 'text-base' : 'text-sm'}
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
                            fullWidth
                            autoComplete="new-password"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            className={isMobile ? 'text-base' : 'text-sm'}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={!isValid || isPending}
                            fullWidth
                            className="mt-4 min-h-12 text-lg font-semibold"
                        >
                            {isPending ? (
                                <CircularProgress size="small" />
                            ) : (
                                'Update Password'
                            )}
                        </Button>

                        <Typography
                            variant="body2"
                            className="text-gray-600 text-center mt-4"
                        >
                            Remember your password?{' '}
                            <Typography
                                component={Link}
                                to="/login"
                                variant="body2"
                                className="text-blue-600 no-underline hover:underline"
                            >
                                Back to Sign In
                            </Typography>
                        </Typography>
                    </Box>
                </div>
            </Stack>
        </Stack>
    );
};

SetNewPasswordPage.path = '/set-password';
