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
import { CardContent, Grid, Box, Typography, Alert } from '../components/ui-kit';
import { useState, useEffect } from 'react';
import { useRealtimeSettings } from './hooks/useRealtimeSettings';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SettingsCreateToolbar = () => {
    return (
        <Toolbar className="justify-end p-2 md:p-3">
            <SaveButton
                className="w-full sm:w-auto min-h-[48px]"
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
                <CardContent className="p-2 md:p-3">
                    {/* Header */}
                    <Box className="mb-3">
                        <Typography variant="h5" gutterBottom>
                            Create New Setting
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Add a new configuration setting to the system
                        </Typography>

                        {/* Connection Status */}
                        {!isConnected && (
                            <Alert severity="warning" className="mt-2">
                                Real-time updates are currently disconnected.
                                Changes may not be reflected immediately.
                            </Alert>
                        )}

                        {/* Duplicate Error */}
                        {duplicateError && (
                            <Alert severity="error" className="mt-2">
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
                                className="[&_.MuiInputBase-root]:min-h-[48px] md:[&_.MuiInputBase-root]:min-h-[56px]"
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
                                className="[&_.MuiInputBase-root]:min-h-[48px] md:[&_.MuiInputBase-root]:min-h-[56px]"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="label"
                                label="Label"
                                validate={required()}
                                helperText="Display name shown to users"
                                fullWidth
                                className="[&_.MuiInputBase-root]:min-h-[48px] md:[&_.MuiInputBase-root]:min-h-[56px]"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="color"
                                label="Color"
                                validate={validateColor}
                                helperText="Hex color code (e.g., #FF5722)"
                                fullWidth
                                className="[&_.MuiInputBase-root]:min-h-[48px] md:[&_.MuiInputBase-root]:min-h-[56px]"
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
                                className="[&_.MuiInputBase-root]:min-h-[48px] md:[&_.MuiInputBase-root]:min-h-[56px]"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="pt-1">
                                <BooleanInput
                                    source="active"
                                    label="Active"
                                    defaultValue={true}
                                    helperText="Whether this setting is available for use"
                                    className="[&_.MuiCheckbox-root]:min-w-[48px] [&_.MuiCheckbox-root]:min-h-[48px]"
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
