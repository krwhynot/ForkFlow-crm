import React, { useState, useEffect } from 'react';
import {
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    SelectInput,
    DateTimeInput,
    NumberInput,
    BooleanInput,
    FileInput,
    FileField,
    required,
    useGetList,
    useRecordContext,
    useWatch,
} from 'react-admin';
import {
    Stack,
    Box,
    Typography,
    Collapse,
    Button,
    Alert,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import { LocationProvider } from '../components/mobile';

export const InteractionInputs = () => {
    const record = useRecordContext();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(false);
    const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
    const [locationError, setLocationError] = useState<string>('');
    
    const typeId = useWatch({ name: 'typeId' });
    
    // Get interaction types from settings
    const { data: interactionTypes } = useGetList('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const interactionTypeChoices = interactionTypes?.map(type => ({
        id: type.id,
        name: type.label,
    })) || [];

    // Check if selected type is "in_person" to show GPS options
    const selectedType = interactionTypes?.find(type => type.id === typeId);
    const isInPersonInteraction = selectedType?.key === 'in_person';

    useEffect(() => {
        if (isInPersonInteraction && gpsEnabled) {
            getCurrentLocation();
        }
    }, [isInPersonInteraction, gpsEnabled]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setLocationError('');
                // These will be handled by the form
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Location access denied by user.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Location request timed out.');
                        break;
                    default:
                        setLocationError('An unknown error occurred.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <Stack spacing={3}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
                Interaction Details
            </Typography>
            
            <Stack spacing={2}>
                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    validate={required()}
                    label="Organization"
                >
                    <AutocompleteInput
                        optionText="name"
                        size="medium"
                        fullWidth
                        helperText="Select the organization for this interaction"
                    />
                </ReferenceInput>

                <ReferenceInput
                    source="contactId"
                    reference="contacts"
                    label="Contact (Optional)"
                    filter={{ organizationId: useWatch({ name: 'organizationId' }) }}
                >
                    <AutocompleteInput
                        optionText={(choice: any) => 
                            choice ? `${choice.firstName} ${choice.lastName}` : ''
                        }
                        size="medium"
                        fullWidth
                        helperText="Select a specific contact (optional)"
                    />
                </ReferenceInput>

                <SelectInput
                    source="typeId"
                    label="Interaction Type"
                    choices={interactionTypeChoices}
                    validate={required()}
                    size="medium"
                    fullWidth
                    helperText="Choose the type of interaction"
                />

                <TextInput
                    source="subject"
                    label="Subject"
                    validate={required()}
                    size="medium"
                    fullWidth
                    helperText="Brief summary of the interaction"
                />

                <TextInput
                    source="description"
                    label="Description"
                    multiline
                    minRows={3}
                    size="medium"
                    fullWidth
                    helperText="Detailed notes about the interaction"
                />
            </Stack>

            {/* Scheduling */}
            <Typography variant="h6" gutterBottom>
                Scheduling
            </Typography>
            
            <Stack spacing={2}>
                <DateTimeInput
                    source="scheduledDate"
                    label="Scheduled Date & Time"
                    size="medium"
                    fullWidth
                    helperText="When is this interaction scheduled?"
                />

                <NumberInput
                    source="duration"
                    label="Duration (minutes)"
                    size="medium"
                    min={1}
                    step={5}
                    helperText="Expected or actual duration"
                />

                <BooleanInput
                    source="isCompleted"
                    label="Mark as completed"
                    defaultValue={false}
                />
            </Stack>

            {/* GPS Location for In-Person Interactions */}
            {isInPersonInteraction && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Location (In-Person Interaction)
                    </Typography>
                    
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={gpsEnabled}
                                    onChange={(e) => setGpsEnabled(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Capture GPS location"
                        />

                        {gpsEnabled && (
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<LocationIcon />}
                                    onClick={getCurrentLocation}
                                    sx={{ mb: 2 }}
                                >
                                    Get Current Location
                                </Button>

                                {location && (
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                    </Alert>
                                )}

                                {locationError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {locationError}
                                    </Alert>
                                )}

                                <NumberInput
                                    source="latitude"
                                    label="Latitude"
                                    size="medium"
                                    step={0.000001}
                                    format={(value) => location?.latitude || value}
                                />

                                <NumberInput
                                    source="longitude"
                                    label="Longitude"
                                    size="medium"
                                    step={0.000001}
                                    format={(value) => location?.longitude || value}
                                />

                                <TextInput
                                    source="locationNotes"
                                    label="Location Notes"
                                    size="medium"
                                    fullWidth
                                    helperText="Optional notes about the location"
                                />
                            </Box>
                        )}
                    </Stack>
                </Box>
            )}

            {/* Advanced Options */}
            <Box>
                <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 2 }}
                >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>

                <Collapse in={showAdvanced}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" gutterBottom>
                            Follow-up & Outcomes
                        </Typography>

                        <ReferenceInput
                            source="opportunityId"
                            reference="opportunities"
                            label="Related Opportunity (Optional)"
                        >
                            <AutocompleteInput
                                optionText="name"
                                size="medium"
                                fullWidth
                                helperText="Link to a related sales opportunity"
                            />
                        </ReferenceInput>

                        <TextInput
                            source="outcome"
                            label="Outcome"
                            multiline
                            minRows={2}
                            size="medium"
                            fullWidth
                            helperText="Results or outcomes of the interaction"
                        />

                        <BooleanInput
                            source="followUpRequired"
                            label="Follow-up required"
                            defaultValue={false}
                        />

                        <DateTimeInput
                            source="followUpDate"
                            label="Follow-up Date"
                            size="medium"
                            fullWidth
                            helperText="When to follow up (if required)"
                        />

                        <TextInput
                            source="followUpNotes"
                            label="Follow-up Notes"
                            multiline
                            minRows={2}
                            size="medium"
                            fullWidth
                            helperText="Notes for the follow-up"
                        />

                        <FileInput
                            source="attachments"
                            label="Attachments"
                            multiple
                            accept="image/*,application/pdf,.doc,.docx"
                        >
                            <FileField source="src" title="title" />
                        </FileInput>
                    </Stack>
                </Collapse>
            </Box>
        </Stack>
    );
};