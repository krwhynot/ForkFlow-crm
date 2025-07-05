/**
 * Password Reset Request Page
 * Allows users to request a password reset email
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
import { useDataProvider, useNotify } from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CrmDataProvider } from '../providers/types';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { PasswordResetRequest } from '../types';

export const PasswordResetPage = () => {
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { logo, title } = useConfigurationContext();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const { isPending, mutate, error, isSuccess } = useMutation({
        mutationKey: ['password-reset'],
        mutationFn: async (data: PasswordResetRequest) => {
            // Use the authentication API to request password reset
            if ('requestPasswordReset' in dataProvider) {
                return (dataProvider as any).requestPasswordReset(data);
            }
            throw new Error(
                'Password reset not supported by this data provider'
            );
        },
        onSuccess: () => {
            notify(
                'Password reset email sent! Check your inbox for instructions.',
                {
                    type: 'success',
                }
            );
        },
        onError: (error: any) => {
            const errorMessage =
                error?.message ||
                'Failed to send password reset email. Please try again.';
            notify(errorMessage, { type: 'error' });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
    } = useForm<PasswordResetRequest>({
        mode: 'onChange',
        defaultValues: {
            email: '',
        },
    });

    const onSubmit: SubmitHandler<PasswordResetRequest> = async data => {
        mutate(data);
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
                                Check Your Email
                            </Typography>
                            <Typography
                                variant="body1"
                                className="text-gray-600 mb-2"
                            >
                                We've sent password reset instructions to your
                                email address.
                            </Typography>
                        </Box>

                        <Alert severity="success" className="mb-4">
                            <Typography variant="body2">
                                <strong>Email Sent!</strong>
                                <br />
                                If an account with that email exists, you'll
                                receive reset instructions within a few minutes.
                            </Typography>
                        </Alert>

                        <Stack spacing={4}>
                            <Button
                                component={Link}
                                to="/login"
                                variant="contained"
                                size="large"
                                fullWidth
                                className="min-h-12 text-lg font-semibold"
                            >
                                Back to Sign In
                            </Button>

                            <Typography
                                variant="body2"
                                className="text-gray-600 text-center"
                            >
                                Didn't receive the email?{' '}
                                <Typography
                                    component="button"
                                    onClick={() => window.location.reload()}
                                    variant="body2"
                                    className="border-0 bg-transparent cursor-pointer underline text-blue-600 hover:no-underline"
                                >
                                    Try again
                                </Typography>
                            </Typography>
                        </Stack>
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
                            Reset Your Password
                        </Typography>
                        <Typography
                            variant="body1"
                            className="text-gray-600 mb-2"
                        >
                            Enter your email address and we'll send you
                            instructions to reset your password.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" className="mb-4">
                            {error instanceof Error
                                ? error.message
                                : 'An error occurred while sending the reset email'}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <TextField
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message:
                                        'Please enter a valid email address',
                                },
                            })}
                            label="Email address"
                            type="email"
                            fullWidth
                            autoComplete="email"
                            inputMode="email"
                            autoFocus={!isMobile}
                            error={!!errors.email}
                            helperText={errors.email?.message}
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
                                'Send Reset Instructions'
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

PasswordResetPage.path = '/forgot-password';
