// src/users/UserCreate.tsx
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Typography,
} from '@/components/ui-kit';
import {
    PlusIcon as AddIcon,
    TrashIcon as DeleteIcon,
    UserIcon as PersonIcon,
    CameraIcon as PhotoCameraIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import {
    BooleanInput,
    Create,
    email,
    FormDataConsumer,
    minLength,
    required,
    SaveButton,
    SelectInput,
    SimpleForm,
    TextInput,
    Toolbar,
    useNotify,
    useRedirect
} from 'react-admin';

import { RoleChip } from '../components/auth/RoleChip';
import { UserRole } from '../types';

import { useBreakpoint } from '../hooks/useBreakpoint';

const roleChoices = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'broker', name: 'Broker' },
];

const generateRandomPassword = (): string => {
    const length = 12;
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export const UserCreate = () => {
    const isMobile = useBreakpoint('sm');

    return (
        <Create
            title="Create New User"
            redirect="list"
            className={`${isMobile ? 'w-full' : 'max-w-4xl mx-auto'}`}
        >
            <UserCreateForm />
        </Create>
    );
};

const UserCreateForm = () => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [principals, setPrincipals] = useState<string[]>([]);
    const [newPrincipal, setNewPrincipal] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const notify = useNotify();
    const redirect = useRedirect();
    const isMobile = useBreakpoint('sm');

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



    const handleAddPrincipal = () => {
        if (newPrincipal.trim() && !principals.includes(newPrincipal.trim())) {
            setPrincipals([...principals, newPrincipal.trim()]);
            setNewPrincipal('');
        }
    };

    const handleRemovePrincipal = (principalToRemove: string) => {
        setPrincipals(principals.filter(p => p !== principalToRemove));
    };

    const handleGeneratePassword = () => {
        const newPassword = generateRandomPassword();
        setPassword(newPassword);
        setShowPassword(true);
        notify('Password generated successfully', { type: 'success' });
    };

    const transform = (data: any) => {
        const transformedData = {
            ...data,
            principals,
            password: password || generateRandomPassword(),
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (avatarFile) {
            transformedData.avatar = avatarFile;
        }

        return transformedData;
    };

    return (
        <SimpleForm toolbar={<UserCreateToolbar />} className="max-w-none">
            <Card className="mb-6 w-full">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>

                    {/* Avatar Section */}
                    <Box className="flex items-center gap-4 mb-6">
                        <Avatar
                            src={avatarPreview || undefined}
                            className={`${isMobile
                                ? 'w-20 h-20 text-2xl'
                                : 'w-25 h-25 text-3xl'
                                }`}
                        >
                            <PersonIcon className="w-12 h-12" />
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
                                    <PhotoCameraIcon className="w-5 h-5" />
                                </IconButton>
                            </label>
                            {avatarPreview && (
                                <IconButton
                                    className="text-red-600 min-h-11 min-w-11"
                                    onClick={handleRemoveAvatar}
                                >
                                    <DeleteIcon className="w-5 h-5" />
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
                        className="mb-6"
                    />

                    <FormDataConsumer>
                        {({ formData }) => (
                            <Box className="mb-6">
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Selected Role:
                                </Typography>
                                {formData.role && (
                                    <RoleChip
                                        role={formData.role as UserRole}
                                    />
                                )}
                            </Box>
                        )}
                    </FormDataConsumer>

                    {/* Active Status */}
                    <BooleanInput
                        source="isActive"
                        label="Active User"
                        defaultValue={true}
                        className="mb-4"
                    />
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card className="mb-6 w-full">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Password Setup
                    </Typography>

                    <Alert variant="info" className="mb-6">
                        A secure password will be generated automatically. The
                        user will be able to change it after first login.
                    </Alert>

                    <Box className="flex gap-4 items-center mb-4">
                        <Button
                            variant="outlined"
                            onClick={handleGeneratePassword}
                            className="min-h-11"
                        >
                            Generate Password
                        </Button>
                        {password && showPassword && (
                            <Typography
                                variant="body2"
                                className="font-mono bg-white p-2 rounded border border-gray-300"
                            >
                                {password}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        The generated password will be sent to the user via
                        email.
                    </Typography>
                </CardContent>
            </Card>

            <FormDataConsumer>
                {({ formData }) =>
                    formData.role === 'broker' && (
                        <>


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
                                        Assign specific food service principals
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
                                            className={`px-3 py-2 border border-gray-300 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isMobile ? 'text-base' : 'text-sm'
                                                }`}
                                        />
                                        <IconButton
                                            onClick={handleAddPrincipal}
                                            className="text-blue-600 min-h-11 min-w-11"
                                            disabled={!newPrincipal.trim()}
                                        >
                                            <AddIcon className="w-5 h-5" />
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

const UserCreateToolbar = () => (
    <Toolbar className="flex justify-between">
        <SaveButton variant="contained" className="min-h-12 px-8" />
    </Toolbar>
);
