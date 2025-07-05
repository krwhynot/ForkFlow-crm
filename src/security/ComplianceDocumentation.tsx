// src/security/ComplianceDocumentation.tsx
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
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
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
} from '@/components/ui-kit';
import {
    CheckCircleIcon as CheckIcon,
    DocumentTextIcon as DocIcon,
    ArrowDownTrayIcon as DownloadIcon,
    XCircleIcon as ErrorIcon,
    ChevronDownIcon as ExpandIcon,
    KeyIcon,
    ScaleIcon as LegalIcon,
    LockClosedIcon as LockIcon,
    UserGroupIcon as PeopleIcon,
    DocumentTextIcon as PolicyIcon,
    ShieldCheckIcon as SecurityIcon,
    ShieldExclamationIcon as ShieldIcon,
    ClipboardDocumentListIcon as TaskIcon,
    ChartBarIcon as TimelineIcon,
    EyeIcon as ViewIcon,
    ExclamationTriangleIcon as WarningIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useGetIdentity, useNotify } from 'react-admin';

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

export const ComplianceDocumentation: React.FC<
    ComplianceDocumentationProps
> = ({ compactView = false }) => {
    const { data: identity } = useGetIdentity();
    const isMobile = useBreakpoint('sm');
    const notify = useNotify();

    const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
    const [controls, setControls] = useState<SecurityControl[]>([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedFramework, setSelectedFramework] =
        useState<ComplianceFramework | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadComplianceData();
    }, []);

    const loadComplianceData = async () => {
        setLoading(true);
        try {
            // Mock compliance frameworks data
            const mockFrameworks: ComplianceFramework[] = [
                {
                    id: 'gdpr',
                    name: 'GDPR (General Data Protection Regulation)',
                    description:
                        'EU regulation for data protection and privacy',
                    status: 'compliant',
                    lastAudit: '2024-06-15',
                    nextAudit: '2024-12-15',
                    requirements: [
                        {
                            id: 'gdpr_consent',
                            title: 'Lawful Basis for Processing',
                            description:
                                'Ensure all data processing has a lawful basis under GDPR Article 6',
                            status: 'implemented',
                            priority: 'high',
                            controls: [
                                'consent_management',
                                'data_minimization',
                            ],
                            responsible: 'Data Protection Officer',
                            lastVerified: '2024-06-15',
                            evidence: [
                                'Consent management system',
                                'Privacy policy',
                                'Data processing records',
                            ],
                        },
                        {
                            id: 'gdpr_rights',
                            title: 'Data Subject Rights',
                            description:
                                'Implement processes for data subject rights (access, rectification, erasure, etc.)',
                            status: 'implemented',
                            priority: 'high',
                            controls: [
                                'data_access',
                                'data_deletion',
                                'data_portability',
                            ],
                            responsible: 'Data Protection Officer',
                            lastVerified: '2024-06-15',
                            evidence: [
                                'Self-service portal',
                                'Request handling procedures',
                                'Automated deletion',
                            ],
                        },
                        {
                            id: 'gdpr_breach',
                            title: 'Data Breach Notification',
                            description:
                                'Implement procedures for detecting, reporting, and investigating data breaches',
                            status: 'partial',
                            priority: 'high',
                            controls: [
                                'incident_response',
                                'breach_notification',
                            ],
                            responsible: 'Security Team',
                            lastVerified: '2024-05-20',
                            evidence: [
                                'Incident response plan',
                                'Breach notification templates',
                            ],
                        },
                        {
                            id: 'gdpr_dpia',
                            title: 'Data Protection Impact Assessment',
                            description:
                                'Conduct DPIAs for high-risk processing activities',
                            status: 'implemented',
                            priority: 'medium',
                            controls: [
                                'risk_assessment',
                                'privacy_by_design',
                            ],
                            responsible: 'Data Protection Officer',
                            lastVerified: '2024-04-10',
                            evidence: [
                                'DPIA documentation',
                                'Risk assessments',
                                'Mitigation measures',
                            ],
                        },
                    ],
                },
                {
                    id: 'ccpa',
                    name: 'CCPA (California Consumer Privacy Act)',
                    description:
                        'California state law for consumer privacy rights',
                    status: 'compliant',
                    lastAudit: '2024-05-20',
                    nextAudit: '2024-11-20',
                    requirements: [
                        {
                            id: 'ccpa_disclosure',
                            title: 'Privacy Policy Disclosure',
                            description:
                                'Provide clear disclosure of data collection and use practices',
                            status: 'implemented',
                            priority: 'high',
                            controls: ['privacy_policy', 'transparency'],
                            responsible: 'Legal Team',
                            lastVerified: '2024-05-20',
                            evidence: [
                                'Updated privacy policy',
                                'Consumer notices',
                            ],
                        },
                        {
                            id: 'ccpa_rights',
                            title: 'Consumer Rights',
                            description:
                                'Implement processes for consumer requests (know, delete, opt-out)',
                            status: 'implemented',
                            priority: 'high',
                            controls: [
                                'data_access',
                                'data_deletion',
                                'opt_out',
                            ],
                            responsible: 'Privacy Team',
                            lastVerified: '2024-05-20',
                            evidence: [
                                'Consumer portal',
                                'Request forms',
                                'Response procedures',
                            ],
                        },
                    ],
                },
                {
                    id: 'iso27001',
                    name: 'ISO 27001 (Information Security Management)',
                    description:
                        'International standard for information security management systems',
                    status: 'partial',
                    lastAudit: '2024-04-01',
                    nextAudit: '2024-10-01',
                    requirements: [
                        {
                            id: 'iso_isms',
                            title: 'Information Security Management System',
                            description:
                                'Establish, implement, maintain and continually improve ISMS',
                            status: 'partial',
                            priority: 'high',
                            controls: ['isms_framework', 'security_policies'],
                            responsible: 'CISO',
                            lastVerified: '2024-04-01',
                            evidence: [
                                'ISMS documentation',
                                'Security policies',
                                'Procedures',
                            ],
                        },
                        {
                            id: 'iso_risk',
                            title: 'Risk Management',
                            description:
                                'Implement information security risk management process',
                            status: 'implemented',
                            priority: 'high',
                            controls: ['risk_assessment', 'risk_treatment'],
                            responsible: 'Risk Manager',
                            lastVerified: '2024-04-01',
                            evidence: [
                                'Risk register',
                                'Risk assessments',
                                'Treatment plans',
                            ],
                        },
                    ],
                },
                {
                    id: 'sox',
                    name: 'SOX (Sarbanes-Oxley Act)',
                    description:
                        'US federal law for financial reporting and controls',
                    status: 'non_compliant',
                    lastAudit: '2024-03-15',
                    nextAudit: '2024-09-15',
                    requirements: [
                        {
                            id: 'sox_controls',
                            title: 'Internal Controls over Financial Reporting',
                            description:
                                'Establish and maintain internal controls over financial reporting',
                            status: 'not_implemented',
                            priority: 'high',
                            controls: [
                                'financial_controls',
                                'segregation_duties',
                            ],
                            responsible: 'CFO',
                            evidence: [],
                        },
                    ],
                },
            ];

            const mockControls: SecurityControl[] = [
                {
                    id: 'consent_management',
                    name: 'Consent Management System',
                    category: 'Privacy',
                    description:
                        'System for collecting, storing, and managing user consents',
                    implementation:
                        'Automated consent collection with granular options',
                    status: 'active',
                    effectiveness: 'high',
                    lastTested: '2024-06-15',
                    nextReview: '2024-09-15',
                },
                {
                    id: 'data_encryption',
                    name: 'Data Encryption',
                    category: 'Technical',
                    description: 'Encryption of data at rest and in transit',
                    implementation: 'AES-256 encryption with TLS 1.3',
                    status: 'active',
                    effectiveness: 'high',
                    lastTested: '2024-06-10',
                    nextReview: '2024-09-10',
                },
                {
                    id: 'access_controls',
                    name: 'Access Controls',
                    category: 'Technical',
                    description:
                        'Role-based access control and authentication',
                    implementation: 'RBAC with MFA for admin users',
                    status: 'active',
                    effectiveness: 'medium',
                    lastTested: '2024-06-05',
                    nextReview: '2024-08-05',
                },
                {
                    id: 'incident_response',
                    name: 'Incident Response Plan',
                    category: 'Organizational',
                    description:
                        'Documented procedures for security incident response',
                    implementation:
                        'Incident response playbook with escalation procedures',
                    status: 'testing',
                    effectiveness: 'medium',
                    lastTested: '2024-05-30',
                    nextReview: '2024-08-30',
                },
                {
                    id: 'audit_logging',
                    name: 'Audit Logging',
                    category: 'Technical',
                    description: 'Comprehensive logging of system activities',
                    implementation: 'Centralized logging with 12-month retention',
                    status: 'active',
                    effectiveness: 'high',
                    lastTested: '2024-06-12',
                    nextReview: '2024-09-12',
                },
                {
                    id: 'privacy_by_design',
                    name: 'Privacy by Design',
                    category: 'Organizational',
                    description:
                        'Privacy considerations in system design and development',
                    implementation:
                        'Privacy impact assessments for new features',
                    status: 'testing',
                    effectiveness: 'medium',
                    lastTested: '2024-05-15',
                    nextReview: '2024-08-15',
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

    const generateComplianceReport = async (frameworkId?: string) => {
        try {
            const targetFrameworks = frameworkId
                ? frameworks.filter((f) => f.id === frameworkId)
                : frameworks;

            const report = {
                generatedAt: new Date().toISOString(),
                frameworks: targetFrameworks.map((framework) => ({
                    ...framework,
                    compliance: {
                        total: framework.requirements.length,
                        implemented: framework.requirements.filter(
                            (r) => r.status === 'implemented'
                        ).length,
                        partial: framework.requirements.filter(
                            (r) => r.status === 'partial'
                        ).length,
                        notImplemented: framework.requirements.filter(
                            (r) => r.status === 'not_implemented'
                        ).length,
                    },
                })),
                controls: controls,
                summary: {
                    totalFrameworks: targetFrameworks.length,
                    compliantFrameworks: targetFrameworks.filter(
                        (f) => f.status === 'compliant'
                    ).length,
                    totalRequirements: targetFrameworks.reduce(
                        (sum, f) => sum + f.requirements.length,
                        0
                    ),
                    implementedRequirements: targetFrameworks.reduce(
                        (sum, f) =>
                            sum +
                            f.requirements.filter(
                                (r) => r.status === 'implemented'
                            ).length,
                        0
                    ),
                },
            };

            // In production, this would generate and download a PDF report
            console.log('Compliance Report:', report);
            notify('Compliance report generated successfully', {
                type: 'success',
            });
        } catch (error) {
            notify('Failed to generate compliance report', { type: 'error' });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'compliant':
            case 'implemented':
            case 'active':
                return <CheckIcon className="w-4 h-4 text-green-600" />;
            case 'partial':
            case 'testing':
                return <WarningIcon className="w-4 h-4 text-yellow-600" />;
            case 'non_compliant':
            case 'not_implemented':
            case 'inactive':
                return <ErrorIcon className="w-4 h-4 text-red-600" />;
            default:
                return <WarningIcon className="w-4 h-4 text-gray-500" />;
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
                return 'default';
        }
    };

    const getEffectivenessColor = (effectiveness: string) => {
        switch (effectiveness) {
            case 'high':
                return 'success';
            case 'medium':
                return 'warning';
            case 'low':
                return 'error';
            default:
                return 'default';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'privacy':
                return <LockIcon className="w-5 h-5" />;
            case 'technical':
                return <SecurityIcon className="w-5 h-5" />;
            case 'organizational':
                return <PeopleIcon className="w-5 h-5" />;
            case 'physical':
                return <ShieldIcon className="w-5 h-5" />;
            default:
                return <TaskIcon className="w-5 h-5" />;
        }
    };

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert variant="error" className="m-3">
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access compliance
                    documentation.
                </Typography>
            </Alert>
        );
    }

    const overallCompliance =
        frameworks.length > 0
            ? Math.round(
                (frameworks.filter((f) => f.status === 'compliant')
                    .length /
                    frameworks.length) *
                100
            )
            : 0;

    return (
        <Box className={`${compactView ? 'p-1' : 'p-3'}`}>
            {!compactView && (
                <Box className="flex justify-between items-center mb-3">
                    <Box className="flex items-center gap-2">
                        <PolicyIcon className="w-8 h-8 text-blue-600" />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Compliance Documentation
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Regulatory compliance status and security
                                controls
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon className="w-4 h-4" />}
                        onClick={() => generateComplianceReport()}
                        className="min-h-11"
                    >
                        Generate Report
                    </Button>
                </Box>
            )}

            {/* Compliance Overview */}
            <Grid container spacing={3} className="mb-3">
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <LegalIcon className="w-10 h-10 text-blue-600 mb-1" />
                            <Typography variant="h4" className="text-blue-600">
                                {frameworks.length}
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Frameworks
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <CheckIcon className="w-10 h-10 text-green-600 mb-1" />
                            <Typography variant="h4" className="text-green-600">
                                {overallCompliance}%
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Overall Compliance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <ShieldIcon className="w-10 h-10 text-blue-600 mb-1" />
                            <Typography variant="h4" className="text-blue-600">
                                {
                                    controls.filter(
                                        (c) => c.status === 'active'
                                    ).length
                                }
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Active Controls
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent className="text-center">
                            <TimelineIcon className="w-10 h-10 text-yellow-600 mb-1" />
                            <Typography variant="h4" className="text-yellow-600">
                                {
                                    frameworks.filter(
                                        (f) =>
                                            new Date(f.nextAudit) <=
                                            new Date(
                                                Date.now() +
                                                30 * 24 * 60 * 60 * 1000
                                            )
                                    ).length
                                }
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Upcoming Audits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons="auto"
                    >
                        <Tab label="Compliance Frameworks" />
                        <Tab label="Security Controls" />
                        <Tab label="Risk Assessment" />
                        <Tab label="Documentation" />
                    </Tabs>
                </Box>

                {/* Compliance Frameworks Tab */}
                {currentTab === 0 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Regulatory Compliance Frameworks
                        </Typography>

                        {frameworks.map((framework) => (
                            <Accordion key={framework.id}>
                                <AccordionSummary expandIcon={<ExpandIcon />}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        width="100%"
                                    >
                                        <LegalIcon />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1">
                                                {framework.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {framework.description}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={getStatusIcon(
                                                framework.status
                                            )}
                                            label={framework.status
                                                .replace('_', ' ')
                                                .toUpperCase()}
                                            color={
                                                getStatusColor(
                                                    framework.status
                                                ) as any
                                            }
                                            size="small"
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box mb={2}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Last Audit:{' '}
                                            {new Date(
                                                framework.lastAudit
                                            ).toLocaleDateString()}{' '}
                                            • Next Audit:{' '}
                                            {new Date(
                                                framework.nextAudit
                                            ).toLocaleDateString()}
                                        </Typography>
                                    </Box>

                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Requirement
                                                    </TableCell>
                                                    <TableCell>
                                                        Status
                                                    </TableCell>
                                                    <TableCell>
                                                        Priority
                                                    </TableCell>
                                                    <TableCell>
                                                        Responsible
                                                    </TableCell>
                                                    <TableCell>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {framework.requirements.map(
                                                    (req) => (
                                                        <TableRow key={req.id}>
                                                            <TableCell>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight="medium"
                                                                >
                                                                    {req.title}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {
                                                                        req.description
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    icon={getStatusIcon(
                                                                        req.status
                                                                    )}
                                                                    label={req.status.replace(
                                                                        '_',
                                                                        ' '
                                                                    )}
                                                                    color={
                                                                        getStatusColor(
                                                                            req.status
                                                                        ) as any
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={
                                                                        req.priority
                                                                    }
                                                                    color={
                                                                        req.priority ===
                                                                            'high'
                                                                            ? 'error'
                                                                            : req.priority ===
                                                                                'medium'
                                                                                ? 'warning'
                                                                                : 'info'
                                                                    }
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {
                                                                        req.responsible
                                                                    }
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            setSelectedFramework(
                                                                                framework
                                                                            );
                                                                            setDialogOpen(
                                                                                true
                                                                            );
                                                                        }}
                                                                    >
                                                                        <ViewIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Box className="mt-2 flex gap-1">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<DownloadIcon className="w-4 h-4" />}
                                            onClick={() =>
                                                generateComplianceReport(
                                                    framework.id
                                                )
                                            }
                                        >
                                            Generate Report
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                )}

                {/* Security Controls Tab */}
                {currentTab === 1 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Security Controls Inventory
                        </Typography>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Control</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Effectiveness</TableCell>
                                        <TableCell>Last Tested</TableCell>
                                        <TableCell>Next Review</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {controls.map((control) => (
                                        <TableRow key={control.id}>
                                            <TableCell>
                                                <Box className="flex items-center gap-1">
                                                    {getCategoryIcon(
                                                        control.category
                                                    )}
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            className="font-medium"
                                                        >
                                                            {control.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            className="text-gray-500"
                                                        >
                                                            {
                                                                control.description
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={control.category}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(
                                                        control.status
                                                    )}
                                                    label={control.status}
                                                    color={
                                                        getStatusColor(
                                                            control.status
                                                        ) as any
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        control.effectiveness
                                                    }
                                                    color={
                                                        getEffectivenessColor(
                                                            control.effectiveness
                                                        ) as any
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(
                                                        control.lastTested
                                                    ).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(
                                                        control.nextReview
                                                    ).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                )}

                {/* Risk Assessment Tab */}
                {currentTab === 2 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Risk Assessment Summary
                        </Typography>

                        <Alert variant="info" className="mb-3">
                            <Typography>
                                Risk assessments are conducted quarterly to
                                identify and evaluate security risks. The next
                                comprehensive risk assessment is scheduled for
                                Q4 2024.
                            </Typography>
                        </Alert>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Risk Categories
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <ErrorIcon className="w-5 h-5 text-red-600" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Critical Risk"
                                                secondary="0 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <WarningIcon className="w-5 h-5 text-yellow-600" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="High Risk"
                                                secondary="2 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <WarningIcon className="w-5 h-5 text-blue-600" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Medium Risk"
                                                secondary="5 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon className="w-5 h-5 text-green-600" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Low Risk"
                                                secondary="8 identified risks"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Risk Mitigation Status
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemText
                                                primary="Data Breach Risk"
                                                secondary="Mitigated through encryption and access controls"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="Compliance Violations"
                                                secondary="Monitored through automated compliance checks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="Third-party Dependencies"
                                                secondary="Regular security assessments and updates"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="Insider Threats"
                                                secondary="Background checks and access monitoring"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                )}

                {/* Documentation Tab */}
                {currentTab === 3 && (
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Compliance Documentation Library
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        <DocIcon className="mr-1 align-middle w-5 h-5 inline" />
                                        Policies & Procedures
                                    </Typography>
                                    <List dense>
                                        <ListItem button>
                                            <ListItemText primary="Information Security Policy" />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Data Protection Policy" />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Incident Response Procedure" />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Business Continuity Plan" />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper className="p-2">
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        <KeyIcon className="mr-1 align-middle w-5 h-5 inline" />
                                        Audit & Assessment Reports
                                    </Typography>
                                    <List dense>
                                        <ListItem button>
                                            <ListItemText
                                                primary="GDPR Compliance Audit 2024"
                                                secondary="Generated: June 15, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Penetration Test Report"
                                                secondary="Generated: May 30, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Risk Assessment Q2 2024"
                                                secondary="Generated: April 15, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Security Controls Review"
                                                secondary="Generated: March 30, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon className="w-4 h-4" />
                                            </IconButton>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                )}
            </Card>

            {/* Framework Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    {selectedFramework?.name} - Compliance Details
                </DialogTitle>
                <DialogContent>
                    {selectedFramework && (
                        <Box>
                            <Typography variant="body1" paragraph>
                                {selectedFramework.description}
                            </Typography>

                            <Typography variant="h6" gutterBottom>
                                Requirements Summary
                            </Typography>

                            <Grid container spacing={2} className="mb-3">
                                <Grid item xs={4}>
                                    <Paper className="p-2 text-center">
                                        <Typography
                                            variant="h4"
                                            className="text-green-600"
                                        >
                                            {
                                                selectedFramework.requirements.filter(
                                                    (r) =>
                                                        r.status ===
                                                        'implemented'
                                                ).length
                                            }
                                        </Typography>
                                        <Typography variant="caption">
                                            Implemented
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper className="p-2 text-center">
                                        <Typography
                                            variant="h4"
                                            className="text-yellow-600"
                                        >
                                            {
                                                selectedFramework.requirements.filter(
                                                    (r) =>
                                                        r.status === 'partial'
                                                ).length
                                            }
                                        </Typography>
                                        <Typography variant="caption">
                                            Partial
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper className="p-2 text-center">
                                        <Typography
                                            variant="h4"
                                            className="text-red-600"
                                        >
                                            {
                                                selectedFramework.requirements.filter(
                                                    (r) =>
                                                        r.status ===
                                                        'not_implemented'
                                                ).length
                                            }
                                        </Typography>
                                        <Typography variant="caption">
                                            Not Implemented
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom>
                                Detailed Requirements
                            </Typography>

                            {selectedFramework.requirements.map((req) => (
                                <Paper key={req.id} className="p-2 mb-2">
                                    <Box className="flex justify-between items-start mb-1">
                                        <Typography
                                            variant="subtitle1"
                                            className="font-medium"
                                        >
                                            {req.title}
                                        </Typography>
                                        <Chip
                                            label={req.status.replace(
                                                '_',
                                                ' '
                                            )}
                                            color={
                                                getStatusColor(
                                                    req.status
                                                ) as any
                                            }
                                            size="small"
                                        />
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500"
                                        paragraph
                                    >
                                        {req.description}
                                    </Typography>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500"
                                        >
                                            Controls: {req.controls.join(', ')}{' '}
                                            • Responsible: {req.responsible}
                                            {req.lastVerified &&
                                                ` • Last Verified: ${new Date(
                                                    req.lastVerified
                                                ).toLocaleDateString()}`}
                                        </Typography>
                                    </Box>
                                    {req.evidence &&
                                        req.evidence.length > 0 && (
                                            <Box className="mt-1">
                                                <Typography
                                                    variant="caption"
                                                    className="font-medium"
                                                >
                                                    Evidence:
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    className="block"
                                                >
                                                    {req.evidence.join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon className="w-4 h-4" />}
                        onClick={() => {
                            if (selectedFramework) {
                                generateComplianceReport(selectedFramework.id);
                            }
                        }}
                    >
                        Export Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
