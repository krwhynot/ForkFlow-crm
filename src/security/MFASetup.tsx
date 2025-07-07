// src/security/MFASetup.tsx
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '../components/ui-kit';
import {
    CheckCircleIcon as CheckIcon,
    ArrowDownTrayIcon as DownloadIcon,
    EyeSlashIcon as HideIcon,
    KeyIcon,
    DevicePhoneMobileIcon as PhoneIcon,
    QrCodeIcon,
    ShieldCheckIcon as SecurityIcon,
    ShieldExclamationIcon as ShieldIcon,
    EyeIcon as ViewIcon,
    ExclamationTriangleIcon as WarningIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useGetIdentity, useNotify } from 'react-admin';

import { useBreakpoint } from '../hooks/useBreakpoint';

interface MFAMethod {
    id: string;
    type: 'totp' | 'email' | 'sms' | 'backup_codes';
    name: string;
    description: string;
    isEnabled: boolean;
    isDefault: boolean;
    setupAt?: string;
    lastUsed?: string;
}

interface MFASetupProps {
    onSetupComplete?: (method: MFAMethod) => void;
    compactView?: boolean;
}

export const MFASetup: React.FC<MFASetupProps> = ({
    onSetupComplete,
    compactView = false,
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [setupDialogOpen, setSetupDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(
        null
    );
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMfaMethods();
    }, []);

    const loadMfaMethods = async () => {
        try {
            // Mock MFA methods - in production, this would come from the API
            const mockMethods: MFAMethod[] = [
                {
                    id: 'totp',
                    type: 'totp',
                    name: 'Authenticator App',
                    description:
                        'Use Google Authenticator, Authy, or similar apps',
                    isEnabled: false,
                    isDefault: false,
                },
                {
                    id: 'email',
                    type: 'email',
                    name: 'Email Verification',
                    description: 'Receive codes via email',
                    isEnabled: true,
                    isDefault: true,
                    setupAt: new Date(
                        Date.now() - 1000 * 60 * 60 * 24 * 7
                    ).toISOString(), // 7 days ago
                    lastUsed: new Date(
                        Date.now() - 1000 * 60 * 60 * 2
                    ).toISOString(), // 2 hours ago
                },
                {
                    id: 'backup_codes',
                    type: 'backup_codes',
                    name: 'Backup Codes',
                    description: 'Single-use recovery codes',
                    isEnabled: false,
                    isDefault: false,
                },
            ];

            setMfaMethods(mockMethods);
        } catch (error) {
            notify('Failed to load MFA methods', { type: 'error' });
        }
    };

    const handleSetupMethod = async (method: MFAMethod) => {
        setSelectedMethod(method);
        setActiveStep(0);
        setVerificationCode('');

        if (method.type === 'totp') {
            // Generate QR code and secret for TOTP setup
            const mockSecret = 'JBSWY3DPEHPK3PXP'; // In production, generate a real secret
            const appName = 'ForkFlow-CRM';
            const userEmail = identity?.email || 'user@example.com';
            const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${mockSecret}&issuer=${appName}`;

            setSecretKey(mockSecret);
            setQrCodeUrl(qrUrl);
        } else if (method.type === 'backup_codes') {
            // Generate backup codes
            const codes = Array.from({ length: 10 }, () =>
                Math.random().toString(36).substring(2, 8).toUpperCase()
            );
            setBackupCodes(codes);
        }

        setSetupDialogOpen(true);
    };

    const handleVerifySetup = async () => {
        setLoading(true);
        try {
            // In production, verify the code with the API
            if (verificationCode.length < 6) {
                notify('Please enter a valid verification code', {
                    type: 'error',
                });
                return;
            }

            // Mock successful verification
            if (selectedMethod) {
                const updatedMethods = mfaMethods.map(method =>
                    method.id === selectedMethod.id
                        ? {
                            ...method,
                            isEnabled: true,
                            setupAt: new Date().toISOString(),
                            isDefault: !mfaMethods.some(
                                m => m.isEnabled && m.isDefault
                            ),
                        }
                        : method
                );

                setMfaMethods(updatedMethods);

                if (onSetupComplete) {
                    onSetupComplete(selectedMethod);
                }

                notify('MFA method enabled successfully', {
                    type: 'success',
                });
                setSetupDialogOpen(false);
                setActiveStep(0);
            }
        } catch (error) {
            notify('Failed to verify setup', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDisableMethod = async (methodId: string) => {
        try {
            // Check if this is the only enabled method
            const enabledMethods = mfaMethods.filter(m => m.isEnabled);
            if (enabledMethods.length <= 1) {
                notify('You must have at least one MFA method enabled', {
                    type: 'error',
                });
                return;
            }

            const updatedMethods = mfaMethods.map(method =>
                method.id === methodId
                    ? { ...method, isEnabled: false, isDefault: false }
                    : method
            );

            // If we disabled the default method, make another one default
            const hasDefault = updatedMethods.some(
                m => m.isEnabled && m.isDefault
            );
            if (!hasDefault) {
                const firstEnabled = updatedMethods.find(m => m.isEnabled);
                if (firstEnabled) {
                    firstEnabled.isDefault = true;
                }
            }

            setMfaMethods(updatedMethods);
            notify('MFA method disabled', { type: 'success' });
        } catch (error) {
            notify('Failed to disable MFA method', { type: 'error' });
        }
    };

    const handleSetDefault = async (methodId: string) => {
        try {
            const updatedMethods = mfaMethods.map(method => ({
                ...method,
                isDefault: method.id === methodId,
            }));

            setMfaMethods(updatedMethods);
            notify('Default MFA method updated', { type: 'success' });
        } catch (error) {
            notify('Failed to update default method', { type: 'error' });
        }
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'totp':
                return <PhoneIcon className="w-5 h-5" />;
            case 'email':
                return <KeyIcon className="w-5 h-5" />;
            case 'sms':
                return <PhoneIcon className="w-5 h-5" />;
            case 'backup_codes':
                return <SecurityIcon className="w-5 h-5" />;
            default:
                return <SecurityIcon className="w-5 h-5" />;
        }
    };

    const renderSetupSteps = () => {
        if (!selectedMethod) return null;

        const steps = [];

        if (selectedMethod.type === 'totp') {
            steps.push(
                {
                    label: 'Install Authenticator App',
                    content: (
                        <Box>
                            <Typography paragraph>
                                Install an authenticator app on your mobile
                                device:
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="Google Authenticator (iOS/Android)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Authy (iOS/Android/Desktop)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Microsoft Authenticator (iOS/Android)" />
                                </ListItem>
                            </List>
                        </Box>
                    ),
                },
                {
                    label: 'Scan QR Code',
                    content: (
                        <Box>
                            <Typography paragraph>
                                Scan this QR code with your authenticator app:
                            </Typography>
                            <Box className="flex justify-center mb-2">
                                <Paper className="p-2 text-center">
                                    <QrCodeIcon className="w-30 h-30 text-gray-500" />
                                    <Typography
                                        variant="caption"
                                        className="block"
                                    >
                                        QR Code would be displayed here
                                    </Typography>
                                </Paper>
                            </Box>
                            <Alert severity="info">
                                Can't scan? Manually enter this key:{' '}
                                <code>{secretKey}</code>
                            </Alert>
                        </Box>
                    ),
                }
            );
        } else if (selectedMethod.type === 'backup_codes') {
            steps.push({
                label: 'Save Backup Codes',
                content: (
                    <Box>
                        <Typography paragraph className="text-red-600">
                            <WarningIcon className="mr-1 align-middle w-5 h-5 inline" />
                            Save these backup codes in a secure location. Each
                            code can only be used once.
                        </Typography>
                        <Paper className="p-2 bg-gray-50">
                            <Grid container spacing={1}>
                                {backupCodes.map((code, index) => (
                                    <Grid item xs={6} key={index}>
                                        <Typography
                                            variant="body2"
                                            className="font-mono text-center"
                                        >
                                            {code}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                        <Box className="flex gap-1 mt-2">
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon className="w-4 h-4" />}
                                onClick={() => {
                                    // In production, generate and download a file
                                    const text = backupCodes.join('\n');
                                    console.log('Download backup codes:', text);
                                }}
                            >
                                Download
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={
                                    showBackupCodes ? (
                                        <HideIcon className="w-4 h-4" />
                                    ) : (
                                        <ViewIcon className="w-4 h-4" />
                                    )
                                }
                                onClick={() =>
                                    setShowBackupCodes(!showBackupCodes)
                                }
                            >
                                {showBackupCodes ? 'Hide' : 'Show'} Codes
                            </Button>
                        </Box>
                    </Box>
                ),
            });
        }

        // Add verification step for all methods except backup codes
        if (selectedMethod.type !== 'backup_codes') {
            steps.push({
                label: 'Verify Setup',
                content: (
                    <Box>
                        <Typography paragraph>
                            Enter the verification code from your{' '}
                            {selectedMethod.name.toLowerCase()}:
                        </Typography>
                        <TextField
                            label="Verification Code"
                            value={verificationCode}
                            onChange={e =>
                                setVerificationCode(
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 6)
                                )
                            }
                            placeholder="123456"
                            fullWidth
                            inputProps={{
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontFamily: 'monospace',
                                },
                            }}
                            className="mb-2"
                        />
                    </Box>
                ),
            });
        }

        return steps;
    };

    const enabledMethods = mfaMethods.filter(m => m.isEnabled);
    const availableMethods = mfaMethods.filter(m => !m.isEnabled);

    // Check if user is admin or if MFA is required for their role
    const isAdmin = identity?.role === 'admin';
    const mfaRequired = isAdmin; // In production, check security settings

    return (
        <Box className={`${compactView ? 'p-1' : 'p-8'}`}>
            {!compactView && (
                <Box className="flex items-center gap-2 mb-8">
                    <ShieldIcon className="w-8 h-8 text-blue-600" />
                    <Box>
                        <Typography variant="h4" component="h1">
                            Multi-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                        </Typography>
                    </Box>
                </Box>
            )}

            {mfaRequired && enabledMethods.length === 0 && (
                <Alert variant="error" className="mb-3">
                    <Typography variant="h6" gutterBottom>
                        MFA Required
                    </Typography>
                    <Typography>
                        Multi-factor authentication is required for your role.
                        Please set up at least one MFA method to continue.
                    </Typography>
                </Alert>
            )}

            {/* Enabled Methods */}
            {enabledMethods.length > 0 && (
                <Card className="mb-3">
                    <CardContent>
                        <Typography
                            variant="h6"
                            gutterBottom
                            className="text-green-600"
                        >
                            <CheckIcon className="mr-1 align-middle w-5 h-5 inline" />
                            Enabled MFA Methods ({enabledMethods.length})
                        </Typography>

                        <List>
                            {enabledMethods.map(method => (
                                <ListItem key={method.id} divider>
                                    <ListItemIcon>
                                        {getMethodIcon(method.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box className="flex items-center gap-1">
                                                <Typography variant="body1">
                                                    {method.name}
                                                </Typography>
                                                {method.isDefault && (
                                                    <Chip
                                                        label="Default"
                                                        className="bg-blue-500 text-white"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2">
                                                    {method.description}
                                                </Typography>
                                                {method.setupAt && (
                                                    <Typography
                                                        variant="caption"
                                                        className="text-gray-500"
                                                    >
                                                        Setup:{' '}
                                                        {new Date(
                                                            method.setupAt
                                                        ).toLocaleDateString()}
                                                        {method.lastUsed && (
                                                            <>
                                                                {' '}
                                                                • Last used:{' '}
                                                                {new Date(
                                                                    method.lastUsed
                                                                ).toLocaleDateString()}
                                                            </>
                                                        )}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <Box className="flex gap-1">
                                        {!method.isDefault && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() =>
                                                    handleSetDefault(method.id)
                                                }
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            className="border-red-500 text-red-500"
                                            onClick={() =>
                                                handleDisableMethod(method.id)
                                            }
                                            disabled={
                                                enabledMethods.length <= 1
                                            }
                                        >
                                            Disable
                                        </Button>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* Available Methods */}
            {availableMethods.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Available MFA Methods
                        </Typography>

                        <List>
                            {availableMethods.map(method => (
                                <ListItem key={method.id} divider>
                                    <ListItemIcon>
                                        {getMethodIcon(method.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={method.name}
                                        secondary={method.description}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            handleSetupMethod(method)
                                        }
                                        className="min-h-11"
                                    >
                                        Enable
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* Setup Dialog */}
            <Dialog
                open={setupDialogOpen}
                onClose={() => setSetupDialogOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    <Box className="flex items-center gap-2">
                        {selectedMethod && getMethodIcon(selectedMethod.type)}
                        Setup {selectedMethod?.name}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedMethod && (
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {renderSetupSteps()?.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel>{step.label}</StepLabel>
                                    <StepContent>
                                        {step.content}
                                        <Box className="mb-2 mt-2">
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    if (
                                                        index ===
                                                        (renderSetupSteps()
                                                            ?.length ?? 0) -
                                                        1
                                                    ) {
                                                        if (
                                                            selectedMethod.type ===
                                                            'backup_codes'
                                                        ) {
                                                            // For backup codes, skip verification
                                                            handleVerifySetup();
                                                        } else {
                                                            handleVerifySetup();
                                                        }
                                                    } else {
                                                        setActiveStep(
                                                            activeStep + 1
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    index ===
                                                    (renderSetupSteps()
                                                        ?.length ?? 0) -
                                                    1 &&
                                                    selectedMethod.type !==
                                                    'backup_codes' &&
                                                    verificationCode.length < 6
                                                }
                                                className="mr-1 min-h-11"
                                            >
                                                {index ===
                                                    (renderSetupSteps()?.length ??
                                                        0) -
                                                    1
                                                    ? 'Complete Setup'
                                                    : 'Next'}
                                            </Button>
                                            {index > 0 && (
                                                <Button
                                                    onClick={() =>
                                                        setActiveStep(
                                                            activeStep - 1
                                                        )
                                                    }
                                                    className="min-h-11"
                                                >
                                                    Back
                                                </Button>
                                            )}
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSetupDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
