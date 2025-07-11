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
} from '@mui/material';
import { useLogout, useNotify } from 'react-admin';
import { Timer as TimerIcon, Warning as WarningIcon } from '@mui/icons-material';

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

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
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
    }, [enabled, lastActivity, timeoutMs, warningMs, isWarningOpen, handleAutoLogout]);

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
            fullWidth
            disableEscapeKeyDown
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6">
                        Session Timeout Warning
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Your session will expire in <strong>{formatTime(remainingTime)}</strong> due to inactivity.
                    </Typography>
                    <Typography variant="body2">
                        Click "Stay Logged In" to extend your session, or "Logout Now" to end your session safely.
                    </Typography>
                </Alert>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Time Remaining:
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={warningProgress}
                        color={warningProgress > 50 ? "warning" : "error"}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                        Automatic logout in {formatTime(remainingTime)}
                    </Typography>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, gap: 1 }}>
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