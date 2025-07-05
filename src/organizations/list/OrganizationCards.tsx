import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardFooter,
    Avatar,
    Typography,
    Chip,
    IconButton,
    Box,
    Button,
} from '@/components/ui-kit';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import {
    PencilIcon as EditIcon,
    EyeIcon as ViewIcon,
    BuildingOfficeIcon as BusinessIcon,
    PhoneIcon,
    EnvelopeIcon as EmailIcon,
    MapPinIcon as LocationIcon,
} from '@heroicons/react/24/outline';
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
    const theme = useTwTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

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
            <Box className="p-6 text-center">
                <Typography>Loading organizations...</Typography>
            </Box>
        );
    }

    if (organizations.length === 0) {
        return (
            <Box className="p-6 text-center">
                <Typography variant="h6" className="text-gray-600">
                    No organizations found
                </Typography>
            </Box>
        );
    }

    return (
        <Grid 
            container 
            spacing={isMobile ? 2 : 3} 
            className="mt-2 mb-6"
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
                        className={`h-full flex flex-col transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg cursor-pointer min-h-[280px] ${
                            isMobile ? 'organization-card-mobile' : 'organization-card-desktop'
                        }`}
                    >
                        <CardContent className="flex-grow pb-2">
                            {/* Header with avatar and basic info */}
                            <Box className="flex items-start gap-4 mb-4">
                                <Avatar 
                                    src={org.logo}
                                    className="w-12 h-12"
                                >
                                    <BusinessIcon />
                                </Avatar>
                                <Box className="flex-grow min-w-0">
                                    <Typography 
                                        variant="h6" 
                                        component="h3"
                                        className="font-semibold text-lg leading-tight mb-1 overflow-hidden text-ellipsis line-clamp-2"
                                    >
                                        {org.name}
                                    </Typography>
                                    {org.business_type && (
                                        <Chip
                                            label={org.business_type}
                                            size="small"
                                            color={getBusinessTypeColor(org.business_type) as any}
                                            variant="outlined"
                                            className="text-xs"
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Contact information */}
                            <Box className="mb-4">
                                {org.contact_person && (
                                    <Typography variant="body2" className="text-gray-600 mb-1">
                                        👤 {org.contact_person}
                                    </Typography>
                                )}
                                {org.email && (
                                    <Box className="flex items-center gap-1 mb-1">
                                        <EmailIcon className="w-4 h-4 text-gray-600" />
                                        <Typography 
                                            variant="body2" 
                                            className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-500"
                                        >
                                            {org.email}
                                        </Typography>
                                    </Box>
                                )}
                                {org.phone_number && (
                                    <Box className="flex items-center gap-1 mb-1">
                                        <PhoneIcon className="w-4 h-4 text-gray-600" />
                                        <Typography variant="body2" className="text-gray-500">
                                            {org.phone_number}
                                        </Typography>
                                    </Box>
                                )}
                                {(org.city || org.stateAbbr) && (
                                    <Box className="flex items-center gap-1">
                                        <LocationIcon className="w-4 h-4 text-gray-600" />
                                        <Typography variant="body2" className="text-gray-500">
                                            {[org.city, org.stateAbbr].filter(Boolean).join(', ')}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Metrics and status */}
                            <Box className="flex flex-wrap gap-2 mb-4">
                                {org.nb_contacts !== undefined && (
                                    <Chip
                                        label={`${org.nb_contacts} contacts`}
                                        size="small"
                                        variant="outlined"
                                        className="text-xs"
                                    />
                                )}
                                {org.nb_deals !== undefined && (
                                    <Chip
                                        label={`${org.nb_deals} deals`}
                                        size="small"
                                        variant="outlined"
                                        className="text-xs"
                                    />
                                )}
                                {formatRevenue(org.revenue) && (
                                    <Chip
                                        label={formatRevenue(org.revenue)}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        className="text-xs font-semibold"
                                    />
                                )}
                            </Box>

                            {/* Priority and status indicators */}
                            <Box className="flex gap-2 flex-wrap">
                                {org.priority && (
                                    <Chip
                                        label={`${org.priority} priority`}
                                        size="small"
                                        color={getPriorityColor(org.priority) as any}
                                        variant="filled"
                                        className="text-xs"
                                    />
                                )}
                                {org.status && (
                                    <Chip
                                        label={org.status}
                                        size="small"
                                        className={`status-${org.status} text-xs`}
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </CardContent>

                        <CardFooter className="px-4 pb-4 pt-0 justify-between">
                            <Button
                                size="small"
                                startIcon={<ViewIcon className="w-4 h-4" />}
                                className="min-h-9 text-sm"
                            >
                                View
                            </Button>
                            <IconButton 
                                size="small"
                                aria-label={`Edit ${org.name}`}
                                className="min-h-9 min-w-9"
                            >
                                <EditIcon className="w-4 h-4" />
                            </IconButton>
                        </CardFooter>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};