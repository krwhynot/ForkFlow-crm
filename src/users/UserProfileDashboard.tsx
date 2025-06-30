// src/users/UserProfileDashboard.tsx
import React, { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Button,
    Tab,
    Tabs,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Alert,
    LinearProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Person as PersonIcon,
    Security as SecurityIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
    Analytics as AnalyticsIcon,
    Map as TerritoryIcon,
    Business as BusinessIcon,
    Notifications as NotificationsIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';

import { User } from '../types';
import { RoleChip } from '../components/auth/RoleChip';
import { TerritoryDisplay, TerritoryBadge } from '../components/TerritoryDisplay';
import { UserActivityTracker } from './UserActivityTracker';

interface UserProfileDashboardProps {
    user: User;
    onEdit?: () => void;
    onRefresh?: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            aria-labelledby={`user-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `user-tab-${index}`,
        'aria-controls': `user-tabpanel-${index}`,
    };
}

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
    user,
    onEdit,
    onRefresh
}) => {
    const [currentTab, setCurrentTab] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // Mock data for demonstration
    const userStats = {
        totalLogins: 127,
        lastActive: '2 hours ago',
        accountAge: 45, // days
        dataCreated: 89, // records
        dataModified: 156, // records
        securityScore: 85, // percentage
    };

    const recentActivities = [
        { action: 'Updated profile information', time: '2 hours ago', type: 'edit' },
        { action: 'Logged in from San Francisco', time: '2 hours ago', type: 'login' },
        { action: 'Created new organization: Acme Corp', time: '1 day ago', type: 'create' },
        { action: 'Modified contact: John Smith', time: '2 days ago', type: 'edit' },
    ];

    return (
        <Box>
            {/* User Header */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                        <Avatar
                            src={user.avatar}
                            sx={{ 
                                width: isMobile ? 80 : 120, 
                                height: isMobile ? 80 : 120,
                                fontSize: isMobile ? '2rem' : '3rem'
                            }}
                        >
                            {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        
                        <Box flex={1}>
                            <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
                                {user.firstName} {user.lastName}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
                                <MailIcon color="action" fontSize="small" />
                                <Typography variant="body1" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Box>
                            
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <RoleChip role={user.role} />
                                
                                <Chip
                                    label={user.isActive ? 'Active' : 'Inactive'}
                                    color={user.isActive ? 'success' : 'error'}
                                    variant="outlined"
                                />
                                
                                {user.territory && user.territory.length > 0 && (
                                    <Chip
                                        icon={<LocationIcon />}
                                        label={`${user.territory.length} territories`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={1}>
                            {onEdit && (
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={onEdit}
                                    sx={{ minHeight: 44 }}
                                >
                                    Edit Profile
                                </Button>
                            )}
                            
                            {onRefresh && (
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={onRefresh}
                                    sx={{ minHeight: 44 }}
                                >
                                    Refresh
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Quick Stats */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h6" color="primary">
                                    {userStats.totalLogins}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total Logins
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h6" color="success.main">
                                    {userStats.accountAge}d
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Account Age
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h6" color="info.main">
                                    {userStats.dataCreated}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Records Created
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                                <Typography variant="h6" color="warning.main">
                                    {userStats.securityScore}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Security Score
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="user profile tabs"
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons="auto"
                    >
                        <Tab 
                            label="Overview" 
                            icon={<DashboardIcon />} 
                            iconPosition="start"
                            {...a11yProps(0)} 
                        />
                        <Tab 
                            label="Activity" 
                            icon={<HistoryIcon />} 
                            iconPosition="start"
                            {...a11yProps(1)} 
                        />
                        <Tab 
                            label="Security" 
                            icon={<SecurityIcon />} 
                            iconPosition="start"
                            {...a11yProps(2)} 
                        />
                        <Tab 
                            label="Analytics" 
                            icon={<AnalyticsIcon />} 
                            iconPosition="start"
                            {...a11yProps(3)} 
                        />
                    </Tabs>
                </Box>

                {/* Overview Tab */}
                <CustomTabPanel value={currentTab} index={0}>
                    <Grid container spacing={3}>
                        {/* Account Details */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Account Details
                                    </Typography>
                                    
                                    <List dense>
                                        <ListItem>
                                            <ListItemText
                                                primary="Full Name"
                                                secondary={`${user.firstName} ${user.lastName}`}
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Email"
                                                secondary={user.email}
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Role"
                                                secondary={<RoleChip role={user.role} size="small" />}
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Status"
                                                secondary={
                                                    <Chip
                                                        label={user.isActive ? 'Active' : 'Inactive'}
                                                        color={user.isActive ? 'success' : 'error'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                }
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Last Login"
                                                secondary={user.lastLoginAt 
                                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Security Overview */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Security Overview
                                    </Typography>
                                    
                                    <Box mb={2}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">Security Score</Typography>
                                            <Typography variant="body2">{userStats.securityScore}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={userStats.securityScore} 
                                            color={userStats.securityScore > 80 ? 'success' : 
                                                   userStats.securityScore > 60 ? 'warning' : 'error'}
                                        />
                                    </Box>
                                    
                                    <List dense>
                                        <ListItem>
                                            <ListItemText
                                                primary="Password Strength"
                                                secondary="Strong"
                                            />
                                            <Chip label="✓" color="success" size="small" />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Two-Factor Auth"
                                                secondary="Enabled"
                                            />
                                            <Chip label="✓" color="success" size="small" />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Recent Security Events"
                                                secondary="No suspicious activity"
                                            />
                                            <Chip label="✓" color="success" size="small" />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Territory Information - Only for brokers */}
                        {user.role === 'broker' && (
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Territory & Coverage
                                        </Typography>
                                        
                                        {user.territory && user.territory.length > 0 ? (
                                            <Box>
                                                <TerritoryDisplay 
                                                    territory={user.territory}
                                                    showTooltip={true}
                                                    size="medium"
                                                />
                                                
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Coverage Areas:
                                                    </Typography>
                                                    <TerritoryBadge territory={user.territory} maxItems={10} />
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Alert severity="info">
                                                No territory assigned to this broker.
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Principals - Only for brokers */}
                        {user.role === 'broker' && user.principals && user.principals.length > 0 && (
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Assigned Principals
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {user.principals.map((principal) => (
                                                <Chip
                                                    key={principal}
                                                    label={principal}
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </CustomTabPanel>

                {/* Activity Tab */}
                <CustomTabPanel value={currentTab} index={1}>
                    <UserActivityTracker user={user} />
                </CustomTabPanel>

                {/* Security Tab */}
                <CustomTabPanel value={currentTab} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Security Settings
                                    </Typography>
                                    
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary="Password Security"
                                                secondary="Last changed 30 days ago"
                                            />
                                            <Button size="small" variant="outlined">
                                                Reset
                                            </Button>
                                        </ListItem>
                                        
                                        <Divider />
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Two-Factor Authentication"
                                                secondary="Enhanced security enabled"
                                            />
                                            <Chip label="Enabled" color="success" size="small" />
                                        </ListItem>
                                        
                                        <Divider />
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Login Notifications"
                                                secondary="Email alerts for new devices"
                                            />
                                            <Chip label="On" color="primary" size="small" />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Security Audit
                                    </Typography>
                                    
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Account security is excellent
                                    </Alert>
                                    
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <SecurityIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Strong password"
                                                secondary="Complex password with special characters"
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemIcon>
                                                <SecurityIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Secure connections"
                                                secondary="All logins use HTTPS encryption"
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemIcon>
                                                <SecurityIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Recent activity normal"
                                                secondary="No suspicious login attempts"
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CustomTabPanel>

                {/* Analytics Tab */}
                <CustomTabPanel value={currentTab} index={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Usage Analytics
                                    </Typography>
                                    
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary="Total Logins"
                                                secondary="127 sessions"
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Average Session Duration"
                                                secondary="2h 15m"
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Data Created"
                                                secondary="89 records"
                                            />
                                        </ListItem>
                                        
                                        <ListItem>
                                            <ListItemText
                                                primary="Data Modified"
                                                secondary="156 records"
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Performance Metrics
                                    </Typography>
                                    
                                    <Box mb={2}>
                                        <Typography variant="body2" gutterBottom>
                                            Productivity Score
                                        </Typography>
                                        <LinearProgress variant="determinate" value={78} color="primary" />
                                        <Typography variant="caption" color="text.secondary">
                                            78% - Above average
                                        </Typography>
                                    </Box>
                                    
                                    <Box mb={2}>
                                        <Typography variant="body2" gutterBottom>
                                            Data Quality
                                        </Typography>
                                        <LinearProgress variant="determinate" value={92} color="success" />
                                        <Typography variant="caption" color="text.secondary">
                                            92% - Excellent
                                        </Typography>
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            System Usage
                                        </Typography>
                                        <LinearProgress variant="determinate" value={65} color="info" />
                                        <Typography variant="caption" color="text.secondary">
                                            65% - Good utilization
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CustomTabPanel>
            </Card>
        </Box>
    );
};