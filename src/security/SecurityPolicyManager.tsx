// src/security/SecurityPolicyManager.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Switch,
    TextField,
    Button,
    Alert,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@/components/ui-kit';
import {
    ShieldCheckIcon as SecurityIcon,
    UserIcon as AdminIcon,
    KeyIcon,
    ClockIcon as TimeIcon,
    NoSymbolIcon as BlockIcon,
    ShieldExclamationIcon as ShieldIcon,
    ExclamationTriangleIcon as WarningIcon,
    CheckCircleIcon as CheckIcon,
    CogIcon as SettingsIcon,
    BookmarkSquareIcon as SaveIcon,
    ArrowPathIcon as RefreshIcon,
} from '@heroicons/react/24/outline';
import { useNotify, useGetIdentity } from 'react-admin';

import { User } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface SecuritySetting {
    id: string;
    category: string;
    key: string;
    value: string;
    description: string;
    type: 'boolean' | 'number' | 'string' | 'select';
    options?: string[];
    min?: number;
    max?: number;
    unit?: string;
}

interface SecurityPolicyManagerProps {
    onSettingChange?: (setting: SecuritySetting) => void;
}

export const SecurityPolicyManager: React.FC<SecurityPolicyManagerProps> = ({
    onSettingChange,
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [settings, setSettings] = useState<SecuritySetting[]>([]);
    const [editingSettings, setEditingSettings] = useState<{
        [key: string]: any;
    }>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    // Mock security settings data - in production, this would come from the API
    const defaultSettings: SecuritySetting[] = [
        // Session Management
        {
            id: 'session_idle_timeout',
            category: 'session',
            key: 'idle_timeout_minutes',
            value: '30',
            description: 'Session idle timeout in minutes',
            type: 'number',
            min: 5,
            max: 120,
            unit: 'minutes',
        },
        {
            id: 'session_max_duration',
            category: 'session',
            key: 'max_session_hours',
            value: '8',
            description: 'Maximum session duration in hours',
            type: 'number',
            min: 1,
            max: 24,
            unit: 'hours',
        },
        {
            id: 'session_concurrent_limit',
            category: 'session',
            key: 'max_concurrent_sessions',
            value: '3',
            description: 'Maximum concurrent sessions per user',
            type: 'number',
            min: 1,
            max: 10,
            unit: 'sessions',
        },

        // Password Policy
        {
            id: 'password_min_length',
            category: 'password',
            key: 'min_length',
            value: '12',
            description: 'Minimum password length',
            type: 'number',
            min: 8,
            max: 64,
            unit: 'characters',
        },
        {
            id: 'password_require_uppercase',
            category: 'password',
            key: 'require_uppercase',
            value: 'true',
            description: 'Require uppercase characters',
            type: 'boolean',
        },
        {
            id: 'password_require_lowercase',
            category: 'password',
            key: 'require_lowercase',
            value: 'true',
            description: 'Require lowercase characters',
            type: 'boolean',
        },
        {
            id: 'password_require_numbers',
            category: 'password',
            key: 'require_numbers',
            value: 'true',
            description: 'Require numeric characters',
            type: 'boolean',
        },
        {
            id: 'password_require_symbols',
            category: 'password',
            key: 'require_symbols',
            value: 'true',
            description: 'Require special characters',
            type: 'boolean',
        },
        {
            id: 'password_expiry_days',
            category: 'password',
            key: 'expiry_days',
            value: '90',
            description: 'Password expiration in days',
            type: 'number',
            min: 30,
            max: 365,
            unit: 'days',
        },
        {
            id: 'password_history_count',
            category: 'password',
            key: 'history_count',
            value: '5',
            description: 'Number of previous passwords to remember',
            type: 'number',
            min: 1,
            max: 24,
            unit: 'passwords',
        },

        // Security Controls
        {
            id: 'security_max_failed_attempts',
            category: 'security',
            key: 'max_failed_attempts',
            value: '5',
            description: 'Maximum failed login attempts before lockout',
            type: 'number',
            min: 3,
            max: 10,
            unit: 'attempts',
        },
        {
            id: 'security_lockout_duration',
            category: 'security',
            key: 'lockout_duration_minutes',
            value: '15',
            description: 'Account lockout duration in minutes',
            type: 'number',
            min: 5,
            max: 60,
            unit: 'minutes',
        },
        {
            id: 'security_require_mfa_admin',
            category: 'security',
            key: 'require_mfa_admin',
            value: 'true',
            description: 'Require MFA for admin users',
            type: 'boolean',
        },
        {
            id: 'security_require_mfa_all',
            category: 'security',
            key: 'require_mfa_all',
            value: 'false',
            description: 'Require MFA for all users',
            type: 'boolean',
        },

        // Monitoring
        {
            id: 'monitoring_log_retention',
            category: 'monitoring',
            key: 'log_retention_days',
            value: '365',
            description: 'Security log retention period in days',
            type: 'number',
            min: 90,
            max: 2555, // 7 years
            unit: 'days',
        },
        {
            id: 'monitoring_risk_threshold_high',
            category: 'monitoring',
            key: 'risk_threshold_high',
            value: '80',
            description: 'High risk threshold score',
            type: 'number',
            min: 70,
            max: 95,
            unit: 'score',
        },
        {
            id: 'monitoring_risk_threshold_medium',
            category: 'monitoring',
            key: 'risk_threshold_medium',
            value: '50',
            description: 'Medium risk threshold score',
            type: 'number',
            min: 30,
            max: 70,
            unit: 'score',
        },
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // In production, fetch from API
            setSettings(defaultSettings);
            setEditingSettings(
                defaultSettings.reduce(
                    (acc, setting) => ({
                        ...acc,
                        [setting.id]: setting.value,
                    }),
                    {}
                )
            );
        } catch (error) {
            notify('Failed to load security settings', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (settingId: string, value: any) => {
        setEditingSettings(prev => ({
            ...prev,
            [settingId]: value,
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // In production, save to API
            const updatedSettings = settings.map(setting => ({
                ...setting,
                value: editingSettings[setting.id] || setting.value,
            }));

            setSettings(updatedSettings);
            setHasChanges(false);
            setSaveDialogOpen(false);

            // Notify parent component of changes
            updatedSettings.forEach(setting => {
                if (onSettingChange) {
                    onSettingChange(setting);
                }
            });

            notify('Security settings saved successfully', {
                type: 'success',
            });
        } catch (error) {
            notify('Failed to save security settings', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setEditingSettings(
            settings.reduce(
                (acc, setting) => ({
                    ...acc,
                    [setting.id]: setting.value,
                }),
                {}
            )
        );
        setHasChanges(false);
    };

    const renderSettingControl = (setting: SecuritySetting) => {
        const currentValue = editingSettings[setting.id] || setting.value;

        switch (setting.type) {
            case 'boolean':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={currentValue === 'true'}
                                onChange={e =>
                                    handleSettingChange(
                                        setting.id,
                                        e.target.checked.toString()
                                    )
                                }
                                className="text-blue-600"
                            />
                        }
                        label=""
                    />
                );

            case 'number':
                return (
                    <TextField
                        type="number"
                        value={currentValue}
                        onChange={e =>
                            handleSettingChange(setting.id, e.target.value)
                        }
                        size="small"
                        inputProps={{
                            min: setting.min,
                            max: setting.max,
                            style: { textAlign: 'center' },
                        }}
                        className="w-25"
                    />
                );

            case 'select':
                return (
                    <FormControl size="small" className="min-w-30">
                        <Select
                            value={currentValue}
                            onChange={e =>
                                handleSettingChange(setting.id, e.target.value)
                            }
                        >
                            {setting.options?.map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );

            default:
                return (
                    <TextField
                        value={currentValue}
                        onChange={e =>
                            handleSettingChange(setting.id, e.target.value)
                        }
                        size="small"
                        className="w-50"
                    />
                );
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'session':
                return <TimeIcon className="w-5 h-5" />;
            case 'password':
                return <KeyIcon className="w-5 h-5" />;
            case 'security':
                return <ShieldIcon className="w-5 h-5" />;
            case 'monitoring':
                return <WarningIcon className="w-5 h-5" />;
            default:
                return <SettingsIcon className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'session':
                return 'primary';
            case 'password':
                return 'secondary';
            case 'security':
                return 'error';
            case 'monitoring':
                return 'warning';
            default:
                return 'default';
        }
    };

    const groupedSettings = settings.reduce(
        (acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        },
        {} as { [key: string]: SecuritySetting[] }
    );

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert variant="error" className="m-3">
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access security policy
                    management.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box className="p-3">
            {/* Header */}
            <Box className="flex justify-between items-center mb-3">
                <Box className="flex items-center gap-2">
                    <SecurityIcon className="w-8 h-8 text-blue-600" />
                    <Box>
                        <Typography variant="h4" component="h1">
                            Security Policy Manager
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure security policies and access controls for
                            ForkFlow-CRM
                        </Typography>
                    </Box>
                </Box>

                <Box className="flex gap-1">
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon className="w-4 h-4" />}
                        onClick={loadSettings}
                        disabled={loading}
                        className="min-h-11"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon className="w-4 h-4" />}
                        onClick={() => setSaveDialogOpen(true)}
                        disabled={!hasChanges || loading}
                        className="min-h-11"
                    >
                        Save Changes
                    </Button>
                </Box>
            </Box>

            {hasChanges && (
                <Alert variant="warning" className="mb-3">
                    <Typography variant="body1" gutterBottom>
                        You have unsaved changes to security settings.
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleReset}
                        className="mt-1"
                    >
                        Reset Changes
                    </Button>
                </Alert>
            )}

            {/* Security Settings by Category */}
            <Grid container spacing={3}>
                {Object.entries(groupedSettings).map(
                    ([category, categorySettings]) => (
                        <Grid item xs={12} lg={6} key={category}>
                            <Card>
                                <CardContent>
                                    <Box className="flex items-center gap-2 mb-2">
                                        {getCategoryIcon(category)}
                                        <Typography
                                            variant="h6"
                                            className="capitalize"
                                        >
                                            {category} Settings
                                        </Typography>
                                        <Chip
                                            label={categorySettings.length}
                                            size="small"
                                            className={
                                                getCategoryColor(category) === 'primary' 
                                                    ? 'bg-blue-500 text-white'
                                                    : getCategoryColor(category) === 'secondary'
                                                    ? 'bg-gray-500 text-white' 
                                                    : getCategoryColor(category) === 'error'
                                                    ? 'bg-red-500 text-white'
                                                    : getCategoryColor(category) === 'warning'
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-400 text-white'
                                            }
                                        />
                                    </Box>

                                    <List dense>
                                        {categorySettings.map(
                                            (setting, index) => (
                                                <React.Fragment
                                                    key={setting.id}
                                                >
                                                    <ListItem
                                                        className={`${isMobile ? 'flex-col items-start' : 'flex-row items-center'} py-2`}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                setting.description
                                                            }
                                                            secondary={
                                                                <Box
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    gap={1}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        Key:{' '}
                                                                        {
                                                                            setting.key
                                                                        }
                                                                    </Typography>
                                                                    {setting.unit && (
                                                                        <Chip
                                                                            label={
                                                                                setting.unit
                                                                            }
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </Box>
                                                            }
                                                            className={`flex-1 ${isMobile ? 'mr-0' : 'mr-2'}`}
                                                        />
                                                        <ListItemSecondaryAction
                                                            className={`${isMobile ? 'static mt-1' : 'absolute right-4 -translate-y-1/2'}`}
                                                        >
                                                            {renderSettingControl(
                                                                setting
                                                            )}
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                    {index <
                                                        categorySettings.length -
                                                            1 && <Divider />}
                                                </React.Fragment>
                                            )
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                )}
            </Grid>

            {/* Save Confirmation Dialog */}
            <Dialog
                open={saveDialogOpen}
                onClose={() => setSaveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box className="flex items-center gap-2">
                        <WarningIcon color="warning" />
                        Confirm Security Policy Changes
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography paragraph>
                        You are about to update security policies for the entire
                        system. These changes will affect all users and may
                        impact system behavior.
                    </Typography>
                    <Typography paragraph>
                        <strong>Changes will take effect immediately.</strong>
                    </Typography>
                    <Alert severity="info">
                        Make sure all changes have been reviewed and approved by
                        your security team before applying them to the
                        production environment.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSaveDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-yellow-500 text-white"
                    >
                        Apply Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
