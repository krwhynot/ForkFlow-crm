// src/users/UserEdit.tsx
import React, { useState, useEffect } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    required,
    email,
    minLength,
    useNotify,
    SaveButton,
    Toolbar,
    FormDataConsumer,
    useRecordContext,
    DeleteButton,
    ShowButton,
    TopToolbar,
    ListButton,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    Stack,
    Alert,
    Chip,
    Button,
    Divider,
} from '@/components/ui-kit';
import {
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Security as SecurityIcon,
    History as HistoryIcon,
    VpnKey as VpnKeyIcon,
} from '@mui/icons-material';

import { User, UserRole } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { TerritoryDisplay } from '../components/TerritoryDisplay';
import { validateTerritory } from '../utils/territoryFilter';
import { useBreakpoint } from '../hooks/useBreakpoint';

const roleChoices = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'broker', name: 'Broker' },
];

export const UserEdit = () => {
    const isMobile = useBreakpoint('sm');

    return (
        <Edit
            title={<UserEditTitle />}
            actions={<UserEditActions />}
            className={`${isMobile ? 'w-full' : 'max-w-5xl mx-auto'}`}
        >
            <UserEditForm />
        </Edit>
    );
};

const UserEditTitle = () => {
    const record = useRecordContext<User>();
    if (!record) return null;

    return (
        <span>
            Edit User: {record.firstName} {record.lastName}
        </span>
    );
};

