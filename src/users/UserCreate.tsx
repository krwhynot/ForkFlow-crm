// src/users/UserCreate.tsx
import React, { useState } from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    required,
    email,
    minLength,
    useNotify,
    useRedirect,
    SaveButton,
    Toolbar,
    useCreate,
    FormDataConsumer,
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
    TextField,
    Button,
} from '@mui/material';
import {
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon,
} from '@mui/icons-material';

import { UserRole, User } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { validateTerritory } from '../utils/territoryFilter';
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
        password += charset.charAt(
            Math.floor(Math.random() * charset.length)
        );
    }
    return password;
};

export const UserCreate = () => {
    const isMobile = useBreakpoint('sm');

    return (
        <Create
            title="Create New User"
            redirect="list"
            sx={{
                '& .RaCreate-main': {
                    maxWidth: isMobile ? '100%' : 800,
                    margin: '0 auto',
                },
            }}
        >
            <UserCreateForm />
        </Create>
    );
};

const UserCreateForm = () => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [territory, setTerritory] = useState<string[]>([]);
    const [principals, setPrincipals] = useState<string[]>([]);
    const [newTerritory, setNewTerritory] = useState('');
    const [newPrincipal, setNewPrincipal] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const notify = useNotify();
    const redirect = useRedirect();
    const isMobile = useBreakpoint('sm');

    const handleAvatarChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
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
            reader.onload = (e) => {
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
        if (
            newTerritory.trim() &&
            !territory.includes(newTerritory.trim())
        ) {
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
        setTerritory(territory.filter((t) => t !== territoryToRemove));
    };

    const handleAddPrincipal = () => {
        if (
            newPrincipal.trim() &&
            !principals.includes(newPrincipal.trim())
        ) {
            setPrincipals([...principals, newPrincipal.trim()]);
            setNewPrincipal('');
        }
    };

    const handleRemovePrincipal = (principalToRemove: string) => {
        setPrincipals(principals.filter((p) => p !== principalToRemove));
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
            territory,
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
        <SimpleForm
            toolbar={<UserCreateToolbar />}
            sx={{ maxWidth: 'none' }}
        >
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>

                    {/* Avatar Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <Avatar
                            src={avatarPreview || undefined}
                            sx={{
                                width: isMobile ? 80 : 100,
                                height: isMobile ? 80 : 100,
                                fontSize: isMobile ? '2rem' : '2.5rem',
                            }}
                        >
                            <PersonIcon fontSize="large" />
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
                                    <PhotoCameraIcon />
                                </IconButton>
                            </label>
                            {avatarPreview && (
                                <IconButton
                                    color="error"
                                    onClick={handleRemoveAvatar}
                                    sx={{ minHeight: 44, minWidth: 44 }}
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
                        sx={{ mb: 3 }}
                    >
                        <TextInput
                            source="firstName"
                            label="First Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontSize: isMobile ? '16px' : '14px',
                                },
                            }}
                        />
                        <TextInput
                            source="lastName"
                            label="Last Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            sx={{
                                '& .MuiInputBase-input': {
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
                        sx={{
                            mb: 3,
                            '& .MuiInputBase-input': {
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
                        sx={{ mb: 3 }}
                    />

                    <FormDataConsumer>
                        {({ formData }) => (
                            <Box sx={{ mb: 3 }}>
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
                        sx={{ mb: 2 }}
                    />
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Password Setup
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        A secure password will be generated automatically. The
                        user will be able to change it after first login.
                    </Alert>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleGeneratePassword}
                            sx={{ minHeight: 44 }}
                        >
                            Generate Password
                        </Button>
                        {password && showPassword && (
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: 'monospace',
                                    bgcolor: 'background.paper',
                                    p: 1,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                {password}
                            </Typography>
                        )}
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        The generated password will be sent to the user via
                        email.
                    </Typography>
                </CardContent>
            </Card>

            <FormDataConsumer>
                {({ formData }) =>
                    formData.role === 'broker' && (
                        <>
                            {/* Territory Management */}
                            <Card sx={{ mb: 3, width: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Sales Territory
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph
                                    >
                                        Assign territories for this broker. Use
                                        state codes (CA, NY), cities (Los
                                        Angeles), or ZIP codes (90210).
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            mb: 2,
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <TextField
                                            label="Add Territory"
                                            value={newTerritory}
                                            onChange={(e) =>
                                                setNewTerritory(e.target.value)
                                            }
                                            size="small"
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleAddTerritory())
                                            }
                                            inputProps={{
                                                style: {
                                                    fontSize: isMobile
                                                        ? '16px'
                                                        : '14px',
                                                },
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleAddTerritory}
                                            color="primary"
                                            disabled={!newTerritory.trim()}
                                            sx={{
                                                minHeight: 44,
                                                minWidth: 44,
                                            }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {territory.map((area) => (
                                            <Chip
                                                key={area}
                                                label={area}
                                                onDelete={() =>
                                                    handleRemoveTerritory(area)
                                                }
                                                color="primary"
                                                variant="outlined"
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
                                </CardContent>
                            </Card>

                            {/* Principals Management */}
                            <Card sx={{ mb: 3, width: '100%' }}>
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

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            mb: 2,
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <TextField
                                            label="Add Principal"
                                            value={newPrincipal}
                                            onChange={(e) =>
                                                setNewPrincipal(e.target.value)
                                            }
                                            size="small"
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                (e.preventDefault(),
                                                handleAddPrincipal())
                                            }
                                            inputProps={{
                                                style: {
                                                    fontSize: isMobile
                                                        ? '16px'
                                                        : '14px',
                                                },
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleAddPrincipal}
                                            color="primary"
                                            disabled={!newPrincipal.trim()}
                                            sx={{
                                                minHeight: 44,
                                                minWidth: 44,
                                            }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {principals.map((principal) => (
                                            <Chip
                                                key={principal}
                                                label={principal}
                                                onDelete={() =>
                                                    handleRemovePrincipal(
                                                        principal
                                                    )
                                                }
                                                color="secondary"
                                                variant="outlined"
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
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <SaveButton
            variant="contained"
            sx={{ minHeight: 48, px: 4 }}
        />
    </Toolbar>
);
