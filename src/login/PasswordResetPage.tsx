/**
 * Password Reset Request Page
 * Allows users to request a password reset email
 */

import React from 'react';
import { Button, CircularProgress, Container, Stack, TextField, Typography, Alert, Box } from '@/components/ui-kit';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useMutation } from '@tanstack/react-query';
import { useDataProvider, useNotify } from 'react-admin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CrmDataProvider } from '../providers/types';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { PasswordResetRequest } from '../types';

export const PasswordResetPage = () => {
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { logo, title } = useConfigurationContext();
    const { isMobile } = useBreakpoint();
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
                                Check Your Email
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                gutterBottom
                            >
                                We've sent password reset instructions to your
                                email address.
                            </Typography>
                        </Box>

                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Email Sent!</strong>
                                <br />
                                If an account with that email exists, you'll
                                receive reset instructions within a few minutes.
                            </Typography>
                        </Alert>

                        <Stack spacing={2}>
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
                                Back to Sign In
                            </Button>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                            >
                                Didn't receive the email?{' '}
                                <Typography
                                    component="button"
                                    onClick={() => window.location.reload()}
                                    variant="body2"
                                    color="primary"
                                    sx={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        '&:hover': { textDecoration: 'none' },
                                    }}
                                >
                                    Try again
                                </Typography>
                            </Typography>
                        </Stack>
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
                            Reset Your Password
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            gutterBottom
                        >
                            Enter your email address and we'll send you
                            instructions to reset your password.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error instanceof Error
                                ? error.message
                                : 'An error occurred while sending the reset email'}
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
                            variant="outlined"
                            fullWidth
                            autoComplete="email"
                            inputMode="email"
                            autoFocus={!isMobile}
                            error={!!errors.email}
                            helperText={errors.email?.message}
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
                                'Send Reset Instructions'
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

PasswordResetPage.path = '/forgot-password';
