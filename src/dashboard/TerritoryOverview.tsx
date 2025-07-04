import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '../components/ui-kit';
import {
    MapPinIcon as LocationIcon,
    BuildingStorefrontIcon as RestaurantIcon,
    BuildingStorefrontIcon as StoreIcon,
    BuildingOfficeIcon as BusinessIcon,
    TruckIcon as DistributorIcon,
    TrendingUpIcon as GrowthIcon,
    ClockIcon as RecentIcon,
} from '@heroicons/react/24/outline';
import { Customer, Visit } from '../types';

interface TerritoryOverviewProps {
    customers: Customer[];
    visits: Visit[];
}

const getBusinessTypeIcon = (type: string) => {
    const iconMap = {
        restaurant: <RestaurantIcon className="h-5 w-5" />,
        grocery: <StoreIcon className="h-5 w-5" />,
        distributor: <DistributorIcon className="h-5 w-5" />,
        other: <BusinessIcon className="h-5 w-5" />,
    };
    return (
        iconMap[type as keyof typeof iconMap] || (
            <BusinessIcon className="h-5 w-5" />
        )
    );
};

const getBusinessTypeColor = (type: string) => {
    const colorMap = {
        restaurant: 'error',
        grocery: 'success',
        distributor: 'warning',
        other: 'default',
    };
    return colorMap[type as keyof typeof colorMap] || 'default';
};

export const TerritoryOverview = ({
    customers,
    visits,
}: TerritoryOverviewProps) => {
    // Business type breakdown
    const businessTypes = customers.reduce(
        (acc, customer) => {
            acc[customer.business_type] =
                (acc[customer.business_type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Customer visit status analysis
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const customersNeedingAttention = customers.filter(c => {
        if (!c.last_visit_date) return true; // Never visited
        const lastVisit = new Date(c.last_visit_date);
        return lastVisit < twoWeeksAgo; // Not visited in 2+ weeks
    });

    const recentlyVisited = customers.filter(c => {
        if (!c.last_visit_date) return false;
        const lastVisit = new Date(c.last_visit_date);
        return lastVisit >= oneWeekAgo; // Visited in last week
    });

    // GPS coverage by area (simplified - in real app would use actual geographic clustering)
    const visitsWithGPS = visits.filter(v => v.latitude && v.longitude);
    const gpsCoverage =
        visits.length > 0
            ? Math.round((visitsWithGPS.length / visits.length) * 100)
            : 0;

    // Recent activity in territory
    const recentVisits = visits
        .filter(v => new Date(v.visit_date) >= oneWeekAgo)
        .sort(
            (a, b) =>
                new Date(b.visit_date).getTime() -
                new Date(a.visit_date).getTime()
        )
        .slice(0, 5);

    return (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Type Distribution */}
            <Card>
                <CardContent>
                    <Typography variant="h6" className="mb-2 flex items-center">
                        <BusinessIcon className="h-5 w-5 mr-2" />
                        Business Mix
                    </Typography>

                    <List dense>
                        {Object.entries(businessTypes).map(([type, count]) => (
                            <ListItem key={type} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    {getBusinessTypeIcon(type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        type.charAt(0).toUpperCase() +
                                        type.slice(1)
                                    }
                                    secondary={`${count} customer${count !== 1 ? 's' : ''}`}
                                />
                                <Chip
                                    label={count}
                                    color={getBusinessTypeColor(type) as any}
                                    size="small"
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Box
                        sx={{
                            mt: 2,
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            <strong>Territory Coverage:</strong> {gpsCoverage}%
                            GPS tracked visits
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Customer Status Overview */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <GrowthIcon sx={{ mr: 1 }} />
                        Customer Status
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography variant="body2">
                                Need Attention
                            </Typography>
                            <Chip
                                label={customersNeedingAttention.length}
                                color={
                                    customersNeedingAttention.length > 0
                                        ? 'error'
                                        : 'success'
                                }
                                size="small"
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Customers not visited in 2+ weeks
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography variant="body2">
                                Recently Visited
                            </Typography>
                            <Chip
                                label={recentlyVisited.length}
                                color="success"
                                size="small"
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Visited in the last week
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography variant="body2">
                                Total Territory
                            </Typography>
                            <Chip
                                label={customers.length}
                                color="primary"
                                size="small"
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            All customers in your territory
                        </Typography>
                    </Box>

                    {customersNeedingAttention.length > 0 && (
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 1 }}
                        >
                            View Customers Needing Attention
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Recent Territory Activity */}
            <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <RecentIcon sx={{ mr: 1 }} />
                        Recent Territory Activity
                    </Typography>

                    {recentVisits.length === 0 ? (
                        <Typography color="text.secondary">
                            No recent visits in your territory this week.
                        </Typography>
                    ) : (
                        <List dense>
                            {recentVisits.map(visit => (
                                <ListItem key={visit.id} sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <LocationIcon
                                            color={
                                                visit.latitude &&
                                                visit.longitude
                                                    ? 'success'
                                                    : 'disabled'
                                            }
                                            fontSize="small"
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            visit.customer_name ||
                                            `Customer #${visit.customer_id}`
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {visit.visit_type.replace(
                                                        '_',
                                                        ' '
                                                    )}{' '}
                                                    •{' '}
                                                    {new Date(
                                                        visit.visit_date
                                                    ).toLocaleDateString()}{' '}
                                                    at{' '}
                                                    {new Date(
                                                        visit.visit_date
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                                {visit.notes && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {visit.notes.slice(
                                                            0,
                                                            60
                                                        )}
                                                        {visit.notes.length > 60
                                                            ? '...'
                                                            : ''}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    {visit.duration_minutes && (
                                        <Chip
                                            label={`${visit.duration_minutes}m`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};
