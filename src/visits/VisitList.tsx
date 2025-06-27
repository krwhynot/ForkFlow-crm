import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    FunctionField,
    useListContext,
    TopToolbar,
    CreateButton,
    FilterButton,
} from 'react-admin';
import { useMediaQuery, Theme } from '@mui/material';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Navigation as DirectionsIcon,
} from '@mui/icons-material';
import { VisitListFilter } from './VisitListFilter';
import { Visit } from '../types';

const VisitListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton label="Log Visit" />
    </TopToolbar>
);

const MobileVisitCard = ({ record }: { record: Visit }) => {
    const hasLocation = record.latitude && record.longitude;

    const openMaps = () => {
        if (hasLocation) {
            const url = `https://maps.google.com/maps?q=${record.latitude},${record.longitude}`;
            window.open(url, '_blank');
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
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
        <Card sx={{ mb: 1, cursor: 'pointer' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, fontSize: '1rem' }}
                    >
                        {record.customer_name ||
                            `Customer #${record.customer_id}`}
                    </Typography>
                    <Chip
                        label={record.visit_type.replace('_', ' ')}
                        color={getVisitTypeColor(record.visit_type) as any}
                        size="small"
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        color: 'text.secondary',
                    }}
                >
                    <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                        {new Date(record.visit_date).toLocaleDateString()} at{' '}
                        {new Date(record.visit_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {record.duration_minutes && (
                            <span>
                                {' '}
                                • {formatDuration(record.duration_minutes)}
                            </span>
                        )}
                    </Typography>
                </Box>

                {hasLocation && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon
                            fontSize="small"
                            color="success"
                            sx={{ mr: 0.5 }}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ flex: 1 }}
                        >
                            {record.latitude?.toFixed(4)},{' '}
                            {record.longitude?.toFixed(4)}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={openMaps}
                            sx={{ p: 0.5 }}
                        >
                            <DirectionsIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                {record.notes && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 1,
                        }}
                    >
                        {record.notes}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const MobileVisitList = () => {
    const { data: visits } = useListContext<Visit>();

    if (!visits?.length) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No visits logged yet. Start by logging your first customer
                    visit!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            {visits.map(visit => (
                <MobileVisitCard key={visit.id} record={visit} />
            ))}
        </Box>
    );
};

const DesktopVisitList = () => (
    <Datagrid>
        <ReferenceField
            source="customer_id"
            reference="customers"
            label="Customer"
            link="show"
        >
            <TextField source="business_name" />
        </ReferenceField>

        <FunctionField
            label="Visit Type"
            render={(record: Visit) => (
                <Chip
                    label={record.visit_type.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                />
            )}
        />

        <DateField source="visit_date" label="Visit Date" showTime />

        <FunctionField
            label="Duration"
            render={(record: Visit) => {
                if (!record.duration_minutes) return '';
                const hours = Math.floor(record.duration_minutes / 60);
                const minutes = record.duration_minutes % 60;
                if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                }
                return `${minutes}m`;
            }}
        />

        <FunctionField
            label="Location"
            render={(record: Visit) => {
                if (record.latitude && record.longitude) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon
                                fontSize="small"
                                color="success"
                                sx={{ mr: 0.5 }}
                            />
                            <Typography variant="body2">GPS</Typography>
                        </Box>
                    );
                }
                return (
                    <Typography variant="body2" color="text.secondary">
                        No location
                    </Typography>
                );
            }}
        />

        <TextField
            source="notes"
            label="Notes"
            sx={{
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        />
    </Datagrid>
);

export const VisitList = () => {
    const isSmall = useMediaQuery((theme: Theme) =>
        theme.breakpoints.down('md')
    );

    return (
        <List
            filters={<VisitListFilter />}
            actions={<VisitListActions />}
            perPage={25}
            sort={{ field: 'visit_date', order: 'DESC' }}
        >
            {isSmall ? <MobileVisitList /> : <DesktopVisitList />}
        </List>
    );
};
