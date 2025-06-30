import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Fab,
    Badge,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon,
    Business as BusinessIcon,
    LocalShipping as LocalShippingIcon,
    Person as PersonIcon,
    Psychology as PsychologyIcon,
    AccountTree as AccountTreeIcon,
    Category as CategoryIcon,
    Timeline as TimelineIcon,
    Chat as ChatIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDataProvider, useGetList, CreateButton, EditButton, ShowButton } from 'react-admin';
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
        icon: <TrendingUpIcon />,
        color: '#22c55e',
        description: 'Organization priority levels (A-D)',
    },
    segment: {
        key: 'segment',
        label: 'Segments',
        icon: <CategoryIcon />,
        color: '#8b5cf6',
        description: 'Market segments for targeting',
    },
    distributor: {
        key: 'distributor',
        label: 'Distributors',
        icon: <LocalShippingIcon />,
        color: '#f59e0b',
        description: 'Distribution channel partners',
    },
    role: {
        key: 'role',
        label: 'Roles',
        icon: <PersonIcon />,
        color: '#3b82f6',
        description: 'Contact job roles and positions',
    },
    influence: {
        key: 'influence',
        label: 'Influence Levels',
        icon: <PsychologyIcon />,
        color: '#ef4444',
        description: 'Decision-making influence levels',
    },
    decision: {
        key: 'decision',
        label: 'Decision Roles',
        icon: <AccountTreeIcon />,
        color: '#f59e0b',
        description: 'Roles in decision-making process',
    },
    principal: {
        key: 'principal',
        label: 'Principals',
        icon: <BusinessIcon />,
        color: '#607d8b',
        description: 'Food service brand principals',
    },
    stage: {
        key: 'stage',
        label: 'Pipeline Stages',
        icon: <TimelineIcon />,
        color: '#059669',
        description: 'Sales pipeline stages',
    },
    interaction_type: {
        key: 'interaction_type',
        label: 'Interaction Types',
        icon: <ChatIcon />,
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

const CategoryCard: React.FC<CategoryCardProps> = ({ category, stats, onManage }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                },
                borderLeft: `4px solid ${category.color}`,
            }}
            onClick={() => onManage(category.key)}
        >
            <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                color: category.color,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {category.icon}
                        </Box>
                        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                            {category.label}
                        </Typography>
                    </Box>
                    <Badge badgeContent={stats.total} color="primary" max={99}>
                        <SettingsIcon fontSize="small" />
                    </Badge>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 32 }}>
                    {category.description}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                            label={`${stats.active} Active`}
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                        {stats.inactive > 0 && (
                            <Chip
                                label={`${stats.inactive} Inactive`}
                                size="small"
                                color="default"
                                variant="outlined"
                            />
                        )}
                    </Box>
                    <Box display="flex" gap={0.5}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to create new setting
                                window.location.href = `/settings/create?category=${category.key}`;
                            }}
                            sx={{ minWidth: 44, minHeight: 44 }}
                        >
                            <AddIcon fontSize="small" />
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
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

export const SettingsAdminDashboard: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    const [categoryStats, setCategoryStats] = useState<Record<string, any>>({});

    const { data: settings, isLoading } = useGetList<Setting>('settings', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'category', order: 'ASC' },
    });

    // Calculate statistics for each category
    useEffect(() => {
        if (settings) {
            const stats = settings.reduce((acc, setting) => {
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
            }, {} as Record<string, any>);
            setCategoryStats(stats);
        }
    }, [settings]);

    const handleManageCategory = (category: string) => {
        window.location.href = `/settings?filter=${JSON.stringify({ category })}`;
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const totalSettings = settings?.length || 0;
    const activeSettings = settings?.filter(s => s.active).length || 0;
    const categories = Object.keys(CATEGORY_CONFIG);

    if (isLoading) {
        return <Box p={3}>Loading settings dashboard...</Box>;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Settings Management
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                    Manage all system configuration settings across {categories.length} categories
                </Typography>
                
                {/* Quick Stats */}
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                        icon={<SettingsIcon />}
                        label={`${totalSettings} Total Settings`}
                        color="primary"
                        variant="filled"
                    />
                    <Chip
                        label={`${activeSettings} Active`}
                        color="success"
                        variant="outlined"
                    />
                    <Chip
                        label={`${categories.length} Categories`}
                        color="info"
                        variant="outlined"
                    />
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
                    {categories.map((categoryKey) => {
                        const category = CATEGORY_CONFIG[categoryKey];
                        const stats = categoryStats[categoryKey] || { total: 0, active: 0, inactive: 0 };
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={categoryKey}>
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
                    {categories.map((categoryKey) => {
                        const category = CATEGORY_CONFIG[categoryKey];
                        const stats = categoryStats[categoryKey] || { total: 0, active: 0, inactive: 0 };
                        
                        return (
                            <Grid item xs={12} key={categoryKey}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Box sx={{ color: category.color }}>
                                                    {category.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6">
                                                        {category.label}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {category.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Box display="flex" gap={1}>
                                                    <Chip label={`${stats.active} Active`} size="small" color="success" />
                                                    <Chip label={`${stats.total} Total`} size="small" color="primary" />
                                                </Box>
                                                <Box display="flex" gap={1}>
                                                    <IconButton
                                                        onClick={() => handleManageCategory(categoryKey)}
                                                        sx={{ minWidth: 44, minHeight: 44 }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => window.location.href = `/settings/create?category=${categoryKey}`}
                                                        sx={{ minWidth: 44, minHeight: 44 }}
                                                    >
                                                        <AddIcon />
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
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Import settings from CSV or JSON files
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Chip label="CSV Import" variant="outlined" />
                                    <Chip label="JSON Import" variant="outlined" />
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
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Export all or selected settings data
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Chip label="CSV Export" variant="outlined" />
                                    <Chip label="JSON Export" variant="outlined" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                aria-label="add setting"
                sx={{
                    position: 'fixed',
                    bottom: { xs: 16, md: 32 },
                    right: { xs: 16, md: 32 },
                    minWidth: 56,
                    minHeight: 56,
                }}
                onClick={() => window.location.href = '/settings/create'}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};