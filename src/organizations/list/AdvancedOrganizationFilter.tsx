import React, { useState, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    Grid,
    TextField,
    Select,
    Chip,
    Box,
    IconButton,
    Typography,
    Stack,
    Autocomplete,
} from '@/components/ui-kit';
import {
    MagnifyingGlassIcon as SearchIcon,
    ChevronDownIcon as ExpandMoreIcon,
    ChevronUpIcon as ExpandLessIcon,
    XMarkIcon as ClearIcon,
    AdjustmentsHorizontalIcon as TuneIcon,
} from '@heroicons/react/24/outline';
import { useListContext } from 'react-admin';
import { useDebounce } from '../hooks/useDebounce';
import { OrganizationFilter } from '../../types';

/**
 * Advanced filter component for organizations with debounced search,
 * priority dropdowns with color-coded options, and segment filters
 */
export const AdvancedOrganizationFilter: React.FC = () => {
    const { filterValues, setFilters } = useListContext();
    const [searchQuery, setSearchQuery] = useState(filterValues?.q || '');
    const [expanded, setExpanded] = useState(false);
    const [revenueRange, setRevenueRange] = useState<[number, number]>([
        0, 10000000,
    ]);

    // Debounce search query for 300ms
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Update filters when debounced search changes
    React.useEffect(() => {
        if (debouncedSearchQuery !== filterValues?.q) {
            setFilters(
                { ...filterValues, q: debouncedSearchQuery || undefined },
                false
            );
        }
    }, [debouncedSearchQuery, filterValues, setFilters]);

    // Filter options with visual indicators
    const priorityOptions = [
        { value: 'high', label: 'High Priority', color: '#ef4444', icon: '🔴' },
        {
            value: 'medium',
            label: 'Medium Priority',
            color: '#f59e0b',
            icon: '🟡',
        },
        { value: 'low', label: 'Low Priority', color: '#10b981', icon: '🟢' },
    ];

    const statusOptions = [
        { value: 'prospect', label: 'Prospect', color: '#6366f1', icon: '🎯' },
        { value: 'active', label: 'Active', color: '#10b981', icon: '✅' },
        { value: 'inactive', label: 'Inactive', color: '#6b7280', icon: '⏸️' },
        { value: 'closed', label: 'Closed', color: '#ef4444', icon: '❌' },
    ];

    const businessTypeOptions = [
        { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
        { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
        { value: 'distributor', label: 'Distributor', icon: '🚛' },
        { value: 'other', label: 'Other', icon: '🏢' },
    ];

    const sizeOptions = [
        { value: 'Very Small', label: 'Very Small (1-10)', icon: '🏪' },
        { value: 'Small', label: 'Small (11-50)', icon: '🏬' },
        { value: 'Medium', label: 'Medium (51-250)', icon: '🏢' },
        { value: 'Big', label: 'Big (251-1000)', icon: '🏭' },
        { value: 'Very Big', label: 'Very Big (1000+)', icon: '🌆' },
    ];

    // Segment options (could be loaded from API)
    const segmentOptions = [
        'Enterprise',
        'Mid-Market',
        'Small Business',
        'Startup',
        'Government',
        'Non-Profit',
    ];

    const handleFilterChange = useCallback(
        (key: keyof OrganizationFilter, value: any) => {
            const newFilters = { ...filterValues };
            if (value === '' || value === null || value === undefined) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }
            setFilters(newFilters, false);
        },
        [filterValues, setFilters]
    );

    const handleRevenueRangeChange = useCallback(
        (_: Event, newValue: number | number[]) => {
            const range = newValue as [number, number];
            setRevenueRange(range);
            handleFilterChange('revenueMin', range[0]);
            handleFilterChange('revenueMax', range[1]);
        },
        [handleFilterChange]
    );

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setRevenueRange([0, 10000000]);
        setFilters({}, false);
    }, [setFilters]);

    const activeFiltersCount = useMemo(() => {
        return Object.keys(filterValues || {}).filter(
            key =>
                key !== 'q' &&
                filterValues?.[key] !== undefined &&
                filterValues?.[key] !== ''
        ).length;
    }, [filterValues]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
        }).format(value);
    };

    return (
        <Card className="filter-container mb-4">
            <CardContent className="pb-4">
                {/* Search and Toggle Row */}
                <Box className={`flex gap-4 items-center ${expanded ? 'mb-4' : ''}`}>
                    <TextField
                        className="search-input flex-grow max-w-md"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        size="small"
                        startAdornment={
                            <SearchIcon className="w-4 h-4 text-gray-400" />
                        }
                        endAdornment={searchQuery && (
                            <IconButton
                                size="small"
                                onClick={() => setSearchQuery('')}
                                className="p-1"
                            >
                                <ClearIcon className="w-4 h-4" />
                            </IconButton>
                        )}
                    />

                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        aria-label="toggle advanced filters"
                        className="min-h-10 min-w-10 relative"
                    >
                        <TuneIcon className="w-4 h-4" />
                        {expanded ? (
                            <ExpandLessIcon className="w-4 h-4 ml-1" />
                        ) : (
                            <ExpandMoreIcon className="w-4 h-4 ml-1" />
                        )}
                        {activeFiltersCount > 0 && (
                            <Chip
                                label={activeFiltersCount}
                                size="small"
                                color="primary"
                                className="absolute -top-1 -right-1 h-4 min-w-4 text-xs px-1"
                            />
                        )}
                    </IconButton>

                    {(activeFiltersCount > 0 || searchQuery) && (
                        <IconButton
                            onClick={clearAllFilters}
                            aria-label="clear all filters"
                            size="small"
                            className="min-h-10 min-w-10"
                        >
                            <ClearIcon className="w-4 h-4" />
                        </IconButton>
                    )}
                </Box>

                {/* Advanced Filters */}
                <div className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <Grid container spacing={4}>
                        {/* Priority Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Select
                                value={filterValues?.priority || ''}
                                onValueChange={(value: string) =>
                                    handleFilterChange('priority', value)
                                }
                                label="Priority"
                                size="small"
                            >
                                <option value="">All Priorities</option>
                                {priorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </Select>
                        </Grid>

                        {/* Status Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Select
                                value={filterValues?.status || ''}
                                onValueChange={(value: string) =>
                                    handleFilterChange('status', value)
                                }
                                label="Status"
                                size="small"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </Select>
                        </Grid>

                        {/* Business Type Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Business Type</InputLabel>
                                <Select
                                    value={filterValues?.business_type || ''}
                                    onChange={e =>
                                        handleFilterChange(
                                            'business_type',
                                            e.target.value
                                        )
                                    }
                                    label="Business Type"
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {businessTypeOptions.map(option => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Organization Size Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Size</InputLabel>
                                <Select
                                    value={filterValues?.size || ''}
                                    onChange={e =>
                                        handleFilterChange(
                                            'size',
                                            e.target.value
                                        )
                                    }
                                    label="Size"
                                >
                                    <MenuItem value="">All Sizes</MenuItem>
                                    {sizeOptions.map(option => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Segment Filter */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                size="small"
                                options={segmentOptions}
                                value={filterValues?.segment || null}
                                onChange={(_, value) =>
                                    handleFilterChange('segment', value)
                                }
                                renderInput={params => (
                                    <TextField {...params} label="Segment" />
                                )}
                                freeSolo
                            />
                        </Grid>

                        {/* Revenue Range Filter */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Revenue Range:{' '}
                                    {formatCurrency(revenueRange[0])} -{' '}
                                    {formatCurrency(revenueRange[1])}
                                </Typography>
                                <Slider
                                    value={revenueRange}
                                    onChange={handleRevenueRangeChange}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={formatCurrency}
                                    min={0}
                                    max={10000000}
                                    step={100000}
                                    marks={[
                                        { value: 0, label: '$0' },
                                        { value: 1000000, label: '$1M' },
                                        { value: 5000000, label: '$5M' },
                                        { value: 10000000, label: '$10M+' },
                                    ]}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Collapse>

                {/* Active Filters Display */}
                {(activeFiltersCount > 0 || searchQuery) && (
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {searchQuery && (
                                <Chip
                                    label={`Search: "${searchQuery}"`}
                                    onDelete={() => setSearchQuery('')}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            {Object.entries(filterValues || {}).map(
                                ([key, value]) => {
                                    if (key === 'q' || !value) return null;

                                    const getFilterLabel = () => {
                                        switch (key) {
                                            case 'priority':
                                                const priorityOption =
                                                    priorityOptions.find(
                                                        opt =>
                                                            opt.value === value
                                                    );
                                                return `Priority: ${priorityOption?.icon} ${priorityOption?.label}`;
                                            case 'status':
                                                const statusOption =
                                                    statusOptions.find(
                                                        opt =>
                                                            opt.value === value
                                                    );
                                                return `Status: ${statusOption?.icon} ${statusOption?.label}`;
                                            case 'business_type':
                                                const businessOption =
                                                    businessTypeOptions.find(
                                                        opt =>
                                                            opt.value === value
                                                    );
                                                return `Type: ${businessOption?.icon} ${businessOption?.label}`;
                                            case 'size':
                                                const sizeOption =
                                                    sizeOptions.find(
                                                        opt =>
                                                            opt.value === value
                                                    );
                                                return `Size: ${sizeOption?.icon} ${sizeOption?.label}`;
                                            case 'segment':
                                                return `Segment: ${value}`;
                                            case 'revenueMin':
                                            case 'revenueMax':
                                                return null; // Handled together as range
                                            default:
                                                return `${key}: ${value}`;
                                        }
                                    };

                                    const label = getFilterLabel();
                                    if (!label) return null;

                                    return (
                                        <Chip
                                            key={key}
                                            label={label}
                                            onDelete={() =>
                                                handleFilterChange(
                                                    key as keyof OrganizationFilter,
                                                    undefined
                                                )
                                            }
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    );
                                }
                            )}
                        </Stack>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
