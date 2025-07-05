/**
 * Security Dashboard Component
 * Comprehensive security monitoring and management interface
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TableContainer,
} from '@/components/ui-kit';
import {
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    LockClosedIcon,
    KeyIcon,
    BugAntIcon,
    ChartBarIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    EyeIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
    getAuditStatistics,
    getLocalAuditEvents,
    AuditEvent,
} from '../../utils/auditLogging';
import { getSecurityStatistics } from '../../utils/securityMiddleware';
import { getSecurityStatus } from '../../utils/httpsEnforcement';
import { getOfflineAuthStatus } from '../../utils/offlineAuth';
import { getSessionSummary } from '../../utils/sessionPersistence';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface SecurityMetrics {
    auditStats: ReturnType<typeof getAuditStatistics>;
    securityStats: ReturnType<typeof getSecurityStatistics>;
    httpsStatus: ReturnType<typeof getSecurityStatus>;
    offlineStatus: ReturnType<typeof getOfflineAuthStatus>;
    sessionInfo: ReturnType<typeof getSessionSummary>;
}

export const SecurityDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
    const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState<string | false>(
        'overview'
    );
    const isMobile = useBreakpoint('md');

    useEffect(() => {
        loadSecurityMetrics();
        const interval = setInterval(loadSecurityMetrics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadSecurityMetrics = () => {
        try {
            const newMetrics: SecurityMetrics = {
                auditStats: getAuditStatistics(),
                securityStats: getSecurityStatistics(),
                httpsStatus: getSecurityStatus(),
                offlineStatus: getOfflineAuthStatus(),
                sessionInfo: getSessionSummary(),
            };

            setMetrics(newMetrics);
            setRecentEvents(getLocalAuditEvents({ limit: 50 }));
            setLoading(false);
        } catch (error) {
            console.error('Failed to load security metrics:', error);
            setLoading(false);
        }
    };

    const getOverallSecurityScore = (): number => {
        if (!metrics) return 0;

        let score = 0;
        let maxScore = 0;

        // HTTPS Score (40 points)
        maxScore += 40;
        score += metrics.httpsStatus.securityScore;

        // Audit Logging (20 points)
        maxScore += 20;
        if (metrics.auditStats.totalEvents > 0) score += 20;

        // Session Security (20 points)
        maxScore += 20;
        if (metrics.sessionInfo.isValid) score += 20;

        // Offline Security (20 points)
        maxScore += 20;
        if (metrics.offlineStatus.isEnabled) score += 20;

        return Math.round((score / maxScore) * 100);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return '#dc2626'; // red-600
            case 'high':
                return '#d97706'; // amber-600
            case 'medium':
                return '#2563eb'; // blue-600
            case 'low':
                return '#16a34a'; // green-600
            default:
                return '#6b7280'; // gray-500
        }
    };

    const exportAuditLog = () => {
        const events = getLocalAuditEvents();
        const csv = [
            'Timestamp,Type,Category,Severity,User,Message,Outcome',
            ...events.map(event =>
                [
                    new Date(event.timestamp).toISOString(),
                    event.type,
                    event.category,
                    event.severity,
                    event.userEmail || 'System',
                    `"${event.message}"`,
                    event.outcome,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forkflow-audit-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading || !metrics) {
        return (
            <Box className="p-2">
                <Typography variant="h5" gutterBottom>
                    Security Dashboard
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    const securityScore = getOverallSecurityScore();

    return (
        <Box className={`p-${isMobile ? '1' : '2'}`}>
            <Box className="flex items-center mb-3">
                <ShieldCheckIcon className="w-6 h-6 mr-2" />
                <Typography variant="h4" component="h1">
                    Security Dashboard
                </Typography>
                <Box className="flex-grow" />
                <Tooltip title="Refresh">
                    <IconButton onClick={loadSecurityMetrics}>
                        <ArrowPathIcon className="w-5 h-5" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Security Score Overview */}
            <Grid container spacing={2} className="mb-3">
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography
                                variant="h3"
                                className={
                                    securityScore >= 80
                                        ? 'text-green-600'
                                        : securityScore >= 60
                                          ? 'text-yellow-600'
                                          : 'text-red-600'
                                }
                            >
                                {securityScore}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Security Score
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={securityScore}
                                className="mt-1"
                                color={
                                    securityScore >= 80
                                        ? 'success'
                                        : securityScore >= 60
                                          ? 'warning'
                                          : 'error'
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4">
                                {metrics.auditStats.recentCriticalEvents}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Critical Events (24h)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4">
                                {metrics.securityStats.activeRateLimits}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Active Rate Limits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4">
                                {metrics.auditStats.totalEvents}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Total Audit Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Security Status Alerts */}
            {!metrics.httpsStatus.isSecure && (
                <Alert severity="error" className="mb-2">
                    <strong>HTTPS Not Enabled:</strong> Your connection is not
                    secure. Enable HTTPS for production use.
                </Alert>
            )}
            {metrics.auditStats.recentCriticalEvents > 0 && (
                <Alert severity="warning" className="mb-2">
                    <strong>Critical Security Events:</strong>{' '}
                    {metrics.auditStats.recentCriticalEvents} critical security
                    events detected in the last 24 hours.
                </Alert>
            )}

            {/* Detailed Security Sections */}
            <Accordion
                expanded={expandedSection === 'overview'}
                onChange={(_, isExpanded) =>
                    setExpandedSection(isExpanded ? 'overview' : false)
                }
            >
                <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                    <ShieldExclamationIcon className="w-5 h-5 mr-2" />
                    <Typography variant="h6">Security Overview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                HTTPS Status
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        {metrics.httpsStatus.isSecure ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Secure Connection"
                                        secondary={
                                            metrics.httpsStatus.isSecure
                                                ? 'HTTPS Enabled'
                                                : 'HTTP Only'
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        {metrics.httpsStatus.hasCSP ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Content Security Policy"
                                        secondary={
                                            metrics.httpsStatus.hasCSP
                                                ? 'Configured'
                                                : 'Not Set'
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        {metrics.httpsStatus.hasHSTS ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Strict Transport Security"
                                        secondary={
                                            metrics.httpsStatus.hasHSTS
                                                ? 'Enabled'
                                                : 'Disabled'
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Authentication Status
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        {metrics.sessionInfo.isValid ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Session Valid"
                                        secondary={
                                            metrics.sessionInfo.isValid
                                                ? 'Active Session'
                                                : 'No Session'
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        {metrics.offlineStatus
                                            .hasCredentials ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Offline Authentication"
                                        secondary={
                                            metrics.offlineStatus.hasCredentials
                                                ? 'Available'
                                                : 'Not Available'
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={expandedSection === 'audit'}
                onChange={(_, isExpanded) =>
                    setExpandedSection(isExpanded ? 'audit' : false)
                }
            >
                <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    <Typography variant="h6">Audit Events</Typography>
                    <Box className="flex-grow" />
                    <IconButton size="small" onClick={exportAuditLog}>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                    </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                    <Box className="mb-2">
                        <Typography variant="subtitle2" gutterBottom>
                            Events by Category
                        </Typography>
                        <Grid container spacing={1}>
                            {Object.entries(
                                metrics.auditStats.eventsByCategory
                            ).map(([category, count]) => (
                                <Grid item key={category}>
                                    <Chip
                                        label={`${category}: ${count}`}
                                        size="small"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    <Box className="mb-2">
                        <Typography variant="subtitle2" gutterBottom>
                            Events by Severity
                        </Typography>
                        <Grid container spacing={1}>
                            {Object.entries(
                                metrics.auditStats.eventsBySeverity
                            ).map(([severity, count]) => (
                                <Grid item key={severity}>
                                    <Chip
                                        label={`${severity}: ${count}`}
                                        size="small"
                                        style={{
                                            backgroundColor:
                                                getSeverityColor(severity) +
                                                '20',
                                            color: getSeverityColor(severity),
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    <TableContainer component={Paper} style={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Outcome</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentEvents.slice(0, 20).map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {new Date(
                                                    event.timestamp
                                                ).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {event.type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.severity}
                                                size="small"
                                                style={{
                                                    backgroundColor:
                                                        getSeverityColor(
                                                            event.severity
                                                        ) + '20',
                                                    color: getSeverityColor(
                                                        event.severity
                                                    ),
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {event.userEmail || 'System'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                style={{ maxWidth: 200 }}
                                            >
                                                {event.message}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.outcome}
                                                size="small"
                                                color={
                                                    event.outcome === 'success'
                                                        ? 'success'
                                                        : event.outcome ===
                                                            'failure'
                                                          ? 'error'
                                                          : 'warning'
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={expandedSection === 'recommendations'}
                onChange={(_, isExpanded) =>
                    setExpandedSection(isExpanded ? 'recommendations' : false)
                }
            >
                <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                    <BugAntIcon className="w-5 h-5 mr-2" />
                    <Typography variant="h6">
                        Security Recommendations
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {metrics.httpsStatus.recommendations?.map(
                            (rec, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                    </ListItemIcon>
                                    <ListItemText primary={rec} />
                                </ListItem>
                            )
                        )}
                    </List>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
