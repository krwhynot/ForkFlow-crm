// src/security/SecurityAuditLog.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    useMediaQuery,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Security as SecurityIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import { useGetIdentity } from 'react-admin';

import { User } from '../types';

interface SecurityEvent {
    id: string;
    userId?: string;
    userEmail?: string;
    eventType: string;
    eventCategory: 'authentication' | 'authorization' | 'data_access' | 'security_violation' | 'admin_action';
    resource?: string;
    resourceId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    deviceFingerprint?: string;
    riskScore: number;
    details: any;
    success: boolean;
    errorMessage?: string;
    createdAt: string;
}

interface AuditLog {
    id: string;
    tableName: string;
    recordId: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    userId?: string;
    userEmail?: string;
    oldValues?: any;
    newValues?: any;
    changedFields: string[];
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    createdAt: string;
}

interface SecurityAuditLogProps {
    viewType?: 'security' | 'audit' | 'both';
    compactView?: boolean;
}

export const SecurityAuditLog: React.FC<SecurityAuditLogProps> = ({
    viewType = 'both',
    compactView = false
}) => {
    const { data: identity } = useGetIdentity<User>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | AuditLog | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        eventCategory: '',
        eventType: '',
        userId: '',
        riskScore: '',
        success: '',
        tableName: '',
        operation: ''
    });

    // Mock data - in production, this would come from the API
    useEffect(() => {
        loadSecurityData();
    }, [filters, page, rowsPerPage]);

    const loadSecurityData = async () => {
        setLoading(true);
        try {
            // Mock security events
            const mockSecurityEvents: SecurityEvent[] = [
                {
                    id: '1',
                    userId: 'user123',
                    userEmail: 'admin@example.com',
                    eventType: 'login_success',
                    eventCategory: 'authentication',
                    action: 'login',
                    ipAddress: '192.168.1.100',
                    userAgent: 'Mozilla/5.0 (Chrome)',
                    sessionId: 'sess_123',
                    riskScore: 10,
                    details: { loginMethod: 'email_password' },
                    success: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                },
                {
                    id: '2',
                    userId: 'user456',
                    userEmail: 'broker@example.com',
                    eventType: 'failed_login',
                    eventCategory: 'authentication',
                    action: 'login',
                    ipAddress: '10.0.0.50',
                    userAgent: 'Mozilla/5.0 (Safari)',
                    riskScore: 75,
                    details: { reason: 'invalid_password', attempts: 3 },
                    success: false,
                    errorMessage: 'Invalid credentials',
                    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
                },
                {
                    id: '3',
                    userId: 'user123',
                    userEmail: 'admin@example.com',
                    eventType: 'data_access',
                    eventCategory: 'data_access',
                    resource: 'organizations',
                    resourceId: '42',
                    action: 'view',
                    ipAddress: '192.168.1.100',
                    riskScore: 5,
                    details: { organizationName: 'Acme Restaurant' },
                    success: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
                },
                {
                    id: '4',
                    userId: 'user789',
                    userEmail: 'manager@example.com',
                    eventType: 'permission_denied',
                    eventCategory: 'authorization',
                    resource: 'users',
                    action: 'delete',
                    ipAddress: '172.16.0.10',
                    riskScore: 60,
                    details: { deniedPermission: 'delete_user' },
                    success: false,
                    errorMessage: 'Insufficient privileges',
                    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
                },
                {
                    id: '5',
                    eventType: 'suspicious_activity',
                    eventCategory: 'security_violation',
                    action: 'multiple_rapid_requests',
                    ipAddress: '203.0.113.45',
                    userAgent: 'bot/1.0',
                    riskScore: 95,
                    details: { 
                        requestCount: 100, 
                        timeWindow: '1 minute',
                        blocked: true 
                    },
                    success: false,
                    errorMessage: 'Rate limit exceeded',
                    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
                }
            ];

            // Mock audit logs
            const mockAuditLogs: AuditLog[] = [
                {
                    id: '1',
                    tableName: 'organizations',
                    recordId: '42',
                    operation: 'UPDATE',
                    userId: 'user123',
                    userEmail: 'admin@example.com',
                    oldValues: { name: 'Acme Corp', phone: '555-0123' },
                    newValues: { name: 'Acme Restaurant', phone: '555-0124' },
                    changedFields: ['name', 'phone'],
                    ipAddress: '192.168.1.100',
                    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
                },
                {
                    id: '2',
                    tableName: 'contacts',
                    recordId: '15',
                    operation: 'INSERT',
                    userId: 'user456',
                    userEmail: 'broker@example.com',
                    newValues: { 
                        firstName: 'John', 
                        lastName: 'Smith', 
                        email: 'john@example.com',
                        organizationId: 42
                    },
                    changedFields: ['firstName', 'lastName', 'email', 'organizationId'],
                    ipAddress: '10.0.0.50',
                    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
                },
                {
                    id: '3',
                    tableName: 'settings',
                    recordId: '8',
                    operation: 'DELETE',
                    userId: 'user123',
                    userEmail: 'admin@example.com',
                    oldValues: { 
                        category: 'principal', 
                        key: 'old_principal', 
                        label: 'Deprecated Principal' 
                    },
                    changedFields: ['category', 'key', 'label'],
                    ipAddress: '192.168.1.100',
                    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
                }
            ];

            setSecurityEvents(mockSecurityEvents);
            setAuditLogs(mockAuditLogs);
        } catch (error) {
            console.error('Failed to load security data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // In production, this would generate and download a CSV/Excel file
        const data = viewType === 'audit' ? auditLogs : 
                    viewType === 'security' ? securityEvents : 
                    [...securityEvents, ...auditLogs];
        
        console.log('Exporting data:', data);
        // Implement actual export functionality
    };

    const getEventIcon = (eventType: string, category: string) => {
        switch (eventType) {
            case 'login_success':
            case 'login':
                return <LoginIcon color="success" />;
            case 'logout':
                return <LogoutIcon color="action" />;
            case 'failed_login':
                return <ErrorIcon color="error" />;
            case 'data_access':
                return <ViewIcon color="info" />;
            case 'permission_denied':
                return <ShieldIcon color="warning" />;
            case 'suspicious_activity':
                return <WarningIcon color="error" />;
            default:
                if (category === 'admin_action') return <AdminIcon color="primary" />;
                return <InfoIcon color="action" />;
        }
    };

    const getOperationIcon = (operation: string) => {
        switch (operation) {
            case 'INSERT': return <AddIcon color="success" />;
            case 'UPDATE': return <EditIcon color="info" />;
            case 'DELETE': return <DeleteIcon color="error" />;
            default: return <InfoIcon color="action" />;
        }
    };

    const getRiskScoreColor = (score: number) => {
        if (score >= 80) return 'error';
        if (score >= 50) return 'warning';
        return 'success';
    };

    const formatDetails = (details: any) => {
        if (!details || typeof details !== 'object') return 'N/A';
        
        return Object.entries(details).map(([key, value]) => (
            <Box key={key} sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {key}:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Typography>
            </Box>
        ));
    };

    const renderSecurityEventsTable = () => (
        <TableContainer component={Paper}>
            <Table size={compactView ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Resource</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>IP Address</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {securityEvents
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((event) => (
                        <TableRow key={event.id}>
                            <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {getEventIcon(event.eventType, event.eventCategory)}
                                    <Box>
                                        <Typography variant="body2">
                                            {event.eventType.replace(/_/g, ' ')}
                                        </Typography>
                                        <Chip 
                                            label={event.eventCategory} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {event.userEmail || 'System'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {event.userId || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {event.resource ? (
                                    <Box>
                                        <Typography variant="body2">{event.resource}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ID: {event.resourceId || 'N/A'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        N/A
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={event.riskScore}
                                    color={getRiskScoreColor(event.riskScore)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {event.ipAddress || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {new Date(event.createdAt).toLocaleString()}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Tooltip title="View Details">
                                    <IconButton 
                                        size="small"
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setDetailsOpen(true);
                                        }}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderAuditLogsTable = () => (
        <TableContainer component={Paper}>
            <Table size={compactView ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell>Operation</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Record</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Changes</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {auditLogs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {getOperationIcon(log.operation)}
                                    <Typography variant="body2">
                                        {log.operation}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {log.tableName}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {log.recordId}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {log.userEmail || 'System'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {log.userId || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                    {log.changedFields.slice(0, 3).map(field => (
                                        <Chip 
                                            key={field} 
                                            label={field} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    ))}
                                    {log.changedFields.length > 3 && (
                                        <Chip 
                                            label={`+${log.changedFields.length - 3}`} 
                                            size="small" 
                                            variant="outlined"
                                            color="primary"
                                        />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {new Date(log.createdAt).toLocaleString()}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Tooltip title="View Details">
                                    <IconButton 
                                        size="small"
                                        onClick={() => {
                                            setSelectedEvent(log);
                                            setDetailsOpen(true);
                                        }}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    // Check if user has admin permissions
    const isAdmin = identity?.role === 'admin';

    if (!isAdmin) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                <Typography variant="h6">Access Denied</Typography>
                <Typography>
                    You need administrator privileges to access security audit logs.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box sx={{ p: compactView ? 1 : 3 }}>
            {!compactView && (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" component="h1">
                                Security Audit Log
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Monitor security events and data changes across the system
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        sx={{ minHeight: 44 }}
                    >
                        Export
                    </Button>
                </Box>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Date From"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Date To"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Event Category</InputLabel>
                                <Select
                                    value={filters.eventCategory}
                                    onChange={(e) => setFilters(prev => ({ ...prev, eventCategory: e.target.value }))}
                                    label="Event Category"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    <MenuItem value="authentication">Authentication</MenuItem>
                                    <MenuItem value="authorization">Authorization</MenuItem>
                                    <MenuItem value="data_access">Data Access</MenuItem>
                                    <MenuItem value="security_violation">Security Violation</MenuItem>
                                    <MenuItem value="admin_action">Admin Action</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Success</InputLabel>
                                <Select
                                    value={filters.success}
                                    onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                                    label="Success"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="true">Successful</MenuItem>
                                    <MenuItem value="false">Failed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Content */}
            {viewType === 'security' && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Security Events
                        </Typography>
                        {renderSecurityEventsTable()}
                    </CardContent>
                </Card>
            )}

            {viewType === 'audit' && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Audit Logs
                        </Typography>
                        {renderAuditLogsTable()}
                    </CardContent>
                </Card>
            )}

            {viewType === 'both' && (
                <>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                Security Events ({securityEvents.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderSecurityEventsTable()}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                Audit Logs ({auditLogs.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderAuditLogsTable()}
                        </AccordionDetails>
                    </Accordion>
                </>
            )}

            {/* Pagination */}
            <TablePagination
                component="div"
                count={viewType === 'audit' ? auditLogs.length : 
                      viewType === 'security' ? securityEvents.length : 
                      securityEvents.length + auditLogs.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                rowsPerPageOptions={[10, 25, 50, 100]}
            />

            {/* Details Dialog */}
            <Dialog 
                open={detailsOpen} 
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {'eventType' in (selectedEvent || {}) ? 'Security Event Details' : 'Audit Log Details'}
                </DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <Box>
                            {'eventType' in selectedEvent ? (
                                // Security Event Details
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Event Type" 
                                            secondary={selectedEvent.eventType} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Category" 
                                            secondary={selectedEvent.eventCategory} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="User" 
                                            secondary={selectedEvent.userEmail || 'System'} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Risk Score" 
                                            secondary={
                                                <Chip 
                                                    label={selectedEvent.riskScore}
                                                    color={getRiskScoreColor(selectedEvent.riskScore)}
                                                    size="small"
                                                />
                                            } 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="IP Address" 
                                            secondary={selectedEvent.ipAddress || 'N/A'} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Details" 
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    {formatDetails(selectedEvent.details)}
                                                </Box>
                                            } 
                                        />
                                    </ListItem>
                                    {selectedEvent.errorMessage && (
                                        <ListItem>
                                            <ListItemText 
                                                primary="Error Message" 
                                                secondary={selectedEvent.errorMessage} 
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            ) : (
                                // Audit Log Details
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Operation" 
                                            secondary={selectedEvent.operation} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Table" 
                                            secondary={selectedEvent.tableName} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Record ID" 
                                            secondary={selectedEvent.recordId} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="User" 
                                            secondary={selectedEvent.userEmail || 'System'} 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Changed Fields" 
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    {selectedEvent.changedFields.map(field => (
                                                        <Chip 
                                                            key={field} 
                                                            label={field} 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                            } 
                                        />
                                    </ListItem>
                                    {selectedEvent.oldValues && (
                                        <ListItem>
                                            <ListItemText 
                                                primary="Old Values" 
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        {formatDetails(selectedEvent.oldValues)}
                                                    </Box>
                                                } 
                                            />
                                        </ListItem>
                                    )}
                                    {selectedEvent.newValues && (
                                        <ListItem>
                                            <ListItemText 
                                                primary="New Values" 
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        {formatDetails(selectedEvent.newValues)}
                                                    </Box>
                                                } 
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};