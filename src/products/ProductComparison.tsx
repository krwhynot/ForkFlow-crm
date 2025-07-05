import * as React from 'react';
import { useState } from 'react';
import { useGetMany, useGetList, Loading } from 'react-admin';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Chip,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Paper,
    Stack,
} from '@/components/ui-kit';
import {
    XMarkIcon as CloseIcon,
    CheckCircleIcon as ActiveIcon,
    XCircleIcon as InactiveIcon,
} from '@heroicons/react/24/outline';

import { Product, Setting } from '../types';
import { PriceField } from './PriceField';

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
                <Box className="flex justify-end gap-2 p-4 border-t">
                    <Button onClick={onClose}>Close</Button>
                </Box>
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
            className="h-[90vh] w-full"
        >
            <DialogTitle>
                <Box className="flex justify-between items-center">
                    <Typography variant="h6" component="div">
                        Product Comparison ({products.length} products)
                    </Typography>
                    <IconButton onClick={onClose} size="sm">
                        <CloseIcon className="w-5 h-5" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent className="border-t border-b">
                <Paper className="overflow-auto max-h-[70vh]">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="min-w-[150px] font-semibold">
                                    Attribute
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="min-w-[200px] font-semibold text-center"
                                    >
                                        <Stack className="space-y-2 items-center">
                                            <Typography variant="h6" className="truncate">
                                                {product.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                className="text-gray-600"
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
                                <TableCell className="font-semibold">
                                    Price
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
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
                                <TableCell className="font-semibold">
                                    Category
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <div
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                            style={{
                                                backgroundColor:
                                                    getCategoryColor(
                                                        product.category || ''
                                                    ),
                                            }}
                                        >
                                            {product.category || 'N/A'}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Principal Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Principal/Brand
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
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
                                <TableCell className="font-semibold">
                                    Package Size
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <Typography variant="body2">
                                            {product.packageSize || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Unit of Measure Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Unit of Measure
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <Typography variant="body2">
                                            {product.unitOfMeasure || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Status Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Status
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <Chip
                                            label={
                                                product.active
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            size="small"
                                            color={
                                                product.active
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Description Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Description
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center max-w-[200px]"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="line-clamp-3"
                                        >
                                            {product.description ||
                                                'No description available'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Created By Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Created By
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            {product.createdBy || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Created Date Row */}
                            <TableRow>
                                <TableCell className="font-semibold">
                                    Created Date
                                </TableCell>
                                {products.map(product => (
                                    <TableCell
                                        key={product.id}
                                        className="text-center"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
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

            <Box className="flex justify-between items-center p-4 border-t">
                <Typography variant="body2" className="text-gray-500">
                    Compare up to 4 products side by side
                </Typography>
                <Button onClick={onClose} variant="contained">
                    Close Comparison
                </Button>
            </Box>
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
