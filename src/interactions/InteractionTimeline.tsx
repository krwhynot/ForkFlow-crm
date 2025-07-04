import React from 'react';
// Timeline implementation using simple layout instead of @mui/lab
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    Avatar,
} from '@/components/ui-kit';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    PersonPin as PersonPinIcon,
    Slideshow as DemoIcon,
    AttachMoney as QuoteIcon,
    Schedule as FollowUpIcon,
} from '@mui/icons-material';
import { ReferenceField, TextField, DateField } from 'react-admin';

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

interface InteractionTimelineProps {
    interactions: Interaction[];
    maxItems?: number;
    showFilters?: boolean;
    compact?: boolean;
}

export const InteractionTimeline = ({
    interactions = [],
    maxItems = 20,
    compact = false,
}: InteractionTimelineProps) => {
    if (!interactions || interactions.length === 0) {
        return (
            <Box className="p-3 text-center">
                <Typography variant="body2" className="text-gray-500">
                    No interactions found
                </Typography>
            </Box>
        );
    }

    // Sort interactions by most recent first
    const sortedInteractions = [...interactions]
        .sort((a, b) => {
            const dateA = new Date(
                a.completedDate || a.scheduledDate || a.createdAt
            );
            const dateB = new Date(
                b.completedDate || b.scheduledDate || b.createdAt
            );
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, maxItems);

    return (
        <Stack className="space-y-2 p-2">
            {sortedInteractions.map((interaction, index) => {
                const TypeIcon =
                    interactionTypeIcons[
                        interaction.type
                            ?.key as keyof typeof interactionTypeIcons
                    ] || FollowUpIcon;
                const typeColor =
                    interactionTypeColors[
                        interaction.type
                            ?.key as keyof typeof interactionTypeColors
                    ] || '#455a64';

                return (
                    <Box key={interaction.id} className="flex gap-2">
                        {/* Timeline connector */}
                        <Box className="flex flex-col items-center">
                            <Avatar
                                className={compact ? 'w-8 h-8' : 'w-10 h-10'}
                                style={{
                                    backgroundColor: typeColor,
                                }}
                            >
                                <TypeIcon
                                    fontSize={compact ? 'small' : 'medium'}
                                />
                            </Avatar>
                            {index < sortedInteractions.length - 1 && (
                                <Box
                                    className={`w-0.5 ${compact ? 'h-5' : 'h-10'} bg-gray-300 mt-1`}
                                />
                            )}
                        </Box>

                        {/* Content */}
                        <Card
                            variant="outlined"
                            className="flex-1 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <CardContent
                                className={compact ? 'p-1.5 [&:last-child]:pb-1.5' : 'p-2 [&:last-child]:pb-2'}
                            >
                                {/* Header */}
                                <Stack className="flex-row justify-between items-start mb-1">
                                    <Typography
                                        variant={
                                            compact ? 'body2' : 'subtitle1'
                                        }
                                        className="font-semibold flex-grow mr-1"
                                    >
                                        {interaction.subject ||
                                            'Untitled Interaction'}
                                    </Typography>

                                    <Chip
                                        label={
                                            interaction.isCompleted
                                                ? 'Completed'
                                                : 'Pending'
                                        }
                                        size="small"
                                        color={
                                            interaction.isCompleted
                                                ? 'success'
                                                : 'warning'
                                        }
                                        variant="outlined"
                                    />
                                </Stack>

                                {/* Organization and Contact */}
                                <Stack className="space-y-0.5 mb-1">
                                    <ReferenceField
                                        source="organizationId"
                                        reference="organizations"
                                        link={false}
                                        record={interaction}
                                    >
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500 block"
                                        >
                                            📍 <TextField source="name" />
                                        </Typography>
                                    </ReferenceField>

                                    {interaction.contactId && (
                                        <ReferenceField
                                            source="contactId"
                                            reference="contacts"
                                            link={false}
                                            record={interaction}
                                        >
                                            <Typography
                                                variant="caption"
                                                className="text-gray-500 block"
                                            >
                                                👤{' '}
                                                <TextField source="firstName" />{' '}
                                                <TextField source="lastName" />
                                            </Typography>
                                        </ReferenceField>
                                    )}
                                </Stack>

                                {/* Description Preview */}
                                {interaction.description && !compact && (
                                    <Typography
                                        variant="body2"
                                        className="mb-1 text-gray-500 line-clamp-2 overflow-hidden text-ellipsis"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {interaction.description}
                                    </Typography>
                                )}

                                {/* Date and Type */}
                                <Stack className="flex-row justify-between items-center">
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        <DateField
                                            source={
                                                interaction.isCompleted
                                                    ? 'completedDate'
                                                    : 'scheduledDate'
                                            }
                                            record={interaction}
                                            showTime
                                        />
                                    </Typography>

                                    <Chip
                                        label={
                                            interaction.type?.label || 'Unknown'
                                        }
                                        size="small"
                                        className="text-xs"
                                        style={{
                                            backgroundColor: typeColor,
                                            color: 'white',
                                        }}
                                    />
                                </Stack>

                                {/* Follow-up indicator */}
                                {interaction.followUpRequired && (
                                    <Box className="mt-1">
                                        <Chip
                                            label="Follow-up Required"
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                );
            })}
        </Stack>
    );
};
