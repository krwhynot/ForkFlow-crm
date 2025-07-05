import React, { useState, useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@/components/ui-kit';
import {
    ArrowPathIcon as RefreshIcon,
    ArrowDownTrayIcon as DownloadIcon,
    ExclamationTriangleIcon as WarningIcon,
    CheckCircleIcon as SuccessIcon,
    XCircleIcon as ErrorIcon,
    ChartBarIcon as PerformanceIcon,
} from '@heroicons/react/24/outline';

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
            {value === index && <Box className="p-6">{children}</Box>}
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
            <Box className="flex items-center gap-4 p-4">
                <LinearProgress className="flex-grow" />
                <Typography variant="body2">
                    Loading performance data...
                </Typography>
            </Box>
        );
    }

    const hasWarnings =
        summary.warnings.slowApiCalls > 0 ||
        summary.warnings.slowGpsAcquisitions > 0 ||
        summary.warnings.lowGpsAccuracy > 0 ||
        summary.warnings.slowUploads > 0;

    return (
        <Box className="w-full">
            {/* Header */}
            <Box className="flex justify-between items-center mb-6">
                <Box className="flex items-center gap-4">
                    <PerformanceIcon color="primary" />
                    <Typography variant="h5">Performance Monitor</Typography>
                    <Chip label={summary.timeRange} color="info" size="small" />
                </Box>

                <Box className="flex gap-2">
                    <Button
                        variant="outlined"
                        startIcon={
                            refreshing ? <LinearProgress /> : <RefreshIcon />
                        }
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
                <Alert variant="warning" className="mb-6">
                    <Typography variant="subtitle2" gutterBottom>
                        Performance Issues Detected
                    </Typography>
                    <Box className="flex flex-wrap gap-2">
                        {summary.warnings.slowApiCalls > 0 && (
                            <Chip
                                label={`${summary.warnings.slowApiCalls} slow API calls`}
                                size="small"
                                color="warning"
                            />
                        )}
                        {summary.warnings.slowGpsAcquisitions > 0 && (
                            <Chip
                                label={`${summary.warnings.slowGpsAcquisitions} slow GPS`}
                                size="small"
                                color="warning"
                            />
                        )}
                        {summary.warnings.lowGpsAccuracy > 0 && (
                            <Chip
                                label={`${summary.warnings.lowGpsAccuracy} low GPS accuracy`}
                                size="small"
                                color="warning"
                            />
                        )}
                        {summary.warnings.slowUploads > 0 && (
                            <Chip
                                label={`${summary.warnings.slowUploads} slow uploads`}
                                size="small"
                                color="warning"
                            />
                        )}
                    </Box>
                </Alert>
            )}

            {/* Summary Cards */}
            <Box className="grid gap-6 md:grid-cols-3 mb-6">
                {/* API Performance */}
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                API Performance
                            </Typography>
                            <Box className="flex justify-between mb-2">
                                <Typography variant="body2">
                                    Total Calls:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.api.totalCalls}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body2">
                                    Success Rate:
                                </Typography>
                                <Chip
                                    label={`${summary.api.successRate}%`}
                                    color={
                                        summary.api.successRate >= 95
                                            ? 'success'
                                            : 'warning'
                                    }
                                    size="small"
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body2">
                                    Avg Response Time:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.api.avgResponseTime}ms
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Typography variant="body2">
                                    Slow Calls:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={
                                        summary.api.slowCalls > 0
                                            ? 'error'
                                            : 'success'
                                    }
                                >
                                    {summary.api.slowCalls}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* GPS Performance */}
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                GPS Performance
                            </Typography>
                            <Box className="flex justify-between mb-2">
                                <Typography variant="body2">
                                    Acquisitions:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.gps.totalAcquisitions}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body2">
                                    Success Rate:
                                </Typography>
                                <Chip
                                    label={`${summary.gps.successRate}%`}
                                    color={
                                        summary.gps.successRate >= 90
                                            ? 'success'
                                            : 'warning'
                                    }
                                    size="small"
                                />
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body2">
                                    Avg Time:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.gps.avgAcquisitionTime}ms
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Typography variant="body2">
                                    Avg Accuracy:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    ±{summary.gps.avgAccuracy}m
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Upload Performance */}
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upload Performance
                            </Typography>
                            <Box className="flex justify-between mb-2">
                                <Typography variant="body2">
                                    Total Uploads:
                                </Typography>
                                <Typography variant="body2" className="font-bold">
                                    {summary.uploads.totalUploads}
                                </Typography>
                            </Box>
                            <Box className="flex justify-between mb-2">
                                <Typography variant="body2">
                                    Success Rate:
                                </Typography>
                                <Chip
                                    label={`${summary.uploads.successRate}%`}
                                    className={`${
                                        summary.uploads.successRate >= 95
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                    size="small"
                                />
                            </Box>
                            <Box className="flex justify-between mb-2">
                                <Typography variant="body2">
                                    Avg Upload Time:
                                </Typography>
                                <Typography variant="body2" className="font-bold">
                                    {summary.uploads.avgUploadTime}ms
                                </Typography>
                            </Box>
                            <Box className="flex justify-between">
                                <Typography variant="body2">
                                    Data Uploaded:
                                </Typography>
                                <Typography variant="body2" className="font-bold">
                                    {(
                                        summary.uploads.totalDataUploaded /
                                        1024 /
                                        1024
                                    ).toFixed(2)}{' '}
                                    MB
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Detailed Metrics Tabs */}
            <Card>
                <Box className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                tabValue === 0
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setTabValue(0)}
                        >
                            API Calls ({allMetrics?.api?.length || 0})
                        </button>
                        <button
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                tabValue === 1
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setTabValue(1)}
                        >
                            GPS Events ({allMetrics?.gps?.length || 0})
                        </button>
                        <button
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                tabValue === 2
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setTabValue(2)}
                        >
                            Uploads ({allMetrics?.uploads?.length || 0})
                        </button>
                    </nav>
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
                                {allMetrics?.api
                                    ?.slice(-20)
                                    .reverse()
                                    .map((metric: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(
                                                    metric.timestamp
                                                ).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>
                                                {metric.endpoint}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={metric.method}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color={
                                                        metric.duration > 2000
                                                            ? 'error'
                                                            : 'inherit'
                                                    }
                                                >
                                                    {metric.duration}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {metric.success ? (
                                                    <SuccessIcon className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <ErrorIcon className="h-4 w-4 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {metric.errorMessage && (
                                                    <Typography
                                                        variant="caption"
                                                        className="text-red-600"
                                                    >
                                                        {metric.errorMessage}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
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
                                {allMetrics?.gps
                                    ?.slice(-20)
                                    .reverse()
                                    .map((metric: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(
                                                    metric.timestamp
                                                ).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    className={`${
                                                        metric.acquisitionTime >
                                                        10000
                                                            ? 'text-red-600'
                                                            : ''
                                                    }`}
                                                >
                                                    {metric.acquisitionTime}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    className={`${
                                                        metric.accuracy > 100
                                                            ? 'text-yellow-600'
                                                            : ''
                                                    }`}
                                                >
                                                    ±
                                                    {Math.round(
                                                        metric.accuracy
                                                    )}
                                                    m
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {metric.success ? (
                                                    <SuccessIcon className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <ErrorIcon className="h-4 w-4 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {metric.errorType && (
                                                    <Typography
                                                        variant="caption"
                                                        className="text-red-600"
                                                    >
                                                        {metric.errorType}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
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
                                {allMetrics?.uploads
                                    ?.slice(-20)
                                    .reverse()
                                    .map((metric: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(
                                                    metric.timestamp
                                                ).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>
                                                {(
                                                    metric.fileSize / 1024
                                                ).toFixed(1)}{' '}
                                                KB
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    className={`${
                                                        metric.uploadTime >
                                                        30000
                                                            ? 'text-red-600'
                                                            : ''
                                                    }`}
                                                >
                                                    {metric.uploadTime}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {metric.compressionRatio ? (
                                                    <Typography variant="body2">
                                                        {(
                                                            metric.compressionRatio *
                                                            100
                                                        ).toFixed(1)}
                                                        %
                                                    </Typography>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {metric.success ? (
                                                    <SuccessIcon className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <ErrorIcon className="h-4 w-4 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {metric.errorMessage && (
                                                    <Typography
                                                        variant="caption"
                                                        className="text-red-600"
                                                    >
                                                        {metric.errorMessage}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabPanel>
            </Card>
        </Box>
    );
};
