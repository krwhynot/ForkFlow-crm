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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                return theme.palette.error.main;
            case 'high':
                return theme.palette.warning.main;
            case 'medium':
                return theme.palette.info.main;
            case 'low':
                return theme.palette.success.main;
            default:
                return theme.palette.grey[500];
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
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Security Dashboard
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    const securityScore = getOverallSecurityScore();

    return (
        <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShieldCheckIcon className="w-6 h-6 mr-2" />
                <Typography variant="h4" component="h1">
                    Security Dashboard
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={loadSecurityMetrics}>
                        <ArrowPathIcon className="w-5 h-5" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Security Score Overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                color={
                                    securityScore >= 80
                                        ? 'success.main'
                                        : securityScore >= 60
                                          ? 'warning.main'
                                          : 'error.main'
                                }
                            >
                                {securityScore}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Security Score
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={securityScore}
                                sx={{ mt: 1 }}
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
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">
                                {metrics.auditStats.recentCriticalEvents}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Critical Events (24h)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">
                                {metrics.securityStats.activeRateLimits}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Rate Limits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4">
                                {metrics.auditStats.totalEvents}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Audit Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Security Status Alerts */}
            {!metrics.httpsStatus.isSecure && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>HTTPS Not Enabled:</strong> Your connection is not
                    secure. Enable HTTPS for production use.
                </Alert>
            )}
            {metrics.auditStats.recentCriticalEvents > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
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
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <ShieldIcon sx={{ mr: 1 }} />
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
                                            <CheckIcon color="success" />
                                        ) : (
                                            <ErrorIcon color="error" />
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
                                            <CheckIcon color="success" />
                                        ) : (
                                            <WarningIcon color="warning" />
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
                                            <CheckIcon color="success" />
                                        ) : (
                                            <WarningIcon color="warning" />
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
                                            <CheckIcon color="success" />
                                        ) : (
                                            <ErrorIcon color="error" />
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
                                            <CheckIcon color="success" />
                                        ) : (
                                            <WarningIcon color="warning" />
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
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Audit Events</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small" onClick={exportAuditLog}>
                        <DownloadIcon />
                    </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
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
                    <Box sx={{ mb: 2 }}>
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
                                        sx={{
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
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
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
                                                sx={{
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
                                                sx={{ maxWidth: 200 }}
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
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <BugIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        Security Recommendations
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {metrics.httpsStatus.recommendations.map(
                            (rec, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <WarningIcon color="warning" />
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