const UserEditActions = () => (
    <TopToolbar>
        <ShowButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const UserEditForm = () => {
    const record = useRecordContext<User>();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        record?.avatar?.src || null
    );
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [territory, setTerritory] = useState<string[]>(
        typeof record?.territory === 'string'
            ? [record.territory]
            : record?.territory || []
    );
    const [principals, setPrincipals] = useState<string[]>([]);
    const [newTerritory, setNewTerritory] = useState('');
    const [newPrincipal, setNewPrincipal] = useState('');

    const notify = useNotify();
    const isMobile = useBreakpoint('sm');

    // Update local state when record changes
    useEffect(() => {
        if (record) {
            setAvatarPreview(record.avatar?.src || null);
            setTerritory(
                typeof record.territory === 'string'
                    ? [record.territory]
                    : record.territory || []
            );
            setPrincipals([]);
        }
    }, [record]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                notify('File size must be less than 5MB', { type: 'error' });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                notify('Please select an image file', { type: 'error' });
                return;
            }

            setAvatarFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = e => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleAddTerritory = () => {
        if (newTerritory.trim() && !territory.includes(newTerritory.trim())) {
            const validation = validateTerritory([
                ...territory,
                newTerritory.trim(),
            ]);
            if (!validation.isValid) {
                notify(validation.errors[validation.errors.length - 1], {
                    type: 'error',
                });
                return;
            }

            setTerritory([...territory, newTerritory.trim()]);
            setNewTerritory('');
        }
    };

    const handleRemoveTerritory = (territoryToRemove: string) => {
        setTerritory(territory.filter(t => t !== territoryToRemove));
    };

    const handleAddPrincipal = () => {
        if (newPrincipal.trim() && !principals.includes(newPrincipal.trim())) {
            setPrincipals([...principals, newPrincipal.trim()]);
            setNewPrincipal('');
        }
    };

    const handleRemovePrincipal = (principalToRemove: string) => {
        setPrincipals(principals.filter(p => p !== principalToRemove));
    };

    const handleResetPassword = () => {
        // This would trigger a password reset email
        notify('Password reset email will be sent to user', { type: 'info' });
    };

    const transform = (data: any) => {
        const transformedData = {
            ...data,
            territory,
            principals,
            updatedAt: new Date().toISOString(),
        };

        if (avatarFile) {
            transformedData.avatar = avatarFile;
        } else if (avatarPreview === null) {
            transformedData.avatar = null;
        }

        return transformedData;
    };

    if (!record) return null;

    return (
        <SimpleForm toolbar={<UserEditToolbar />} className="max-w-none">
            {/* User Status Overview */}
            <Card className="mb-6 w-full">
                <CardContent>
                    <Box className="flex items-center gap-4 mb-4">
                        <Avatar
                            src={avatarPreview || undefined}
                            className="w-15 h-15 text-xl"
                        >
                            {record.firstName?.[0]}
                            {record.lastName?.[0]}
                        </Avatar>
                        <Box className="flex-1">
                            <Typography variant="h6">
                                {record.firstName} {record.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {record.email}
                            </Typography>
                            <Box className="flex gap-2 mt-2">
                                <RoleChip
                                    role={record.role || 'user'}
                                    size="small"
                                />
                                <Chip
                                    label={
                                        record.administrator
                                            ? 'Active'
                                            : 'Inactive'
                                    }
                                    className={
                                        record.administrator
                                            ? 'border-green-500 text-green-500'
                                            : 'border-red-500 text-red-500'
                                    }
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Box>

                    {record.updatedAt && (
                        <Typography variant="body2" color="text.secondary">
                            Last login:{' '}
                            {new Date(record.updatedAt).toLocaleDateString()} at{' '}
                            {new Date(record.updatedAt).toLocaleTimeString()}
                        </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Account created:{' '}
                        {new Date(record.createdAt || '').toLocaleDateString()}
                    </Typography>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="mb-6 w-full">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>

                    {/* Avatar Section */}
                    <Box className="flex items-center gap-4 mb-6">
                        <Avatar
                            src={avatarPreview || undefined}
                            className={`${
                                isMobile
                                    ? 'w-20 h-20 text-2xl'
                                    : 'w-25 h-25 text-3xl'
                            }`}
                        >
                            {record.firstName?.[0]}
                            {record.lastName?.[0]}
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
                                    className="text-blue-600 min-h-11 min-w-11"
                                    aria-label="upload picture"
                                >
                                    <PhotoCameraIcon />
                                </IconButton>
                            </label>
                            {avatarPreview && (
                                <IconButton
                                    className="text-red-600 min-h-11 min-w-11"
                                    onClick={handleRemoveAvatar}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Stack>
                    </Box>

                    {/* Name Fields */}
                    <Stack
                        direction={isMobile ? 'column' : 'row'}
                        spacing={2}
                        className="mb-6"
                    >
                        <TextInput
                            source="firstName"
                            label="First Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            className="text-base"
                            inputProps={{
                                style: {
                                    fontSize: isMobile ? '16px' : '14px',
                                },
                            }}
                        />
                        <TextInput
                            source="lastName"
                            label="Last Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            className="text-base"
                            inputProps={{
                                style: {
                                    fontSize: isMobile ? '16px' : '14px',
                                },
                            }}
                        />
                    </Stack>

                    {/* Email */}
                    <TextInput
                        source="email"
                        label="Email Address"
                        validate={[required(), email()]}
                        fullWidth
                        helperText="Changing email will require user verification"
                        className="mb-6 text-base"
                        inputProps={{
                            style: {
                                fontSize: isMobile ? '16px' : '14px',
                            },
                        }}
                    />

                    {/* Role Selection */}
                    <SelectInput
                        source="role"
                        label="Role"
                        choices={roleChoices}
                        validate={[required()]}
                        fullWidth
                        helperText="Changing role will affect user permissions immediately"
                        className="mb-6"
                    />

                    {/* Active Status */}
                    <BooleanInput
                        source="administrator"
                        label="Active User"
                        helperText="Inactive users cannot log in"
                        className="mb-4"
                    />
                </CardContent>
            </Card>

            {/* Security Management */}
            <Card className="mb-6 w-full">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <SecurityIcon className="mr-2 align-middle" />
                        Security Management
                    </Typography>

                    <Box className="flex gap-4 flex-wrap">
                        <Button
                            variant="outlined"
                            startIcon={<VpnKeyIcon />}
                            onClick={handleResetPassword}
                            className="min-h-11"
                        >
                            Send Password Reset
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            className="min-h-11"
                        >
                            View Login History
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        className="mt-4"
                    >
                        Password reset emails will be sent to the user's current
                        email address.
                    </Typography>
                </CardContent>
            </Card>

            <FormDataConsumer>
                {({ formData }) =>
                    formData.role === 'broker' && (
                        <>
                            {/* Territory Management */}
                            <Card className="mb-6 w-full">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Sales Territory
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph
                                    >
                                        Manage territories for this broker. Use
                                        state codes (CA, NY), cities (Los
                                        Angeles), or ZIP codes (90210).
                                    </Typography>

                                    <Box className="flex gap-2 mb-4 flex-wrap items-center">
                                        <input
                                            type="text"
                                            placeholder="Add Territory"
                                            value={newTerritory}
                                            onChange={e =>
                                                setNewTerritory(e.target.value)
                                            }
                                            onKeyPress={e =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleAddTerritory())
                                            }
                                            className={`px-3 py-2 border border-gray-300 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isMobile ? 'text-base' : 'text-sm'
                                            }`}
                                        />
                                        <IconButton
                                            onClick={handleAddTerritory}
                                            className="text-blue-600 min-h-11 min-w-11"
                                            disabled={!newTerritory.trim()}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    <Box className="flex gap-2 flex-wrap mb-4">
                                        {territory.map(area => (
                                            <Chip
                                                key={area}
                                                label={area}
                                                onDelete={() =>
                                                    handleRemoveTerritory(area)
                                                }
                                                className="border-blue-500 text-blue-500"
                                            />
                                        ))}
                                        {territory.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                No territories assigned
                                            </Typography>
                                        )}
                                    </Box>

                                    {territory.length > 0 && (
                                        <TerritoryDisplay
                                            territory={territory}
                                            showTooltip={true}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Principals Management */}
                            <Card className="mb-6 w-full">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Principals/Brands
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph
                                    >
                                        Manage specific food service principals
                                        or brands this broker represents.
                                    </Typography>

                                    <Box className="flex gap-2 mb-4 flex-wrap items-center">
                                        <input
                                            type="text"
                                            placeholder="Add Principal"
                                            value={newPrincipal}
                                            onChange={e =>
                                                setNewPrincipal(e.target.value)
                                            }
                                            onKeyPress={e =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleAddPrincipal())
                                            }
                                            className={`px-3 py-2 border border-gray-300 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isMobile ? 'text-base' : 'text-sm'
                                            }`}
                                        />
                                        <IconButton
                                            onClick={handleAddPrincipal}
                                            className="text-blue-600 min-h-11 min-w-11"
                                            disabled={!newPrincipal.trim()}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    <Box className="flex gap-2 flex-wrap">
                                        {principals.map(principal => (
                                            <Chip
                                                key={principal}
                                                label={principal}
                                                onDelete={() =>
                                                    handleRemovePrincipal(
                                                        principal
                                                    )
                                                }
                                                className="border-gray-500 text-gray-600"
                                            />
                                        ))}
                                        {principals.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                No principals assigned
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </>
                    )
                }
            </FormDataConsumer>
        </SimpleForm>
    );
};

const UserEditToolbar = () => (
    <Toolbar className="flex justify-between">
        <SaveButton variant="contained" className="min-h-12 px-8" />
        <DeleteButton
            confirmTitle="Delete User"
            confirmContent="Are you sure you want to delete this user? This action cannot be undone."
        />
    </Toolbar>
);
