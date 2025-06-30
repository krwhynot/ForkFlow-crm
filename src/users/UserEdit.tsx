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
    TextField,
    Button,
    useMediaQuery,
    useTheme,
    Divider,
} from '@mui/material';
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

const roleChoices = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'broker', name: 'Broker' },
];

export const UserEdit = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Edit
            title={<UserEditTitle />}
            actions={<UserEditActions />}
            sx={{
                '& .RaEdit-main': {
                    maxWidth: isMobile ? '100%' : 900,
                    margin: '0 auto',
                },
            }}
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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(record?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [territory, setTerritory] = useState<string[]>(record?.territory || []);
    const [principals, setPrincipals] = useState<string[]>(record?.principals || []);
    const [newTerritory, setNewTerritory] = useState('');
    const [newPrincipal, setNewPrincipal] = useState('');
    
    const notify = useNotify();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Update local state when record changes
    useEffect(() => {
        if (record) {
            setAvatarPreview(record.avatar || null);
            setTerritory(record.territory || []);
            setPrincipals(record.principals || []);
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
        if (newTerritory.trim() && !territory.includes(newTerritory.trim())) {
            const validation = validateTerritory([...territory, newTerritory.trim()]);
            if (!validation.isValid) {
                notify(validation.errors[validation.errors.length - 1], { type: 'error' });
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
        <SimpleForm
            toolbar={<UserEditToolbar />}
            sx={{ maxWidth: 'none' }}
        >
            {/* User Status Overview */}
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                            src={avatarPreview || undefined}
                            sx={{ 
                                width: 60, 
                                height: 60,
                                fontSize: '1.5rem'
                            }}
                        >
                            {record.firstName[0]}{record.lastName[0]}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="h6">
                                {record.firstName} {record.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {record.email}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                                <RoleChip role={record.role} size="small" />
                                <Chip
                                    label={record.isActive ? 'Active' : 'Inactive'}
                                    color={record.isActive ? 'success' : 'error'}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    </Box>

                    {record.lastLoginAt && (
                        <Typography variant="body2" color="text.secondary">
                            Last login: {new Date(record.lastLoginAt).toLocaleDateString()} at {new Date(record.lastLoginAt).toLocaleTimeString()}
                        </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                        Account created: {new Date(record.createdAt).toLocaleDateString()}
                    </Typography>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>

                    {/* Avatar Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar
                            src={avatarPreview || undefined}
                            sx={{ 
                                width: isMobile ? 80 : 100, 
                                height: isMobile ? 80 : 100,
                                fontSize: isMobile ? '2rem' : '2.5rem'
                            }}
                        >
                            {record.firstName[0]}{record.lastName[0]}
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
                    <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 3 }}>
                        <TextInput
                            source="firstName"
                            label="First Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            sx={{ 
                                '& .MuiInputBase-input': { 
                                    fontSize: isMobile ? '16px' : '14px' 
                                } 
                            }}
                        />
                        <TextInput
                            source="lastName"
                            label="Last Name"
                            validate={[required(), minLength(2)]}
                            fullWidth
                            sx={{ 
                                '& .MuiInputBase-input': { 
                                    fontSize: isMobile ? '16px' : '14px' 
                                } 
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
                        sx={{ 
                            mb: 3,
                            '& .MuiInputBase-input': { 
                                fontSize: isMobile ? '16px' : '14px' 
                            } 
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
                        sx={{ mb: 3 }}
                    />

                    {/* Active Status */}
                    <BooleanInput
                        source="isActive"
                        label="Active User"
                        helperText="Inactive users cannot log in"
                        sx={{ mb: 2 }}
                    />
                </CardContent>
            </Card>

            {/* Security Management */}
            <Card sx={{ mb: 3, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Security Management
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<VpnKeyIcon />}
                            onClick={handleResetPassword}
                            sx={{ minHeight: 44 }}
                        >
                            Send Password Reset
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            sx={{ minHeight: 44 }}
                        >
                            View Login History
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Password reset emails will be sent to the user's current email address.
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
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Manage territories for this broker. Use state codes (CA, NY), cities (Los Angeles), or ZIP codes (90210).
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
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {territory.map((area) => (
                                            <Chip
                                                key={area}
                                                label={area}
                                                onDelete={() => handleRemoveTerritory(area)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                        {territory.length === 0 && (
                                            <Typography variant="body2" color="text.secondary">
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
                            <Card sx={{ mb: 3, width: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Principals/Brands
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Manage specific food service principals or brands this broker represents.
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
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {principals.map((principal) => (
                                            <Chip
                                                key={principal}
                                                label={principal}
                                                onDelete={() => handleRemovePrincipal(principal)}
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        ))}
                                        {principals.length === 0 && (
                                            <Typography variant="body2" color="text.secondary">
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
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <SaveButton
            variant="contained"
            sx={{ minHeight: 48, px: 4 }}
        />
        <DeleteButton
            confirmTitle="Delete User"
            confirmContent="Are you sure you want to delete this user? This action cannot be undone."
        />
    </Toolbar>
);