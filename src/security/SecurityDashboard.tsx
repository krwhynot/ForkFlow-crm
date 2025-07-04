// src/security/SecurityDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Alert,
    Chip,
    Button,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Paper,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
import {
    Security as SecurityIcon,
    Shield as ShieldIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    Notifications as AlertIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Schedule as TimeIcon,
    Person as UserIcon,
    Computer as DeviceIcon,
    Public as NetworkIcon,
    VpnKey as AuthIcon,
    Lock as LockIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useGetIdentity, useNotify } from 'react-admin';

import { User } from '../types';
import { SecurityAuditLog } from './SecurityAuditLog';
import { SessionManager } from './SessionManager';
import { useBreakpoint } from '../hooks/useBreakpoint';

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
                lastScan: new Date(
                    Date.now() - 1000 * 60 * 30
                ).toISOString(), // 30 minutes ago
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
            setAlerts((prev) =>
                prev.map((alert) =>
                    alert.id === alertId
                        ? { ...alert, resolved: true }
                        : alert
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
                return <ErrorIcon color="error" />;
            case 'high':
                return <WarningIcon color="error" />;
            case 'medium':
                return <WarningIcon color="warning" />;
            case 'low':
                return <AlertIcon color="info" />;
            default:
                return <AlertIcon color="action" />;
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

    const unResolvedAlerts = alerts.filter((alert) => !alert.resolved);
    const criticalAlerts = unResolvedAlerts.filter(
        (alert) => alert.type === 'critical'
    );
    const highAlerts = unResolvedAlerts.filter(
        (alert) => alert.type === 'high'
    );

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access the security
                    dashboard.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box sx={{ p: compactView ? 1 : 3 }}>
            {!compactView && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Security Dashboard
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Real-time security monitoring and threat
                                detection
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadSecurityData}
                            disabled={loading}
                            sx={{ minHeight: 44 }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant={autoRefresh ? 'contained' : 'outlined'}
                            startIcon={<TimeIcon />}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            sx={{ minHeight: 44 }}
                        >
                            Auto Refresh
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Critical Alerts Banner */}
            {criticalAlerts.length > 0 && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small">
                            View Details
                        </Button>
                    }
                >
                    <Typography variant="h6" gutterBottom>
                        {criticalAlerts.length} Critical Security Alert(s)
                    </Typography>
                    <Typography>
                        Immediate attention required. Review security incidents
                        and take action.
                    </Typography>
                </Alert>
            )}

            {/* Security Metrics Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Security Score */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box display="flex" justifyContent="center" mb={1}>
                                <ShieldIcon
                                    color={getSecurityScoreColor(
                                        metrics?.securityScore || 0
                                    )}
                                    sx={{ fontSize: 40 }}
                                />
                            </Box>
                            <Typography
                                variant="h4"
                                color={`${getSecurityScoreColor(
                                    metrics?.securityScore || 0
                                )}.main`}
                            >
                                {metrics?.securityScore || 0}%
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Security Score
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics?.securityScore || 0}
                                color={getSecurityScoreColor(
                                    metrics?.securityScore || 0
                                )}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Threats */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box display="flex" justifyContent="center" mb={1}>
                                <Badge
                                    badgeContent={metrics?.activeThreats || 0}
                                    color="error"
                                    invisible={
                                        (metrics?.activeThreats || 0) === 0
                                    }
                                >
                                    <WarningIcon
                                        color="error"
                                        sx={{ fontSize: 40 }}
                                    />
                                </Badge>
                            </Box>
                            <Typography variant="h4" color="error.main">
                                {metrics?.activeThreats || 0}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Active Threats
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Failed Logins */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box display="flex" justifyContent="center" mb={1}>
                                <AuthIcon
                                    color="warning"
                                    sx={{ fontSize: 40 }}
                                />
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {metrics?.failedLogins || 0}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Failed Logins (24h)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Sessions */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box display="flex" justifyContent="center" mb={1}>
                                <DeviceIcon
                                    color="info"
                                    sx={{ fontSize: 40 }}
                                />
                            </Box>
                            <Typography variant="h4" color="info.main">
                                {metrics?.activeSessions || 0}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Active Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs for Different Views */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                        <Typography variant="h6" gutterBottom>
                            Security Alerts ({unResolvedAlerts.length}{' '}
                            unresolved)
                        </Typography>

                        {unResolvedAlerts.length === 0 ? (
                            <Alert severity="success">
                                <Typography variant="h6">All Clear!</Typography>
                                <Typography>
                                    No active security alerts at this time.
                                </Typography>
                            </Alert>
                        ) : (
                            <List>
                                {alerts.map((alert) => (
                                    <ListItem
                                        key={alert.id}
                                        divider
                                        sx={{
                                            opacity: alert.resolved ? 0.6 : 1,
                                            bgcolor: alert.resolved
                                                ? 'transparent'
                                                : 'background.paper',
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getAlertIcon(alert.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    <Typography variant="body1">
                                                        {alert.title}
                                                    </Typography>
                                                    <Chip
                                                        label={alert.type.toUpperCase()}
                                                        color={
                                                            getAlertColor(
                                                                alert.type
                                                            ) as any
                                                        }
                                                        size="small"
                                                    />
                                                    {alert.resolved && (
                                                        <Chip
                                                            label="RESOLVED"
                                                            color="success"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        gutterBottom
                                                    >
                                                        {alert.description}
                                                    </Typography>
                                                    {alert.recommendation && (
                                                        <Typography
                                                            variant="body2"
                                                            color="info.main"
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
                                                        color="text.secondary"
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
                                        <Box display="flex" gap={1}>
                                            <Tooltip title="View Details">
                                                <IconButton size="small">
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {!alert.resolved && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() =>
                                                        handleResolveAlert(
                                                            alert.id
                                                        )
                                                    }
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
                    <CardContent sx={{ p: 0 }}>
                        <SecurityAuditLog
                            viewType="both"
                            compactView={true}
                        />
                    </CardContent>
                )}

                {/* Session Monitor Tab */}
                {currentTab === 2 && (
                    <CardContent sx={{ p: 0 }}>
                        <SessionManager showAllSessions={true} />
                    </CardContent>
                )}

                {/* System Health Tab */}
                {currentTab === 3 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            System Health Status
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Authentication System
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <SuccessIcon color="success" />
                                        <Typography variant="body2">
                                            Operational
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Last check:{' '}
                                        {new Date().toLocaleTimeString()}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Database Security
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <SuccessIcon color="success" />
                                        <Typography variant="body2">
                                            Secure
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        RLS policies: Active
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        API Security
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <WarningIcon color="warning" />
                                        <Typography variant="body2">
                                            Rate limiting active
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Current load: 78% of limit
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Security Monitoring
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <SuccessIcon color="success" />
                                        <Typography variant="body2">
                                            Active
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
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
                        <Box mt={3}>
                            <Typography variant="h6" gutterBottom>
                                Security Recommendations
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <LockIcon color="info" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Enable MFA for all admin users"
                                        secondary="2 admin users still need to set up multi-factor authentication"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <TimeIcon color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Review password policies"
                                        secondary="Consider reducing password expiration to 60 days"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <NetworkIcon color="info" />
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
