import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Stack,
    Avatar,
} from '@mui/material';
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
    showTimeline = true 
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

    const TypeIcon = interactionTypeIcons[interaction.type?.key as keyof typeof interactionTypeIcons] || FollowUpIcon;
    const typeColor = interactionTypeColors[interaction.type?.key as keyof typeof interactionTypeColors] || '#455a64';

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
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleView(e as any);
                }
            }}
            sx={{
                mb: showTimeline ? 2 : 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                },
                '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                },
                minHeight: 140,
            }}
            onClick={handleView}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header with Type Icon and Actions */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Avatar
                            aria-label={`${interaction.type?.label || 'Unknown Type'} interaction`}
                            sx={{
                                bgcolor: typeColor,
                                width: 32,
                                height: 32,
                                mr: 1.5,
                            }}
                        >
                            <TypeIcon fontSize="small" aria-hidden="true" />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    fontSize: '0.95rem',
                                }}
                            >
                                {interaction.subject || 'Untitled Interaction'}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                {interaction.type?.label || 'Unknown Type'}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Stack direction="row" spacing={0.5}>
                        <IconButton
                            size="small"
                            onClick={handleView}
                            aria-label={`View interaction: ${interaction.subject || 'Untitled Interaction'}`}
                            sx={{ 
                                minWidth: 44, 
                                minHeight: 44,
                                padding: 1,
                            }}
                        >
                            <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleEdit}
                            aria-label={`Edit interaction: ${interaction.subject || 'Untitled Interaction'}`}
                            sx={{ 
                                minWidth: 44, 
                                minHeight: 44,
                                padding: 1,
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Organization and Contact */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon 
                            aria-hidden="true"
                            sx={{ 
                                fontSize: 16, 
                                mr: 1, 
                                color: 'text.secondary' 
                            }} 
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
                                sx={{ fontSize: '0.875rem' }}
                            />
                        </ReferenceField>
                    </Box>
                    
                    {interaction.contactId && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon 
                                aria-hidden="true"
                                sx={{ 
                                    fontSize: 16, 
                                    mr: 1, 
                                    color: 'text.secondary' 
                                }} 
                            />
                            <ReferenceField
                                source="contactId"
                                reference="contacts"
                                link={false}
                                record={interaction}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    <TextField source="firstName" /> <TextField source="lastName" />
                                </Typography>
                            </ReferenceField>
                        </Box>
                    )}
                </Stack>

                {/* Status and Details */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {interaction.isCompleted ? (
                            <CompletedIcon 
                                aria-hidden="true"
                                sx={{ 
                                    fontSize: 18, 
                                    mr: 0.5, 
                                    color: 'success.main' 
                                }} 
                            />
                        ) : (
                            <PendingIcon 
                                aria-hidden="true"
                                sx={{ 
                                    fontSize: 18, 
                                    mr: 0.5, 
                                    color: 'warning.main' 
                                }} 
                            />
                        )}
                        <Chip
                            label={interaction.isCompleted ? 'Completed' : 'Pending'}
                            size="small"
                            color={interaction.isCompleted ? 'success' : 'warning'}
                            variant="outlined"
                            sx={{ 
                                fontSize: '0.75rem',
                                minWidth: 80,
                            }}
                        />
                    </Box>
                    
                    {interaction.duration && (
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                        >
                            {formatDuration(interaction.duration)}
                        </Typography>
                    )}
                </Box>

                {/* Schedule and Location */}
                <Stack spacing={0.5}>
                    {interaction.scheduledDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon 
                                aria-hidden="true"
                                sx={{ 
                                    fontSize: 14, 
                                    mr: 1, 
                                    color: 'text.secondary' 
                                }} 
                            />
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                {interaction.isCompleted ? 'Completed: ' : 'Scheduled: '}
                                {formatDate(interaction.completedDate || interaction.scheduledDate)}
                            </Typography>
                        </Box>
                    )}
                    
                    {(interaction.latitude && interaction.longitude) && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon 
                                aria-hidden="true"
                                sx={{ 
                                    fontSize: 14, 
                                    mr: 1, 
                                    color: 'text.secondary' 
                                }} 
                            />
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                Location recorded
                                {interaction.locationNotes && ` • ${interaction.locationNotes}`}
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Description Preview */}
                {interaction.description && (
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                            mt: 1,
                            fontSize: '0.8rem',
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
            </CardContent>
        </Card>
    );
};