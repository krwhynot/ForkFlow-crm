import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Alert,
    Chip,
    Stack,
    Divider,
} from '@/components/ui-kit';
import {
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    ChevronDownIcon,
    CogIcon,
    MapPinIcon,
    CloudSlashIcon,
    ServerIcon,
    BoltIcon,
    ShieldCheckIcon,
    ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

import { PerformanceDashboard } from './PerformanceDashboard';
import { useGPSService, useOfflineService } from '../../providers/mobile';

export const InteractionSettings = () => {
    const gpsService = useGPSService();
    const offlineService = useOfflineService();

    const [settings, setSettings] = useState({
        // GPS Settings
        gpsEnabled: true,
        gpsHighAccuracy: true,
        gpsTimeout: 10000,
        gpsCacheTime: 60000,
        gpsAutoCapture: true,

        // Offline Settings
        offlineEnabled: true,
        autoSync: true,
        syncInterval: 300000, // 5 minutes
        maxOfflineStorage: 100,

        // File Upload Settings
        fileCompression: true,
        maxFileSize: 10485760, // 10MB
        compressionQuality: 0.8,
        thumbnailSize: 150,

        // Performance Settings
        performanceTracking: true,
        performanceAlerts: true,
        maxMetricsStorage: 1000,
    });

    const [offlineStatus, setOfflineStatus] = useState(
        offlineService.getStatus()
    );

    const handleSettingChange =
        (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const value =
                event.target.type === 'checkbox'
                    ? event.target.checked
                    : event.target.value;
            setSettings(prev => ({
                ...prev,
                [key]: value,
            }));
        };

    const testGPS = async () => {
        try {
            const result = await gpsService.getCurrentLocation({
                enableHighAccuracy: settings.gpsHighAccuracy,
                timeout: settings.gpsTimeout,
                maximumAge: settings.gpsCacheTime,
            });

            if (result.coordinates) {
                alert(
                    `GPS Test Successful!\n\nLatitude: ${result.coordinates.latitude}\nLongitude: ${result.coordinates.longitude}\nAccuracy: ±${Math.round(result.coordinates.accuracy || 0)}m`
                );
            } else {
                alert(`GPS Test Failed: ${result.error}`);
            }
        } catch (error: any) {
            alert(`GPS Test Error: ${error.message}`);
        }
    };

    const clearOfflineData = async () => {
        if (
            confirm(
                'Are you sure you want to clear all offline data? This action cannot be undone.'
            )
        ) {
            try {
                await offlineService.clearOfflineData();
                setOfflineStatus(offlineService.getStatus());
                alert('Offline data cleared successfully!');
            } catch (error: any) {
                alert(`Failed to clear offline data: ${error.message}`);
            }
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CogIcon className="w-6 h-6 text-blue-600" />
                <Typography variant="h4">
                    Interaction Tracking Settings
                </Typography>
            </Box>

            {/* Status Overview */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        System Status
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <MapPinIcon
                                    className={`w-10 h-10 mb-1 ${
                                        gpsService.isAvailable()
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                />
                                <Typography variant="body2">
                                    GPS:{' '}
                                    {gpsService.isAvailable()
                                        ? 'Available'
                                        : 'Unavailable'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <CloudSlashIcon
                                    className={`w-10 h-10 mb-1 ${
                                        offlineStatus.isOnline
                                            ? 'text-green-600'
                                            : 'text-yellow-600'
                                    }`}
                                />
                                <Typography variant="body2">
                                    Status:{' '}
                                    {offlineStatus.isOnline
                                        ? 'Online'
                                        : 'Offline'}
                                </Typography>
                                {offlineStatus.pendingActions > 0 && (
                                    <Chip
                                        label={`${offlineStatus.pendingActions} pending`}
                                        size="small"
                                        color="info"
                                    />
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ServerIcon
                                    className="w-10 h-10 mb-1 text-blue-600"
                                />
                                <Typography variant="body2">
                                    Storage:{' '}
                                    {formatBytes(
                                        (offlineStatus as any).storageUsed || 0
                                    )}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <BoltIcon
                                    className="w-10 h-10 mb-1 text-blue-600"
                                />
                                <Typography variant="body2">
                                    Performance: Monitoring
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Settings Sections */}
            <Stack spacing={2}>
                {/* GPS Settings */}
                <Accordion>
                    <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <MapPinIcon className="w-5 h-5 text-blue-600" />
                            <Typography variant="h6">
                                GPS & Location Settings
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.gpsEnabled}
                                                onChange={handleSettingChange(
                                                    'gpsEnabled'
                                                )}
                                            />
                                        }
                                        label="Enable GPS tracking"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.gpsHighAccuracy
                                                }
                                                onChange={handleSettingChange(
                                                    'gpsHighAccuracy'
                                                )}
                                                disabled={!settings.gpsEnabled}
                                            />
                                        }
                                        label="High accuracy mode (uses more battery)"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.gpsAutoCapture
                                                }
                                                onChange={handleSettingChange(
                                                    'gpsAutoCapture'
                                                )}
                                                disabled={!settings.gpsEnabled}
                                            />
                                        }
                                        label="Auto-capture location for in-person interactions"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="GPS Timeout"
                                        type="number"
                                        value={settings.gpsTimeout / 1000}
                                        onChange={e =>
                                            handleSettingChange('gpsTimeout')({
                                                target: {
                                                    value:
                                                        Number(e.target.value) *
                                                        1000,
                                                    type: 'text',
                                                },
                                            } as any)
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    seconds
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Maximum time to wait for GPS signal"
                                        disabled={!settings.gpsEnabled}
                                        size="small"
                                    />
                                    <TextField
                                        label="Cache Duration"
                                        type="number"
                                        value={settings.gpsCacheTime / 60000}
                                        onChange={e =>
                                            handleSettingChange('gpsCacheTime')(
                                                {
                                                    target: {
                                                        value:
                                                            Number(
                                                                e.target.value
                                                            ) * 60000,
                                                        type: 'text',
                                                    },
                                                } as any
                                            )
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    minutes
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="How long to cache GPS coordinates"
                                        disabled={!settings.gpsEnabled}
                                        size="small"
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={testGPS}
                                        disabled={!settings.gpsEnabled}
                                        startIcon={<MapPinIcon className="w-4 h-4" />}
                                    >
                                        Test GPS
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Offline Settings */}
                <Accordion>
                    <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <CloudSlashIcon className="w-5 h-5 text-blue-600" />
                            <Typography variant="h6">
                                Offline & Sync Settings
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.offlineEnabled
                                                }
                                                onChange={handleSettingChange(
                                                    'offlineEnabled'
                                                )}
                                            />
                                        }
                                        label="Enable offline mode"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.autoSync}
                                                onChange={handleSettingChange(
                                                    'autoSync'
                                                )}
                                                disabled={
                                                    !settings.offlineEnabled
                                                }
                                            />
                                        }
                                        label="Auto-sync when connection is restored"
                                    />
                                    <TextField
                                        label="Sync Interval"
                                        type="number"
                                        value={settings.syncInterval / 60000}
                                        onChange={e =>
                                            handleSettingChange('syncInterval')(
                                                {
                                                    target: {
                                                        value:
                                                            Number(
                                                                e.target.value
                                                            ) * 60000,
                                                        type: 'text',
                                                    },
                                                } as any
                                            )
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    minutes
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="How often to attempt sync when online"
                                        disabled={
                                            !settings.offlineEnabled ||
                                            !settings.autoSync
                                        }
                                        size="small"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Max Offline Records"
                                        type="number"
                                        value={settings.maxOfflineStorage}
                                        onChange={handleSettingChange(
                                            'maxOfflineStorage'
                                        )}
                                        helperText="Maximum interactions to store offline"
                                        disabled={!settings.offlineEnabled}
                                        size="small"
                                    />
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            <strong>
                                                Current Offline Status:
                                            </strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            • Pending Actions:{' '}
                                            {offlineStatus.pendingActions}
                                        </Typography>
                                        <Typography variant="body2">
                                            • Storage Used:{' '}
                                            {formatBytes(
                                                (offlineStatus as any)
                                                    .storageUsed || 0
                                            )}
                                        </Typography>
                                        <Typography variant="body2">
                                            • Last Sync:{' '}
                                            {offlineStatus.lastSync || 'Never'}
                                        </Typography>
                                    </Alert>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        onClick={clearOfflineData}
                                        disabled={!settings.offlineEnabled}
                                        startIcon={<ServerIcon className="w-4 h-4" />}
                                    >
                                        Clear Offline Data
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* File Upload Settings */}
                <Accordion>
                    <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <ArrowUpTrayIcon className="w-5 h-5 text-blue-600" />
                            <Typography variant="h6">
                                File Upload Settings
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.fileCompression
                                                }
                                                onChange={handleSettingChange(
                                                    'fileCompression'
                                                )}
                                            />
                                        }
                                        label="Compress images for mobile upload"
                                    />
                                    <TextField
                                        label="Max File Size"
                                        type="number"
                                        value={settings.maxFileSize / 1048576}
                                        onChange={e =>
                                            handleSettingChange('maxFileSize')({
                                                target: {
                                                    value:
                                                        Number(e.target.value) *
                                                        1048576,
                                                    type: 'text',
                                                },
                                            } as any)
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    MB
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Maximum allowed file size"
                                        size="small"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Compression Quality"
                                        type="number"
                                        value={settings.compressionQuality}
                                        onChange={handleSettingChange(
                                            'compressionQuality'
                                        )}
                                        InputProps={{
                                            inputProps: {
                                                min: 0.1,
                                                max: 1.0,
                                                step: 0.1,
                                            },
                                        }}
                                        helperText="Image compression quality (0.1 - 1.0)"
                                        disabled={!settings.fileCompression}
                                        size="small"
                                    />
                                    <TextField
                                        label="Thumbnail Size"
                                        type="number"
                                        value={settings.thumbnailSize}
                                        onChange={handleSettingChange(
                                            'thumbnailSize'
                                        )}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    px
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Size of generated thumbnails"
                                        size="small"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Performance Settings */}
                <Accordion>
                    <AccordionSummary expandIcon={<ChevronDownIcon className="w-5 h-5" />}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <BoltIcon className="w-5 h-5 text-blue-600" />
                            <Typography variant="h6">
                                Performance Monitoring
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.performanceTracking
                                                }
                                                onChange={handleSettingChange(
                                                    'performanceTracking'
                                                )}
                                            />
                                        }
                                        label="Enable performance tracking"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    settings.performanceAlerts
                                                }
                                                onChange={handleSettingChange(
                                                    'performanceAlerts'
                                                )}
                                                disabled={
                                                    !settings.performanceTracking
                                                }
                                            />
                                        }
                                        label="Show performance alerts"
                                    />
                                    <TextField
                                        label="Max Metrics to Store"
                                        type="number"
                                        value={settings.maxMetricsStorage}
                                        onChange={handleSettingChange(
                                            'maxMetricsStorage'
                                        )}
                                        helperText="Maximum number of performance metrics to keep"
                                        disabled={!settings.performanceTracking}
                                        size="small"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Alert severity="info">
                                    <Typography variant="body2">
                                        <strong>
                                            Performance tracking monitors:
                                        </strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        • API response times
                                    </Typography>
                                    <Typography variant="body2">
                                        • GPS acquisition speed
                                    </Typography>
                                    <Typography variant="body2">
                                        • File upload performance
                                    </Typography>
                                    <Typography variant="body2">
                                        • Error rates and success metrics
                                    </Typography>
                                </Alert>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Performance Dashboard */}
                        {settings.performanceTracking && (
                            <PerformanceDashboard />
                        )}
                    </AccordionDetails>
                </Accordion>
            </Stack>

            {/* Save Settings */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShieldCheckIcon className="w-4 h-4" />}
                    onClick={() => {
                        // In a real implementation, this would save settings to the backend
                        alert('Settings saved successfully!');
                    }}
                >
                    Save Settings
                </Button>
            </Box>
        </Box>
    );
};
