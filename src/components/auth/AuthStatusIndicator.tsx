/**
 * Authentication Status Indicator for Mobile Field Sales
 * Shows connection status, offline capabilities, and session info
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Popover,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Wifi as OnlineIcon,
    WifiOff as OfflineIcon,
    CloudDone as SyncedIcon,
    CloudOff as UnsyncedIcon,
    Security as SecurityIcon,
    Schedule as SessionIcon,
    Phone as MobileIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-admin';
import { isOnline, getOfflineAuthStatus } from '../../utils/offlineAuth';
import { getSessionSummary } from '../../utils/sessionPersistence';

export const AuthStatusIndicator: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isConnected, setIsConnected] = useState(isOnline());
    const [offlineStatus, setOfflineStatus] = useState(getOfflineAuthStatus());
    const [sessionSummary, setSessionSummary] = useState(getSessionSummary());
    const { authenticated } = useAuthState();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const updateStatus = () => {
            setIsConnected(isOnline());
            setOfflineStatus(getOfflineAuthStatus());
            setSessionSummary(getSessionSummary());
        };

        // Update status periodically
        const interval = setInterval(updateStatus, 30000); // Every 30 seconds
        
        // Listen to online/offline events
        const handleOnline = () => updateStatus();
        const handleOffline = () => updateStatus();
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    if (!authenticated) {
        return null;
    }

    const getStatusColor = (): 'success' | 'warning' | 'error' => {
        if (!isConnected && !offlineStatus.hasCredentials) return 'error';
        if (!isConnected && offlineStatus.hasCredentials) return 'warning';
        return 'success';
    };

    const getStatusIcon = () => {
        if (!isConnected) {
            return offlineStatus.hasCredentials ? <UnsyncedIcon /> : <OfflineIcon />;
        }
        return <SyncedIcon />;
    };

    const getStatusText = () => {
        if (!isConnected) {
            return offlineStatus.hasCredentials ? 'Offline Mode' : 'No Connection';
        }
        return 'Connected';
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                size={isMobile ? 'medium' : 'small'}
                sx={{
                    color: (theme) => theme.palette[getStatusColor()].main,
                    '&:hover': {
                        backgroundColor: (theme) => theme.palette[getStatusColor()].light + '20',
                    },
                }}
            >
                {getStatusIcon()}
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        width: isMobile ? '90vw' : 320,
                        maxWidth: 400,
                        p: 2,
                    },
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getStatusIcon()}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {getStatusText()}
                        </Typography>
                    </Box>

                    {/* Connection Status */}
                    <Alert
                        severity={getStatusColor()}
                        icon={isConnected ? <OnlineIcon /> : <OfflineIcon />}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2">
                            {isConnected
                                ? 'Connected to server - full functionality available'
                                : offlineStatus.hasCredentials
                                ? 'Offline mode active - limited functionality'
                                : 'No connection - please connect to use the app'
                            }
                        </Typography>
                    </Alert>

                    <Divider sx={{ my: 2 }} />

                    {/* Session Information */}
                    {sessionSummary.isValid && (
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <SecurityIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Current User"
                                    secondary={sessionSummary.user}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <SessionIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Last Activity"
                                    secondary={sessionSummary.sessionAge}
                                />
                            </ListItem>

                            {sessionSummary.deviceInfo?.isMobile && (
                                <ListItem>
                                    <ListItemIcon>
                                        <MobileIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Mobile Device"
                                        secondary={
                                            sessionSummary.deviceInfo.isStandalone
                                                ? 'PWA Mode Active'
                                                : 'Browser Mode'
                                        }
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}

                    {/* Offline Authentication Status */}
                    {offlineStatus.isEnabled && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Offline Authentication
                            </Typography>
                            
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <InfoIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Status"
                                        secondary={
                                            offlineStatus.hasCredentials
                                                ? 'Enabled - can work offline'
                                                : 'Disabled - online login required'
                                        }
                                    />
                                </ListItem>

                                {offlineStatus.hasCredentials && offlineStatus.lastSync && (
                                    <ListItem>
                                        <ListItemIcon>
                                            <SyncedIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Last Sync"
                                            secondary={offlineStatus.lastSync}
                                        />
                                    </ListItem>
                                )}

                                {offlineStatus.isLocked && (
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Alert severity="error">
                                                    <Typography variant="caption">
                                                        Account locked until {offlineStatus.lockoutUntil}
                                                    </Typography>
                                                </Alert>
                                            }
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </>
                    )}

                    {/* Tips for Mobile Users */}
                    {isMobile && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Alert severity="info">
                                <Typography variant="caption">
                                    <strong>Field Sales Tip:</strong> Keep "Remember Me" enabled for reliable offline access
                                </Typography>
                            </Alert>
                        </>
                    )}
                </Box>
            </Popover>
        </>
    );
};