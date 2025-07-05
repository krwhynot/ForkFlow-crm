import {
    Badge,
    Box,
    Card,
    CardContent,
    Chip,
    Fab,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Typography,
} from '@/components/ui-kit';
import {
    RectangleGroupIcon as AccountTreeIcon,
    PlusIcon as AddIcon,
    ArrowTrendingUpIcon,
    BuildingOfficeIcon as BusinessIcon,
    RectangleStackIcon as CategoryIcon,
    ChatBubbleLeftRightIcon as ChatIcon,
    TruckIcon as LocalShippingIcon,
    UserIcon as PersonIcon,
    LightBulbIcon as PsychologyIcon,
    CogIcon as SettingsIcon,
    ChartBarIcon as TimelineIcon,
    EyeIcon as VisibilityIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import {
    useGetList
} from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTwTheme } from '../hooks/useTwTheme';
import { Setting } from '../types';

interface CategoryInfo {
    key: string;
    label: string;
    icon: React.ReactElement;
    color: string;
    description: string;
}

const CATEGORY_CONFIG: Record<string, CategoryInfo> = {
    priority: {
        key: 'priority',
        label: 'Priorities',
        icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
        color: '#22c55e',
        description: 'Organization priority levels (A-D)',
    },
    segment: {
        key: 'segment',
        label: 'Segments',
        icon: <CategoryIcon className="w-5 h-5" />,
        color: '#8b5cf6',
        description: 'Market segments for targeting',
    },
    distributor: {
        key: 'distributor',
        label: 'Distributors',
        icon: <LocalShippingIcon className="w-5 h-5" />,
        color: '#f59e0b',
        description: 'Distribution channel partners',
    },
    role: {
        key: 'role',
        label: 'Roles',
        icon: <PersonIcon className="w-5 h-5" />,
        color: '#3b82f6',
        description: 'Contact job roles and positions',
    },
    influence: {
        key: 'influence',
        label: 'Influence Levels',
        icon: <PsychologyIcon className="w-5 h-5" />,
        color: '#ef4444',
        description: 'Decision-making influence levels',
    },
    decision: {
        key: 'decision',
        label: 'Decision Roles',
        icon: <AccountTreeIcon className="w-5 h-5" />,
        color: '#f59e0b',
        description: 'Roles in decision-making process',
    },
    principal: {
        key: 'principal',
        label: 'Principals',
        icon: <BusinessIcon className="w-5 h-5" />,
        color: '#607d8b',
        description: 'Food service brand principals',
    },
    stage: {
        key: 'stage',
        label: 'Pipeline Stages',
        icon: <TimelineIcon className="w-5 h-5" />,
        color: '#059669',
        description: 'Sales pipeline stages',
    },
    interaction_type: {
        key: 'interaction_type',
        label: 'Interaction Types',
        icon: <ChatIcon className="w-5 h-5" />,
        color: '#3b82f6',
        description: 'Customer interaction methods',
    },
};

interface CategoryCardProps {
    category: CategoryInfo;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    onManage: (category: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    stats,
    onManage,
}) => {
    const theme = useTwTheme();
    const isMobile = useBreakpoint('sm');

    return (
        <Card
            className="h-full cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderLeft: `4px solid ${category.color}` }}
            onClick={() => onManage(category.key)}
        >
            <CardContent className="p-2">
                <Box className="flex items-center justify-between mb-1">
                    <Box className="flex items-center gap-1">
                        <Box
                            className="flex items-center"
                            style={{ color: category.color }}
                        >
                            {category.icon}
                        </Box>
                        <Typography
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            className="font-bold"
                        >
                            {category.label}
                        </Typography>
                    </Box>
                    <Badge badgeContent={stats.total} className="text-blue-600" max={99}>
                        <SettingsIcon className="w-4 h-4" />
                    </Badge>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    className="mb-2 min-h-8"
                >
                    {category.description}
                </Typography>

                <Box className="flex justify-between items-center">
                    <Box className="flex gap-1 flex-wrap">
                        <Chip
                            label={`${stats.active} Active`}
                            size="small"
                            className="border-green-500 text-green-500"
                            variant="outlined"
                        />
                        {stats.inactive > 0 && (
                            <Chip
                                label={`${stats.inactive} Inactive`}
                                size="small"
                                className="border-gray-500 text-gray-500"
                                variant="outlined"
                            />
                        )}
                    </Box>
                    <Box className="flex gap-0.5">
                        <IconButton
                            size="small"
                            onClick={e => {
                                e.stopPropagation();
                                // Navigate to create new setting
                                window.location.href = `/settings/create?category=${category.key}`;
                            }}
                            className="min-w-11 min-h-11"
                        >
                            <AddIcon className="w-4 h-4" />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box className="pt-3">{children}</Box>}
    </div>
);

