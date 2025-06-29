import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Alert,
    LinearProgress,
    Chip,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import {
    Speed as PerformanceIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Warning as WarningIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';

import { usePerformanceMonitor } from '../../providers/monitoring/performanceMonitor';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`performance-tabpanel-${index}`}
            aria-labelledby={`performance-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const PerformanceDashboard = () => {
    const performanceMonitor = usePerformanceMonitor();
    const [summary, setSummary] = useState<any>(null);
    const [allMetrics, setAllMetrics] = useState<any>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setRefreshing(true);
        try {
            const summaryData = performanceMonitor.getPerformanceSummary();
            const metricsData = performanceMonitor.getAllMetrics();
            
            setSummary(summaryData);
            setAllMetrics(metricsData);
        } catch (error) {
            console.error('Failed to load performance data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const exportMetrics = () => {
        const csv = performanceMonitor.exportMetricsAsCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const clearMetrics = () => {
        performanceMonitor.clearMetrics();
        loadData();
    };

    if (!summary) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <LinearProgress sx={{ flexGrow: 1 }} />
                <Typography variant="body2">Loading performance data...</Typography>
            </Box>
        );
    }

    const hasWarnings = summary.warnings.slowApiCalls > 0 || 
                       summary.warnings.slowGpsAcquisitions > 0 || 
                       summary.warnings.lowGpsAccuracy > 0 || 
                       summary.warnings.slowUploads > 0;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PerformanceIcon color="primary" />
                    <Typography variant="h5">
                        Performance Monitor
                    </Typography>
                    <Chip 
                        label={summary.timeRange} 
                        color="info" 
                        size="small" 
                    />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={refreshing ? <LinearProgress /> : <RefreshIcon />}
                        onClick={loadData}
                        disabled={refreshing}
                        size="small"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={exportMetrics}
                        size="small"
                    >
                        Export CSV
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={clearMetrics}
                        size="small"
                    >
                        Clear Data
                    </Button>
                </Box>
            </Box>

            {/* Warnings Alert */}
            {hasWarnings && (
                <Alert 
                    severity="warning" 
                    icon={<WarningIcon />} 
                    sx={{ mb: 3 }}
                >
                    <Typography variant="subtitle2" gutterBottom>
                        Performance Issues Detected
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {summary.warnings.slowApiCalls > 0 && (
                            <Chip label={`${summary.warnings.slowApiCalls} slow API calls`} size="small" color="warning" />
                        )}
                        {summary.warnings.slowGpsAcquisitions > 0 && (
                            <Chip label={`${summary.warnings.slowGpsAcquisitions} slow GPS`} size="small" color="warning" />
                        )}
                        {summary.warnings.lowGpsAccuracy > 0 && (
                            <Chip label={`${summary.warnings.lowGpsAccuracy} low GPS accuracy`} size="small" color="warning" />
                        )}
                        {summary.warnings.slowUploads > 0 && (
                            <Chip label={`${summary.warnings.slowUploads} slow uploads`} size="small" color="warning" />
                        )}
                    </Box>
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* API Performance */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                API Performance
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Total Calls:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.api.totalCalls}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Success Rate:</Typography>
                                <Chip 
                                    label={`${summary.api.successRate}%`} 
                                    color={summary.api.successRate >= 95 ? 'success' : 'warning'} 
                                    size="small" 
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Avg Response Time:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.api.avgResponseTime}ms
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Slow Calls:</Typography>
                                <Typography 
                                    variant="body2" 
                                    fontWeight="bold"
                                    color={summary.api.slowCalls > 0 ? 'error' : 'success'}
                                >
                                    {summary.api.slowCalls}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* GPS Performance */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                GPS Performance
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Acquisitions:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.gps.totalAcquisitions}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Success Rate:</Typography>
                                <Chip 
                                    label={`${summary.gps.successRate}%`} 
                                    color={summary.gps.successRate >= 90 ? 'success' : 'warning'} 
                                    size="small" 
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Avg Time:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.gps.avgAcquisitionTime}ms
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Avg Accuracy:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    ±{summary.gps.avgAccuracy}m
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Upload Performance */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upload Performance
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Total Uploads:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.uploads.totalUploads}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Success Rate:</Typography>
                                <Chip 
                                    label={`${summary.uploads.successRate}%`} 
                                    color={summary.uploads.successRate >= 95 ? 'success' : 'warning'} 
                                    size="small" 
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Avg Upload Time:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.uploads.avgUploadTime}ms
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Data Uploaded:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {(summary.uploads.totalDataUploaded / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Metrics Tabs */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label={`API Calls (${allMetrics?.api?.length || 0})`} />
                        <Tab label={`GPS Events (${allMetrics?.gps?.length || 0})`} />
                        <Tab label={`Uploads (${allMetrics?.uploads?.length || 0})`} />
                    </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Endpoint</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allMetrics?.api?.slice(-20).reverse().map((metric: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>{metric.endpoint}</TableCell>
                                        <TableCell>
                                            <Chip label={metric.method} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2" 
                                                color={metric.duration > 2000 ? 'error' : 'inherit'}
                                            >
                                                {metric.duration}ms
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {metric.success ? (
                                                <SuccessIcon color="success" fontSize="small" />
                                            ) : (
                                                <ErrorIcon color="error" fontSize="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {metric.errorMessage && (
                                                <Typography variant="caption" color="error">
                                                    {metric.errorMessage}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Acquisition Time</TableCell>
                                    <TableCell>Accuracy</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allMetrics?.gps?.slice(-20).reverse().map((metric: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2" 
                                                color={metric.acquisitionTime > 10000 ? 'error' : 'inherit'}
                                            >
                                                {metric.acquisitionTime}ms
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2" 
                                                color={metric.accuracy > 100 ? 'warning.main' : 'inherit'}
                                            >
                                                ±{Math.round(metric.accuracy)}m
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {metric.success ? (
                                                <SuccessIcon color="success" fontSize="small" />
                                            ) : (
                                                <ErrorIcon color="error" fontSize="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {metric.errorType && (
                                                <Typography variant="caption" color="error">
                                                    {metric.errorType}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>File Size</TableCell>
                                    <TableCell>Upload Time</TableCell>
                                    <TableCell>Compression</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allMetrics?.uploads?.slice(-20).reverse().map((metric: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            {(metric.fileSize / 1024).toFixed(1)} KB
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="body2" 
                                                color={metric.uploadTime > 30000 ? 'error' : 'inherit'}
                                            >
                                                {metric.uploadTime}ms
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {metric.compressionRatio ? (
                                                <Typography variant="body2">
                                                    {(metric.compressionRatio * 100).toFixed(1)}%
                                                </Typography>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {metric.success ? (
                                                <SuccessIcon color="success" fontSize="small" />
                                            ) : (
                                                <ErrorIcon color="error" fontSize="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {metric.errorMessage && (
                                                <Typography variant="caption" color="error">
                                                    {metric.errorMessage}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Card>
        </Box>
    );
};