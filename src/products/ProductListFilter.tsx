import * as React from 'react';
import {
    FilterList,
    FilterLiveSearch,
    FilterListItem,
    useGetList,
    TextInput,
} from 'react-admin';
import { Box, Chip, Typography, Divider } from '@mui/material';
import {
    Category as CategoryIcon,
    Business as BusinessIcon,
    Search as SearchIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
} from '@mui/icons-material';

import { Setting } from '../types';

export const ProductListFilter = () => {
    // Fetch Settings for principal filtering
    const { data: principalSettings } = useGetList<Setting>('settings', {
        filter: { category: 'principal', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const categoryChoices = [
        { id: 'Dairy', name: 'Dairy', color: '#1976d2' },
        { id: 'Meat', name: 'Meat', color: '#d32f2f' },
        { id: 'Produce', name: 'Produce', color: '#388e3c' },
        { id: 'Frozen', name: 'Frozen', color: '#0288d1' },
        { id: 'Dry Goods', name: 'Dry Goods', color: '#f57c00' },
        { id: 'Beverages', name: 'Beverages', color: '#7b1fa2' },
        { id: 'Cleaning', name: 'Cleaning', color: '#5d4037' },
    ];

    return (
        <Box width="16em" minWidth="16em" order={-1} mr={2} mt={5}>
            {/* Enhanced Search Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Search Products
                </Typography>
                <FilterLiveSearch
                    source="name"
                    hiddenLabel
                    sx={{
                        display: 'block',
                        mb: 2,
                        '& .MuiFilledInput-root': {
                            width: '100%',
                            minHeight: '44px',
                        },
                    }}
                    placeholder="Search by product name..."
                />
                <FilterLiveSearch
                    source="sku"
                    hiddenLabel
                    sx={{
                        display: 'block',
                        '& .MuiFilledInput-root': {
                            width: '100%',
                            minHeight: '44px',
                        },
                    }}
                    placeholder="Search by SKU..."
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Principal/Brand Filter */}
            <FilterList label="Principal/Brand" icon={<BusinessIcon />}>
                {principalSettings?.map(principal => (
                    <FilterListItem
                        key={principal.id}
                        label={
                            <Chip
                                label={principal.label}
                                size="small"
                                sx={{
                                    backgroundColor:
                                        principal.color || '#e0e0e0',
                                    color: 'white',
                                    border: 0,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    minHeight: '32px',
                                    '&:hover': {
                                        backgroundColor: principal.color
                                            ? `${principal.color}dd`
                                            : '#d0d0d0',
                                    },
                                }}
                            />
                        }
                        value={{ principalId: principal.id }}
                    />
                ))}
            </FilterList>

            {/* Category Filter */}
            <FilterList label="Category" icon={<CategoryIcon />}>
                {categoryChoices.map(category => (
                    <FilterListItem
                        key={category.id}
                        label={
                            <Chip
                                label={category.name}
                                size="small"
                                sx={{
                                    backgroundColor: category.color,
                                    color: 'white',
                                    border: 0,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    minHeight: '32px',
                                    '&:hover': {
                                        backgroundColor: `${category.color}dd`,
                                    },
                                }}
                            />
                        }
                        value={{ category: category.id }}
                    />
                ))}
            </FilterList>

            {/* Status Filter */}
            <FilterList label="Status" icon={<ActiveIcon />}>
                <FilterListItem
                    label={
                        <Chip
                            icon={<ActiveIcon fontSize="small" />}
                            label="Active Products"
                            size="small"
                            sx={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 0,
                                cursor: 'pointer',
                                fontWeight: 500,
                                minHeight: '32px',
                                '& .MuiChip-icon': {
                                    color: 'white',
                                },
                                '&:hover': {
                                    backgroundColor: '#45a049',
                                },
                            }}
                        />
                    }
                    value={{ active: true }}
                />
                <FilterListItem
                    label={
                        <Chip
                            icon={<InactiveIcon fontSize="small" />}
                            label="Inactive Products"
                            size="small"
                            sx={{
                                backgroundColor: '#9e9e9e',
                                color: 'white',
                                border: 0,
                                cursor: 'pointer',
                                fontWeight: 500,
                                minHeight: '32px',
                                '& .MuiChip-icon': {
                                    color: 'white',
                                },
                                '&:hover': {
                                    backgroundColor: '#8e8e8e',
                                },
                            }}
                        />
                    }
                    value={{ active: false }}
                />
            </FilterList>

            {/* Price Range Filter (Future Enhancement) */}
            <FilterList label="Price Range" icon={<SearchIcon />}>
                <FilterListItem label="Under $10" value={{ price_lt: 10 }} />
                <FilterListItem
                    label="$10 - $50"
                    value={{ price_gte: 10, price_lt: 50 }}
                />
                <FilterListItem
                    label="$50 - $100"
                    value={{ price_gte: 50, price_lt: 100 }}
                />
                <FilterListItem label="Over $100" value={{ price_gte: 100 }} />
            </FilterList>
        </Box>
    );
};
