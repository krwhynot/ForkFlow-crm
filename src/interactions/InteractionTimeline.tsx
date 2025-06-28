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
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    PersonPin as PersonPinIcon,
    Presentation as DemoIcon,
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
    compact = false 
}: InteractionTimelineProps) => {
    if (!interactions || interactions.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No interactions found
                </Typography>
            </Box>
        );
    }

    // Sort interactions by most recent first
    const sortedInteractions = [...interactions]
        .sort((a, b) => {
            const dateA = new Date(a.completedDate || a.scheduledDate || a.createdAt);
            const dateB = new Date(b.completedDate || b.scheduledDate || b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, maxItems);

    return (
        <Stack spacing={2} sx={{ p: 2 }}>
            {sortedInteractions.map((interaction, index) => {
                const TypeIcon = interactionTypeIcons[interaction.type?.key as keyof typeof interactionTypeIcons] || FollowUpIcon;
                const typeColor = interactionTypeColors[interaction.type?.key as keyof typeof interactionTypeColors] || '#455a64';

                return (
                    <Box key={interaction.id} sx={{ display: 'flex', gap: 2 }}>
                        {/* Timeline connector */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                sx={{
                                    bgcolor: typeColor,
                                    width: compact ? 32 : 40,
                                    height: compact ? 32 : 40,
                                }}
                            >
                                <TypeIcon fontSize={compact ? "small" : "medium"} />
                            </Avatar>
                            {index < sortedInteractions.length - 1 && (
                                <Box
                                    sx={{
                                        width: 2,
                                        height: compact ? 20 : 40,
                                        bgcolor: 'divider',
                                        mt: 1,
                                    }}
                                />
                            )}
                        </Box>

                        {/* Content */}
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                flex: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 2,
                                },
                            }}
                        >
                            <CardContent sx={{ 
                                p: compact ? 1.5 : 2, 
                                '&:last-child': { pb: compact ? 1.5 : 2 } 
                            }}>
                                {/* Header */}
                                <Stack 
                                    direction="row" 
                                    justifyContent="space-between" 
                                    alignItems="flex-start"
                                    sx={{ mb: 1 }}
                                >
                                    <Typography 
                                        variant={compact ? "body2" : "subtitle1"} 
                                        sx={{ 
                                            fontWeight: 600,
                                            flexGrow: 1,
                                            mr: 1,
                                        }}
                                    >
                                        {interaction.subject || 'Untitled Interaction'}
                                    </Typography>
                                    
                                    <Chip
                                        label={interaction.isCompleted ? 'Completed' : 'Pending'}
                                        size="small"
                                        color={interaction.isCompleted ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                </Stack>

                                {/* Organization and Contact */}
                                <Stack spacing={0.5} sx={{ mb: 1 }}>
                                    <ReferenceField
                                        source="organizationId"
                                        reference="organizations"
                                        link={false}
                                        record={interaction}
                                    >
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
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
                                                color="text.secondary"
                                                sx={{ display: 'block' }}
                                            >
                                                👤 <TextField source="firstName" /> <TextField source="lastName" />
                                            </Typography>
                                        </ReferenceField>
                                    )}
                                </Stack>

                                {/* Description Preview */}
                                {interaction.description && !compact && (
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            mb: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {interaction.description}
                                    </Typography>
                                )}

                                {/* Date and Type */}
                                <Stack 
                                    direction="row" 
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        <DateField 
                                            source={interaction.isCompleted ? "completedDate" : "scheduledDate"}
                                            record={interaction}
                                            showTime
                                        />
                                    </Typography>
                                    
                                    <Chip
                                        label={interaction.type?.label || 'Unknown'}
                                        size="small"
                                        sx={{ 
                                            bgcolor: typeColor,
                                            color: 'white',
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </Stack>

                                {/* Follow-up indicator */}
                                {interaction.followUpRequired && (
                                    <Box sx={{ mt: 1 }}>
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