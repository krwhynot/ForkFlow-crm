import * as React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useRecordContext, useGetOne } from 'react-admin';
import { Organization, Setting } from '../types';

export const OrganizationCard = () => {
    const record = useRecordContext<Organization>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fetch Settings for display
    const { data: priority } = useGetOne<Setting>(
        'settings',
        {
            id: record?.priorityId,
        },
        { enabled: !!record?.priorityId }
    );

    const { data: segment } = useGetOne<Setting>(
        'settings',
        {
            id: record?.segmentId,
        },
        { enabled: !!record?.segmentId }
    );

    const { data: distributor } = useGetOne<Setting>(
        'settings',
        {
            id: record?.distributorId,
        },
        { enabled: !!record?.distributorId }
    );

    if (!record) return null;

    const handlePhoneClick = () => {
        if (record.phone) {
            window.location.href = `tel:${record.phone}`;
        }
    };

    const handleEmailClick = () => {
        if (record.accountManager) {
            window.location.href = `mailto:${record.accountManager}`;
        }
    };

    const handleWebsiteClick = () => {
        if (record.website) {
            window.open(record.website, '_blank');
        }
    };

    const handleDirectionsClick = () => {
        if (record.latitude && record.longitude) {
            const url = `https://maps.google.com/?q=${record.latitude},${record.longitude}`;
            window.open(url, '_blank');
        } else if (record.address) {
            const url = `https://maps.google.com/?q=${encodeURIComponent(
                `${record.address}, ${record.city}, ${record.state} ${record.zipCode}`
            )}`;
            window.open(url, '_blank');
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                },
                minHeight: isMobile ? '200px' : '250px',
            }}
        >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Header with Priority */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                    >
                        {record.name}
                    </Typography>
                    {priority && (
                        <Chip
                            label={priority.label}
                            size="small"
                            sx={{
                                backgroundColor:
                                    priority.color || theme.palette.grey[300],
                                color: theme.palette.getContrastText(
                                    priority.color || theme.palette.grey[300]
                                ),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        />
                    )}
                </Box>

                {/* Business Context */}
                <Box sx={{ mb: 2 }}>
                    {segment && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            <strong>Segment:</strong> {segment.label}
                        </Typography>
                    )}
                    {distributor && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            <strong>Distributor:</strong> {distributor.label}
                        </Typography>
                    )}
                    {record.accountManager && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Manager:</strong> {record.accountManager}
                        </Typography>
                    )}
                </Box>

                {/* Address */}
                {(record.address || record.city) && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        {record.address && `${record.address}, `}
                        {record.city && record.state
                            ? `${record.city}, ${record.state}`
                            : record.city || record.state}
                        {record.zipCode && ` ${record.zipCode}`}
                    </Typography>
                )}

                {/* Notes Preview */}
                {record.notes && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.4,
                        }}
                    >
                        {record.notes}
                    </Typography>
                )}
            </CardContent>

            {/* Quick Actions */}
            <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {record.phone && (
                        <IconButton
                            size="small"
                            onClick={handlePhoneClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="Call organization"
                        >
                            <PhoneIcon fontSize="small" />
                        </IconButton>
                    )}
                    {record.accountManager && (
                        <IconButton
                            size="small"
                            onClick={handleEmailClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="Email account manager"
                        >
                            <EmailIcon fontSize="small" />
                        </IconButton>
                    )}
                    {record.website && (
                        <IconButton
                            size="small"
                            onClick={handleWebsiteClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="Visit website"
                        >
                            <WebsiteIcon fontSize="small" />
                        </IconButton>
                    )}
                    {(record.latitude || record.address) && (
                        <IconButton
                            size="small"
                            onClick={handleDirectionsClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="Get directions"
                        >
                            <LocationIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <IconButton
                    size="small"
                    sx={{
                        minWidth: 44,
                        minHeight: 44,
                        color: theme.palette.text.secondary,
                    }}
                    aria-label="Edit organization"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </CardActions>
        </Card>
    );
};
