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
    Avatar,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    LinkedIn as LinkedInIcon,
    Business as BusinessIcon,
    Edit as EditIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { useRecordContext, useGetOne, Link } from 'react-admin';
import { Contact, Setting, Organization } from '../types';

export const ContactCard = () => {
    const record = useRecordContext<Contact>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fetch Settings for display
    const { data: role } = useGetOne<Setting>(
        'settings',
        {
            id: record?.roleId,
        },
        { enabled: !!record?.roleId }
    );

    const { data: influenceLevel } = useGetOne<Setting>(
        'settings',
        {
            id: record?.influenceLevelId,
        },
        { enabled: !!record?.influenceLevelId }
    );

    const { data: decisionRole } = useGetOne<Setting>(
        'settings',
        {
            id: record?.decisionRoleId,
        },
        { enabled: !!record?.decisionRoleId }
    );

    // Fetch Organization
    const { data: organization } = useGetOne<Organization>(
        'organizations',
        {
            id: record?.organizationId,
        },
        { enabled: !!record?.organizationId }
    );

    if (!record) return null;

    const handlePhoneClick = () => {
        if (record.phone) {
            window.location.href = `tel:${record.phone}`;
        }
    };

    const handleEmailClick = () => {
        if (record.email) {
            window.location.href = `mailto:${record.email}`;
        }
    };

    const handleLinkedInClick = () => {
        if (record.linkedInUrl) {
            window.open(record.linkedInUrl, '_blank');
        }
    };

    const getInitials = () => {
        const first = record.firstName?.charAt(0) || '';
        const last = record.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    const getInfluenceColor = () => {
        if (!influenceLevel?.color) return theme.palette.grey[300];
        return influenceLevel.color;
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
                minHeight: isMobile ? '220px' : '260px',
                position: 'relative',
            }}
        >
            {/* Primary Contact Badge */}
            {record.isPrimary && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                    }}
                >
                    <Chip
                        icon={<StarIcon fontSize="small" />}
                        label="Primary"
                        size="small"
                        sx={{
                            backgroundColor: theme.palette.warning.main,
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                                color: 'white',
                            },
                        }}
                    />
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Contact Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            backgroundColor: getInfluenceColor(),
                            color: theme.palette.getContrastText(
                                getInfluenceColor()
                            ),
                            fontWeight: 600,
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {record.firstName} {record.lastName}
                        </Typography>
                        {role && (
                            <Typography variant="body2" color="text.secondary">
                                {role.label}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Organization */}
                {organization && (
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                            }}
                        >
                            <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Link
                                to={`/organizations/${organization.id}/show`}
                                style={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                {organization.name}
                            </Link>
                        </Typography>
                    </Box>
                )}

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                    {record.email && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            {record.email}
                        </Typography>
                    )}
                    {record.phone && (
                        <Typography variant="body2" color="text.secondary">
                            {record.phone}
                        </Typography>
                    )}
                </Box>

                {/* Business Context Chips */}
                <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}
                >
                    {influenceLevel && (
                        <Chip
                            label={influenceLevel.label}
                            size="small"
                            sx={{
                                backgroundColor:
                                    influenceLevel.color ||
                                    theme.palette.grey[300],
                                color: theme.palette.getContrastText(
                                    influenceLevel.color ||
                                        theme.palette.grey[300]
                                ),
                                fontSize: '0.7rem',
                                height: 24,
                            }}
                        />
                    )}
                    {decisionRole && (
                        <Chip
                            label={decisionRole.label}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderColor:
                                    decisionRole.color ||
                                    theme.palette.grey[400],
                                color:
                                    decisionRole.color ||
                                    theme.palette.text.secondary,
                                fontSize: '0.7rem',
                                height: 24,
                            }}
                        />
                    )}
                </Box>

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
                            aria-label="Call contact"
                        >
                            <PhoneIcon fontSize="small" />
                        </IconButton>
                    )}
                    {record.email && (
                        <IconButton
                            size="small"
                            onClick={handleEmailClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="Email contact"
                        >
                            <EmailIcon fontSize="small" />
                        </IconButton>
                    )}
                    {record.linkedInUrl && (
                        <IconButton
                            size="small"
                            onClick={handleLinkedInClick}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                                color: theme.palette.primary.main,
                            }}
                            aria-label="LinkedIn profile"
                        >
                            <LinkedInIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <IconButton
                    size="small"
                    component={Link}
                    to={`/contacts/${record.id}/edit`}
                    sx={{
                        minWidth: 44,
                        minHeight: 44,
                        color: theme.palette.text.secondary,
                    }}
                    aria-label="Edit contact"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </CardActions>
        </Card>
    );
};
