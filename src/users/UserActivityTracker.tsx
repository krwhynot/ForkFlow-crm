// src/users/UserActivityTracker.tsx
import React, { useState } from 'react';
import {
    ArrowRightOnRectangleIcon as LoginIcon,
    ArrowLeftOnRectangleIcon as LogoutIcon,
    PencilIcon as EditIcon,
    PlusIcon as CreateIcon,
    TrashIcon as DeleteIcon,
    ShieldCheckIcon as SecurityIcon,
    ExclamationTriangleIcon as WarningIcon,
    InformationCircleIcon as InfoIcon,
    ClockIcon as HistoryIcon,
    EyeIcon as VisibilityIcon,
    XMarkIcon as CloseIcon,
    ArrowDownTrayIcon as DownloadIcon,
} from '@heroicons/react/24/outline';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
} from '@/components/ui-kit';

import { User } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@/components/ui-kit';

interface UserActivity {
    id: string;
    type:
        | 'login'
        | 'logout'
        | 'create'
        | 'edit'
        | 'delete'
        | 'view'
        | 'security'
        | 'error';
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
    onExportActivity,
}) => {
    const [selectedActivity, setSelectedActivity] =
        useState<UserActivity | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const isMobile = useBreakpoint('sm');

    // Mock activity data for demonstration
    const mockActivities: UserActivity[] = [
        {
            id: '1',
            type: 'login',
            description: 'User logged in successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
            timestamp: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            resourceType: 'contact',
            resourceId: '456',
        },
        {
            id: '4',
            type: 'security',
            description: 'Password changed successfully',
            timestamp: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            ipAddress: '192.168.1.100',
        },
        {
            id: '5',
            type: 'logout',
            description: 'User logged out',
            timestamp: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            ipAddress: '192.168.1.100',
        },
    ];

    const displayActivities =
        activities.length > 0 ? activities : mockActivities;

    const getActivityIcon = (type: UserActivity['type']) => {
        switch (type) {
            case 'login':
                return <LoginIcon className="w-5 h-5 text-green-500" />;
            case 'logout':
                return <LogoutIcon className="w-5 h-5 text-gray-500" />;
            case 'create':
                return <CreateIcon className="w-5 h-5 text-blue-500" />;
            case 'edit':
                return <EditIcon className="w-5 h-5 text-blue-500" />;
            case 'delete':
                return <DeleteIcon className="w-5 h-5 text-red-500" />;
            case 'view':
                return <VisibilityIcon className="w-5 h-5 text-gray-500" />;
            case 'security':
                return <SecurityIcon className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <WarningIcon className="w-5 h-5 text-red-500" />;
            default:
                return <InfoIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getActivityColor = (
        type: UserActivity['type']
    ): 'success' | 'error' | 'warning' | 'info' | 'default' => {
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
            return (
                date.toLocaleDateString() + ' at ' + date.toLocaleTimeString()
            );
        }
    };

    return (
        <Box>
            <Card>
                <CardContent>
                    <Box className="flex justify-between items-center mb-4">
                        <Typography
                            variant="h6"
                            className="mb-0 flex items-center"
                        >
                            <HistoryIcon className="w-6 h-6 mr-2" />
                            User Activity Log
                        </Typography>

                        {onExportActivity && (
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={onExportActivity}
                            >
                                <DownloadIcon className="w-4 h-4 mr-1" />
                                Export
                            </Button>
                        )}
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                    >
                        Recent activity and system interactions for{' '}
                        {user.firstName} {user.lastName}
                    </Typography>

                    {displayActivities.length === 0 ? (
                        <Box className="text-center py-8">
                            <HistoryIcon className="w-20 h-20 text-gray-500 mb-4 mx-auto" />
                            <Typography variant="body1" color="text.secondary">
                                No activity recorded yet
                            </Typography>
                        </Box>
                    ) : (
                        <List className="max-h-96 overflow-auto">
                            {displayActivities.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() =>
                                            handleViewDetails(activity)
                                        }
                                    >
                                        <ListItemIcon>
                                            {getActivityIcon(activity.type)}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box className="flex items-center gap-2">
                                                    <Typography variant="body2">
                                                        {activity.description}
                                                    </Typography>
                                                    <Chip
                                                        label={activity.type}
                                                        size="small"
                                                        className={`border ${
                                                            getActivityColor(
                                                                activity.type
                                                            ) === 'success'
                                                                ? 'border-green-500 text-green-500'
                                                                : getActivityColor(
                                                                        activity.type
                                                                    ) ===
                                                                    'error'
                                                                  ? 'border-red-500 text-red-500'
                                                                  : getActivityColor(
                                                                          activity.type
                                                                      ) ===
                                                                      'warning'
                                                                    ? 'border-yellow-500 text-yellow-500'
                                                                    : getActivityColor(
                                                                            activity.type
                                                                        ) ===
                                                                        'info'
                                                                      ? 'border-blue-500 text-blue-500'
                                                                      : 'border-gray-500 text-gray-500'
                                                        }`}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box className="space-y-1">
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {formatTimestamp(
                                                            activity.timestamp
                                                        )}
                                                    </Typography>
                                                    {activity.ipAddress && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            className="ml-2"
                                                        >
                                                            •{' '}
                                                            {activity.ipAddress}
                                                        </Typography>
                                                    )}
                                                    {activity.location && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            className="ml-2"
                                                        >
                                                            •{' '}
                                                            {activity.location}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />

                                        <IconButton
                                            size="small"
                                            className="text-blue-600"
                                        >
                                            <VisibilityIcon className="w-4 h-4" />
                                        </IconButton>
                                    </ListItem>

                                    {index < displayActivities.length - 1 && (
                                        <Divider className="my-1" />
                                    )}
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
                    <Box className="flex justify-between items-center">
                        <Typography variant="h6">Activity Details</Typography>
                        <IconButton
                            onClick={handleCloseDetails}
                            size="small"
                            className="text-gray-600"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    {selectedActivity && (
                        <Box>
                            <Box className="flex items-center gap-4 mb-6">
                                {getActivityIcon(selectedActivity.type)}
                                <Box className="space-y-2">
                                    <Typography variant="h6">
                                        {selectedActivity.description}
                                    </Typography>
                                    <Chip
                                        label={selectedActivity.type.toUpperCase()}
                                        size="small"
                                        className={`${
                                            getActivityColor(
                                                selectedActivity.type
                                            ) === 'success'
                                                ? 'bg-green-500 text-white'
                                                : getActivityColor(
                                                        selectedActivity.type
                                                    ) === 'error'
                                                  ? 'bg-red-500 text-white'
                                                  : getActivityColor(
                                                          selectedActivity.type
                                                      ) === 'warning'
                                                    ? 'bg-yellow-500 text-white'
                                                    : getActivityColor(
                                                            selectedActivity.type
                                                        ) === 'info'
                                                      ? 'bg-blue-500 text-white'
                                                      : 'bg-gray-500 text-white'
                                        }`}
                                    />
                                </Box>
                            </Box>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <Table className="w-full">
                                    <TableBody>
                                        <TableRow className="border-b border-gray-100">
                                            <TableCell className="font-semibold p-3">
                                                Timestamp
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {new Date(
                                                    selectedActivity.timestamp
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>

                                        {selectedActivity.ipAddress && (
                                            <TableRow className="border-b border-gray-100">
                                                <TableCell className="font-semibold p-3">
                                                    IP Address
                                                </TableCell>
                                                <TableCell className="font-mono p-3">
                                                    {selectedActivity.ipAddress}
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {selectedActivity.location && (
                                            <TableRow className="border-b border-gray-100">
                                                <TableCell className="font-semibold p-3">
                                                    Location
                                                </TableCell>
                                                <TableCell className="p-3">
                                                    {selectedActivity.location}
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {selectedActivity.resourceType && (
                                            <TableRow className="border-b border-gray-100">
                                                <TableCell className="font-semibold p-3">
                                                    Resource Type
                                                </TableCell>
                                                <TableCell className="p-3">
                                                    {
                                                        selectedActivity.resourceType
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {selectedActivity.resourceId && (
                                            <TableRow className="border-b border-gray-100">
                                                <TableCell className="font-semibold p-3">
                                                    Resource ID
                                                </TableCell>
                                                <TableCell className="font-mono p-3">
                                                    {
                                                        selectedActivity.resourceId
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {selectedActivity.userAgent && (
                                            <TableRow className="border-b border-gray-100">
                                                <TableCell className="font-semibold p-3">
                                                    User Agent
                                                </TableCell>
                                                <TableCell className="font-mono text-xs break-all p-3">
                                                    {selectedActivity.userAgent}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {selectedActivity.metadata &&
                                Object.keys(selectedActivity.metadata).length >
                                    0 && (
                                    <Box className="mt-6">
                                        <Typography variant="h6" gutterBottom>
                                            Additional Details
                                        </Typography>
                                        <Paper className="border border-gray-200 p-4 rounded-lg">
                                            <pre
                                                style={{
                                                    margin: 0,
                                                    fontSize: '0.875rem',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {JSON.stringify(
                                                    selectedActivity.metadata,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </Paper>
                                    </Box>
                                )}
                        </Box>
                    )}
                </DialogContent>

                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <Button onClick={handleCloseDetails} variant="secondary">
                        Close
                    </Button>
                </div>
            </Dialog>
        </Box>
    );
};
