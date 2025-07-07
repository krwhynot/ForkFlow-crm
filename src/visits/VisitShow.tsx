import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    ReferenceField,
    FunctionField,
    TopToolbar,
    EditButton,
    DeleteButton,
} from 'react-admin';
import { Card, CardContent } from '../components/core/cards';
import { Typography } from '../components/core/typography';
import { Box } from '../components/core/layout';
import { Chip } from '../components/core/data-display';
import { Button } from '../components/core/buttons';
import { Divider } from '../components/ui-kit'; // Keep for now
import {
    MapPinIcon as LocationIcon,
    ClockIcon as TimeIcon,
    ArrowTopRightOnSquareIcon as DirectionsIcon,
    UserIcon as PersonIcon,
} from '@heroicons/react/24/outline';
import { Visit } from '../types';

const VisitShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const LocationCard = ({ visit }: { visit: Visit }) => {
    if (!visit.latitude || !visit.longitude) {
        return (
            <Card className="mb-2">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Location
                    </Typography>
                    <Typography className="text-gray-500">
                        No GPS location recorded for this visit
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const openMaps = () => {
        const url = `https://maps.google.com/maps?q=${visit.latitude},${visit.longitude}`;
        window.open(url, '_blank');
    };

    return (
        <Card className="mb-2">
            <CardContent>
                <Box className="flex items-center justify-between mb-2">
                    <Typography variant="h6">GPS Location</Typography>
                    <Chip
                        icon={<LocationIcon className="w-4 h-4" />}
                        label="Location Recorded"
                        color="success"
                        size="small"
                    />
                </Box>

                <Box className="mb-2">
                    <Typography variant="body2" className="text-gray-500">
                        Latitude: {visit.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                        Longitude: {visit.longitude.toFixed(6)}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<DirectionsIcon className="w-4 h-4" />}
                    onClick={openMaps}
                    size="small"
                >
                    View on Map
                </Button>
            </CardContent>
        </Card>
    );
};

const VisitDetailsCard = ({ visit }: { visit: Visit }) => {
    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'Not specified';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
        }
        return `${mins} minute${mins !== 1 ? 's' : ''}`;
    };

    const getVisitTypeColor = (type: string) => {
        const colorMap: Record<string, string> = {
            sales_call: 'primary',
            follow_up: 'secondary',
            delivery: 'success',
            service_call: 'warning',
            other: 'default',
        };
        return colorMap[type] || 'default';
    };

    return (
        <Card className="mb-2">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Visit Details
                </Typography>

                <Box className="flex items-center mb-2">
                    <PersonIcon className="w-4 h-4 mr-1 text-gray-500" />
                    <Typography variant="body1">
                        Customer:{' '}
                        {visit.customer_name ||
                            `Customer #${visit.customer_id}`}
                    </Typography>
                </Box>

                <Box className="flex items-center mb-2">
                    <Typography
                        variant="body2"
                        className="text-gray-500 mr-2"
                    >
                        Visit Type:
                    </Typography>
                    <Chip
                        label={visit.visit_type.replace('_', ' ')}
                        color={getVisitTypeColor(visit.visit_type) as any}
                        size="small"
                    />
                </Box>

                <Box className="flex items-center mb-2">
                    <TimeIcon className="w-4 h-4 mr-1 text-gray-500" />
                    <Box>
                        <Typography variant="body1">
                            {new Date(visit.visit_date).toLocaleDateString(
                                undefined,
                                {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }
                            )}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            {new Date(visit.visit_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Typography>
                    </Box>
                </Box>

                <Box className="flex items-center">
                    <Typography
                        variant="body2"
                        className="text-gray-500 mr-2"
                    >
                        Duration:
                    </Typography>
                    <Typography variant="body1">
                        {formatDuration(visit.duration_minutes)}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const NotesCard = ({ visit }: { visit: Visit }) => {
    if (!visit.notes) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Visit Notes
                    </Typography>
                    <Typography className="text-gray-500">
                        No notes recorded for this visit
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Visit Notes
                </Typography>
                <Typography variant="body1" className="whitespace-pre-wrap">
                    {visit.notes}
                </Typography>
            </CardContent>
        </Card>
    );
};

export const VisitShow = () => (
    <Show actions={<VisitShowActions />}>
        <SimpleShowLayout>
            <FunctionField
                render={(record: Visit) => (
                    <Box className="p-2">
                        <VisitDetailsCard visit={record} />
                        <LocationCard visit={record} />
                        <NotesCard visit={record} />
                    </Box>
                )}
            />
        </SimpleShowLayout>
    </Show>
);
