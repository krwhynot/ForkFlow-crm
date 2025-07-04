import * as React from 'react';
import { useState } from 'react';
import { useGetMany, useGetList, Loading } from 'react-admin';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Box,
    Typography,
    Chip,
    IconButton,
    Paper,
    Stack,
    Divider,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
} from '@mui/icons-material';

import { Product, Setting } from '../types';
import { PriceField } from './PriceField';
import { Button } from '../components/Button/Button';

interface ProductComparisonProps {
    open: boolean;
    onClose: () => void;
    productIds: number[];
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
    open,
    onClose,
    productIds,
}) => {
    const { data: products, isLoading } = useGetMany<Product>(
        'products',
        { ids: productIds },
        { enabled: open && productIds.length > 0 }
    );

    const { data: principals } = useGetList<Setting>('settings', {
        filter: { category: 'principal', active: true },
        pagination: { page: 1, perPage: 100 },
    });

    if (!open) return null;

    if (isLoading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Loading />
                </DialogContent>
            </Dialog>
        );
    }

    if (!products || products.length === 0) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm">
                <DialogTitle>Product Comparison</DialogTitle>
                <DialogContent>
                    <Typography>
                        No products selected for comparison.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const getPrincipalName = (principalId?: number) => {
        if (!principalId) return 'Unknown';
        return principals?.find(p => p.id === principalId)?.label || 'Unknown';
    };

    const getCategoryColor = (category: string) => {
        const categoryColors: Record<string, string> = {
            Dairy: '#1976d2',
            Meat: '#d32f2f',
            Produce: '#388e3c',
            Frozen: '#0288d1',
            'Dry Goods': '#f57c00',
            Beverages: '#7b1fa2',
            Cleaning: '#5d4037',
        };
        return categoryColors[category] || '#9e9e9e';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: { height: '90vh' },
            }}
        >
            <DialogTitle>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" component="div">
                        Product Comparison ({products.length} products)
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Paper sx={{ overflow: 'auto', maxHeight: '70vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{ minWidth: 150, fontWeight: 600 }}
                                >
                                    Attribute
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{
                                            minWidth: 200,
                                            fontWeight: 600,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Stack spacing={1} alignItems="center">
                                            <Typography variant="h6" noWrap>
                                                {product.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                SKU: {product.sku}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {/* Price Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Price
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <PriceField
                                            record={product}
                                            variant="h6"
                                            color="primary.main"
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Category Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Category
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Chip
                                            label={product.category || 'N/A'}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    getCategoryColor(
                                                        product.category || ''
                                                    ),
                                                color: 'white',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Principal Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Principal/Brand
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Typography variant="body2">
                                            {getPrincipalName(
                                                product.principalId
                                            )}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Package Size Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Package Size
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Typography variant="body2">
                                            {product.packageSize || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Unit of Measure Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Unit of Measure
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Typography variant="body2">
                                            {product.unitOfMeasure || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Status Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Status
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Chip
                                            icon={
                                                product.active ? (
                                                    <ActiveIcon />
                                                ) : (
                                                    <InactiveIcon />
                                                )
                                            }
                                            label={
                                                product.active
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            size="small"
                                            color={
                                                product.active
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            variant={
                                                product.active
                                                    ? 'filled'
                                                    : 'outlined'
                                            }
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Description Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Description
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{
                                            textAlign: 'center',
                                            maxWidth: 200,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {product.description ||
                                                'No description available'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Created By Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Created By
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {product.createdBy || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Created Date Row */}
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    Created Date
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        sx={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {product.createdAt
                                                ? new Date(
                                                      product.createdAt
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
            </DialogContent>

            <DialogActions>
                <Typography
                    variant="body2"
                    className="text-gray-500 mr-auto"
                >
                    Compare up to 4 products side by side
                </Typography>
                <Button onClick={onClose} variant="primary">
                    Close Comparison
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Hook for managing product comparison
export const useProductComparison = () => {
    const [open, setOpen] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

    const openComparison = (productIds: number[]) => {
        if (productIds.length === 0) return;
        if (productIds.length > 4) {
            // Limit to 4 products for better UX
            setSelectedProductIds(productIds.slice(0, 4));
        } else {
            setSelectedProductIds(productIds);
        }
        setOpen(true);
    };

    const closeComparison = () => {
        setOpen(false);
        setSelectedProductIds([]);
    };

    return {
        open,
        selectedProductIds,
        openComparison,
        closeComparison,
        ComparisonDialog: () => (
            <ProductComparison
                open={open}
                onClose={closeComparison}
                productIds={selectedProductIds}
            />
        ),
    };
};
