// src/security/SecurityDashboard.tsx
import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '../components/ui-kit';
import {
    BellAlertIcon as AlertIcon,
    KeyIcon as AuthIcon,
    ComputerDesktopIcon as DeviceIcon,
    XCircleIcon as ErrorIcon,
    LockClosedIcon as LockIcon,
    GlobeAltIcon as NetworkIcon,
    ArrowPathIcon as RefreshIcon,
    ShieldCheckIcon as SecurityIcon,
    ShieldExclamationIcon as ShieldIcon,
    CheckCircleIcon as SuccessIcon,
    ClockIcon as TimeIcon,
    EyeIcon as ViewIcon,
    ExclamationTriangleIcon as WarningIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useGetIdentity, useNotify } from 'react-admin';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { SecurityAuditLog } from './SecurityAuditLog';
import { SessionManager } from './SessionManager';

interface SecurityMetrics {
    securityScore: number;
    activeThreats: number;
    failedLogins: number;
    suspiciousActivities: number;
    activeUsers: number;
    activeSessions: number;
    vulnerabilities: number;
    lastScan: string;
}

interface SecurityAlert {
    id: string;
    type: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    timestamp: string;
    resolved: boolean;
    affectedUsers?: number;
    recommendation?: string;
}

interface SecurityTrend {
    date: string;
    securityScore: number;
    threats: number;
    incidents: number;
}

