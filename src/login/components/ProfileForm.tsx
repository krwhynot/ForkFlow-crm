/**
 * Profile Form Component
 * Allows users to update their basic profile information
 */

import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Avatar,
    Stack,
    Typography,
    IconButton,
    Chip,
    Alert,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from '@mui/material';
import { PhotoCamera, Delete, Add } from '@mui/icons-material';
import { useDataProvider } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { CrmDataProvider } from '../../providers/types';
import { User, UserProfileUpdate } from '../../types';

interface ProfileFormProps {
    user: User;
    onSuccess: () => void;
}

interface ProfileFormData {
    firstName: string;
    lastName: string;
    avatar?: File | string;
    territory: string[];
    principals: string[];
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSuccess }) => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const [newTerritory, setNewTerritory] = useState('');
    const [newPrincipal, setNewPrincipal] = useState('');
    const dataProvider = useDataProvider<CrmDataProvider>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
    } = useForm<ProfileFormData>({
        mode: 'onChange',
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            territory: user.territory || [],
            principals: user.principals || [],
        },
    });

    const watchedTerritory = watch('territory');
    const watchedPrincipals = watch('principals');

    const { isPending, mutate, error } = useMutation({
        mutationKey: ['update-profile'],
        mutationFn: async (data: UserProfileUpdate) => {
            // Use the authentication API to update user profile
            if ('updateUser' in dataProvider) {
                return await (dataProvider as any).updateUser(user.id, data);
            }
            throw new Error('Profile update not supported');
        },
        onSuccess: () => {
            onSuccess();
        },
        onError: (error: any) => {
            console.error('Profile update failed:', error);
        },
    });

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            setValue('avatar', file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setValue('avatar', undefined);
        setAvatarPreview(null);
    };

    const handleAddTerritory = () => {
        if (newTerritory.trim() && !watchedTerritory.includes(newTerritory.trim())) {
            setValue('territory', [...watchedTerritory, newTerritory.trim()]);
            setNewTerritory('');
        }
    };

    const handleRemoveTerritory = (territoryToRemove: string) => {
        setValue('territory', watchedTerritory.filter(t => t !== territoryToRemove));
    };

    const handleAddPrincipal = () => {
        if (newPrincipal.trim() && !watchedPrincipals.includes(newPrincipal.trim())) {
            setValue('principals', [...watchedPrincipals, newPrincipal.trim()]);
            setNewPrincipal('');
        }
    };

    const handleRemovePrincipal = (principalToRemove: string) => {
        setValue('principals', watchedPrincipals.filter(p => p !== principalToRemove));
    };

    const onSubmit = (data: ProfileFormData) => {
        const updateData: UserProfileUpdate = {
            firstName: data.firstName,
            lastName: data.lastName,
            territory: data.territory,
            principals: data.principals,
        };

        if (data.avatar instanceof File) {
            updateData.avatar = data.avatar;
        }

        mutate(updateData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>

                {error && (
                    <Alert severity="error">
                        {error instanceof Error ? error.message : 'Failed to update profile'}
                    </Alert>
                )}

                {/* Avatar Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={avatarPreview || undefined}
                        sx={{ 
                            width: isMobile ? 80 : 100, 
                            height: isMobile ? 80 : 100,
                            fontSize: isMobile ? '2rem' : '2.5rem'
                        }}
                    >
                        {user.firstName[0]}{user.lastName[0]}
                    </Avatar>
                    <Stack>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarChange}
                        />
                        <label htmlFor="avatar-upload">
                            <IconButton 
                                color="primary" 
                                aria-label="upload picture" 
                                component="span"
                                sx={{ minHeight: 44, minWidth: 44 }}
                            >
                                <PhotoCamera />
                            </IconButton>
                        </label>
                        {avatarPreview && (
                            <IconButton 
                                color="error" 
                                onClick={handleRemoveAvatar}
                                sx={{ minHeight: 44, minWidth: 44 }}
                            >
                                <Delete />
                            </IconButton>
                        )}
                    </Stack>
                </Box>

                {/* Name Fields */}
                <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <TextField
                        {...register('firstName', { 
                            required: 'First name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' }
                        })}
                        label="First Name"
                        fullWidth
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        inputProps={{
                            style: { fontSize: isMobile ? '16px' : '14px' }
                        }}
                    />
                    <TextField
                        {...register('lastName', { 
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                        })}
                        label="Last Name"
                        fullWidth
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        inputProps={{
                            style: { fontSize: isMobile ? '16px' : '14px' }
                        }}
                    />
                </Stack>

                {/* Email (Read-only) */}
                <TextField
                    label="Email"
                    value={user.email}
                    fullWidth
                    disabled
                    helperText="Email cannot be changed"
                    inputProps={{
                        style: { fontSize: isMobile ? '16px' : '14px' }
                    }}
                />

                {/* Role (Read-only) */}
                <TextField
                    label="Role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    fullWidth
                    disabled
                    helperText="Role is assigned by administrators"
                    inputProps={{
                        style: { fontSize: isMobile ? '16px' : '14px' }
                    }}
                />

                {/* Territory Management */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Sales Territory
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label="Add Territory"
                            value={newTerritory}
                            onChange={(e) => setNewTerritory(e.target.value)}
                            size="small"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTerritory())}
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' }
                            }}
                        />
                        <IconButton 
                            onClick={handleAddTerritory} 
                            color="primary"
                            disabled={!newTerritory.trim()}
                            sx={{ minHeight: 44, minWidth: 44 }}
                        >
                            <Add />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {watchedTerritory.map((territory) => (
                            <Chip
                                key={territory}
                                label={territory}
                                onDelete={() => handleRemoveTerritory(territory)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                        {watchedTerritory.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No territories assigned
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Principals Management */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Principals/Brands
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label="Add Principal"
                            value={newPrincipal}
                            onChange={(e) => setNewPrincipal(e.target.value)}
                            size="small"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrincipal())}
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' }
                            }}
                        />
                        <IconButton 
                            onClick={handleAddPrincipal} 
                            color="primary"
                            disabled={!newPrincipal.trim()}
                            sx={{ minHeight: 44, minWidth: 44 }}
                        >
                            <Add />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {watchedPrincipals.map((principal) => (
                            <Chip
                                key={principal}
                                label={principal}
                                onDelete={() => handleRemovePrincipal(principal)}
                                color="secondary"
                                variant="outlined"
                            />
                        ))}
                        {watchedPrincipals.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No principals assigned
                            </Typography>
                        )}
                    </Box>
                </Box>

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
                        'Update Profile'
                    )}
                </Button>
            </Stack>
        </Box>
    );
};