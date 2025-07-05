import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
} from '@/components/ui-kit';
import {
    MapIcon as GPSIcon,
    MapPinIcon as LocationIcon,
    ClockIcon as TimeIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import {
    Create,
    DateTimeInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    useGetIdentity,
    useNotify,
    useRedirect,
} from 'react-admin';
import { useLocation } from '../components/mobile';

const visitTypes = [
    { id: 'sales_call', name: 'Sales Call' },
    { id: 'follow_up', name: 'Follow-up' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'service_call', name: 'Service Call' },
    { id: 'other', name: 'Other' },
];

export const VisitCreate = () => {
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const redirect = useRedirect();
    const { currentLocation, requestLocation, permission } = useLocation();
    const [gpsLoading, setGpsLoading] = useState(false);
    const [visitData, setVisitData] = useState<{
        latitude?: number;
        longitude?: number;
        visit_date: string;
        duration_minutes?: number;
    }>({
        visit_date: new Date().toISOString(),
    });

    // Auto-capture GPS on component mount if permission is granted
    useEffect(() => {
        if (permission === 'granted' && !currentLocation) {
            handleGetCurrentLocation();
        }
    }, [permission]);

    // Update visit data when location changes
    useEffect(() => {
        if (currentLocation) {
            setVisitData(prev => ({
                ...prev,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            }));
        }
    }, [currentLocation]);

    const handleGetCurrentLocation = async () => {
        setGpsLoading(true);
        try {
            await requestLocation();
            notify('Location captured successfully', { type: 'success' });
        } catch (error) {
            notify('Failed to get location. Please check GPS permissions.', {
                type: 'warning',
            });
        } finally {
            setGpsLoading(false);
        }
    };

    const transform = (data: any) => ({
        ...data,
        broker_id: identity?.id,
        latitude: visitData.latitude,
        longitude: visitData.longitude,
        visit_date: visitData.visit_date,
        duration_minutes: visitData.duration_minutes,
    });

    return (
        <Create transform={transform} redirect="list">
            <SimpleForm>
                <Box className="w-full mb-2">
                    <Typography variant="h6" gutterBottom>
                        Log New Visit
                    </Typography>

                    {/* GPS Location Card */}
                    <Card
                        className={`mb-2 ${currentLocation
                                ? 'bg-green-50'
                                : 'bg-gray-100'
                            }`}
                    >
                        <CardContent>
                            <Box className="flex items-center mb-1">
                                <LocationIcon
                                    className={`w-5 h-5 mr-1 ${currentLocation ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                />
                                <Typography variant="subtitle1">
                                    GPS Location
                                </Typography>
                                {gpsLoading && (
                                    <CircularProgress
                                        size="sm"
                                        className="ml-1"
                                    />
                                )}
                            </Box>

                            {currentLocation ? (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500"
                                    >
                                        Latitude:{' '}
                                        {currentLocation.latitude.toFixed(6)}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500"
                                    >
                                        Longitude:{' '}
                                        {currentLocation.longitude.toFixed(6)}
                                    </Typography>
                                    {currentLocation.accuracy && (
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500"
                                        >
                                            Accuracy: ±
                                            {Math.round(
                                                currentLocation.accuracy
                                            )}
                                            m
                                        </Typography>
                                    )}
                                    <Chip
                                        icon={<LocationIcon className="w-4 h-4" />}
                                        label="Location Captured"
                                        color="success"
                                        size="small"
                                        className="mt-1"
                                    />
                                </Box>
                            ) : (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500 mb-1"
                                    >
                                        {permission === 'denied'
                                            ? 'Location permission denied. Please enable GPS in browser settings.'
                                            : 'No location captured. GPS helps track visit locations.'}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={
                                            gpsLoading ? (
                                                <CircularProgress size="xs" />
                                            ) : (
                                                <GPSIcon className="w-4 h-4" />
                                            )
                                        }
                                        onClick={handleGetCurrentLocation}
                                        disabled={
                                            gpsLoading ||
                                            permission === 'denied'
                                        }
                                    >
                                        {gpsLoading
                                            ? 'Getting Location...'
                                            : 'Capture Location'}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Visit Information */}
                    <ReferenceInput
                        source="customer_id"
                        reference="customers"
                        label="Customer"
                        fullWidth
                    >
                        <SelectInput
                            optionText="business_name"
                            fullWidth
                            className="mb-2"
                        />
                    </ReferenceInput>

                    <SelectInput
                        source="visit_type"
                        label="Visit Type"
                        choices={visitTypes}
                        fullWidth
                        className="mb-2"
                        defaultValue="sales_call"
                    />

                    <DateTimeInput
                        source="visit_date"
                        label="Visit Date & Time"
                        fullWidth
                        className="mb-2"
                        defaultValue={new Date().toISOString()}
                        onChange={value =>
                            setVisitData(prev => ({
                                ...prev,
                                visit_date: value,
                            }))
                        }
                    />

                    <NumberInput
                        source="duration_minutes"
                        label="Duration (minutes)"
                        fullWidth
                        className="mb-2"
                        min={1}
                        max={480}
                        onChange={value =>
                            setVisitData(prev => ({
                                ...prev,
                                duration_minutes: value,
                            }))
                        }
                    />

                    <TextInput
                        source="notes"
                        label="Visit Notes"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="What was discussed? Any follow-up actions needed?"
                        className="mb-2"
                    />

                    {/* Time Tracking Alert */}
                    <Alert severity="info" className="mt-2">
                        <Box className="flex items-center">
                            <TimeIcon className="w-4 h-4 mr-1" />
                            <Typography variant="body2">
                                Visit time is automatically recorded. GPS
                                location helps track your customer coverage.
                            </Typography>
                        </Box>
                    </Alert>
                </Box>
            </SimpleForm>
        </Create>
    );
};
