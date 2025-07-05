/**
 * Compliance Documentation Component
 * Handles regulatory compliance status and security controls
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Alert,
    Grid,
    Paper,
    Accordion,
    Tooltip,
    IconButton,
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
    Tabs,
} from '@/components/ui-kit';
import {
    DocumentTextIcon as PolicyIcon,
    ShieldCheckIcon as SecurityIcon,
    CheckCircleIcon as CheckIcon,
    ExclamationTriangleIcon as WarningIcon,
    XCircleIcon as ErrorIcon,
    ArrowDownTrayIcon as DownloadIcon,
    ChevronDownIcon as ExpandIcon,
    EyeIcon as ViewIcon,
    DocumentIcon as DocIcon,
    ScaleIcon as LegalIcon,
    ShieldExclamationIcon as ShieldIcon,
    LockClosedIcon as LockIcon,
    KeyIcon,
    CircleStackIcon as DataIcon,
    UsersIcon as PeopleIcon,
    ClipboardDocumentListIcon as TaskIcon,
    ChartBarIcon as TimelineIcon,
} from '@heroicons/react/24/outline';
import { useGetIdentity, useNotify } from 'react-admin';

import { User } from '../types';
import { privacyManager } from '../utils/privacyCompliance';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface ComplianceFramework {
    id: string;
    name: string;
    description: string;
    requirements: ComplianceRequirement[];
    status: 'compliant' | 'partial' | 'non_compliant';
    lastAudit: string;
    nextAudit: string;
}

interface ComplianceRequirement {
    id: string;
    title: string;
    description: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    priority: 'high' | 'medium' | 'low';
    evidence?: string[];
    controls: string[];
    lastVerified?: string;
    responsible: string;
}

interface SecurityControl {
    id: string;
    name: string;
    category: string;
    description: string;
    implementation: string;
    status: 'active' | 'inactive' | 'testing';
    effectiveness: 'high' | 'medium' | 'low';
    lastTested: string;
    nextReview: string;
}

interface ComplianceDocumentationProps {
    compactView?: boolean;
}

export const ComplianceDocumentation: React.FC<ComplianceDocumentationProps> = ({ 
    compactView = false 
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
    const [controls, setControls] = useState<SecurityControl[]>([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadComplianceData();
    }, []);

    const loadComplianceData = async () => {
        setLoading(true);
        try {
            // Mock data for demonstration
            const mockFrameworks: ComplianceFramework[] = [
                {
                    id: 'gdpr',
                    name: 'GDPR (General Data Protection Regulation)',
                    description: 'EU regulation for data protection and privacy',
                    status: 'compliant',
                    lastAudit: '2024-06-15',
                    nextAudit: '2024-12-15',
                    requirements: [
                        {
                            id: 'gdpr_consent',
                            title: 'Lawful Basis for Processing',
                            description: 'Ensure all data processing has a lawful basis under GDPR Article 6',
                            status: 'implemented',
                            priority: 'high',
                            controls: ['consent_management', 'data_minimization'],
                            responsible: 'Data Protection Officer',
                            lastVerified: '2024-06-15',
                            evidence: ['Consent management system', 'Privacy policy', 'Data processing records'],
                        },
                    ],
                },
            ];

            const mockControls: SecurityControl[] = [
                {
                    id: 'consent_management',
                    name: 'Consent Management System',
                    category: 'Privacy',
                    description: 'System for collecting, storing, and managing user consents',
                    implementation: 'Automated consent collection with granular options',
                    status: 'active',
                    effectiveness: 'high',
                    lastTested: '2024-06-15',
                    nextReview: '2024-09-15',
                },
            ];

            setFrameworks(mockFrameworks);
            setControls(mockControls);
        } catch (error) {
            notify('Failed to load compliance data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'compliant':
            case 'implemented':
            case 'active':
                return <CheckIcon className="w-5 h-5 text-green-500" />;
            case 'partial':
            case 'testing':
                return <WarningIcon className="w-5 h-5 text-yellow-500" />;
            case 'non_compliant':
            case 'not_implemented':
            case 'inactive':
                return <ErrorIcon className="w-5 h-5 text-red-500" />;
            default:
                return <WarningIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant':
            case 'implemented':
            case 'active':
                return 'success';
            case 'partial':
            case 'testing':
                return 'warning';
            case 'non_compliant':
            case 'not_implemented':
            case 'inactive':
                return 'error';
            default:
                return 'secondary';
        }
    };

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert severity="error" className="m-6">
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access compliance documentation.
                </Typography>
            </Alert>
        );
    }

    const overallCompliance = frameworks.length > 0
        ? Math.round((frameworks.filter(f => f.status === 'compliant').length / frameworks.length) * 100)
        : 0;

    return (
        <Box className={compactView ? 'p-2' : 'p-6'}>
            {!compactView && (
                <Box className="flex justify-between items-center mb-6">
                    <Box className="flex items-center gap-4">
                        <PolicyIcon className="w-8 h-8 text-blue-600" />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Compliance Documentation
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Regulatory compliance status and security controls
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon className="w-5 h-5" />}
                        onClick={() => notify('Report generation feature coming soon', { type: 'info' })}
                        className="min-h-11"
                    >
                        Generate Report
                    </Button>
                </Box>
            )}

            {/* Compliance Overview */}
            <Grid container spacing={6} className="mb-6">
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <LegalIcon className="w-10 h-10 text-blue-600 mb-2 mx-auto" />
                            <Typography variant="h4" className="text-blue-600">
                                {frameworks.length}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Frameworks
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <CheckIcon className="w-10 h-10 text-green-500 mb-2 mx-auto" />
                            <Typography variant="h4" className="text-green-500">
                                {overallCompliance}%
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Overall Compliance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <ShieldIcon className="w-10 h-10 text-blue-500 mb-2 mx-auto" />
                            <Typography variant="h4" className="text-blue-500">
                                {controls.filter(c => c.status === 'active').length}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Active Controls
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <TimelineIcon className="w-10 h-10 text-orange-500 mb-2 mx-auto" />
                            <Typography variant="h4" className="text-orange-500">
                                {frameworks.filter(f => 
                                    new Date(f.nextAudit) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ).length}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Upcoming Audits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Basic Content */}
            <Card>
                <CardContent>
                    <Typography variant="h6" className="mb-4">
                        Compliance Frameworks
                    </Typography>
                    
                    {frameworks.length === 0 ? (
                        <Typography variant="body2" className="text-gray-600 text-center py-8">
                            No compliance frameworks configured yet.
                        </Typography>
                    ) : (
                        frameworks.map((framework) => (
                            <Box key={framework.id} className="mb-4 p-4 border rounded-lg">
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="subtitle1" className="font-semibold">
                                            {framework.name}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-600">
                                            {framework.description}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={framework.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(framework.status)}
                                        size="small"
                                        icon={getStatusIcon(framework.status)}
                                    />
                                </Box>
                                <Typography variant="body2" className="text-gray-500 mt-2">
                                    Last Audit: {new Date(framework.lastAudit).toLocaleDateString()} • 
                                    Next Audit: {new Date(framework.nextAudit).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ComplianceDocumentation;