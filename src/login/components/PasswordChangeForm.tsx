/**
 * Password Change Form Component
 * Allows users to change their current password
 */

import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Stack,
    Typography,
    Alert,
    IconButton,
    InputAdornment,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDataProvider } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { CrmDataProvider } from '../../providers/types';
import { User, PasswordChangeRequest } from '../../types';

interface PasswordChangeFormProps {
    user: User;
    onSuccess: () => void;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
    user,
    onSuccess,
}) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dataProvider = useDataProvider<CrmDataProvider>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
    } = useForm<PasswordFormData>({
        mode: 'onChange',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');

    const { isPending, mutate, error } = useMutation({
        mutationKey: ['change-password'],
        mutationFn: async (data: PasswordChangeRequest) => {
            // For now, we'll use the simple updatePassword method
            // In a real implementation, this would verify the current password first
            if ('authUpdatePassword' in dataProvider) {
                return await (dataProvider as any).authUpdatePassword(
                    data.newPassword
                );
            }
            throw new Error('Password change not supported');
        },
        onSuccess: () => {
            reset();
            onSuccess();
        },
        onError: (error: any) => {
            console.error('Password change failed:', error);
        },
    });

    const onSubmit = (data: PasswordFormData) => {
        const changeRequest: PasswordChangeRequest = {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        };
        mutate(changeRequest);
    };

    const toggleShowCurrentPassword = () =>
        setShowCurrentPassword(!showCurrentPassword);
    const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
    const toggleShowConfirmPassword = () =>
        setShowConfirmPassword(!showConfirmPassword);

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>
                    Change Password
                </Typography>

                <Alert severity="info">
                    <Typography variant="body2">
                        <strong>Password Requirements:</strong>
                        <br />
                        • At least 8 characters long
                        <br />
                        • Must contain uppercase and lowercase letters
                        <br />
                        • Must contain at least one number
                        <br />
                    </Typography>
                </Alert>

                {error && (
                    <Alert severity="error">
                        {error instanceof Error
                            ? error.message
                            : 'Failed to change password'}
                    </Alert>
                )}

                {/* Current Password */}
                <TextField
                    {...register('currentPassword', {
                        required: 'Current password is required',
                    })}
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="current-password"
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                    inputProps={{
                        style: { fontSize: isMobile ? '16px' : '14px' },
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowCurrentPassword}
                                    edge="end"
                                    sx={{ minHeight: 44, minWidth: 44 }}
                                >
                                    {showCurrentPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* New Password */}
                <TextField
                    {...register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                            message:
                                'Password must contain uppercase, lowercase, and number',
                        },
                    })}
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    inputProps={{
                        style: { fontSize: isMobile ? '16px' : '14px' },
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowNewPassword}
                                    edge="end"
                                    sx={{ minHeight: 44, minWidth: 44 }}
                                >
                                    {showNewPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Confirm New Password */}
                <TextField
                    {...register('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value =>
                            value === newPassword || 'Passwords do not match',
                    })}
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    inputProps={{
                        style: { fontSize: isMobile ? '16px' : '14px' },
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowConfirmPassword}
                                    edge="end"
                                    sx={{ minHeight: 44, minWidth: 44 }}
                                >
                                    {showConfirmPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!isValid || isPending}
                    sx={{
                        mt: 3,
                        minHeight: 48,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                    }}
                >
                    {isPending ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Change Password'
                    )}
                </Button>

                <Typography variant="body2" color="text.secondary">
                    <strong>Security Tip:</strong> Use a unique password that
                    you don't use anywhere else. Consider using a password
                    manager to generate and store strong passwords.
                </Typography>
            </Stack>
        </Box>
    );
};
