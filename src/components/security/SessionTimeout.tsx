/**
 * Session Timeout Management Component
 * Handles automatic logout and session warnings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    LinearProgress,
    Alert,
    Box,
} from '@/components/ui-kit';
import { useLogout, useNotify } from 'react-admin';
import {
    ClockIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SessionTimeoutProps {
    timeoutMinutes?: number;
    warningMinutes?: number;
    enabled?: boolean;
}

export const SessionTimeout: React.FC<SessionTimeoutProps> = ({
    timeoutMinutes = 30,
    warningMinutes = 5,
    enabled = true,
}) => {
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const logout = useLogout();
    const notify = useNotify();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;

    // Reset activity timer
    const resetActivity = useCallback(() => {
        setLastActivity(Date.now());
        setIsWarningOpen(false);
    }, []);

    // Handle automatic logout
    const handleAutoLogout = useCallback(() => {
        notify('Session expired due to inactivity', { type: 'warning' });
        logout();
    }, [logout, notify]);

    // Extend session
    const handleExtendSession = useCallback(() => {
        resetActivity();
        notify('Session extended', { type: 'success' });
    }, [resetActivity, notify]);

    // Track user activity
    useEffect(() => {
        if (!enabled) return;

        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        const handleActivity = () => {
            resetActivity();
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [enabled, resetActivity]);

    // Session timeout logic
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;
            const remaining = timeoutMs - timeSinceActivity;

            setRemainingTime(remaining);

            // Show warning
            if (remaining <= warningMs && remaining > 0 && !isWarningOpen) {
                setIsWarningOpen(true);
            }

            // Auto logout
            if (remaining <= 0) {
                handleAutoLogout();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [
        enabled,
        lastActivity,
        timeoutMs,
        warningMs,
        isWarningOpen,
        handleAutoLogout,
    ]);

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const warningProgress = Math.max(0, (remainingTime / warningMs) * 100);

    if (!enabled) return null;

    return (
        <Dialog
            open={isWarningOpen}
            onClose={() => {}} // Prevent closing by clicking outside
            maxWidth="sm"
            className="w-full"
        >
            <DialogTitle>
                <Box className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                    <Typography variant="h6">
                        Session Timeout Warning
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Alert severity="warning" className="mb-4">
                    <Typography variant="body1" className="mb-2">
                        Your session will expire in{' '}
                        <strong>{formatTime(remainingTime)}</strong> due to
                        inactivity.
                    </Typography>
                    <Typography variant="body2">
                        Click "Stay Logged In" to extend your session, or
                        "Logout Now" to end your session safely.
                    </Typography>
                </Alert>

                <Box className="mt-4">
                    <Typography
                        variant="body2"
                        className="text-gray-600 mb-2"
                    >
                        Time Remaining:
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={warningProgress}
                        color={warningProgress > 50 ? 'warning' : 'error'}
                        className="h-2 rounded"
                    />
                </Box>

                <Box className="mt-4 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <Typography variant="caption" className="text-gray-600">
                        Automatic logout in {formatTime(remainingTime)}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions className="p-4 gap-2">
                <Button
                    onClick={() => logout()}
                    color="error"
                    variant="outlined"
                >
                    Logout Now
                </Button>
                <Button
                    onClick={handleExtendSession}
                    color="primary"
                    variant="contained"
                    autoFocus
                >
                    Stay Logged In
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionTimeout;
