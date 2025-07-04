import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Stack,
    Avatar,
} from '@/components/ui-kit';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    LocationOn as LocationIcon,
    CheckCircle as CompletedIcon,
    RadioButtonUnchecked as PendingIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    PersonPin as PersonPinIcon,
    Slideshow as DemoIcon,
    AttachMoney as QuoteIcon,
    Schedule as FollowUpIcon,
} from '@mui/icons-material';
import { useRedirect, ReferenceField, TextField } from 'react-admin';
import { Interaction } from '../types';

const interactionTypeIcons = {
    email: EmailIcon,
    call: PhoneIcon,
    in_person: PersonPinIcon,
    demo: DemoIcon,
    quote: QuoteIcon,
    follow_up: FollowUpIcon,
};

const interactionTypeColors = {
    email: '#1976d2',
    call: '#388e3c',
    in_person: '#f57c00',
    demo: '#7b1fa2',
    quote: '#d32f2f',
    follow_up: '#455a64',
};

interface InteractionCardProps {
    interaction: Interaction;
    showTimeline?: boolean;
}

export const InteractionCard = ({
    interaction,
    showTimeline = true,
}: InteractionCardProps) => {
    const redirect = useRedirect();

    if (!interaction) return null;

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        redirect(`/interactions/${interaction.id}/show`);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        redirect(`/interactions/${interaction.id}`);
    };

    const TypeIcon =
        interactionTypeIcons[
            interaction.type?.key as keyof typeof interactionTypeIcons
        ] || FollowUpIcon;
    const typeColor =
        interactionTypeColors[
            interaction.type?.key as keyof typeof interactionTypeColors
        ] || '#455a64';

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <Card
            component="article"
            role="button"
            tabIndex={0}
            aria-label={`Interaction: ${interaction.subject || 'Untitled Interaction'} with ${interaction.organization?.name || 'Unknown Organization'}`}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleView(e as any);
                }
            }}
            className={`${showTimeline ? 'mb-2' : 'mb-1'} cursor-pointer transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-px focus:outline-2 focus:outline-blue-600 focus:outline-offset-2 min-h-36`}
            onClick={handleView}
        >
            <CardContent className="p-2 [&:last-child]:pb-2">
                {/* Header with Type Icon and Actions */}
                <Box className="flex justify-between items-start mb-2">
                    <Box className="flex items-center flex-grow">
                        <Avatar
                            aria-label={`${interaction.type?.label || 'Unknown Type'} interaction`}
                            className="w-8 h-8 mr-1.5"
                            style={{
                                backgroundColor: typeColor,
                            }}
                        >
                            <TypeIcon className="text-sm" aria-hidden="true" />
                        </Avatar>
                        <Box className="flex-grow">
                            <Typography
                                variant="subtitle1"
                                className="font-semibold leading-tight text-sm"
                            >
                                {interaction.subject || 'Untitled Interaction'}
                            </Typography>
                            <Typography
                                variant="caption"
                                className="text-gray-500 text-xs"
                            >
                                {interaction.type?.label || 'Unknown Type'}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack className="flex-row space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleView}
                            aria-label={`View interaction: ${interaction.subject || 'Untitled Interaction'}`}
                            className="min-w-11 min-h-11 p-1"
                        >
                            <ViewIcon className="text-sm" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEdit}
                            aria-label={`Edit interaction: ${interaction.subject || 'Untitled Interaction'}`}
                            className="min-w-11 min-h-11 p-1"
                        >
                            <EditIcon className="text-sm" />
                        </Button>
                    </Stack>
                </Box>

                {/* Organization and Contact */}
                <Stack className="space-y-1 mb-2">
                    <Box className="flex items-center">
                        <BusinessIcon
                            aria-hidden="true"
                            className="text-base mr-1 text-gray-500"
                        />
                        <ReferenceField
                            source="organizationId"
                            reference="organizations"
                            link={false}
                            record={interaction}
                        >
                            <TextField
                                source="name"
                                variant="body2"
                                className="text-sm"
                            />
                        </ReferenceField>
                    </Box>

                    {interaction.contactId && (
                        <Box className="flex items-center">
                            <PersonIcon
                                aria-hidden="true"
                                className="text-base mr-1 text-gray-500"
                            />
                            <ReferenceField
                                source="contactId"
                                reference="contacts"
                                link={false}
                                record={interaction}
                            >
                                <Typography
                                    variant="body2"
                                    className="text-sm"
                                >
                                    <TextField source="firstName" />{' '}
                                    <TextField source="lastName" />
                                </Typography>
                            </ReferenceField>
                        </Box>
                    )}
                </Stack>

                {/* Status and Details */}
                <Box className="flex justify-between items-center mb-1.5">
                    <Box className="flex items-center">
                        {interaction.isCompleted ? (
                            <CompletedIcon
                                aria-hidden="true"
                                className="text-lg mr-0.5 text-green-600"
                            />
                        ) : (
                            <PendingIcon
                                aria-hidden="true"
                                className="text-lg mr-0.5 text-yellow-600"
                            />
                        )}
                        <Chip
                            label={
                                interaction.isCompleted
                                    ? 'Completed'
                                    : 'Pending'
                            }
                            size="small"
                            color={
                                interaction.isCompleted ? 'success' : 'warning'
                            }
                            variant="outlined"
                            className="text-xs min-w-20"
                        />
                    </Box>

                    {interaction.duration && (
                        <Typography
                            variant="caption"
                            className="text-gray-500 text-xs"
                        >
                            {formatDuration(interaction.duration)}
                        </Typography>
                    )}
                </Box>

                {/* Schedule and Location */}
                <Stack className="space-y-0.5">
                    {interaction.scheduledDate && (
                        <Box className="flex items-center">
                            <ScheduleIcon
                                aria-hidden="true"
                                className="text-sm mr-1 text-gray-500"
                            />
                            <Typography
                                variant="caption"
                                className="text-gray-500 text-xs"
                            >
                                {interaction.isCompleted
                                    ? 'Completed: '
                                    : 'Scheduled: '}
                                {formatDate(
                                    interaction.completedDate ||
                                        interaction.scheduledDate
                                )}
                            </Typography>
                        </Box>
                    )}

                    {interaction.latitude && interaction.longitude && (
                        <Box className="flex items-center">
                            <LocationIcon
                                aria-hidden="true"
                                className="text-sm mr-1 text-gray-500"
                            />
                            <Typography
                                variant="caption"
                                className="text-gray-500 text-xs"
                            >
                                Location recorded
                                {interaction.locationNotes &&
                                    ` • ${interaction.locationNotes}`}
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Description Preview */}
                {interaction.description && (
                    <Typography
                        variant="body2"
                        className="mt-1 text-sm text-gray-500 line-clamp-2 overflow-hidden text-ellipsis"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {interaction.description}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
