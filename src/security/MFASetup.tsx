// src/security/MFASetup.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Paper,
    Divider,
} from '@mui/material';
import {
    Security as SecurityIcon,
    Smartphone as PhoneIcon,
    QrCode as QrCodeIcon,
    Key as KeyIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Warning as WarningIcon,
    Shield as ShieldIcon,
    Visibility as ViewIcon,
    VisibilityOff as HideIcon,
} from '@mui/icons-material';
import { useGetIdentity, useNotify } from 'react-admin';

import { User } from '../types';

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
    compactView = false
}) => {
    const { data: identity } = useGetIdentity();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const notify = useNotify();

    const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [setupDialogOpen, setSetupDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
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
                    description: 'Use Google Authenticator, Authy, or similar apps',
                    isEnabled: false,
                    isDefault: false
                },
                {
                    id: 'email',
                    type: 'email',
                    name: 'Email Verification',
                    description: 'Receive codes via email',
                    isEnabled: true,
                    isDefault: true,
                    setupAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
                    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
                },
                {
                    id: 'backup_codes',
                    type: 'backup_codes',
                    name: 'Backup Codes',
                    description: 'Single-use recovery codes',
                    isEnabled: false,
                    isDefault: false
                }
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
                notify('Please enter a valid verification code', { type: 'error' });
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
                            isDefault: !mfaMethods.some(m => m.isEnabled && m.isDefault) 
                        }
                        : method
                );
                
                setMfaMethods(updatedMethods);
                
                if (onSetupComplete) {
                    onSetupComplete(selectedMethod);
                }
                
                notify('MFA method enabled successfully', { type: 'success' });
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
                notify('You must have at least one MFA method enabled', { type: 'error' });
                return;
            }

            const updatedMethods = mfaMethods.map(method => 
                method.id === methodId 
                    ? { ...method, isEnabled: false, isDefault: false }
                    : method
            );
            
            // If we disabled the default method, make another one default
            const hasDefault = updatedMethods.some(m => m.isEnabled && m.isDefault);
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
                isDefault: method.id === methodId
            }));
            
            setMfaMethods(updatedMethods);
            notify('Default MFA method updated', { type: 'success' });
        } catch (error) {
            notify('Failed to update default method', { type: 'error' });
        }
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'totp': return <PhoneIcon />;
            case 'email': return <KeyIcon />;
            case 'sms': return <PhoneIcon />;
            case 'backup_codes': return <SecurityIcon />;
            default: return <SecurityIcon />;
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
                                Install an authenticator app on your mobile device:
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
                    )
                },
                {
                    label: 'Scan QR Code',
                    content: (
                        <Box>
                            <Typography paragraph>
                                Scan this QR code with your authenticator app:
                            </Typography>
                            <Box display="flex" justifyContent="center" mb={2}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <QrCodeIcon sx={{ fontSize: 120, color: 'text.secondary' }} />
                                    <Typography variant="caption" display="block">
                                        QR Code would be displayed here
                                    </Typography>
                                </Paper>
                            </Box>
                            <Alert severity="info">
                                Can't scan? Manually enter this key: <code>{secretKey}</code>
                            </Alert>
                        </Box>
                    )
                }
            );
        } else if (selectedMethod.type === 'backup_codes') {
            steps.push({
                label: 'Save Backup Codes',
                content: (
                    <Box>
                        <Typography paragraph color="error">
                            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Save these backup codes in a secure location. Each code can only be used once.
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Grid container spacing={1}>
                                {backupCodes.map((code, index) => (
                                    <Grid item xs={6} key={index}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ fontFamily: 'monospace', textAlign: 'center' }}
                                        >
                                            {code}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                        <Box display="flex" gap={1} mt={2}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
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
                                startIcon={showBackupCodes ? <HideIcon /> : <ViewIcon />}
                                onClick={() => setShowBackupCodes(!showBackupCodes)}
                            >
                                {showBackupCodes ? 'Hide' : 'Show'} Codes
                            </Button>
                        </Box>
                    </Box>
                )
            });
        }

        // Add verification step for all methods except backup codes
        if (selectedMethod.type !== 'backup_codes') {
            steps.push({
                label: 'Verify Setup',
                content: (
                    <Box>
                        <Typography paragraph>
                            Enter the verification code from your {selectedMethod.name.toLowerCase()}:
                        </Typography>
                        <TextField
                            label="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            fullWidth
                            inputProps={{
                                style: { 
                                    textAlign: 'center', 
                                    fontSize: '1.5rem', 
                                    letterSpacing: '0.5rem',
                                    fontFamily: 'monospace'
                                }
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                )
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
        <Box sx={{ p: compactView ? 1 : 3 }}>
            {!compactView && (
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ShieldIcon color="primary" sx={{ fontSize: 32 }} />
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
                <Alert severity="error" sx={{ mb: 3 }}>
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
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="success.main">
                            <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Enabled MFA Methods ({enabledMethods.length})
                        </Typography>

                        <List>
                            {enabledMethods.map((method) => (
                                <ListItem key={method.id} divider>
                                    <ListItemIcon>
                                        {getMethodIcon(method.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body1">
                                                    {method.name}
                                                </Typography>
                                                {method.isDefault && (
                                                    <Chip 
                                                        label="Default" 
                                                        color="primary" 
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
                                                    <Typography variant="caption" color="text.secondary">
                                                        Setup: {new Date(method.setupAt).toLocaleDateString()}
                                                        {method.lastUsed && (
                                                            <> • Last used: {new Date(method.lastUsed).toLocaleDateString()}</>
                                                        )}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <Box display="flex" gap={1}>
                                        {!method.isDefault && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleSetDefault(method.id)}
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDisableMethod(method.id)}
                                            disabled={enabledMethods.length <= 1}
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
                            {availableMethods.map((method) => (
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
                                        onClick={() => handleSetupMethod(method)}
                                        sx={{ minHeight: 44 }}
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
                    <Box display="flex" alignItems="center" gap={2}>
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
                                        <Box sx={{ mb: 2, mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    if (index === (renderSetupSteps()?.length ?? 0) - 1) {
                                                        if (selectedMethod.type === 'backup_codes') {
                                                            // For backup codes, skip verification
                                                            handleVerifySetup();
                                                        } else {
                                                            handleVerifySetup();
                                                        }
                                                    } else {
                                                        setActiveStep(activeStep + 1);
                                                    }
                                                }}
                                                disabled={
                                                    index === (renderSetupSteps()?.length ?? 0) - 1 && 
                                                    selectedMethod.type !== 'backup_codes' &&
                                                    verificationCode.length < 6
                                                }
                                                sx={{ mr: 1, minHeight: 44 }}
                                            >
                                                {index === (renderSetupSteps()?.length ?? 0) - 1 ? 'Complete Setup' : 'Next'}
                                            </Button>
                                            {index > 0 && (
                                                <Button
                                                    onClick={() => setActiveStep(activeStep - 1)}
                                                    sx={{ minHeight: 44 }}
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