interface SecurityDashboardProps {
    compactView?: boolean;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
    compactView = false,
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [trends, setTrends] = useState<SecurityTrend[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadSecurityData();

        // Set up auto-refresh if enabled
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(loadSecurityData, 60000); // Refresh every minute
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const loadSecurityData = async () => {
        setLoading(true);
        try {
            // Mock security data - in production, this would come from the API
            const mockMetrics: SecurityMetrics = {
                securityScore: 87,
                activeThreats: 2,
                failedLogins: 15,
                suspiciousActivities: 3,
                activeUsers: 24,
                activeSessions: 31,
                vulnerabilities: 1,
                lastScan: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            };

            const mockAlerts: SecurityAlert[] = [
                {
                    id: '1',
                    type: 'high',
                    title: 'Multiple Failed Login Attempts',
                    description:
                        'Unusual number of failed login attempts detected from IP 203.0.113.45',
                    timestamp: new Date(
                        Date.now() - 1000 * 60 * 15
                    ).toISOString(),
                    resolved: false,
                    affectedUsers: 1,
                    recommendation:
                        'Consider blocking the suspicious IP address',
                },
                {
                    id: '2',
                    type: 'medium',
                    title: 'Weak Password Detected',
                    description:
                        'User broker@example.com is using a password that appears in known breach databases',
                    timestamp: new Date(
                        Date.now() - 1000 * 60 * 60 * 2
                    ).toISOString(),
                    resolved: false,
                    affectedUsers: 1,
                    recommendation: 'Force password reset for affected user',
                },
                {
                    id: '3',
                    type: 'low',
                    title: 'Session Timeout Policy Update',
                    description:
                        'Session timeout policy has been updated to 30 minutes',
                    timestamp: new Date(
                        Date.now() - 1000 * 60 * 60 * 4
                    ).toISOString(),
                    resolved: true,
                    recommendation:
                        'Monitor user experience with new timeout policy',
                },
                {
                    id: '4',
                    type: 'critical',
                    title: 'Potential Data Breach Attempt',
                    description:
                        'Suspicious data access patterns detected for organization records',
                    timestamp: new Date(
                        Date.now() - 1000 * 60 * 60 * 6
                    ).toISOString(),
                    resolved: false,
                    affectedUsers: 3,
                    recommendation:
                        'Immediately review access logs and notify security team',
                },
            ];

            const mockTrends: SecurityTrend[] = Array.from(
                { length: 7 },
                (_, i) => ({
                    date: new Date(
                        Date.now() - 1000 * 60 * 60 * 24 * i
                    ).toISOString(),
                    securityScore: Math.floor(Math.random() * 20) + 80,
                    threats: Math.floor(Math.random() * 5),
                    incidents: Math.floor(Math.random() * 3),
                })
            ).reverse();

            setMetrics(mockMetrics);
            setAlerts(mockAlerts);
            setTrends(mockTrends);
        } catch (error) {
            notify('Failed to load security data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async (alertId: string) => {
        try {
            setAlerts(prev =>
                prev.map(alert =>
                    alert.id === alertId ? { ...alert, resolved: true } : alert
                )
            );
            notify('Alert marked as resolved', { type: 'success' });
        } catch (error) {
            notify('Failed to resolve alert', { type: 'error' });
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <ErrorIcon className="w-5 h-5 text-red-600" />;
            case 'high':
                return <WarningIcon className="w-5 h-5 text-red-600" />;
            case 'medium':
                return <WarningIcon className="w-5 h-5 text-yellow-600" />;
            case 'low':
                return <AlertIcon className="w-5 h-5 text-blue-600" />;
            default:
                return <AlertIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical':
                return 'error';
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'default';
        }
    };

    const getSecurityScoreColor = (score: number) => {
        if (score >= 90) return 'success';
        if (score >= 70) return 'warning';
        return 'error';
    };

    const unResolvedAlerts = alerts.filter(alert => !alert.resolved);
    const criticalAlerts = unResolvedAlerts.filter(
        alert => alert.type === 'critical'
    );
    const highAlerts = unResolvedAlerts.filter(alert => alert.type === 'high');

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert variant="error" className="m-8">
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access the security
                    dashboard.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box className={`${compactView ? 'p-1' : 'p-8'}`}>
            {!compactView && (
                <Box className="flex justify-between items-center mb-8">
                    <Box className="flex items-center gap-2">
                        <SecurityIcon className="w-8 h-8 text-blue-600" />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Security Dashboard
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Real-time security monitoring and threat
                                detection
                            </Typography>
                        </Box>
                    </Box>

                    <Box className="flex gap-1">
                        <Button
                            variant="secondary"
                            onClick={loadSecurityData}
                            disabled={loading}
                            className="min-h-[44px]"
                        >
                            <RefreshIcon className="mr-2" />
                            Refresh
                        </Button>
                        <Button
                            variant={autoRefresh ? 'primary' : 'secondary'}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="min-h-[44px]"
                        >
                            <TimeIcon className="mr-2" />
                            Auto Refresh
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Critical Alerts Banner */}
            {criticalAlerts.length > 0 && (
                <Alert
                    variant="error"
                    className="mb-8"
                    action={
                        <Button size="small">
                            View Details
                        </Button>
                    }
                >
                    <Typography variant="h6" className="mb-2">
                        {criticalAlerts.length} Critical Security Alert(s)
                    </Typography>
                    <Typography>
                        Immediate attention required. Review security incidents
                        and take action.
                    </Typography>
                </Alert>
            )}

            {/* Security Metrics Overview */}
            <Grid container spacing={3} className="mb-8">
                {/* Security Score */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Box className="flex justify-center mb-1">
                                <ShieldIcon
                                    color={getSecurityScoreColor(
                                        metrics?.securityScore || 0
                                    )}
                                    className="text-[40px]"
                                />
                            </Box>
                            <Typography
                                variant="h4"
                                className={`text-${getSecurityScoreColor(
                                    metrics?.securityScore || 0
                                )}-600`}
                            >
                                {metrics?.securityScore || 0}%
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Security Score
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics?.securityScore || 0}
                                className="mt-1"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Threats */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Box className="flex justify-center mb-1">
                                <Badge
                                    badgeContent={metrics?.activeThreats || 0}
                                    color="error"
                                    invisible={
                                        (metrics?.activeThreats || 0) === 0
                                    }
                                >
                                    <WarningIcon
                                        color="error"
                                        className="text-[40px]"
                                    />
                                </Badge>
                            </Box>
                            <Typography variant="h4" className="text-red-600">
                                {metrics?.activeThreats || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Active Threats
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Failed Logins */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Box className="flex justify-center mb-1">
                                <AuthIcon
                                    color="warning"
                                    className="text-[40px]"
                                />
                            </Box>
                            <Typography variant="h4" className="text-yellow-600">
                                {metrics?.failedLogins || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Failed Logins (24h)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Sessions */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Box className="flex justify-center mb-1">
                                <DeviceIcon
                                    color="info"
                                    className="text-[40px]"
                                />
                            </Box>
                            <Typography variant="h4" className="text-blue-600">
                                {metrics?.activeSessions || 0}
                            </Typography>
                            <Typography variant="body2" className="text-gray-500">
                                Active Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs for Different Views */}
            <Card>
                <Box className="border-b border-gray-300">
                    <Tabs
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons="auto"
                    >
                        <Tab
                            label={
                                <Badge
                                    badgeContent={unResolvedAlerts.length}
                                    color="error"
                                >
                                    Security Alerts
                                </Badge>
                            }
                        />
                        <Tab label="Audit Log" />
                        <Tab label="Session Monitor" />
                        <Tab label="System Health" />
                    </Tabs>
                </Box>

                {/* Security Alerts Tab */}
                {currentTab === 0 && (
                    <CardContent>
                        <Typography variant="h6" className="mb-4">
                            Security Alerts ({unResolvedAlerts.length}{' '}
                            unresolved)
                        </Typography>

                        {unResolvedAlerts.length === 0 ? (
                            <Alert variant="success">
                                <Typography variant="h6">All Clear!</Typography>
                                <Typography>
                                    No active security alerts at this time.
                                </Typography>
                            </Alert>
                        ) : (
                            <List>
                                {alerts.map(alert => (
                                    <ListItem
                                        key={alert.id}
                                        divider
                                        className={`${alert.resolved
                                                ? 'opacity-60 bg-transparent'
                                                : 'opacity-100 bg-white'
                                            }`}
                                    >
                                        <ListItemIcon>
                                            {getAlertIcon(alert.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box className="flex items-center gap-1">
                                                    <Typography variant="body1">
                                                        {alert.title}
                                                    </Typography>
                                                    <Chip
                                                        label={alert.type.toUpperCase()}
                                                        size="small"
                                                        className={`
                                                            ${alert.type === 'critical' ? 'bg-red-500 text-white' : ''}
                                                            ${alert.type === 'high' ? 'bg-red-500 text-white' : ''}
                                                            ${alert.type === 'medium' ? 'bg-yellow-500 text-white' : ''}
                                                            ${alert.type === 'low' ? 'bg-blue-500 text-white' : ''}
                                                        `}
                                                    />
                                                    {alert.resolved && (
                                                        <Chip
                                                            label="RESOLVED"
                                                            size="small"
                                                            className="border-green-500 text-green-500"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        className="mb-2"
                                                    >
                                                        {alert.description}
                                                    </Typography>
                                                    {alert.recommendation && (
                                                        <Typography
                                                            variant="body2"
                                                            className="text-blue-600"
                                                        >
                                                            <strong>
                                                                Recommendation:
                                                            </strong>{' '}
                                                            {
                                                                alert.recommendation
                                                            }
                                                        </Typography>
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        className="text-gray-500"
                                                    >
                                                        {new Date(
                                                            alert.timestamp
                                                        ).toLocaleString()}
                                                        {alert.affectedUsers && (
                                                            <>
                                                                {' '}
                                                                •{' '}
                                                                {
                                                                    alert.affectedUsers
                                                                }{' '}
                                                                user(s) affected
                                                            </>
                                                        )}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Box className="flex gap-1">
                                            <Tooltip title="View Details">
                                                <IconButton size="small">
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {!alert.resolved && (
                                                <Button
                                                    size="small"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        handleResolveAlert(
                                                            alert.id
                                                        )
                                                    }
                                                    className="text-green-600 border-green-600"
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                )}

                {/* Audit Log Tab */}
                {currentTab === 1 && (
                    <CardContent className="p-0">
                        <SecurityAuditLog viewType="both" compactView={true} />
                    </CardContent>
                )}

                {/* Session Monitor Tab */}
                {currentTab === 2 && (
                    <CardContent className="p-0">
                        <SessionManager showAllSessions={true} />
                    </CardContent>
                )}

                {/* System Health Tab */}
                {currentTab === 3 && (
                    <CardContent>
                        <Typography variant="h6" className="mb-4">
                            System Health Status
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        className="mb-2"
                                    >
                                        Authentication System
                                    </Typography>
                                    <Box className="flex items-center gap-1">
                                        <SuccessIcon className="w-5 h-5 text-green-600" />
                                        <Typography variant="body2">
                                            Operational
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        Last check:{' '}
                                        {new Date().toLocaleTimeString()}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        className="mb-2"
                                    >
                                        Database Security
                                    </Typography>
                                    <Box className="flex items-center gap-1">
                                        <SuccessIcon className="w-5 h-5 text-green-600" />
                                        <Typography variant="body2">
                                            Secure
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        RLS policies: Active
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        className="mb-2"
                                    >
                                        API Security
                                    </Typography>
                                    <Box className="flex items-center gap-1">
                                        <WarningIcon className="w-5 h-5 text-yellow-600" />
                                        <Typography variant="body2">
                                            Rate limiting active
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        Current load: 78% of limit
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        className="mb-2"
                                    >
                                        Security Monitoring
                                    </Typography>
                                    <Box className="flex items-center gap-1">
                                        <SuccessIcon className="w-5 h-5 text-green-600" />
                                        <Typography variant="body2">
                                            Active
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        {metrics &&
                                            `Last scan: ${new Date(
                                                metrics.lastScan
                                            ).toLocaleTimeString()}`}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Security Recommendations */}
                        <Box className="mt-6">
                            <Typography variant="h6" className="mb-4">
                                Security Recommendations
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <LockIcon className="w-5 h-5 text-blue-600" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Enable MFA for all admin users"
                                        secondary="2 admin users still need to set up multi-factor authentication"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <TimeIcon className="w-5 h-5 text-yellow-600" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Review password policies"
                                        secondary="Consider reducing password expiration to 60 days"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <NetworkIcon className="w-5 h-5 text-blue-600" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Monitor suspicious IP addresses"
                                        secondary="Consider implementing IP allowlisting for admin users"
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    </CardContent>
                )}
            </Card>
        </Box>
    );
};
