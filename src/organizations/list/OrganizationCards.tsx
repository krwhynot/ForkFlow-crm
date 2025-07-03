import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Box,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as ViewIcon,
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Organization, OrganizationListViewMode } from '../../types';

interface OrganizationCardsProps {
    organizations: Organization[];
    loading?: boolean;
    viewMode: OrganizationListViewMode;
}

/**
 * Card view component for organizations with responsive grid layout
 * Optimized for both mobile and desktop with touch-friendly interactions
 */
export const OrganizationCards: React.FC<OrganizationCardsProps> = ({
    organizations,
    loading = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const getGridColumns = () => {
        if (isMobile) return 1;
        if (isTablet) return 2;
        return 3;
    };

    const formatRevenue = (revenue?: number) => {
        if (!revenue) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
        }).format(revenue);
    };

    const getBusinessTypeColor = (type?: string) => {
        switch (type) {
            case 'restaurant': return 'warning';
            case 'grocery': return 'success';
            case 'distributor': return 'secondary';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading organizations...</Typography>
            </Box>
        );
    }

    if (organizations.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No organizations found
                </Typography>
            </Box>
        );
    }

    return (
        <Grid 
            container 
            spacing={isMobile ? 2 : 3} 
            sx={{ mt: 1, mb: 3 }}
        >
            {organizations.map((org) => (
                <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    md={6} 
                    lg={4} 
                    xl={3}
                    key={org.id}
                >
                    <Card
                        className={isMobile ? 'organization-card-mobile' : 'organization-card-desktop'}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4],
                            },
                            cursor: 'pointer',
                            minHeight: '280px',
                        }}
                    >
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            {/* Header with avatar and basic info */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                <Avatar 
                                    src={org.logo}
                                    sx={{ width: 48, height: 48 }}
                                >
                                    <BusinessIcon />
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="h6" 
                                        component="h3"
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            lineHeight: 1.2,
                                            mb: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {org.name}
                                    </Typography>
                                    {org.business_type && (
                                        <Chip
                                            label={org.business_type}
                                            size="small"
                                            color={getBusinessTypeColor(org.business_type) as any}
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Contact information */}
                            <Box sx={{ mb: 2 }}>
                                {org.contact_person && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        👤 {org.contact_person}
                                    </Typography>
                                )}
                                {org.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {org.email}
                                        </Typography>
                                    </Box>
                                )}
                                {org.phone_number && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <PhoneIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {org.phone_number}
                                        </Typography>
                                    </Box>
                                )}
                                {(org.city || org.stateAbbr) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {[org.city, org.stateAbbr].filter(Boolean).join(', ')}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Metrics and status */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {org.nb_contacts !== undefined && (
                                    <Chip
                                        label={`${org.nb_contacts} contacts`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {org.nb_deals !== undefined && (
                                    <Chip
                                        label={`${org.nb_deals} deals`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {formatRevenue(org.revenue) && (
                                    <Chip
                                        label={formatRevenue(org.revenue)}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                    />
                                )}
                            </Box>

                            {/* Priority and status indicators */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {org.priority && (
                                    <Chip
                                        label={`${org.priority} priority`}
                                        size="small"
                                        color={getPriorityColor(org.priority) as any}
                                        variant="filled"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                                {org.status && (
                                    <Chip
                                        label={org.status}
                                        size="small"
                                        className={`status-${org.status}`}
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                )}
                            </Box>
                        </CardContent>

                        <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                            <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                sx={{ 
                                    minHeight: '36px',
                                    fontSize: '0.8rem',
                                }}
                            >
                                View
                            </Button>
                            <IconButton 
                                size="small"
                                aria-label={`Edit ${org.name}`}
                                sx={{ 
                                    minHeight: '36px', 
                                    minWidth: '36px',
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};