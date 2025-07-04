// src/security/ComplianceDocumentation.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Alert,
    Grid,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
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
    Tab,
} from '@mui/material';
import {
    Policy as PolicyIcon,
    Security as SecurityIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Download as DownloadIcon,
    ExpandMore as ExpandIcon,
    Visibility as ViewIcon,
    Description as DocIcon,
    Gavel as LegalIcon,
    Shield as ShieldIcon,
    Lock as LockIcon,
    Key as KeyIcon,
    Storage as DataIcon,
    People as PeopleIcon,
    Assignment as TaskIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
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
                return <CheckIcon color="success" />;
            case 'partial':
            case 'testing':
                return <WarningIcon color="warning" />;
            case 'non_compliant':
            case 'not_implemented':
            case 'inactive':
                return <ErrorIcon color="error" />;
            default:
                return <WarningIcon color="action" />;
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
                return <LockIcon />;
            case 'technical':
                return <SecurityIcon />;
            case 'organizational':
                return <PeopleIcon />;
            case 'physical':
                return <ShieldIcon />;
            default:
                return <TaskIcon />;
        }
    };

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
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
        <Box sx={{ p: compactView ? 1 : 3 }}>
            {!compactView && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <PolicyIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Compliance Documentation
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Regulatory compliance status and security
                                controls
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => generateComplianceReport()}
                        sx={{ minHeight: 44 }}
                    >
                        Generate Report
                    </Button>
                </Box>
            )}

            {/* Compliance Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <LegalIcon
                                color="primary"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h4" color="primary.main">
                                {frameworks.length}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Frameworks
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckIcon
                                color="success"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h4" color="success.main">
                                {overallCompliance}%
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Overall Compliance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ShieldIcon
                                color="info"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h4" color="info.main">
                                {
                                    controls.filter(
                                        (c) => c.status === 'active'
                                    ).length
                                }
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Active Controls
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TimelineIcon
                                color="warning"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h4" color="warning.main">
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
                                color="text.secondary"
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

                                    <Box mt={2} display="flex" gap={1}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
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
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    {getCategoryIcon(
                                                        control.category
                                                    )}
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight="medium"
                                                        >
                                                            {control.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
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

                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography>
                                Risk assessments are conducted quarterly to
                                identify and evaluate security risks. The next
                                comprehensive risk assessment is scheduled for
                                Q4 2024.
                            </Typography>
                        </Alert>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Risk Categories
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <ErrorIcon color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Critical Risk"
                                                secondary="0 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <WarningIcon color="warning" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="High Risk"
                                                secondary="2 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <WarningIcon color="info" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Medium Risk"
                                                secondary="5 identified risks"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon color="success" />
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
                                <Paper sx={{ p: 2 }}>
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
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        <DocIcon
                                            sx={{
                                                mr: 1,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        Policies & Procedures
                                    </Typography>
                                    <List dense>
                                        <ListItem button>
                                            <ListItemText primary="Information Security Policy" />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Data Protection Policy" />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Incident Response Procedure" />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary="Business Continuity Plan" />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        <KeyIcon
                                            sx={{
                                                mr: 1,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        Audit & Assessment Reports
                                    </Typography>
                                    <List dense>
                                        <ListItem button>
                                            <ListItemText
                                                primary="GDPR Compliance Audit 2024"
                                                secondary="Generated: June 15, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Penetration Test Report"
                                                secondary="Generated: May 30, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Risk Assessment Q2 2024"
                                                secondary="Generated: April 15, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon />
                                            </IconButton>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText
                                                primary="Security Controls Review"
                                                secondary="Generated: March 30, 2024"
                                            />
                                            <IconButton size="small">
                                                <DownloadIcon />
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

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography
                                            variant="h4"
                                            color="success.main"
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
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography
                                            variant="h4"
                                            color="warning.main"
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
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography
                                            variant="h4"
                                            color="error.main"
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
                                <Paper key={req.id} sx={{ p: 2, mb: 2 }}>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="start"
                                        mb={1}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="medium"
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
                                        color="text.secondary"
                                        paragraph
                                    >
                                        {req.description}
                                    </Typography>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
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
                                            <Box mt={1}>
                                                <Typography
                                                    variant="caption"
                                                    fontWeight="medium"
                                                >
                                                    Evidence:
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    display="block"
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
                        startIcon={<DownloadIcon />}
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.

<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
- [ts Error] Line 1430: Cannot find name 'dev'.
- [ts Error] Line 1430: Cannot find name 'settings'.
- [ts Error] Line 1430: Cannot find name 'cline_mcp_settings'.
- [ts Error] Line 1432: Cannot find name 'Recently'.
- [ts Error] Line 1432: Cannot find name 'Modified'.
- [ts Error] Line 1432: Cannot find name 'Files'.
- [ts Error] Line 1433: Cannot find name 'These'.
- [ts Error] Line 1433: Cannot find name 'files'.
- [ts Error] Line 1433: Cannot find name 'have'.
- [ts Error] Line 1433: Cannot find name 'been'.
- [ts Error] Line 1433: Cannot find name 'modified'.
- [ts Error] Line 1433: Cannot find name 'since'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'last'.
- [ts Error] Line 1433: Cannot find name 'accessed'.
- [ts Error] Line 1433: Cannot find name 'them'.
- [ts Error] Line 1433: Cannot find name 'file'.
- [ts Error] Line 1433: Cannot find name 'was'.
- [ts Error] Line 1433: Cannot find name 'just'.
- [ts Error] Line 1433: Cannot find name 'edited'.
- [ts Error] Line 1433: Cannot find name 'so'.
- [ts Error] Line 1433: Cannot find name 'you'.
- [ts Error] Line 1433: Cannot find name 'may'.
- [ts Error] Line 1433: Cannot find name 'need'.
- [ts Error] Line 1433: Cannot find name 'to'.
- [ts Error] Line 1433: Cannot find name 're'.
- [ts Error] Line 1433: Cannot find name 'read'.
- [ts Error] Line 1433: Cannot find name 'before'.
- [ts Error] Line 1433: Cannot find name 'editing'.
- [ts Error] Line 1434: Cannot find name 'src'.
- [ts Error] Line 1434: Cannot find name 'security'.
- [ts Error] Line 1434: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1436: Cannot find name 'Current'.
- [ts Error] Line 1436: Cannot find name 'Time'.
- [ts Error] Line 1437: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1437: Cannot find name 'PM'.
- [ts Error] Line 1437: Cannot find name 'America'.
- [ts Error] Line 1437: Cannot find name 'Chicago'.
- [ts Error] Line 1437: Cannot find name 'UTC'.
- [ts Error] Line 1439: Cannot find name 'Context'.
- [ts Error] Line 1439: Cannot find name 'Usage'.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1440: Cannot find name 'K'.
- [ts Error] Line 1440: Cannot find name 'tokens'.
- [ts Error] Line 1440: Cannot find name 'used'.
- [ts Error] Line 1442: Cannot find name 'Current'.
- [ts Error] Line 1442: Cannot find name 'Mode'.
- [ts Error] Line 1443: Cannot find name 'ACT'.
- [ts Error] Line 1443: Cannot find name 'MODE'.
- [ts Error] Line 1444: Cannot find name 'environment_details'.<environment_details>
# VSCode Visible Files
src/security/ComplianceDocumentation.tsx

# VSCode Open Tabs
.mcp.json
src/organizations/common/SlideUpModal.tsx
src/components/ui-kit/Input.tsx
tailwind.config.js
src/App.tsx
src/index.css
vite.config.ts
src/index.tsx
src/root/CRM.tsx
doc/mui-migration-audit.md
.storybook/main.ts
.storybook/preview.ts
src/components/ui-kit/Box.stories.tsx
src/components/ui-kit/Box.tsx
src/components/ui-kit/Stack.tsx
src/components/ui-kit/Stack.stories.tsx
src/components/ui-kit/Typography.tsx
src/components/ui-kit/Typography.stories.tsx
src/hooks/useBreakpoint.ts
src/hooks/useTwTheme.ts
src/visits/VisitList.tsx
src/users/UserShow.tsx
src/users/UserProfileDashboard.tsx
src/users/UserListFilter.tsx
src/users/UserList.tsx
src/users/UserEdit.tsx
src/users/UserCreate.tsx
src/users/UserActivityTracker.tsx
src/settings/SettingsCreate.tsx
src/settings/SettingsBulkOperations.tsx
src/settings/SettingsAdminDashboard.tsx
src/security/SessionManager.tsx
src/security/SecurityTestSuite.tsx
src/security/SecurityPolicyManager.tsx
src/security/SecurityDashboard.tsx
src/security/ComplianceDocumentation.tsx
../../Users/Revadmin/AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/security/ComplianceDocumentation.tsx

# Current Time
7/3/2025, 3:00:24 PM (America/Chicago, UTC-5:00)

# Context Window Usage
414,742 / 1,048.576K tokens used (40%)

# Current Mode
ACT MODE
</environment_details>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/security/ComplianceDocumentation.tsx
- [ts Error] Line 1385: Declaration or statement expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Identifier expected.
- [ts Error] Line 1387: Argument expression expected.
- [ts Error] Line 1387: '(' expected.
- [ts Error] Line 1387: ')' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unknown keyword or identifier. Did you mean 'for matter'?
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Declaration or statement expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: ';' expected.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1387: Unexpected keyword or identifier.
- [ts Error] Line 1389: Identifier expected.
- [ts Error] Line 1390: Invalid character.
- [ts Error] Line 1390: ';' expected.
- [ts Error] Line 1390: Unexpected keyword or identifier.
- [ts Error] Line 1393: Invalid character.
- [ts Error] Line 1393: ';' expected.
- [ts Error] Line 1393: Unexpected keyword or identifier.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Expression expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1430: Identifier expected.
- [ts Error] Line 1432: Invalid character.
- [ts Error] Line 1432: ';' expected.
- [ts Error] Line 1432: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: Unexpected keyword or identifier.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ',' expected.
- [ts Error] Line 1433: ';' expected.
- [ts Error] Line 1436: Invalid character.
- [ts Error] Line 1436: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ';' expected.
- [ts Error] Line 1437: ',' expected.
- [ts Error] Line 1437: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1439: Invalid character.
- [ts Error] Line 1439: ';' expected.
- [ts Error] Line 1439: Unexpected keyword or identifier.
- [ts Error] Line 1440: Octal literals are not allowed. Use the syntax '0o0'.
- [ts Error] Line 1440: Decimals with leading zeros are not allowed.
- [ts Error] Line 1440: ';' expected.
- [ts Error] Line 1440: Unexpected keyword or identifier.
- [ts Error] Line 1440: Expression expected.
- [ts Error] Line 1442: Invalid character.
- [ts Error] Line 1442: ';' expected.
- [ts Error] Line 1443: Unexpected keyword or identifier.
- [ts Error] Line 1444: Declaration or statement expected.
- [ts Error] Line 1444: Expression expected.
- [ts Error] Line 1385: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'IMPORTANT'.
- [ts Error] Line 1387: Cannot find name 'For'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'future'.
- [ts Error] Line 1387: Cannot find name 'changes'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'use'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'final_file_content'.
- [ts Error] Line 1387: Cannot find name 'shown'.
- [ts Error] Line 1387: Cannot find name 'above'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'reference'.
- [ts Error] Line 1387: Cannot find name 'content'.
- [ts Error] Line 1387: Cannot find name 'reflects'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'current'.
- [ts Error] Line 1387: Cannot find name 'state'.
- [ts Error] Line 1387: Cannot find name 'of'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'file'.
- [ts Error] Line 1387: Left side of comma operator is unused and has no side effects.
- [ts Error] Line 1387: Cannot find name 'including'.
- [ts Error] Line 1387: 'any' only refers to a type, but is being used as a value here.
- [ts Error] Line 1387: Cannot find name 'auto'.
- [ts Error] Line 1387: Cannot find name 'formatting'.
- [ts Error] Line 1387: Cannot find name 'e'.
- [ts Error] Line 1387: Cannot find name 'you'.
- [ts Error] Line 1387: Cannot find name 'used'.
- [ts Error] Line 1387: Cannot find name 'single'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'but'.
- [ts Error] Line 1387: Cannot find name 'the'.
- [ts Error] Line 1387: Cannot find name 'formatter'.
- [ts Error] Line 1387: Cannot find name 'converted'.
- [ts Error] Line 1387: Cannot find name 'them'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'double'.
- [ts Error] Line 1387: Cannot find name 'quotes'.
- [ts Error] Line 1387: Cannot find name 'Always'.
- [ts Error] Line 1387: Cannot find name 'base'.
- [ts Error] Line 1387: Cannot find name 'your'.
- [ts Error] Line 1387: Cannot find name 'SEARCH'.
- [ts Error] Line 1387: Cannot find name 'REPLACE'.
- [ts Error] Line 1387: Cannot find name 'operations'.
- [ts Error] Line 1387: Cannot find name 'on'.
- [ts Error] Line 1387: Cannot find name 'final'.
- [ts Error] Line 1387: Cannot find name 'version'.
- [ts Error] Line 1387: Cannot find name 'to'.
- [ts Error] Line 1387: Cannot find name 'ensure'.
- [ts Error] Line 1387: Cannot find name 'accuracy'.
- [ts Error] Line 1389: Cannot find name 'environment_details'.
- [ts Error] Line 1390: Cannot find name 'VSCode'.
- [ts Error] Line 1390: Cannot find name 'Visible'.
- [ts Error] Line 1390: Cannot find name 'Files'.
- [ts Error] Line 1391: Cannot find name 'src'.
- [ts Error] Line 1391: Cannot find name 'security'.
- [ts Error] Line 1391: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1393: Cannot find name 'VSCode'.
- [ts Error] Line 1393: Cannot find name 'Open'.
- [ts Error] Line 1394: Property 'mcp' does not exist on type 'OverridableComponent<TabsTypeMap<{}, "div">>'.
- [ts Error] Line 1395: Cannot find name 'src'.
- [ts Error] Line 1395: Cannot find name 'organizations'.
- [ts Error] Line 1395: Cannot find name 'common'.
- [ts Error] Line 1395: Cannot find name 'SlideUpModal'.
- [ts Error] Line 1396: Cannot find name 'src'.
- [ts Error] Line 1396: Cannot find name 'components'.
- [ts Error] Line 1396: Cannot find name 'ui'.
- [ts Error] Line 1396: Cannot find name 'kit'.
- [ts Error] Line 1396: Cannot find name 'Input'.
- [ts Error] Line 1397: Cannot find name 'tailwind'.
- [ts Error] Line 1398: Cannot find name 'src'.
- [ts Error] Line 1398: Cannot find name 'App'.
- [ts Error] Line 1399: Cannot find name 'src'.
- [ts Error] Line 1399: Cannot find name 'index'.
- [ts Error] Line 1400: Cannot find name 'vite'.
- [ts Error] Line 1401: Cannot find name 'src'.
- [ts Error] Line 1401: Cannot find name 'index'.
- [ts Error] Line 1402: Cannot find name 'src'.
- [ts Error] Line 1402: Cannot find name 'root'.
- [ts Error] Line 1402: Cannot find name 'CRM'.
- [ts Error] Line 1403: Cannot find name 'doc'.
- [ts Error] Line 1403: Cannot find name 'mui'.
- [ts Error] Line 1403: Cannot find name 'migration'.
- [ts Error] Line 1403: Cannot find name 'audit'.
- [ts Error] Line 1404: Cannot find name 'main'.
- [ts Error] Line 1405: Cannot find name 'preview'.
- [ts Error] Line 1406: Cannot find name 'src'.
- [ts Error] Line 1406: Cannot find name 'components'.
- [ts Error] Line 1406: Cannot find name 'ui'.
- [ts Error] Line 1406: Cannot find name 'kit'.
- [ts Error] Line 1406: Property 'stories' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1407: Cannot find name 'src'.
- [ts Error] Line 1407: Cannot find name 'components'.
- [ts Error] Line 1407: Cannot find name 'ui'.
- [ts Error] Line 1407: Cannot find name 'kit'.
- [ts Error] Line 1407: Property 'tsx' does not exist on type 'OverridableComponent<BoxTypeMap<{}, "div", Theme>>'.
- [ts Error] Line 1408: Cannot find name 'src'.
- [ts Error] Line 1408: Cannot find name 'components'.
- [ts Error] Line 1408: Cannot find name 'ui'.
- [ts Error] Line 1408: Cannot find name 'kit'.
- [ts Error] Line 1408: Cannot find name 'Stack'.
- [ts Error] Line 1409: Cannot find name 'src'.
- [ts Error] Line 1409: Cannot find name 'components'.
- [ts Error] Line 1409: Cannot find name 'ui'.
- [ts Error] Line 1409: Cannot find name 'kit'.
- [ts Error] Line 1409: Cannot find name 'Stack'.
- [ts Error] Line 1410: Cannot find name 'src'.
- [ts Error] Line 1410: Cannot find name 'components'.
- [ts Error] Line 1410: Cannot find name 'ui'.
- [ts Error] Line 1410: Cannot find name 'kit'.
- [ts Error] Line 1410: Property 'tsx' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1411: Cannot find name 'src'.
- [ts Error] Line 1411: Cannot find name 'components'.
- [ts Error] Line 1411: Cannot find name 'ui'.
- [ts Error] Line 1411: Cannot find name 'kit'.
- [ts Error] Line 1411: Property 'stories' does not exist on type 'OverridableComponent<TypographyTypeMap<{}, "span">>'.
- [ts Error] Line 1412: Cannot find name 'src'.
- [ts Error] Line 1412: Cannot find name 'hooks'.
- [ts Error] Line 1412: Property 'ts' does not exist on type '(size: string | number | symbol) => boolean'.
- [ts Error] Line 1413: Cannot find name 'src'.
- [ts Error] Line 1413: Cannot find name 'hooks'.
- [ts Error] Line 1413: Cannot find name 'useTwTheme'.
- [ts Error] Line 1414: Cannot find name 'src'.
- [ts Error] Line 1414: Cannot find name 'visits'.
- [ts Error] Line 1414: Cannot find name 'VisitList'.
- [ts Error] Line 1415: Cannot find name 'src'.
- [ts Error] Line 1415: Cannot find name 'users'.
- [ts Error] Line 1415: Cannot find name 'UserShow'.
- [ts Error] Line 1416: Cannot find name 'src'.
- [ts Error] Line 1416: Cannot find name 'users'.
- [ts Error] Line 1416: Cannot find name 'UserProfileDashboard'.
- [ts Error] Line 1417: Cannot find name 'src'.
- [ts Error] Line 1417: Cannot find name 'users'.
- [ts Error] Line 1417: Cannot find name 'UserListFilter'.
- [ts Error] Line 1418: Cannot find name 'src'.
- [ts Error] Line 1418: Cannot find name 'users'.
- [ts Error] Line 1418: Cannot find name 'UserList'.
- [ts Error] Line 1419: Cannot find name 'src'.
- [ts Error] Line 1419: Cannot find name 'users'.
- [ts Error] Line 1419: Cannot find name 'UserEdit'.
- [ts Error] Line 1420: Cannot find name 'src'.
- [ts Error] Line 1420: Cannot find name 'users'.
- [ts Error] Line 1420: Cannot find name 'UserCreate'.
- [ts Error] Line 1421: Cannot find name 'src'.
- [ts Error] Line 1421: Cannot find name 'users'.
- [ts Error] Line 1421: Cannot find name 'UserActivityTracker'.
- [ts Error] Line 1422: Cannot find name 'src'.
- [ts Error] Line 1422: Cannot find name 'settings'.
- [ts Error] Line 1422: Cannot find name 'SettingsCreate'.
- [ts Error] Line 1423: Cannot find name 'src'.
- [ts Error] Line 1423: Cannot find name 'settings'.
- [ts Error] Line 1423: Cannot find name 'SettingsBulkOperations'.
- [ts Error] Line 1424: Cannot find name 'src'.
- [ts Error] Line 1424: Cannot find name 'settings'.
- [ts Error] Line 1424: Cannot find name 'SettingsAdminDashboard'.
- [ts Error] Line 1425: Cannot find name 'src'.
- [ts Error] Line 1425: Cannot find name 'security'.
- [ts Error] Line 1425: Cannot find name 'SessionManager'.
- [ts Error] Line 1426: Cannot find name 'src'.
- [ts Error] Line 1426: Cannot find name 'security'.
- [ts Error] Line 1426: Cannot find name 'SecurityTestSuite'.
- [ts Error] Line 1427: Cannot find name 'src'.
- [ts Error] Line 1427: Cannot find name 'security'.
- [ts Error] Line 1427: Cannot find name 'SecurityPolicyManager'.
- [ts Error] Line 1428: Cannot find name 'src'.
- [ts Error] Line 1428: Cannot find name 'security'.
- [ts Error] Line 1428: Cannot find name 'SecurityDashboard'.
- [ts Error] Line 1429: Cannot find name 'src'.
- [ts Error] Line 1429: Cannot find name 'security'.
- [ts Error] Line 1429: Property 'tsx' does not exist on type 'FC<ComplianceDocumentationProps>'.
- [ts Error] Line 1430: Cannot find name 'Users'.
- [ts Error] Line 1430: Cannot find name 'Revadmin'.
- [ts Error] Line 1430: Cannot find name 'AppData'.
- [ts Error] Line 1430: Cannot find name 'Roaming'.
- [ts Error] Line 1430: Cannot find name 'Code'.
- [ts Error] Line 1430: 'User' only refers to a type, but is being used as a value here.
- [ts Error] Line 1430: Cannot find name 'globalStorage'.
- [ts Error] Line 1430: Cannot find name 'saoudrizwan'.
