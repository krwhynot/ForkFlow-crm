/**
 * Authentication Status Indicator for Mobile Field Sales
 * Shows connection status, offline capabilities, and session info
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Chip,
    IconButton,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '../components/ui-kit';
import { Popover } from '@headlessui/react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
    WifiIcon,
    SignalSlashIcon,
    CloudIcon,
    CloudSlashIcon,
    ShieldCheckIcon,
    ClockIcon,
    DevicePhoneMobileIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthState } from 'react-admin';
import { isOnline, getOfflineAuthStatus } from '../../utils/offlineAuth';
import { getSessionSummary } from '../../utils/sessionPersistence';

export const AuthStatusIndicator: React.FC = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(isOnline());
    const [offlineStatus, setOfflineStatus] = useState(getOfflineAuthStatus());
    const [sessionSummary, setSessionSummary] = useState(getSessionSummary());
    const { authenticated } = useAuthState();
    const isMobile = useBreakpoint('sm');

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

    const handleToggle = () => {
        setIsPopoverOpen(!isPopoverOpen);
    };

    const handleClose = () => {
        setIsPopoverOpen(false);
    };

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
            return offlineStatus.hasCredentials ? (
                <CloudSlashIcon className="w-5 h-5" />
            ) : (
                <SignalSlashIcon className="w-5 h-5" />
            );
        }
        return <CloudIcon className="w-5 h-5" />;
    };

    const getStatusText = () => {
        if (!isConnected) {
            return offlineStatus.hasCredentials
                ? 'Offline Mode'
                : 'No Connection';
        }
        return 'Connected';
    };

    return (
        <Popover className="relative">
            <Popover.Button
                as={IconButton}
                onClick={handleToggle}
                className={`${isMobile ? 'p-3' : 'p-2'} ${
                    getStatusColor() === 'success'
                        ? 'text-green-600 hover:bg-green-50'
                        : getStatusColor() === 'warning'
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-red-600 hover:bg-red-50'
                }`}
            >
                {getStatusIcon()}
            </Popover.Button>

            <Popover.Panel
                className={`absolute right-0 top-full z-50 mt-2 ${
                    isMobile ? 'w-[90vw]' : 'w-80'
                } max-w-96 p-4 bg-white border border-gray-200 rounded-lg shadow-lg`}
            >
                <Box>
                    <Box className="flex items-center mb-4">
                        {getStatusIcon()}
                        <Typography variant="h6" className="ml-2">
                            {getStatusText()}
                        </Typography>
                    </Box>

                    {/* Connection Status */}
                    <Alert
                        variant={getStatusColor()}
                        className="mb-4 flex items-center gap-2"
                    >
                        {isConnected ? <WifiIcon className="w-5 h-5" /> : <SignalSlashIcon className="w-5 h-5" />}
                        <Typography variant="body2">
                            {isConnected
                                ? 'Connected to server - full functionality available'
                                : offlineStatus.hasCredentials
                                  ? 'Offline mode active - limited functionality'
                                  : 'No connection - please connect to use the app'}
                        </Typography>
                    </Alert>

                    <Divider className="my-4" />

                    {/* Session Information */}
                    {sessionSummary.isValid && (
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <ShieldCheckIcon className="w-4 h-4" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Current User"
                                    secondary={sessionSummary.user}
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemIcon>
                                    <ClockIcon className="w-4 h-4" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Last Activity"
                                    secondary={sessionSummary.sessionAge}
                                />
                            </ListItem>

                            {sessionSummary.deviceInfo?.isMobile && (
                                <ListItem>
                                    <ListItemIcon>
                                        <DevicePhoneMobileIcon className="w-4 h-4" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Mobile Device"
                                        secondary={
                                            sessionSummary.deviceInfo
                                                .isStandalone
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
                            <Divider className="my-4" />
                            <Typography variant="subtitle2" gutterBottom>
                                Offline Authentication
                            </Typography>

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <InformationCircleIcon className="w-4 h-4" />
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

                                {offlineStatus.hasCredentials &&
                                    offlineStatus.lastSync && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CloudIcon className="w-4 h-4" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Last Sync"
                                                secondary={
                                                    offlineStatus.lastSync
                                                }
                                            />
                                        </ListItem>
                                    )}

                                {offlineStatus.isLocked && (
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Alert severity="error">
                                                    <Typography variant="caption">
                                                        Account locked until{' '}
                                                        {
                                                            offlineStatus.lockoutUntil
                                                        }
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
                            <Divider className="my-4" />
                            <Alert variant="info">
                                <Typography variant="caption">
                                    <strong>Field Sales Tip:</strong> Keep
                                    "Remember Me" enabled for reliable offline
                                    access
                                </Typography>
                            </Alert>
                        </>
                    )}
                </Box>
            </Popover.Panel>
        </Popover>
    );
};
