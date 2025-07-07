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
import { Card, CardContent } from '../components/core/cards';
import { Typography } from '../components/core/typography';
import { Box } from '../components/core/layout';
import { Chip } from '../components/core/data-display';
import { Button } from '../components/core/buttons';
import {
    MapPinIcon as LocationIcon,
    ClockIcon as TimeIcon,
    ArrowTopRightOnSquareIcon as DirectionsIcon,
} from '@heroicons/react/24/outline';
import { VisitListFilter } from './VisitListFilter';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Visit } from '../types';

const VisitListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton label="Log Visit" />
    </TopToolbar>
);

const MobileVisitCard = ({ record }: { record: Visit }) => {
    const hasLocation = record.location?.latitude && record.location?.longitude;

    const openMaps = () => {
        if (hasLocation && record.location) {
            const url = `https://maps.google.com/maps?q=${record.location.latitude},${record.location.longitude}`;
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
        <Card className="mb-1 cursor-pointer">
            <CardContent className="p-2 [&:last-child]:pb-2">
                <Box className="flex justify-between items-start mb-1">
                    <Typography
                        variant="h6"
                        className="font-semibold text-base"
                    >
                        {record.organization?.name ||
                            `Customer #${record.organizationId}`}
                    </Typography>
                    <Chip label={'Visit'} color={'primary'} size="small" />
                </Box>

                <Box className="flex items-center mb-1 text-gray-500">
                    <TimeIcon className="w-4 h-4 mr-0.5" />
                    <Typography variant="body2">
                        {new Date(record.date).toLocaleDateString()} at{' '}
                        {new Date(record.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {record.duration && (
                            <span> • {formatDuration(record.duration)}</span>
                        )}
                    </Typography>
                </Box>

                {hasLocation && (
                    <Box className="flex items-center mb-1">
                        <LocationIcon
                            className="w-4 h-4 mr-0.5 text-green-600"
                        />
                        <Typography
                            variant="body2"
                            className="text-gray-500 flex-1"
                        >
                            {record.location?.latitude?.toFixed(4)},{' '}
                            {record.location?.longitude?.toFixed(4)}
                        </Typography>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openMaps}
                            className="p-0.5 min-w-8 min-h-8"
                        >
                            <DirectionsIcon className="w-4 h-4" />
                        </Button>
                    </Box>
                )}

                {record.notes && (
                    <Typography
                        variant="body2"
                        className="text-gray-500 line-clamp-2 overflow-hidden mt-1"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
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
            <Box className="p-2 text-center">
                <Typography variant="body1" className="text-gray-500">
                    No visits logged yet. Start by logging your first customer
                    visit!
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="p-1">
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
                <Chip label={'Visit'} size="small" variant="outlined" />
            )}
        />

        <DateField source="date" label="Visit Date" showTime />

        <FunctionField
            label="Duration"
            render={(record: Visit) => {
                if (!record.duration) return '';
                const hours = Math.floor(record.duration / 60);
                const minutes = record.duration % 60;
                if (hours > 0) {
                    return `${hours}h ${minutes}m`;
                }
                return `${minutes}m`;
            }}
        />

        <FunctionField
            label="Location"
            render={(record: Visit) => {
                if (record.location?.latitude && record.location?.longitude) {
                    return (
                        <Box className="flex items-center">
                            <LocationIcon
                                className="w-4 h-4 mr-0.5 text-green-600"
                            />
                            <Typography variant="body2">GPS</Typography>
                        </Box>
                    );
                }
                return (
                    <Typography variant="body2" className="text-gray-500">
                        No location
                    </Typography>
                );
            }}
        />

        <TextField
            source="notes"
            label="Notes"
            className="max-w-48 overflow-hidden text-ellipsis whitespace-nowrap"
        />
    </Datagrid>
);

export const VisitList = () => {
    const isSmall = useBreakpoint('md');

    return (
        <List
            filters={<VisitListFilter />}
            actions={<VisitListActions />}
            perPage={25}
            sort={{ field: 'date', order: 'DESC' }}
        >
            {isSmall ? <MobileVisitList /> : <DesktopVisitList />}
        </List>
    );
};
