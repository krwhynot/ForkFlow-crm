import {
    Alert,
    Box,
    Chip,
    Grid,
    Paper,
    Stack,
    Typography
} from '@/components/ui-kit';
import {
    BuildingOffice2Icon as BusinessIcon,
    UserIcon as PersonIcon
} from '@heroicons/react/24/outline';
import {
    FormControl,
    FormHelperText,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Slider,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import {
    FormDataConsumer,
    SelectInput,
    TextInput,
    useGetList,
} from 'react-admin';
import { Setting } from '../../../types';
import { StepComponentProps } from './types';

/**
 * Business Details step component
 * Collects priority, segment, account manager, revenue, and notes
 */
export const BusinessDetailsStep: React.FC<StepComponentProps> = ({
    formData,
    onDataChange,
    validationErrors,
    isMobile,
}) => {
    const [revenueSliderValue, setRevenueSliderValue] = useState<number>(
        formData.revenue || 100000
    );

    // Fetch settings data
    const { data: prioritySettings } = useGetList<Setting>('settings', {
        filter: { category: 'priority', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: segmentSettings } = useGetList<Setting>('settings', {
        filter: { category: 'segment', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: distributorSettings } = useGetList<Setting>('settings', {
        filter: { category: 'distributor', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    // Priority options with enhanced display
    const priorityOptions = [
        {
            value: 'high',
            label: 'High Priority',
            color: '#ef4444',
            icon: '🔴',
            description: 'Key accounts requiring immediate attention',
        },
        {
            value: 'medium',
            label: 'Medium Priority',
            color: '#f59e0b',
            icon: '🟡',
            description: 'Important accounts with regular follow-up',
        },
        {
            value: 'low',
            label: 'Low Priority',
            color: '#10b981',
            icon: '🟢',
            description: 'Standard accounts with periodic contact',
        },
    ];

    // Revenue ranges for quick selection
    const revenueRanges = [
        { label: 'Under $100K', min: 0, max: 100000, color: '#10b981' },
        { label: '$100K - $500K', min: 100000, max: 500000, color: '#f59e0b' },
        { label: '$500K - $1M', min: 500000, max: 1000000, color: '#ef4444' },
        { label: '$1M - $5M', min: 1000000, max: 5000000, color: '#8b5cf6' },
        { label: 'Over $5M', min: 5000000, max: 50000000, color: '#06b6d4' },
    ];

    // Handle form field changes
    const handleFieldChange = useCallback(
        (field: string, value: any) => {
            const updatedData = { ...formData, [field]: value };
            onDataChange(updatedData);
        },
        [formData, onDataChange]
    );

    // Handle revenue slider change
    const handleRevenueSliderChange = useCallback(
        (_: Event, value: number | number[]) => {
            const newValue = Array.isArray(value) ? value[0] : value;
            setRevenueSliderValue(newValue);
        },
        []
    );

    // Handle revenue slider commit (when user stops dragging)
    const handleRevenueSliderCommit = useCallback(
        (_: Event, value: number | number[]) => {
            const newValue = Array.isArray(value) ? value[0] : value;
            handleFieldChange('revenue', newValue);
        },
        [handleFieldChange]
    );

    // Handle revenue range quick selection
    const handleRevenueRangeSelect = useCallback(
        (range: (typeof revenueRanges)[0]) => {
            const averageValue = (range.min + range.max) / 2;
            setRevenueSliderValue(averageValue);
            handleFieldChange('revenue', averageValue);
        },
        [handleFieldChange]
    );

    // Format currency
    const formatCurrency = useCallback((value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: value >= 1000000 ? 'compact' : 'standard',
            maximumFractionDigits: 0,
        }).format(value);
    }, []);

    return (
        <Box className="p-4 md:p-6">
            {/* Header */}
            <Box className="mb-6 text-center">
                <BusinessIcon
                    sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                />
                <Typography variant="h6" className="mb-2">
                    Business Context
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                    Add business details to help with organization management
                    and reporting
                </Typography>
            </Box>

            <Stack gap={8}>
                {/* Priority and Segment */}
                <Paper elevation={1} className="p-6">
                    <Typography
                        variant="subtitle1"
                        className="mb-2 flex items-center gap-2"
                    >
                        <PersonIcon className="h-4 w-4 text-primary" />
                        Business Classification
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Priority */}
                        <Grid item xs={12} md={6}>
                            <FormControl
                                fullWidth
                                error={!!validationErrors.priorityId}
                            >
                                <InputLabel>Priority Level</InputLabel>
                                <Select
                                    value={formData.priorityId || ''}
                                    label="Priority Level"
                                    onChange={e =>
                                        handleFieldChange(
                                            'priorityId',
                                            e.target.value
                                        )
                                    }
                                    sx={{ minHeight: '56px' }}
                                >
                                    <MenuItem value="">
                                        <em>Select priority level</em>
                                    </MenuItem>
                                    {(prioritySettings || priorityOptions).map(
                                        option => {
                                            // Use prioritySettings if available, otherwise use default options
                                            const setting =
                                                prioritySettings?.find(
                                                    s => s.id === option.id
                                                );
                                            const displayOption = setting
                                                ? {
                                                    value: setting.id,
                                                    label: setting.label,
                                                    color: setting.color,
                                                    icon: setting.label
                                                        .toLowerCase()
                                                        .includes('high')
                                                        ? '🔴'
                                                        : setting.label
                                                            .toLowerCase()
                                                            .includes(
                                                                'medium'
                                                            )
                                                            ? '🟡'
                                                            : '🟢',
                                                    description:
                                                        setting.description ||
                                                        '',
                                                }
                                                : option;

                                            return (
                                                <MenuItem
                                                    key={displayOption.value}
                                                    value={displayOption.value}
                                                >
                                                    <Box className="flex items-center gap-4">
                                                        <Box className="text-base">
                                                            {displayOption.icon}
                                                        </Box>
                                                        <Box className="">
                                                            <Typography
                                                                variant="subtitle2"
                                                                style={{
                                                                    color: displayOption.color,
                                                                }}
                                                            >
                                                                {
                                                                    displayOption.label
                                                                }
                                                            </Typography>
                                                            {!isMobile &&
                                                                displayOption.description && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        className="text-gray-600"
                                                                    >
                                                                        {
                                                                            displayOption.description
                                                                        }
                                                                    </Typography>
                                                                )}
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            );
                                        }
                                    )}
                                </Select>
                                <FormHelperText>
                                    {validationErrors.priorityId ||
                                        'Helps prioritize follow-up and attention'}
                                </FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Business Segment */}
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <SelectInput
                                        source="segmentId"
                                        label="Business Segment"
                                        choices={
                                            segmentSettings?.map(setting => ({
                                                id: setting.id,
                                                name: setting.label,
                                                color: setting.color,
                                            })) || []
                                        }
                                        helperText={
                                            validationErrors.segmentId ||
                                            'Market segment classification'
                                        }
                                        error={!!validationErrors.segmentId}
                                        optionText={(choice: any) => (
                                            <Box className="flex items-center gap-2">
                                                <PersonIcon
                                                    className="h-4 w-4 text-primary"
                                                    style={{ color: choice.color }}
                                                />
                                                <span
                                                    style={{
                                                        color:
                                                            choice.color ||
                                                            'inherit',
                                                    }}
                                                >
                                                    {choice.name}
                                                </span>
                                            </Box>
                                        )}
                                        fullWidth
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* Primary Distributor */}
                        <Grid item xs={12}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <SelectInput
                                        source="distributorId"
                                        label="Primary Distributor"
                                        choices={
                                            distributorSettings?.map(
                                                setting => ({
                                                    id: setting.id,
                                                    name: setting.label,
                                                    color: setting.color,
                                                })
                                            ) || []
                                        }
                                        helperText={
                                            validationErrors.distributorId ||
                                            'Main distribution partner'
                                        }
                                        error={!!validationErrors.distributorId}
                                        optionText={(choice: any) => (
                                            <Box className="flex items-center gap-2">
                                                <PersonIcon
                                                    className="h-4 w-4 text-primary"
                                                    style={{ color: choice.color }}
                                                />
                                                <span
                                                    style={{
                                                        color:
                                                            choice.color ||
                                                            'inherit',
                                                    }}
                                                >
                                                    {choice.name}
                                                </span>
                                            </Box>
                                        )}
                                        fullWidth
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Revenue Information */}
                <Paper elevation={1} className="p-6">
                    <Typography
                        variant="subtitle1"
                        className="mb-2 flex items-center gap-2"
                    >
                        <PersonIcon className="h-4 w-4 text-primary" />
                        Revenue Information
                    </Typography>

                    {/* Quick Revenue Range Selection */}
                    <Box className="mb-6">
                        <Typography
                            variant="body2"
                            className="text-gray-600 mb-2"
                        >
                            Quick Selection:
                        </Typography>
                        <Stack direction="row" gap={2} className="flex-wrap">
                            {revenueRanges.map((range, index) => (
                                <Chip
                                    key={index}
                                    label={range.label}
                                    onClick={() =>
                                        handleRevenueRangeSelect(range)
                                    }
                                    variant="outlined"
                                    sx={{
                                        borderColor: range.color,
                                        color: range.color,
                                        '&:hover': {
                                            backgroundColor: `${range.color}15`,
                                        },
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* Revenue Slider */}
                    <Box sx={{ px: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                        >
                            Annual Revenue: {formatCurrency(revenueSliderValue)}
                        </Typography>
                        <Slider
                            value={revenueSliderValue}
                            onChange={handleRevenueSliderChange}
                            onChangeCommitted={handleRevenueSliderCommit}
                            min={0}
                            max={10000000}
                            step={25000}
                            marks={[
                                { value: 0, label: '$0' },
                                { value: 1000000, label: '$1M' },
                                { value: 5000000, label: '$5M' },
                                { value: 10000000, label: '$10M+' },
                            ]}
                            valueLabelDisplay="auto"
                            valueLabelFormat={formatCurrency}
                            sx={{
                                '& .MuiSlider-thumb': {
                                    height: 24,
                                    width: 24,
                                },
                                '& .MuiSlider-track': {
                                    height: 6,
                                },
                                '& .MuiSlider-rail': {
                                    height: 6,
                                },
                            }}
                        />
                    </Box>

                    {/* Manual Revenue Input */}
                    <Grid container spacing={2} className="mt-2">
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="revenue"
                                        label="Annual Revenue"
                                        type="number"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    $
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText={
                                            validationErrors.revenue ||
                                            'Approximate annual revenue'
                                        }
                                        error={!!validationErrors.revenue}
                                        onChange={e => {
                                            const value =
                                                parseFloat(e.target.value) || 0;
                                            setRevenueSliderValue(value);
                                            handleFieldChange('revenue', value);
                                        }}
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Account Management */}
                <Paper elevation={1} className="p-6">
                    <Typography
                        variant="subtitle1"
                        className="mb-2 flex items-center gap-2"
                    >
                        <PersonIcon className="h-4 w-4 text-primary" />
                        Account Management
                    </Typography>

                    <FormDataConsumer>
                        {({ formData: currentData }) => (
                            <TextInput
                                source="accountManager"
                                label="Account Manager Email"
                                fullWidth
                                placeholder="john.smith@forkflow.com"
                                helperText={
                                    validationErrors.accountManager ||
                                    'Email of the assigned account manager'
                                }
                                error={!!validationErrors.accountManager}
                                InputProps={{
                                    startAdornment: (
                                        <PersonIcon
                                            className="h-4 w-4 text-primary"
                                            style={{
                                                mr: 1,
                                            }}
                                        />
                                    ),
                                }}
                            />
                        )}
                    </FormDataConsumer>
                </Paper>

                {/* Notes */}
                <Paper elevation={1} className="p-6">
                    <Typography
                        variant="subtitle1"
                        className="mb-2 flex items-center gap-2"
                    >
                        <PersonIcon className="h-4 w-4 text-primary" />
                        Additional Notes
                    </Typography>

                    <FormDataConsumer>
                        {({ formData: currentData }) => {
                            const noteLength = (currentData?.notes || '')
                                .length;
                            const maxLength = 500;

                            return (
                                <TextInput
                                    source="notes"
                                    label="Business Notes"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    helperText={
                                        validationErrors.notes ||
                                        `${noteLength}/${maxLength} characters - Add any important business context or notes`
                                    }
                                    error={!!validationErrors.notes}
                                    inputProps={{ maxLength }}
                                />
                            );
                        }}
                    </FormDataConsumer>
                </Paper>

                {/* Business Summary */}
                {(formData.priorityId ||
                    formData.segmentId ||
                    formData.revenue) && (
                        <Paper elevation={1} className="p-6 bg-gray-50">
                            <Typography variant="subtitle2" className="mb-2">
                                Business Summary
                            </Typography>
                            <Stack gap={4}>
                                {formData.priorityId && (
                                    <Box className="flex items-center gap-2">
                                        <PersonIcon
                                            className="h-4 w-4 text-primary"
                                            style={{ color: 'primary' }}
                                        />
                                        <Typography variant="body2">
                                            Priority:{' '}
                                            {prioritySettings?.find(
                                                p => p.id === formData.priorityId
                                            )?.label || formData.priorityId}
                                        </Typography>
                                    </Box>
                                )}
                                {formData.segmentId && (
                                    <Box className="flex items-center gap-2">
                                        <PersonIcon
                                            className="h-4 w-4 text-primary"
                                            style={{ color: 'primary' }}
                                        />
                                        <Typography variant="body2">
                                            Segment:{' '}
                                            {segmentSettings?.find(
                                                s => s.id === formData.segmentId
                                            )?.label || formData.segmentId}
                                        </Typography>
                                    </Box>
                                )}
                                {formData.revenue && (
                                    <Box className="flex items-center gap-2">
                                        <PersonIcon
                                            className="h-4 w-4 text-primary"
                                            style={{ color: 'primary' }}
                                        />
                                        <Typography variant="body2">
                                            Revenue:{' '}
                                            {formatCurrency(formData.revenue)}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    )}

                {/* Quick Tips */}
                <Alert severity="info">
                    <Typography variant="body2" className="font-medium mb-2">
                        💡 Business Context Tips:
                    </Typography>
                    <Box as="ul" className="mt-2 mb-0 pl-4">
                        <li>
                            Priority level helps with account management and
                            follow-up scheduling
                        </li>
                        <li>
                            Business segment enables better categorization and
                            reporting
                        </li>
                        <li>
                            All business details can be updated as relationships
                            develop
                        </li>
                    </Box>
                </Alert>
            </Stack>
        </Box>
    );
};