export const SettingsAdminDashboard: React.FC = () => {
    const isMobile = useBreakpoint('md');
    const [activeTab, setActiveTab] = useState(0);
    const [categoryStats, setCategoryStats] = useState<Record<string, any>>({});

    const { data: settings, isLoading } = useGetList<Setting>('settings', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'category', order: 'ASC' },
    });

    // Calculate statistics for each category
    useEffect(() => {
        if (settings) {
            const stats = settings.reduce(
                (acc, setting) => {
                    const category = setting.category;
                    if (!acc[category]) {
                        acc[category] = { total: 0, active: 0, inactive: 0 };
                    }
                    acc[category].total++;
                    if (setting.active) {
                        acc[category].active++;
                    } else {
                        acc[category].inactive++;
                    }
                    return acc;
                },
                {} as Record<string, any>
            );
            setCategoryStats(stats);
        }
    }, [settings]);

    const handleManageCategory = (category: string) => {
        window.location.href = `/settings?filter=${JSON.stringify({
            category,
        })}`;
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const totalSettings = settings?.length || 0;
    const activeSettings = settings?.filter(s => s.active).length || 0;
    const categories = Object.keys(CATEGORY_CONFIG);

    if (isLoading) {
        return <Box className="p-3">Loading settings dashboard...</Box>;
    }

    return (
        <Box className="p-2 md:p-3">
            {/* Header */}
            <Box className="mb-3">
                <Typography variant="h4" gutterBottom className="font-bold">
                    Settings Management
                </Typography>
                <Typography variant="body1" color="text.secondary" className="mb-2">
                    Manage all system configuration settings across{' '}
                    {categories.length} categories
                </Typography>

                {/* Quick Stats */}
                <Box className="flex gap-2 flex-wrap">
                    <Chip
                        icon={<SettingsIcon className="w-4 h-4" />}
                        label={`${totalSettings} Total Settings`}
                        className="bg-blue-500 text-white"
                        variant="filled"
                    />
                    <Chip
                        label={`${activeSettings} Active`}
                        className="border-green-500 text-green-500"
                        variant="outlined"
                    />
                    <Chip
                        label={`${categories.length} Categories`}
                        className="border-blue-500 text-blue-500"
                        variant="outlined"
                    />
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box className="border-b border-gray-200 mb-3">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? 'scrollable' : 'standard'}
                    scrollButtons="auto"
                >
                    <Tab label="Overview" />
                    <Tab label="Categories" />
                    <Tab label="Bulk Operations" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
                {/* Overview - Category Cards Grid */}
                <Grid container spacing={3}>
                    {categories.map(categoryKey => {
                        const category = CATEGORY_CONFIG[categoryKey];
                        const stats = categoryStats[categoryKey] || {
                            total: 0,
                            active: 0,
                            inactive: 0,
                        };

                        return (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={categoryKey}
                            >
                                <CategoryCard
                                    category={category}
                                    stats={stats}
                                    onManage={handleManageCategory}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                {/* Categories - Detailed Management */}
                <Typography variant="h6" gutterBottom>
                    Category Management
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Detailed view and management of each settings category
                </Typography>

                <Grid container spacing={2}>
                    {categories.map(categoryKey => {
                        const category = CATEGORY_CONFIG[categoryKey];
                        const stats = categoryStats[categoryKey] || {
                            total: 0,
                            active: 0,
                            inactive: 0,
                        };

                        return (
                            <Grid item xs={12} key={categoryKey}>
                                <Card>
                                    <CardContent>
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center gap-2">
                                                <Box
                                                    style={{ color: category.color }}
                                                >
                                                    {category.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6">
                                                        {category.label}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {category.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box className="flex items-center gap-2">
                                                <Box className="flex gap-1">
                                                    <Chip
                                                        label={`${stats.active} Active`}
                                                        size="small"
                                                        className="border-green-500 text-green-500"
                                                    />
                                                    <Chip
                                                        label={`${stats.total} Total`}
                                                        size="small"
                                                        className="bg-blue-500 text-white"
                                                    />
                                                </Box>
                                                <Box className="flex gap-1">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleManageCategory(
                                                                categoryKey
                                                            )
                                                        }
                                                        className="min-w-11 min-h-11"
                                                    >
                                                        <VisibilityIcon className="w-5 h-5" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() =>
                                                            (window.location.href = `/settings/create?category=${categoryKey}`)
                                                        }
                                                        className="min-w-11 min-h-11"
                                                    >
                                                        <AddIcon className="w-5 h-5" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                {/* Bulk Operations */}
                <Typography variant="h6" gutterBottom>
                    Bulk Operations
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Import, export, and manage settings in bulk
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Import Settings
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mb={2}
                                >
                                    Import settings from CSV or JSON files
                                </Typography>
                                <Box className="flex gap-1">
                                    <Chip
                                        label="CSV Import"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label="JSON Import"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Export Settings
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mb={2}
                                >
                                    Export all or selected settings data
                                </Typography>
                                <Box className="flex gap-1">
                                    <Chip
                                        label="CSV Export"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label="JSON Export"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Floating Action Button */}
            <Fab
                className="bg-blue-500 text-white fixed bottom-4 md:bottom-8 right-4 md:right-8 min-w-14 min-h-14"
                aria-label="add setting"
                onClick={() => (window.location.href = '/settings/create')}
            >
                <AddIcon className="w-6 h-6" />
            </Fab>
        </Box>
    );
};
