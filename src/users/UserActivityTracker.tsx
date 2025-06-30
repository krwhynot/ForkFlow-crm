// src/users/UserActivityTracker.tsx
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Avatar,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    Login as LoginIcon,
    Logout as LogoutIcon,
    Edit as EditIcon,
    Create as CreateIcon,
    Delete as DeleteIcon,
    Security as SecurityIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    History as HistoryIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';

import { User } from '../types';

interface UserActivity {
    id: string;
    type: 'login' | 'logout' | 'create' | 'edit' | 'delete' | 'view' | 'security' | 'error';
    description: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
}

interface UserActivityTrackerProps {
    user: User;
    activities?: UserActivity[];
    onExportActivity?: () => void;
}

export const UserActivityTracker: React.FC<UserActivityTrackerProps> = ({
    user,
    activities = [],
    onExportActivity
}) => {
    const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Mock activity data for demonstration
    const mockActivities: UserActivity[] = [
        {
            id: '1',
            type: 'login',
            description: 'User logged in successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'San Francisco, CA',
        },
        {
            id: '2',
            type: 'edit',
            description: 'Updated organization: Acme Restaurant',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            resourceType: 'organization',
            resourceId: '123',
            metadata: { changes: ['name', 'phone'] },
        },
        {
            id: '3',
            type: 'create',
            description: 'Created new contact: John Smith',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            resourceType: 'contact',
            resourceId: '456',
        },
        {
            id: '4',
            type: 'security',
            description: 'Password changed successfully',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
        },
        {
            id: '5',
            type: 'logout',
            description: 'User logged out',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
        },
    ];

    const displayActivities = activities.length > 0 ? activities : mockActivities;

    const getActivityIcon = (type: UserActivity['type']) => {
        switch (type) {
            case 'login':
                return <LoginIcon color="success" />;
            case 'logout':
                return <LogoutIcon color="action" />;
            case 'create':
                return <CreateIcon color="primary" />;
            case 'edit':
                return <EditIcon color="info" />;
            case 'delete':
                return <DeleteIcon color="error" />;
            case 'view':
                return <VisibilityIcon color="action" />;
            case 'security':
                return <SecurityIcon color="warning" />;
            case 'error':
                return <WarningIcon color="error" />;
            default:
                return <InfoIcon color="action" />;
        }
    };

    const getActivityColor = (type: UserActivity['type']): 'success' | 'error' | 'warning' | 'info' | 'default' => {
        switch (type) {
            case 'login':
            case 'create':
                return 'success';
            case 'delete':
            case 'error':
                return 'error';
            case 'security':
                return 'warning';
            case 'edit':
            case 'view':
                return 'info';
            default:
                return 'default';
        }
    };

    const handleViewDetails = (activity: UserActivity) => {
        setSelectedActivity(activity);
        setShowDetailDialog(true);
    };

    const handleCloseDetails = () => {
        setSelectedActivity(null);
        setShowDetailDialog(false);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
        }
    };

    return (
        <Box>
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" gutterBottom>
                            <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            User Activity Log
                        </Typography>
                        
                        {onExportActivity && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={onExportActivity}
                            >
                                Export
                            </Button>
                        )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        Recent activity and system interactions for {user.firstName} {user.lastName}
                    </Typography>

                    {displayActivities.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                No activity recorded yet
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {displayActivities.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                        onClick={() => handleViewDetails(activity)}
                                    >
                                        <ListItemIcon>
                                            {getActivityIcon(activity.type)}
                                        </ListItemIcon>
                                        
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body2">
                                                        {activity.description}
                                                    </Typography>
                                                    <Chip
                                                        label={activity.type}
                                                        size="small"
                                                        color={getActivityColor(activity.type)}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTimestamp(activity.timestamp)}
                                                    </Typography>
                                                    {activity.ipAddress && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                            • {activity.ipAddress}
                                                        </Typography>
                                                    )}
                                                    {activity.location && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                            • {activity.location}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        
                                        <IconButton size="small">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </ListItem>
                                    
                                    {index < displayActivities.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Activity Detail Dialog */}
            <Dialog
                open={showDetailDialog}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Activity Details
                        </Typography>
                        <IconButton onClick={handleCloseDetails} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    {selectedActivity && (
                        <Box>
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                {getActivityIcon(selectedActivity.type)}
                                <Box>
                                    <Typography variant="h6">
                                        {selectedActivity.description}
                                    </Typography>
                                    <Chip
                                        label={selectedActivity.type.toUpperCase()}
                                        size="small"
                                        color={getActivityColor(selectedActivity.type)}
                                    />
                                </Box>
                            </Box>

                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><strong>Timestamp</strong></TableCell>
                                            <TableCell>
                                                {new Date(selectedActivity.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        
                                        {selectedActivity.ipAddress && (
                                            <TableRow>
                                                <TableCell><strong>IP Address</strong></TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                                    {selectedActivity.ipAddress}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        
                                        {selectedActivity.location && (
                                            <TableRow>
                                                <TableCell><strong>Location</strong></TableCell>
                                                <TableCell>{selectedActivity.location}</TableCell>
                                            </TableRow>
                                        )}
                                        
                                        {selectedActivity.resourceType && (
                                            <TableRow>
                                                <TableCell><strong>Resource Type</strong></TableCell>
                                                <TableCell>{selectedActivity.resourceType}</TableCell>
                                            </TableRow>
                                        )}
                                        
                                        {selectedActivity.resourceId && (
                                            <TableRow>
                                                <TableCell><strong>Resource ID</strong></TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                                    {selectedActivity.resourceId}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        
                                        {selectedActivity.userAgent && (
                                            <TableRow>
                                                <TableCell><strong>User Agent</strong></TableCell>
                                                <TableCell sx={{ 
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.75rem',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {selectedActivity.userAgent}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                                <Box mt={3}>
                                    <Typography variant="h6" gutterBottom>
                                        Additional Details
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <pre style={{ 
                                            margin: 0, 
                                            fontSize: '0.875rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {JSON.stringify(selectedActivity.metadata, null, 2)}
                                        </pre>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={handleCloseDetails}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};