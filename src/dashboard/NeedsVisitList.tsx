import React, { useMemo } from 'react';
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
    useTheme,
    useMediaQuery,
    Badge,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Business as BusinessIcon,
    Schedule as ScheduleIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Add as AddIcon,
    LocationOn as LocationIcon,
    Star as PriorityIcon,
    TrendingDown as StaleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, subDays, differenceInDays } from 'date-fns';
import { useGetList, Link } from 'react-admin';
import { useNavigate } from 'react-router-dom';

import { Organization, Interaction, Setting } from '../types';

interface OrganizationWithLastInteraction extends Organization {
    lastInteractionDate?: string;
    daysSinceLastInteraction: number;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    priorityColor?: string;
    segmentColor?: string;
}

export const NeedsVisitList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // Get organizations
    const { data: organizations, isPending: organizationsPending } = useGetList<Organization>('organizations', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
    });

    // Get all interactions to find last contact dates
    const { data: interactions, isPending: interactionsPending } = useGetList<Interaction>('interactions', {
        pagination: { page: 1, perPage: 5000 },
        sort: { field: 'completedDate', order: 'DESC' },
        filter: { isCompleted: true },
    });

    // Get priority and segment settings for color coding
    const { data: priorities } = useGetList<Setting>('settings', {
        filter: { category: 'priority' },
        pagination: { page: 1, perPage: 20 },
    });

    const { data: segments } = useGetList<Setting>('settings', {
        filter: { category: 'segment' },
        pagination: { page: 1, perPage: 20 },
    });

    const organizationsNeedingVisit = useMemo(() => {
        if (!organizations || !interactions) return [];

        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        return organizations
            .map((org): OrganizationWithLastInteraction => {
                // Find the most recent completed interaction for this organization
                const orgInteractions = interactions.filter(i => 
                    i.organizationId === org.id && i.completedDate
                );
                
                const latestInteraction = orgInteractions
                    .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())[0];

                const lastInteractionDate = latestInteraction?.completedDate;
                const daysSinceLastInteraction = lastInteractionDate
                    ? differenceInDays(now, new Date(lastInteractionDate))
                    : 9999; // Very high number for organizations never contacted

                // Calculate urgency level based on days since last interaction and priority
                let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
                
                if (daysSinceLastInteraction > 90) urgencyLevel = 'critical';
                else if (daysSinceLastInteraction > 60) urgencyLevel = 'high';
                else if (daysSinceLastInteraction > 30) urgencyLevel = 'medium';

                // Increase urgency for high-priority organizations
                const priority = priorities?.find(p => p.id === org.priorityId);
                if (priority?.key === 'high' && urgencyLevel === 'low') urgencyLevel = 'medium';
                if (priority?.key === 'urgent') urgencyLevel = 'critical';

                // Get colors for priority and segment
                const priorityColor = priority?.color;
                const segment = segments?.find(s => s.id === org.segmentId);
                const segmentColor = segment?.color;

                return {
                    ...org,
                    lastInteractionDate,
                    daysSinceLastInteraction,
                    urgencyLevel,
                    priorityColor,
                    segmentColor,
                };
            })
            .filter(org => org.daysSinceLastInteraction >= 30) // Only show organizations needing attention
            .sort((a, b) => {
                // Sort by urgency first, then by days since last interaction
                const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
                if (urgencyDiff !== 0) return urgencyDiff;
                
                return b.daysSinceLastInteraction - a.daysSinceLastInteraction;
            })
            .slice(0, isMobile ? 8 : 12); // Show fewer on mobile
    }, [organizations, interactions, priorities, segments, isMobile]);

    const stats = useMemo(() => {
        if (!organizations || !interactions) return { total: 0, critical: 0, high: 0, neverContacted: 0 };

        const now = new Date();
        const allOrgsWithInteractions = organizations.map(org => {
            const orgInteractions = interactions.filter(i => 
                i.organizationId === org.id && i.completedDate
            );
            const latestInteraction = orgInteractions
                .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())[0];
            
            const daysSinceLastInteraction = latestInteraction?.completedDate
                ? differenceInDays(now, new Date(latestInteraction.completedDate))
                : 9999;

            return { ...org, daysSinceLastInteraction, hasInteractions: !!latestInteraction };
        });

        return {
            total: allOrgsWithInteractions.filter(org => org.daysSinceLastInteraction >= 30).length,
            critical: allOrgsWithInteractions.filter(org => org.daysSinceLastInteraction > 90).length,
            high: allOrgsWithInteractions.filter(org => org.daysSinceLastInteraction > 60 && org.daysSinceLastInteraction <= 90).length,
            neverContacted: allOrgsWithInteractions.filter(org => !org.hasInteractions).length,
        };
    }, [organizations, interactions]);

    const getUrgencyColor = (urgencyLevel: string) => {
        switch (urgencyLevel) {
            case 'critical': return theme.palette.error.main;
            case 'high': return theme.palette.warning.main;
            case 'medium': return theme.palette.info.main;
            default: return theme.palette.success.main;
        }
    };

    const getUrgencyIcon = (org: OrganizationWithLastInteraction) => {
        if (org.urgencyLevel === 'critical') {
            return <WarningIcon color="error" />;
        }
        if (org.urgencyLevel === 'high') {
            return <StaleIcon color="warning" />;
        }
        return <ScheduleIcon color="info" />;
    };

    const handleOrganizationClick = (org: OrganizationWithLastInteraction) => {
        navigate(`/organizations/${org.id}/show`);
    };

    const handleCreateInteraction = (orgId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/interactions/create?organizationId=${orgId}`);
    };

    if (organizationsPending || interactionsPending) {
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Needs Attention
                    </Typography>
                    <Link to="/organizations" style={{ textDecoration: 'none' }}>
                        <Button size="small" color="primary">
                            View All
                        </Button>
                    </Link>
                </Box>

                {/* Quick Stats */}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    <Chip
                        size="small"
                        icon={<WarningIcon />}
                        label={`${stats.critical} Critical (90+ days)`}
                        color={stats.critical > 0 ? 'error' : 'default'}
                        variant={stats.critical > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<StaleIcon />}
                        label={`${stats.high} High (60+ days)`}
                        color={stats.high > 0 ? 'warning' : 'default'}
                        variant={stats.high > 0 ? 'filled' : 'outlined'}
                    />
                    <Chip
                        size="small"
                        icon={<BusinessIcon />}
                        label={`${stats.neverContacted} Never contacted`}
                        color={stats.neverContacted > 0 ? 'info' : 'default'}
                        variant="outlined"
                    />
                </Stack>

                {organizationsNeedingVisit.length === 0 ? (
                    <Box textAlign="center" py={3}>
                        <BusinessIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
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
                                        backgroundColor: org.urgencyLevel === 'critical' 
                                            ? theme.palette.error.main + '08'
                                            : org.urgencyLevel === 'high'
                                                ? theme.palette.warning.main + '08'
                                                : 'transparent',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Badge
                                            badgeContent={
                                                org.priorityId ? (
                                                    <PriorityIcon 
                                                        sx={{ 
                                                            fontSize: 12, 
                                                            color: org.priorityColor || theme.palette.primary.main 
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
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography 
                                                    variant={isMobile ? "body2" : "subtitle2"}
                                                    noWrap={isMobile}
                                                    fontWeight="medium"
                                                >
                                                    {org.name}
                                                </Typography>
                                                {org.segmentId && (
                                                    <Chip
                                                        size="small"
                                                        label={segments?.find(s => s.id === org.segmentId)?.label || ''}
                                                        sx={{
                                                            backgroundColor: org.segmentColor || theme.palette.grey[200],
                                                            color: theme.palette.getContrastText(org.segmentColor || theme.palette.grey[200]),
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
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <LocationIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption" noWrap={isMobile}>
                                                            {org.city}, {org.state}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                
                                                <Typography 
                                                    variant="caption" 
                                                    color={org.urgencyLevel === 'critical' ? 'error' : 'textSecondary'}
                                                    fontWeight={org.urgencyLevel === 'critical' ? 'bold' : 'normal'}
                                                >
                                                    {org.lastInteractionDate 
                                                        ? `Last contact ${formatDistanceToNow(new Date(org.lastInteractionDate))} ago`
                                                        : 'Never contacted'
                                                    }
                                                </Typography>
                                                
                                                {org.accountManager && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Account Manager: {org.accountManager}
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
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Call organization"
                                                >
                                                    <PhoneIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            )}
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => handleCreateInteraction(org.id, e)}
                                                title="Log interaction"
                                                color="primary"
                                            >
                                                <AddIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < organizationsNeedingVisit.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                {/* Quick Action Button */}
                <Box mt={2}>
                    <Link to="/interactions/create" style={{ textDecoration: 'none', width: '100%' }}>
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