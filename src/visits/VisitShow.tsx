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
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Divider,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Navigation as DirectionsIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
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
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Location
                    </Typography>
                    <Typography color="text.secondary">
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
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">GPS Location</Typography>
                    <Chip
                        icon={<LocationIcon />}
                        label="Location Recorded"
                        color="success"
                        size="small"
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Latitude: {visit.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Longitude: {visit.longitude.toFixed(6)}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
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
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Visit Details
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                        Customer:{' '}
                        {visit.customer_name ||
                            `Customer #${visit.customer_id}`}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                    >
                        Visit Type:
                    </Typography>
                    <Chip
                        label={visit.visit_type.replace('_', ' ')}
                        color={getVisitTypeColor(visit.visit_type) as any}
                        size="small"
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                        <Typography variant="body2" color="text.secondary">
                            {new Date(visit.visit_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
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
                    <Typography color="text.secondary">
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
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
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
                    <Box sx={{ p: 2 }}>
                        <VisitDetailsCard visit={record} />
                        <LocationCard visit={record} />
                        <NotesCard visit={record} />
                    </Box>
                )}
            />
        </SimpleShowLayout>
    </Show>
);
