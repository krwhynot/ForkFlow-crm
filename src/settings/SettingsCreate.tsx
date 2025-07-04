import {
    Create,
    Form,
    NumberInput,
    SelectInput,
    TextInput,
    BooleanInput,
    Toolbar,
    SaveButton,
    required,
    regex,
    useCreate,
    useNotify,
    useRedirect,
} from 'react-admin';
import { CardContent, Grid, Box, Typography, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRealtimeSettings } from './hooks/useRealtimeSettings';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SettingsCreateToolbar = () => {
    return (
        <Toolbar sx={{ justifyContent: 'flex-end', p: { xs: 2, md: 3 } }}>
            <SaveButton
                sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                    minHeight: 48, // Touch-friendly
                }}
            />
        </Toolbar>
    );
};

export const SettingsCreate = () => {
    const isMobile = useBreakpoint('sm');
    const { isConnected } = useRealtimeSettings();
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    // Validation helpers
    const validateKey = [
        required(),
        regex(
            /^[a-z0-9_]+$/,
            'Key must contain only lowercase letters, numbers, and underscores'
        ),
    ];

    const validateColor = [
        regex(
            /^#[0-9A-Fa-f]{6}$/,
            'Color must be a valid hex code (e.g., #FF5722)'
        ),
    ];

    const categoryChoices = [
        { id: 'priority', name: 'Priority' },
        { id: 'segment', name: 'Segment' },
        { id: 'distributor', name: 'Distributor' },
        { id: 'role', name: 'Role' },
        { id: 'influence', name: 'Influence' },
        { id: 'decision', name: 'Decision' },
        { id: 'principal', name: 'Principal' },
        { id: 'stage', name: 'Stage' },
        { id: 'interaction_type', name: 'Interaction Type' },
    ];

    // Get category from URL params for pre-selection
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCategory = urlParams.get('category');

    return (
        <Create
            redirect="show"
            transform={data => ({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })}
        >
            <Form>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Header */}
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>
                            Create New Setting
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add a new configuration setting to the system
                        </Typography>

                        {/* Connection Status */}
                        {!isConnected && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Real-time updates are currently disconnected.
                                Changes may not be reflected immediately.
                            </Alert>
                        )}

                        {/* Duplicate Error */}
                        {duplicateError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {duplicateError}
                            </Alert>
                        )}
                    </Box>

                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12} md={6}>
                            <SelectInput
                                source="category"
                                label="Category"
                                choices={categoryChoices}
                                validate={required()}
                                fullWidth
                                defaultValue={preselectedCategory}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: { xs: 48, md: 56 }, // Touch-friendly
                                    },
                                }}
                                helperText="Select the type of setting to create"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="key"
                                label="Key"
                                validate={validateKey}
                                helperText="Unique identifier (lowercase, underscores only)"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: { xs: 48, md: 56 },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="label"
                                label="Label"
                                validate={required()}
                                helperText="Display name shown to users"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: { xs: 48, md: 56 },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="color"
                                label="Color"
                                validate={validateColor}
                                helperText="Hex color code (e.g., #FF5722)"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: { xs: 48, md: 56 },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="sortOrder"
                                label="Sort Order"
                                validate={required()}
                                helperText="Display order (1 = first)"
                                fullWidth
                                defaultValue={1}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: { xs: 48, md: 56 },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ pt: 1 }}>
                                <BooleanInput
                                    source="active"
                                    label="Active"
                                    defaultValue={true}
                                    helperText="Whether this setting is available for use"
                                    sx={{
                                        '& .MuiCheckbox-root': {
                                            minWidth: 48,
                                            minHeight: 48, // Touch-friendly
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
                <SettingsCreateToolbar />
            </Form>
        </Create>
    );
};
