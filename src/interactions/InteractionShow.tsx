import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    BooleanField,
    ReferenceField,
    FunctionField,
    NumberField,
    FileField,
    TopToolbar,
    ListButton,
    EditButton,
    DeleteButton,
    useRecordContext,
} from 'react-admin';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Chip,
    Avatar,
    Button,
} from '@/components/ui-kit';
import {
    Divider,
    Alert,
} from '@/components/ui-kit';
import {
    EnvelopeIcon,
    PhoneIcon,
    UserIcon,
    PresentationChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    CheckCircleIcon,
    EllipsisHorizontalCircleIcon,
    BuildingOfficeIcon,
    UserCircleIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

import { Interaction } from '../types';

const interactionTypeIcons = {
    email: EnvelopeIcon,
    call: PhoneIcon,
    in_person: UserIcon,
    demo: PresentationChartBarIcon,
    quote: CurrencyDollarIcon,
    follow_up: ClockIcon,
};

const interactionTypeColors = {
    email: '#1976d2',
    call: '#388e3c',
    in_person: '#f57c00',
    demo: '#7b1fa2',
    quote: '#d32f2f',
    follow_up: '#455a64',
};

const ShowActions = () => (
    <TopToolbar>
        <EditButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const InteractionHeader = () => {
    const record = useRecordContext<Interaction>();

    if (!record) return null;

    const TypeIcon =
        interactionTypeIcons[
            record.type?.key as keyof typeof interactionTypeIcons
        ] || FollowUpIcon;
    const typeColor =
        interactionTypeColors[
            record.type?.key as keyof typeof interactionTypeColors
        ] || '#455a64';

    return (
        <Card className="mb-3">
            <CardContent>
                <Stack className="flex-row space-x-2 items-start">
                    <Avatar
                        className="w-12 h-12"
                        style={{
                            backgroundColor: typeColor,
                        }}
                    >
                        <TypeIcon />
                    </Avatar>
                    <Box className="flex-grow">
                        <Typography variant="h5" gutterBottom>
                            {record.subject || 'Untitled Interaction'}
                        </Typography>
                        <Stack className="flex-row space-x-2 items-center">
                            <Chip
                                label={record.type?.label || 'Unknown Type'}
                                style={{ backgroundColor: typeColor, color: 'white' }}
                            />
                            <Chip
                                icon={
                                    record.isCompleted ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                    ) : (
                                        <EllipsisHorizontalCircleIcon className="w-4 h-4" />
                                    )
                                }
                                label={
                                    record.isCompleted ? 'Completed' : 'Pending'
                                }
                                color={
                                    record.isCompleted ? 'success' : 'warning'
                                }
                                variant="outlined"
                            />
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const InteractionDetails = () => {
    const record = useRecordContext<Interaction>();

    if (!record) return null;

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'Not specified';
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0
            ? `${hours}h ${mins}m`
            : `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    const openGoogleMaps = () => {
        if (record.latitude && record.longitude) {
            const url = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;
            window.open(url, '_blank');
        }
    };

    return (
        <Stack className="space-y-3">
            {/* Basic Information */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <Stack className="space-y-2">
                        <Box className="flex items-center gap-1">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Organization
                                </Typography>
                                <ReferenceField
                                    source="organizationId"
                                    reference="organizations"
                                    link="show"
                                    record={record}
                                >
                                    <TextField source="name" variant="body1" />
                                </ReferenceField>
                            </Box>
                        </Box>

                        {record.contactId && (
                            <Box className="flex items-center gap-1">
                                <UserCircleIcon className="w-5 h-5 text-gray-600" />
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Contact
                                    </Typography>
                                    <ReferenceField
                                        source="contactId"
                                        reference="contacts"
                                        link="show"
                                        record={record}
                                    >
                                        <FunctionField
                                            render={(contact: any) =>
                                                contact
                                                    ? `${contact.firstName} ${contact.lastName}`
                                                    : 'Unknown'
                                            }
                                        />
                                    </ReferenceField>
                                </Box>
                            </Box>
                        )}

                        {record.opportunityId && (
                            <Box className="flex items-center gap-1">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-gray-600" />
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Related Opportunity
                                    </Typography>
                                    <ReferenceField
                                        source="opportunityId"
                                        reference="deals"
                                        link="show"
                                        record={record}
                                    >
                                        <TextField
                                            source="name"
                                            variant="body1"
                                        />
                                    </ReferenceField>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Description */}
            {record.description && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography
                            variant="body1"
                            className="whitespace-pre-wrap"
                        >
                            {record.description}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Scheduling & Duration */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Scheduling & Duration
                    </Typography>
                    <Stack className="space-y-2">
                        {record.scheduledDate && (
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Scheduled Date
                                </Typography>
                                <DateField
                                    source="scheduledDate"
                                    record={record}
                                    showTime
                                    variant="body1"
                                />
                            </Box>
                        )}

                        {record.completedDate && (
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Completed Date
                                </Typography>
                                <DateField
                                    source="completedDate"
                                    record={record}
                                    showTime
                                    variant="body1"
                                />
                            </Box>
                        )}

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Duration
                            </Typography>
                            <Typography variant="body1">
                                {formatDuration(record.duration)}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Location (for in-person interactions) */}
            {record.latitude && record.longitude && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Location
                        </Typography>
                        <Stack className="space-y-2">
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    GPS Coordinates
                                </Typography>
                                <Typography variant="body1">
                                    {record.latitude.toFixed(6)},{' '}
                                    {record.longitude.toFixed(6)}
                                </Typography>
                            </Box>

                            {record.locationNotes && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Location Notes
                                    </Typography>
                                    <Typography variant="body1">
                                        {record.locationNotes}
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                startIcon={<MapPinIcon className="w-4 h-4" />}
                                onClick={openGoogleMaps}
                                className="self-start"
                            >
                                View on Google Maps
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Outcome & Follow-up */}
            {(record.outcome || record.followUpRequired) && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Outcome & Follow-up
                        </Typography>
                        <Stack className="space-y-2">
                            {record.outcome && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Outcome
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className="whitespace-pre-wrap"
                                    >
                                        {record.outcome}
                                    </Typography>
                                </Box>
                            )}

                            {record.followUpRequired && (
                                <>
                                    <Alert severity="info">
                                        Follow-up required
                                    </Alert>

                                    {record.followUpDate && (
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Follow-up Date
                                            </Typography>
                                            <DateField
                                                source="followUpDate"
                                                record={record}
                                                showTime
                                                variant="body1"
                                            />
                                        </Box>
                                    )}

                                    {record.followUpNotes && (
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Follow-up Notes
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                className="whitespace-pre-wrap"
                                            >
                                                {record.followUpNotes}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Attachments
                        </Typography>
                        <Stack className="space-y-1">
                            {record.attachments.map((attachment, index) => (
                                <FileField
                                    key={index}
                                    source={`attachments.${index}` as any}
                                    record={record}
                                    title="title"
                                />
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Metadata
                    </Typography>
                    <Stack className="space-y-1">
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Created
                            </Typography>
                            <DateField
                                source="createdAt"
                                record={record}
                                showTime
                                variant="body2"
                            />
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Last Updated
                            </Typography>
                            <DateField
                                source="updatedAt"
                                record={record}
                                showTime
                                variant="body2"
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};

export const InteractionShow = () => (
    <Show actions={<ShowActions />}>
        <SimpleShowLayout>
            <InteractionHeader />
            <InteractionDetails />
        </SimpleShowLayout>
    </Show>
);
