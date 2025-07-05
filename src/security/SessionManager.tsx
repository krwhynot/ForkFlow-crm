// src/security/SessionManager.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
} from '@/components/ui-kit';
import {
    ComputerDesktopIcon as DesktopIcon,
    DevicePhoneMobileIcon as MobileIcon,
    DeviceTabletIcon as TabletIcon,
    NoSymbolIcon as BlockIcon,
    TrashIcon as DeleteIcon,
    ArrowPathIcon as RefreshIcon,
    ClockIcon as TimeIcon,
    MapPinIcon as LocationIcon,
    ShieldCheckIcon as SecurityIcon,
    ExclamationTriangleIcon as WarningIcon,
    CheckCircleIcon as ActiveIcon,
    XCircleIcon as InactiveIcon,
} from '@heroicons/react/24/outline';
import { useGetIdentity, useNotify } from 'react-admin';

import { User } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface UserSession {
    id: string;
    userId: string;
    deviceFingerprint?: string;
    ipAddress: string;
    userAgent?: string;
    location?: string;
    isActive: boolean;
    lastActivity: string;
    createdAt: string;
    expiresAt: string;
    revokedAt?: string;
    revokedReason?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
    isCurrent: boolean;
}

interface SessionManagerProps {
    userId?: string;
    showAllSessions?: boolean;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
    userId,
    showAllSessions = false,
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<UserSession | null>(
        null
    );
    const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false);

    useEffect(() => {
        loadSessions();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(loadSessions, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            // Mock session data - in production, this would come from the API
            const currentSessionId = 'current-session-123';
            const mockSessions: UserSession[] = [
                {
                    id: currentSessionId,
                    userId: userId || String(identity?.id) || 'user123',
                    deviceFingerprint: 'fp_desktop_chrome',
                    ipAddress: '192.168.1.100',
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    location: 'San Francisco, CA',
                    isActive: true,
                    lastActivity: new Date().toISOString(),
                    createdAt: new Date(
                        Date.now() - 1000 * 60 * 120
                    ).toISOString(), // 2 hours ago
                    expiresAt: new Date(
                        Date.now() + 1000 * 60 * 60 * 6
                    ).toISOString(), // 6 hours from now
                    deviceType: 'desktop',
                    browser: 'Chrome 91',
                    os: 'Windows 10',
                    isCurrent: true,
                },
                {
                    id: 'mobile-session-456',
                    userId: userId || String(identity?.id) || 'user123',
                    deviceFingerprint: 'fp_mobile_safari',
                    ipAddress: '10.0.0.50',
                    userAgent:
                        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    location: 'Los Angeles, CA',
                    isActive: true,
                    lastActivity: new Date(
                        Date.now() - 1000 * 60 * 15
                    ).toISOString(), // 15 minutes ago
                    createdAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 3
                    ).toISOString(), // 3 hours ago
                    expiresAt: new Date(
                        Date.now() + 1000 * 60 * 60 * 5
                    ).toISOString(), // 5 hours from now
                    deviceType: 'mobile',
                    browser: 'Safari',
                    os: 'iOS 14.6',
                    isCurrent: false,
                },
                {
                    id: 'tablet-session-789',
                    userId: userId || String(identity?.id) || 'user123',
                    deviceFingerprint: 'fp_tablet_chrome',
                    ipAddress: '172.16.0.25',
                    userAgent:
                        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1',
                    location: 'Seattle, WA',
                    isActive: false,
                    lastActivity: new Date(
                        Date.now() - 1000 * 60 * 45
                    ).toISOString(), // 45 minutes ago
                    createdAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 2
                    ).toISOString(), // 2 hours ago
                    expiresAt: new Date(
                        Date.now() + 1000 * 60 * 60 * 6
                    ).toISOString(), // 6 hours from now
                    revokedAt: new Date(
                        Date.now() - 1000 * 60 * 30
                    ).toISOString(), // 30 minutes ago
                    revokedReason: 'idle_timeout',
                    deviceType: 'tablet',
                    browser: 'Chrome',
                    os: 'iPadOS 14.6',
                    isCurrent: false,
                },
                {
                    id: 'old-session-101',
                    userId: userId || String(identity?.id) || 'user123',
                    ipAddress: '203.0.113.45',
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
                    location: 'Unknown',
                    isActive: false,
                    lastActivity: new Date(
                        Date.now() - 1000 * 60 * 60 * 24
                    ).toISOString(), // 1 day ago
                    createdAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 25
                    ).toISOString(), // 25 hours ago
                    expiresAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 17
                    ).toISOString(), // Expired 17 hours ago
                    revokedAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 17
                    ).toISOString(),
                    revokedReason: 'expired',
                    deviceType: 'desktop',
                    browser: 'Firefox 89',
                    os: 'Windows 10',
                    isCurrent: false,
                },
            ];

            setSessions(mockSessions);
        } catch (error) {
            notify('Failed to load sessions', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (
        sessionId: string,
        reason: string = 'manual_revoke'
    ) => {
        try {
            // In production, call API to revoke session
            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId
                        ? {
                              ...session,
                              isActive: false,
                              revokedAt: new Date().toISOString(),
                              revokedReason: reason,
                          }
                        : session
                )
            );

            notify('Session revoked successfully', { type: 'success' });
            setRevokeDialogOpen(false);
            setSelectedSession(null);
        } catch (error) {
            notify('Failed to revoke session', { type: 'error' });
        }
    };

    const handleRevokeAllSessions = async () => {
        try {
            // In production, call API to revoke all sessions except current
            setSessions(prev =>
                prev.map(session =>
                    session.isCurrent
                        ? session
                        : {
                              ...session,
                              isActive: false,
                              revokedAt: new Date().toISOString(),
                              revokedReason: 'bulk_revoke',
                          }
                )
            );

            notify('All other sessions revoked successfully', {
                type: 'success',
            });
            setRevokeAllDialogOpen(false);
        } catch (error) {
            notify('Failed to revoke sessions', { type: 'error' });
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'mobile':
                return <MobileIcon className="w-5 h-5" />;
            case 'tablet':
                return <TabletIcon className="w-5 h-5" />;
            case 'desktop':
                return <DesktopIcon className="w-5 h-5" />;
            default:
                return <DesktopIcon className="w-5 h-5" />;
        }
    };

    const getSessionStatus = (session: UserSession) => {
        if (session.revokedAt) {
            return {
                label: 'Revoked',
                color: 'error' as const,
                icon: <InactiveIcon className="w-4 h-4" />,
            };
        }

        if (new Date(session.expiresAt) < new Date()) {
            return {
                label: 'Expired',
                color: 'error' as const,
                icon: <InactiveIcon className="w-4 h-4" />,
            };
        }

        if (session.isActive) {
            return {
                label: 'Active',
                color: 'success' as const,
                icon: <ActiveIcon className="w-4 h-4" />,
            };
        }

        return {
            label: 'Inactive',
            color: 'warning' as const,
            icon: <WarningIcon className="w-4 h-4" />,
        };
    };

    const formatLastActivity = (timestamp: string) => {
        const now = new Date();
        const activity = new Date(timestamp);
        const diffMs = now.getTime() - activity.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const activeSessions = sessions.filter(s => s.isActive && !s.revokedAt);
    const inactiveSessions = sessions.filter(s => !s.isActive || s.revokedAt);

    // Check if user has admin permissions to view all sessions
    const isAdmin = identity?.role === 'admin';
    const canViewAllSessions = isAdmin && showAllSessions;

    return (
        <Box>
            {/* Header */}
            <Box className="flex justify-between items-center mb-3">
                <Box className="flex items-center gap-2">
                    <SecurityIcon className="w-8 h-8 text-blue-600" />
                    <Box>
                        <Typography variant="h5">Session Management</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {canViewAllSessions
                                ? 'Manage all user sessions'
                                : 'Manage your active sessions'}
                        </Typography>
                    </Box>
                </Box>

                <Box className="flex gap-1">
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon className="w-4 h-4" />}
                        onClick={loadSessions}
                        disabled={loading}
                        className="min-h-11"
                    >
                        Refresh
                    </Button>
                    {activeSessions.length > 1 && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<BlockIcon className="w-4 h-4" />}
                            onClick={() => setRevokeAllDialogOpen(true)}
                            className="min-h-11"
                        >
                            Revoke All Others
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Session Summary */}
            <Grid container spacing={2} className="mb-3">
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4" className="text-green-600">
                                {activeSessions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4" className="text-yellow-600">
                                {inactiveSessions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Inactive Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent className="text-center">
                            <Typography variant="h4" className="text-blue-600">
                                {sessions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Active Sessions */}
            {activeSessions.length > 0 && (
                <Card className="mb-3">
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                            className="text-green-600"
                        >
                            <ActiveIcon className="w-5 h-5 mr-1 inline-block" />
                            Active Sessions ({activeSessions.length})
                        </Typography>

                        {isMobile ? (
                            <List>
                                {activeSessions.map(session => {
                                    const status = getSessionStatus(session);
                                    return (
                                        <ListItem key={session.id} divider>
                                            <ListItemIcon>
                                                {getDeviceIcon(
                                                    session.deviceType
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        <Typography variant="body1">
                                                            {session.browser} on{' '}
                                                            {session.os}
                                                        </Typography>
                                                        {session.isCurrent && (
                                                            <Chip
                                                                label="Current"
                                                                className="bg-blue-500 text-white"
                                                                size="small"
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {session.ipAddress}{' '}
                                                            •{' '}
                                                            {session.location ||
                                                                'Unknown location'}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Last active:{' '}
                                                            {formatLastActivity(
                                                                session.lastActivity
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                {!session.isCurrent && (
                                                    <IconButton
                                                        edge="end"
                                                        color="error"
                                                        onClick={() => {
                                                            setSelectedSession(
                                                                session
                                                            );
                                                            setRevokeDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                        sx={{
                                                            minHeight: 44,
                                                            minWidth: 44,
                                                        }}
                                                    >
                                                        <BlockIcon />
                                                    </IconButton>
                                                )}
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Device</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>IP Address</TableCell>
                                            <TableCell>Last Activity</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activeSessions.map(session => {
                                            const status =
                                                getSessionStatus(session);
                                            return (
                                                <TableRow key={session.id}>
                                                    <TableCell>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={1}
                                                        >
                                                            {getDeviceIcon(
                                                                session.deviceType
                                                            )}
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {
                                                                        session.browser
                                                                    }{' '}
                                                                    on{' '}
                                                                    {session.os}
                                                                </Typography>
                                                                {session.isCurrent && (
                                                                    <Chip
                                                                        label="Current Session"
                                                                        className="bg-blue-500 text-white"
                                                                        size="small"
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={0.5}
                                                        >
                                                            <LocationIcon
                                                                fontSize="small"
                                                                color="action"
                                                            />
                                                            <Typography variant="body2">
                                                                {session.location ||
                                                                    'Unknown'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily:
                                                                    'monospace',
                                                            }}
                                                        >
                                                            {session.ipAddress}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatLastActivity(
                                                                session.lastActivity
                                                            )}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={status.icon}
                                                            label={status.label}
                                                            color={status.color}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {!session.isCurrent && (
                                                            <Tooltip title="Revoke Session">
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => {
                                                                        setSelectedSession(
                                                                            session
                                                                        );
                                                                        setRevokeDialogOpen(
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    <BlockIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Inactive Sessions */}
            {inactiveSessions.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                            color="text.secondary"
                        >
                            <InactiveIcon
                                sx={{ mr: 1, verticalAlign: 'middle' }}
                            />
                            Inactive Sessions ({inactiveSessions.length})
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Device</TableCell>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell>Last Activity</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Reason</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inactiveSessions.map(session => {
                                        const status =
                                            getSessionStatus(session);
                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        {getDeviceIcon(
                                                            session.deviceType
                                                        )}
                                                        <Typography variant="body2">
                                                            {session.browser} on{' '}
                                                            {session.os}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontFamily:
                                                                'monospace',
                                                        }}
                                                    >
                                                        {session.ipAddress}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatLastActivity(
                                                            session.lastActivity
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={status.icon}
                                                        label={status.label}
                                                        color={status.color}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {session.revokedReason?.replace(
                                                            /_/g,
                                                            ' '
                                                        ) || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {sessions.length === 0 && !loading && (
                <Alert severity="info">No sessions found.</Alert>
            )}

            {/* Revoke Session Dialog */}
            <Dialog
                open={revokeDialogOpen}
                onClose={() => setRevokeDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box className="flex items-center gap-2">
                        <WarningIcon color="warning" />
                        Revoke Session
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedSession && (
                        <Box>
                            <Typography paragraph>
                                Are you sure you want to revoke this session?
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: 'background.paper',
                                    p: 2,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="body2" gutterBottom>
                                    <strong>Device:</strong>{' '}
                                    {selectedSession.browser} on{' '}
                                    {selectedSession.os}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>IP Address:</strong>{' '}
                                    {selectedSession.ipAddress}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Location:</strong>{' '}
                                    {selectedSession.location || 'Unknown'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Last Activity:</strong>{' '}
                                    {formatLastActivity(
                                        selectedSession.lastActivity
                                    )}
                                </Typography>
                            </Box>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                This action will immediately log out the user
                                from this device. This cannot be undone.
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevokeDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                            selectedSession &&
                            handleRevokeSession(selectedSession.id)
                        }
                    >
                        Revoke Session
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Revoke All Sessions Dialog */}
            <Dialog
                open={revokeAllDialogOpen}
                onClose={() => setRevokeAllDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box className="flex items-center gap-2">
                        <WarningIcon color="error" />
                        Revoke All Other Sessions
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography paragraph>
                        Are you sure you want to revoke all other active
                        sessions?
                    </Typography>
                    <Typography paragraph>
                        This will log out the user from{' '}
                        <strong>{activeSessions.length - 1}</strong> other
                        device(s), but will keep your current session active.
                    </Typography>
                    <Alert severity="error">
                        This action cannot be undone. All other sessions will be
                        immediately terminated.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevokeAllDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRevokeAllSessions}
                    >
                        Revoke All Others
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
