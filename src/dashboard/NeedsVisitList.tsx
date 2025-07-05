import React, { useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    Chip,
    Avatar,
    IconButton,
    Button,
    Divider,
    Stack,
    Badge,
} from '@/components/ui-kit';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTwTheme } from '../hooks/useTwTheme';
import {
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
    PlusIcon,
    MapPinIcon,
    StarIcon,
    TrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, subDays, differenceInDays } from 'date-fns';
import { useGetList, Link } from 'react-admin';
import { useNavigate } from 'react-router-dom';

import { Organization, Interaction, Setting } from '../types';
import { useOrganizationsNeedingVisit } from '../hooks/useReporting';

interface OrganizationWithLastInteraction
    extends Omit<Organization, 'priority' | 'segment'> {
    lastInteractionDate?: string;
    daysSinceLastInteraction: number;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    priorityColor?: string;
    segmentColor?: string;
    priority?: string; // API returns string, not Setting object
    segment?: string; // API returns string, not Setting object
}

export const NeedsVisitList = () => {
    const theme = useTwTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const navigate = useNavigate();

    // Use the new reporting API for organizations needing visits
    const {
        data: needsVisitData,
        loading: needsVisitLoading,
        fetch: fetchNeedsVisit,
    } = useOrganizationsNeedingVisit();

    // Get priority and segment settings for color coding (still needed for legacy display)
    const { data: priorities } = useGetList<Setting>('settings', {
        filter: { category: 'priority' },
        pagination: { page: 1, perPage: 20 },
    });

    const { data: segments } = useGetList<Setting>('settings', {
        filter: { category: 'segment' },
        pagination: { page: 1, perPage: 20 },
    });

    // Load needs visit data on component mount
    useEffect(() => {
        fetchNeedsVisit();
    }, [fetchNeedsVisit]);

    const organizationsNeedingVisit = useMemo(() => {
        // If we have data from the reporting API, use it; otherwise use legacy calculation
        if (needsVisitData && needsVisitData.length > 0) {
            return needsVisitData.map(org => {
                // Map the API data to the component's expected format
                let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' =
                    'low';
                if (org.daysSinceContact >= 60) urgencyLevel = 'critical';
                else if (org.daysSinceContact >= 45) urgencyLevel = 'high';
                else if (org.daysSinceContact >= 30) urgencyLevel = 'medium';

                const priority = priorities?.find(
                    p => p.label === org.priority
                );
                const segment = segments?.find(s => s.label === org.segment);

                return {
                    id: org.id,
                    name: org.name,
                    segment: org.segment,
                    priority: org.priority,
                    lastInteractionDate: org.lastContactDate,
                    daysSinceLastInteraction: org.daysSinceContact,
                    urgencyLevel,
                    priorityColor: priority?.color,
                    segmentColor: segment?.color,
                    accountManager: org.accountManager,
                    contactCount: org.contactCount,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as OrganizationWithLastInteraction;
            });
        }

        // Legacy calculation fallback (can be removed once reporting API is fully tested)
        return [];
    }, [needsVisitData, priorities, segments]);

    const stats = useMemo(() => {
        if (!needsVisitData || needsVisitData.length === 0) {
            return { total: 0, critical: 0, high: 0, neverContacted: 0 };
        }

        return {
            total: needsVisitData.length,
            critical: needsVisitData.filter(org => org.daysSinceContact >= 90)
                .length,
            high: needsVisitData.filter(
                org => org.daysSinceContact >= 60 && org.daysSinceContact < 90
            ).length,
            neverContacted: needsVisitData.filter(org => !org.lastContactDate)
                .length,
        };
    }, [needsVisitData]);

    const getUrgencyColor = (urgencyLevel: string) => {
        switch (urgencyLevel) {
            case 'critical':
                return '#dc2626'; // red-600
            case 'high':
                return '#d97706'; // amber-600
            case 'medium':
                return '#2563eb'; // blue-600
            default:
                return '#16a34a'; // green-600
        }
    };

    const getUrgencyIcon = (org: OrganizationWithLastInteraction) => {
        if (org.urgencyLevel === 'critical') {
            return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
        }
        if (org.urgencyLevel === 'high') {
            return <TrendingDownIcon className="w-5 h-5 text-yellow-600" />;
        }
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
    };

    const handleOrganizationClick = (org: OrganizationWithLastInteraction) => {
        navigate(`/organizations/${org.id}/show`);
    };

    const handleCreateInteraction = (
        orgId: number,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        navigate(`/interactions/create?organizationId=${orgId}`);
    };

    if (needsVisitLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Organizations Needing Attention
                    </Typography>
                    <Typography color="textSecondary">Loading...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h6">Needs Attention</Typography>
                    <Link
                        to="/organizations"
                        style={{ textDecoration: 'none' }}
                    >
                        <Button size="small" color="primary">
                            View All
                        </Button>
                    </Link>
                </Box>

                {/* Quick Stats */}
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mb: 2 }}
                >
                    <Chip
                        size="small"
                        icon={<ExclamationTriangleIcon className="w-4 h-4" />}
                        label={`${stats.critical} Critical (90+ days)`}
                        color={stats.critical > 0 ? 'error' : 'default'}
                        variant={stats.critical > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<TrendingDownIcon className="w-4 h-4" />}
                        label={`${stats.high} High (60+ days)`}
                        color={stats.high > 0 ? 'warning' : 'default'}
                        variant={stats.high > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<BuildingOfficeIcon className="w-4 h-4" />}
                        label={`${stats.neverContacted} Never contacted`}
                        color={stats.neverContacted > 0 ? 'info' : 'default'}
                        variant="outlined"
                    />
                </Stack>

                {organizationsNeedingVisit.length === 0 ? (
                    <Box textAlign="center" py={3}>
                        <BusinessIcon
                            color="disabled"
                            sx={{ fontSize: 48, mb: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary">
                            All organizations are up to date!
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Great job staying in touch with your clients
                        </Typography>
                    </Box>
                ) : (
                    <List dense={isMobile} sx={{ p: 0 }}>
                        {organizationsNeedingVisit.map((org, index) => (
                            <React.Fragment key={org.id}>
                                <ListItem
                                    button
                                    onClick={() => handleOrganizationClick(org)}
                                    sx={{
                                        borderLeft: `4px solid ${getUrgencyColor(org.urgencyLevel)}`,
                                        mb: 1,
                                        borderRadius: 1,
                                        backgroundColor:
                                            org.urgencyLevel === 'critical'
                                                ? '#dc262620' // red-600 with 20% opacity
                                                : org.urgencyLevel === 'high'
                                                  ? '#d9770620' // amber-600 with 20% opacity
                                                  : 'transparent',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Badge
                                            badgeContent={
                                                org.priority ? (
                                                    <PriorityIcon
                                                        sx={{
                                                            fontSize: 12,
                                                            color:
                                                                org.priorityColor ||
                                                                '#2563eb', // blue-600
                                                        }}
                                                    />
                                                ) : null
                                            }
                                            overlap="circular"
                                        >
                                            {getUrgencyIcon(org)}
                                        </Badge>
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                            >
                                                <Typography
                                                    variant={
                                                        isMobile
                                                            ? 'body2'
                                                            : 'subtitle2'
                                                    }
                                                    noWrap={isMobile}
                                                    fontWeight="medium"
                                                >
                                                    {org.name}
                                                </Typography>
                                                {org.segment && (
                                                    <Chip
                                                        size="small"
                                                        label={String(
                                                            org.segment
                                                        )}
                                                        sx={{
                                                            backgroundColor:
                                                                org.segmentColor ||
                                                                '#e5e7eb', // gray-200
                                                            color: org.segmentColor 
                                                                ? (org.segmentColor.includes('#') && parseInt(org.segmentColor.substr(1), 16) > 0x888888) 
                                                                    ? '#000000' // black for light colors
                                                                    : '#ffffff' // white for dark colors
                                                                : '#374151', // gray-700 for default
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Stack spacing={0.5}>
                                                {org.address && (
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        <LocationIcon
                                                            sx={{
                                                                fontSize: 14,
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            noWrap={isMobile}
                                                        >
                                                            {org.city},{' '}
                                                            {org.state}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Typography
                                                    variant="caption"
                                                    color={
                                                        org.urgencyLevel ===
                                                        'critical'
                                                            ? 'error'
                                                            : 'textSecondary'
                                                    }
                                                    fontWeight={
                                                        org.urgencyLevel ===
                                                        'critical'
                                                            ? 'bold'
                                                            : 'normal'
                                                    }
                                                >
                                                    {org.lastInteractionDate
                                                        ? `Last contact ${formatDistanceToNow(new Date(org.lastInteractionDate))} ago`
                                                        : 'Never contacted'}
                                                </Typography>

                                                {org.accountManager && (
                                                    <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                    >
                                                        Account Manager:{' '}
                                                        {org.accountManager}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        }
                                    />

                                    <ListItemSecondaryAction>
                                        <Stack direction="row" spacing={0.5}>
                                            {org.phone && (
                                                <IconButton
                                                    size="small"
                                                    href={`tel:${org.phone}`}
                                                    onClick={e =>
                                                        e.stopPropagation()
                                                    }
                                                    title="Call organization"
                                                >
                                                    <PhoneIcon
                                                        sx={{ fontSize: 16 }}
                                                    />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={e =>
                                                    handleCreateInteraction(
                                                        org.id,
                                                        e
                                                    )
                                                }
                                                title="Log interaction"
                                                color="primary"
                                            >
                                                <AddIcon
                                                    sx={{ fontSize: 16 }}
                                                />
                                            </IconButton>
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index <
                                    organizationsNeedingVisit.length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                {/* Quick Action Button */}
                <Box mt={2}>
                    <Link
                        to="/interactions/create"
                        style={{ textDecoration: 'none', width: '100%' }}
                    >
                        <Button
                            variant="outlined"
                            fullWidth={isMobile}
                            size="small"
                            startIcon={<AddIcon />}
                        >
                            Log Interaction
                        </Button>
                    </Link>
                </Box>
            </CardContent>
        </Card>
    );
};
