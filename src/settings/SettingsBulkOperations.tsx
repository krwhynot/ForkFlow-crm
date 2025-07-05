import React, { useState, useCallback, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Alert,
    Chip,
    Grid,
    List,
    Divider,
} from '@/components/ui-kit';
import {
    CloudArrowUpIcon as UploadIcon,
    CloudArrowDownIcon as DownloadIcon,
    CheckCircleIcon as CheckIcon,
    ExclamationCircleIcon as ErrorIcon,
    ExclamationTriangleIcon as WarningIcon,
    TrashIcon as DeleteIcon,
} from '@heroicons/react/24/outline';
import { useDataProvider, useNotify, useGetList } from 'react-admin';
import Papa from 'papaparse';
import { Setting } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface BulkOperationResult {
    success: number;
    errors: number;
    warnings: number;
    details: Array<{
        row: number;
        type: 'success' | 'error' | 'warning';
        message: string;
        data?: any;
    }>;
}

export const SettingsBulkOperations: React.FC = () => {
    const isMobile = useBreakpoint('sm');
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [operationResult, setOperationResult] =
        useState<BulkOperationResult | null>(null);

    const { data: allSettings } = useGetList<Setting>('settings', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'category', order: 'ASC' },
    });

    // CSV Export functionality
    const handleExport = useCallback(
        async (format: 'csv' | 'json') => {
            if (!allSettings || allSettings.length === 0) {
                notify('No settings to export', { type: 'warning' });
                return;
            }

            try {
                setIsProcessing(true);

                if (format === 'csv') {
                    const csvData = Papa.unparse(
                        allSettings.map(setting => ({
                            id: setting.id,
                            category: setting.category,
                            key: setting.key,
                            label: setting.label,
                            color: setting.color || '',
                            sortOrder: setting.sortOrder,
                            active: setting.active,
                            createdAt: setting.createdAt,
                            updatedAt: setting.updatedAt,
                        }))
                    );

                    const blob = new Blob([csvData], {
                        type: 'text/csv;charset=utf-8;',
                    });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `settings-export-${
                        new Date().toISOString().split('T')[0]
                    }.csv`;
                    link.click();
                } else if (format === 'json') {
                    const jsonData = JSON.stringify(allSettings, null, 2);
                    const blob = new Blob([jsonData], {
                        type: 'application/json;charset=utf-8;',
                    });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `settings-export-${
                        new Date().toISOString().split('T')[0]
                    }.json`;
                    link.click();
                }

                notify(`Settings exported as ${format.toUpperCase()}`, {
                    type: 'success',
                });
            } catch (error) {
                console.error('Export error:', error);
                notify('Export failed', { type: 'error' });
            } finally {
                setIsProcessing(false);
            }
        },
        [allSettings, notify]
    );

    // CSV Import functionality
    const handleImport = useCallback(
        (file: File) => {
            if (!file) return;

            setIsProcessing(true);
            setProgress(0);
            setOperationResult(null);

            Papa.parse(file, {
                header: true,
                complete: async results => {
                    const { data } = results;
                    const result: BulkOperationResult = {
                        success: 0,
                        errors: 0,
                        warnings: 0,
                        details: [],
                    };

                    try {
                        for (let i = 0; i < data.length; i++) {
                            const row = data[i] as any;
                            const rowNum = i + 1;

                            try {
                                // Validate required fields
                                if (!row.category || !row.key || !row.label) {
                                    result.errors++;
                                    result.details.push({
                                        row: rowNum,
                                        type: 'error',
                                        message:
                                            'Missing required fields (category, key, label)',
                                        data: row,
                                    });
                                    continue;
                                }

                                // Validate category
                                const validCategories = [
                                    'priority',
                                    'segment',
                                    'distributor',
                                    'role',
                                    'influence',
                                    'decision',
                                    'principal',
                                    'stage',
                                    'interaction_type',
                                ];
                                if (!validCategories.includes(row.category)) {
                                    result.errors++;
                                    result.details.push({
                                        row: rowNum,
                                        type: 'error',
                                        message: `Invalid category: ${row.category}`,
                                        data: row,
                                    });
                                    continue;
                                }

                                // Check for duplicates
                                const existingDuplicate = allSettings?.find(
                                    s =>
                                        s.category === row.category &&
                                        s.key === row.key
                                );

                                const settingData = {
                                    category: row.category.trim(),
                                    key: row.key.trim().toLowerCase(),
                                    label: row.label.trim(),
                                    color: row.color?.trim() || null,
                                    sortOrder: parseInt(row.sortOrder) || 0,
                                    active:
                                        row.active === 'true' ||
                                        row.active === true,
                                };

                                if (existingDuplicate && !row.id) {
                                    // Update existing setting
                                    await dataProvider.update('settings', {
                                        id: existingDuplicate.id,
                                        data: settingData,
                                        previousData: existingDuplicate,
                                    });
                                    result.warnings++;
                                    result.details.push({
                                        row: rowNum,
                                        type: 'warning',
                                        message: `Updated existing setting: ${row.label}`,
                                        data: settingData,
                                    });
                                } else if (row.id) {
                                    // Update by ID
                                    await dataProvider.update('settings', {
                                        id: parseInt(row.id),
                                        data: settingData,
                                        previousData: row,
                                    });
                                    result.success++;
                                    result.details.push({
                                        row: rowNum,
                                        type: 'success',
                                        message: `Updated setting: ${row.label}`,
                                        data: settingData,
                                    });
                                } else {
                                    // Create new setting
                                    await dataProvider.create('settings', {
                                        data: settingData,
                                    });
                                    result.success++;
                                    result.details.push({
                                        row: rowNum,
                                        type: 'success',
                                        message: `Created setting: ${row.label}`,
                                        data: settingData,
                                    });
                                }
                            } catch (error) {
                                result.errors++;
                                result.details.push({
                                    row: rowNum,
                                    type: 'error',
                                    message: `Failed to process: ${
                                        error instanceof Error
                                            ? error.message
                                            : 'Unknown error'
                                    }`,
                                    data: row,
                                });
                            }

                            // Update progress
                            setProgress(((i + 1) / data.length) * 100);
                        }

                        setOperationResult(result);

                        if (result.success > 0) {
                            notify(
                                `Import completed: ${result.success} successful, ${result.errors} errors`,
                                {
                                    type:
                                        result.errors > 0
                                            ? 'warning'
                                            : 'success',
                                }
                            );
                        } else {
                            notify(
                                'Import failed - no settings were created or updated',
                                { type: 'error' }
                            );
                        }
                    } catch (error) {
                        console.error('Import error:', error);
                        notify('Import failed due to an unexpected error', {
                            type: 'error',
                        });
                    } finally {
                        setIsProcessing(false);
                        setProgress(0);
                    }
                },
                error: error => {
                    console.error('CSV parsing error:', error);
                    notify('Failed to parse CSV file', { type: 'error' });
                    setIsProcessing(false);
                },
            });
        },
        [dataProvider, notify, allSettings]
    );

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                    notify('Please select a CSV file', { type: 'error' });
                    return;
                }
                handleImport(file);
            }
        },
        [handleImport, notify]
    );

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <Box>
            <Typography variant="h6" className="mb-2">
                Bulk Operations
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-6">
                Import and export settings in bulk using CSV or JSON files
            </Typography>

            <Grid container spacing={6}>
                {/* Export Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" className="mb-2">
                                Export Settings
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-600 mb-4"
                            >
                                Download all settings data as CSV or JSON
                            </Typography>

                            <Box className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon className="w-4 h-4" />}
                                    onClick={() => handleExport('csv')}
                                    disabled={
                                        isProcessing || !allSettings?.length
                                    }
                                    fullWidth={isMobile}
                                    className="min-h-12"
                                >
                                    Export CSV
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon className="w-4 h-4" />}
                                    onClick={() => handleExport('json')}
                                    disabled={
                                        isProcessing || !allSettings?.length
                                    }
                                    fullWidth={isMobile}
                                    className="min-h-12"
                                >
                                    Export JSON
                                </Button>
                            </Box>

                            {allSettings && (
                                <Box className="mt-4">
                                    <Chip
                                        label={`${allSettings.length} settings available`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Import Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" className="mb-2">
                                Import Settings
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-600 mb-4"
                            >
                                Upload CSV file to create or update settings
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            <Button
                                variant="contained"
                                startIcon={<UploadIcon className="w-4 h-4" />}
                                onClick={triggerFileInput}
                                disabled={isProcessing}
                                fullWidth={isMobile}
                                className="min-h-12"
                            >
                                Select CSV File
                            </Button>

                            <Box className="mt-4">
                                <Typography variant="caption" className="block">
                                    Required columns: category, key, label
                                </Typography>
                                <Typography variant="caption" className="block">
                                    Optional columns: color, sortOrder, active
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Progress Indicator */}
            {isProcessing && (
                <Box className="mt-6">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" className="mb-2">
                                Processing...
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                className="mb-2"
                            />
                            <Typography variant="body2" className="text-gray-600">
                                {Math.round(progress)}% complete
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Operation Results */}
            {operationResult && (
                <Box className="mt-6">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" className="mb-2">
                                Import Results
                            </Typography>

                            <Box className="flex gap-2 mb-4 flex-wrap">
                                <Chip
                                    icon={<CheckIcon className="w-4 h-4" />}
                                    label={`${operationResult.success} Success`}
                                    color="success"
                                    size="small"
                                />
                                {operationResult.warnings > 0 && (
                                    <Chip
                                        icon={<WarningIcon className="w-4 h-4" />}
                                        label={`${operationResult.warnings} Warnings`}
                                        color="warning"
                                        size="small"
                                    />
                                )}
                                {operationResult.errors > 0 && (
                                    <Chip
                                        icon={<ErrorIcon className="w-4 h-4" />}
                                        label={`${operationResult.errors} Errors`}
                                        color="error"
                                        size="small"
                                    />
                                )}
                            </Box>

                            {operationResult.details.length > 0 && (
                                <>
                                    <Divider className="my-4" />
                                    <Typography
                                        variant="subtitle2"
                                        className="mb-2"
                                    >
                                        Details
                                    </Typography>
                                    <List className="max-h-72 overflow-auto">
                                        {operationResult.details.map(
                                            (detail, index) => (
                                                <div key={index} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {detail.type === 'success' && (
                                                            <CheckIcon className="w-5 h-5 text-green-600" />
                                                        )}
                                                        {detail.type === 'warning' && (
                                                            <WarningIcon className="w-5 h-5 text-yellow-600" />
                                                        )}
                                                        {detail.type === 'error' && (
                                                            <ErrorIcon className="w-5 h-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <Typography variant="body2" className="font-medium">
                                                            Row {detail.row}: {detail.message}
                                                        </Typography>
                                                        {detail.data && (
                                                            <Typography variant="caption" className="text-gray-500 block mt-1">
                                                                {JSON.stringify(detail.data, null, 2)}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </List>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};
