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
    useDataProvider,
    useNotify,
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
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CloudOff as OfflineIcon,
    CloudDone as OnlineIcon,
    GpsFixed as GpsIcon,
} from '@mui/icons-material';

import { LocationProvider } from '../components/mobile';
import { useGPSService, useOfflineService } from '../providers/mobile';

export const InteractionInputs = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const gpsService = useGPSService();
    const offlineService = useOfflineService();
    
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gpsEnabled, setGpsEnabled] = useState(false);
    const [location, setLocation] = useState<{latitude: number; longitude: number; accuracy?: number} | null>(null);
    const [locationError, setLocationError] = useState<string>('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [offlineStatus, setOfflineStatus] = useState(offlineService.getStatus());
    
    const typeId = record?.typeId;
    
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

    // Check if selected type requires GPS
    const selectedType = interactionTypes?.find(type => type.id === typeId);
    const isLocationRecommended = selectedType?.key === 'in_person' || selectedType?.key === 'demo';

    // Subscribe to offline status changes
    useEffect(() => {
        const unsubscribe = offlineService.onStatusChange(setOfflineStatus);
        return unsubscribe;
    }, [offlineService]);

    // Auto-enable GPS for location-based interactions
    useEffect(() => {
        if (isLocationRecommended && !gpsEnabled) {
            setGpsEnabled(true);
        }
    }, [isLocationRecommended]);

    // Get location when GPS is enabled
    useEffect(() => {
        if (gpsEnabled) {
            getCurrentLocation();
        }
    }, [gpsEnabled]);

    const getCurrentLocation = async () => {
        if (!gpsService.isAvailable()) {
            setLocationError('Geolocation is not supported by this browser.');
            return;
        }

        setLocationLoading(true);
        setLocationError('');

        try {
            // Try cached location first
            const cachedLocation = gpsService.getCachedLocation();
            if (cachedLocation) {
                setLocation({
                    latitude: cachedLocation.latitude,
                    longitude: cachedLocation.longitude,
                    accuracy: cachedLocation.accuracy,
                });
                setLocationLoading(false);
                return;
            }

            // Get fresh location
            const result = await gpsService.getCurrentLocation({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000, // 1 minute cache
            });

            if (result.coordinates) {
                setLocation({
                    latitude: result.coordinates.latitude,
                    longitude: result.coordinates.longitude,
                    accuracy: result.coordinates.accuracy,
                });
                
                // Show accuracy info to user
                if (result.coordinates.accuracy && result.coordinates.accuracy > 50) {
                    notify('GPS accuracy is low. Consider moving to an open area for better precision.', { type: 'warning' });
                }
            } else {
                setLocationError(result.error || 'Failed to get location');
            }
        } catch (error: any) {
            setLocationError(error.message || 'Failed to get location');
        } finally {
            setLocationLoading(false);
        }
    };

    const refreshLocation = () => {
        getCurrentLocation();
    };

    return (
        <Stack spacing={3}>
            {/* Offline Status Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Interaction Details
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Offline Status */}
                    <Chip
                        icon={offlineStatus.isOnline ? <OnlineIcon /> : <OfflineIcon />}
                        label={offlineStatus.isOnline ? 'Online' : 'Offline'}
                        color={offlineStatus.isOnline ? 'success' : 'warning'}
                        size="small"
                    />
                    
                    {/* Pending Sync Count */}
                    {offlineStatus.pendingActions > 0 && (
                        <Chip
                            label={`${offlineStatus.pendingActions} pending`}
                            color="info"
                            size="small"
                        />
                    )}
                </Box>
            </Box>
            
            <Stack spacing={2}>
                <ReferenceInput
                    source="organizationId"
                    reference="organizations"
                    label="Organization"
                >
                    <AutocompleteInput
                        optionText="name"
                        size="medium"
                        fullWidth
                        helperText="Select the organization for this interaction"
                        validate={required() as any}
                    />
                </ReferenceInput>

                <ReferenceInput
                    source="contactId"
                    reference="contacts"
                    label="Contact (Optional)"
                    filter={{ organizationId: record?.organizationId }}
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

            {/* GPS Location for Location-Based Interactions */}
            {(isLocationRecommended || gpsEnabled) && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Location {isLocationRecommended && '(Recommended)'}
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
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={locationLoading ? <CircularProgress size={16} /> : <GpsIcon />}
                                        onClick={refreshLocation}
                                        disabled={locationLoading}
                                    >
                                        {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                                    </Button>
                                    
                                    {location && (
                                        <Button
                                            variant="text"
                                            startIcon={<LocationIcon />}
                                            onClick={() => {
                                                // Open in maps app
                                                const url = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
                                                window.open(url, '_blank');
                                            }}
                                        >
                                            View on Map
                                        </Button>
                                    )}
                                </Box>

                                {location && (
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        <Box>
                                            <strong>Location captured:</strong> {gpsService.formatCoordinates(location)}
                                            {location.accuracy && (
                                                <Box component="span" sx={{ display: 'block', fontSize: '0.875em', mt: 0.5 }}>
                                                    Accuracy: ±{Math.round(location.accuracy)}m
                                                    {location.accuracy > 50 && ' (Consider moving to an open area for better accuracy)'}
                                                </Box>
                                            )}
                                        </Box>
                                    </Alert>
                                )}

                                {locationError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {locationError}
                                        <Button
                                            size="small"
                                            onClick={refreshLocation}
                                            sx={{ ml: 1 }}
                                        >
                                            Retry
                                        </Button>
                                    </Alert>
                                )}

                                <NumberInput
                                    source="latitude"
                                    label="Latitude"
                                    size="medium"
                                    step={0.000001}
                                    defaultValue={location?.latitude}
                                    helperText="GPS latitude coordinate"
                                />

                                <NumberInput
                                    source="longitude"
                                    label="Longitude"
                                    size="medium"
                                    step={0.000001}
                                    defaultValue={location?.longitude}
                                    helperText="GPS longitude coordinate"
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
                            reference="deals"
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

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Attachments
                            </Typography>
                            <FileInput
                                source="attachments"
                                label="Upload Files"
                                multiple
                                accept={{"image/*": [], "application/pdf": [], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"], "text/csv": [".csv"]} as any}
                                helperText="Max 10MB per file. Images will be compressed for mobile upload."
                            >
                                <FileField source="src" title="title" />
                            </FileInput>
                            
                            {!offlineStatus.isOnline && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    Files will be uploaded when connection is restored.
                                </Alert>
                            )}
                        </Box>
                    </Stack>
                </Collapse>
            </Box>
        </Stack>
    );
};