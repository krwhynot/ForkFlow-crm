import * as React from 'react';
import {
    CreateButton,
    Datagrid,
    FilterButton,
    List,
    TextField,
    TopToolbar,
    useListContext,
    useRecordContext,
    NumberField,
    BooleanField,
    ReferenceField,
    SimpleList,
    BulkActionsToolbar,
    ExportButton,
} from 'react-admin';
import {
    Box,
    Chip,
    Typography,
    useMediaQuery,
    useTheme,
    Stack,
    Avatar,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Grid,
} from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { Product } from '../types';
import { ProductListFilter } from './ProductListFilter';
import { ProductBulkActions } from './ProductBulkActions';
import { PriceField } from './PriceField';

const ProductListActions = () => (
    <TopToolbar>
        <ExportButton />
        <CreateButton
            variant="contained"
            label="Add Product"
            sx={{
                marginLeft: 2,
                minHeight: 44,
                px: 3,
            }}
        />
    </TopToolbar>
);

const CategoryChip = (props: { label?: string }) => {
    const record = useRecordContext<Product>(props);
    if (!record?.category) return null;

    const categoryColors: Record<string, string> = {
        Dairy: '#1976d2',
        Meat: '#d32f2f',
        Produce: '#388e3c',
        Frozen: '#0288d1',
        'Dry Goods': '#f57c00',
        Beverages: '#7b1fa2',
        Cleaning: '#5d4037',
    };

    return (
        <Chip
            label={record.category}
            size="small"
            sx={{
                backgroundColor: categoryColors[record.category] || '#9e9e9e',
                color: 'white',
                fontWeight: 500,
            }}
        />
    );
};

const PrincipalChip = (props: { label?: string }) => {
    const record = useRecordContext<Product>(props);
    if (!record?.principalId) return null;

    return (
        <ReferenceField
            source="principalId"
            reference="settings"
            label="Principal"
            link={false}
        >
            <TextField source="label" />
        </ReferenceField>
    );
};

// Enhanced Product Card for Mobile View
const EnhancedProductCard = () => {
    const record = useRecordContext<Product>();
    const theme = useTheme();

    if (!record) return null;

    return (
        <Card
            component="article"
            role="button"
            tabIndex={0}
            aria-label={`Product: ${record.name}, SKU: ${record.sku}, Price: ${record.price ? `$${record.price}` : 'Not set'}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = `/products/${record.id}/show`;
                }
            }}
            sx={{
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                },
                '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                },
                minHeight: '180px',
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                {/* Product Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 600,
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                            }}
                        >
                            {record.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            SKU: {record.sku}
                        </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                        <PriceField variant="h6" />
                    </Box>
                </Box>

                {/* Product Details */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
                >
                    <CategoryChip />
                    <Chip
                        label={record.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={record.active ? 'success' : 'default'}
                        variant={record.active ? 'filled' : 'outlined'}
                    />
                </Stack>

                {/* Principal */}
                <Box sx={{ mb: 1 }}>
                    <PrincipalChip />
                </Box>

                {/* Package Info */}
                {record.packageSize && (
                    <Typography variant="body2" color="text.secondary">
                        Package: {record.packageSize} • {record.unitOfMeasure}
                    </Typography>
                )}
            </CardContent>

            {/* Quick Actions */}
            <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                        component={Link}
                        to={`/products/${record.id}/show`}
                        sx={{
                            minWidth: 44,
                            minHeight: 44,
                            color: theme.palette.primary.main,
                        }}
                        aria-label={`View product: ${record.name}`}
                    >
                        <ViewIcon />
                    </IconButton>
                    <IconButton
                        component={Link}
                        to={`/products/${record.id}/edit`}
                        sx={{
                            minWidth: 44,
                            minHeight: 44,
                            color: theme.palette.text.secondary,
                        }}
                        aria-label={`Edit product: ${record.name}`}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            </CardActions>
        </Card>
    );
};

export const ProductList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Debug logging for ProductList component
    React.useEffect(() => {
        console.log('🛍️ ProductList component mounted', {
            isMobile,
            screenWidth: window.innerWidth
        });
    }, [isMobile]);

    return (
        <Stack direction="row" sx={{ width: '100%' }}>
            {!isMobile && <ProductListFilter />}
            <Box sx={{ flexGrow: 1 }}>
                <List
                    actions={<ProductListActions />}
                    sort={{ field: 'name', order: 'ASC' }}
                    perPage={25}
                    title="Food Service Products"
                    sx={{ '& .RaList-content': { px: { xs: 1, sm: 2 } } }}
                >
                    <BulkActionsToolbar>
                        <ProductBulkActions />
                    </BulkActionsToolbar>
                    <ProductDatagrid />
                </List>
            </Box>
        </Stack>
    );
};

const ProductDatagrid = () => {
    const listContext = useListContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Debug logging for data loading
    React.useEffect(() => {
        console.log('📊 ProductDatagrid state:', {
            isLoading: listContext.isLoading,
            dataLength: listContext.data?.length || 0,
            total: listContext.total,
            error: listContext.error,
            isMobile
        });
    }, [listContext.isLoading, listContext.data, listContext.total, listContext.error, isMobile]);

    // Enhanced error handling
    if (listContext.error) {
        console.error('❌ ProductList error:', listContext.error);
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>
                    Error Loading Products
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {listContext.error.message || 'An unexpected error occurred'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Check the browser console for more details
                </Typography>
            </Box>
        );
    }

    if (listContext.isLoading) {
        console.log('⏳ ProductList loading...');
        return null;
    }

    // Handle empty data state
    if (!listContext.data || listContext.data.length === 0) {
        console.log('📭 No products found');
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Products Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {listContext.total === 0 
                        ? 'No products have been added yet.' 
                        : 'No products match your current filters.'}
                </Typography>
                <CreateButton 
                    variant="contained" 
                    label="Add First Product"
                    sx={{ mt: 1 }}
                />
            </Box>
        );
    }

    console.log(`✅ ProductList loaded successfully with ${listContext.data.length} products`);

    // For mobile/card view
    if (isMobile) {
        return (
            <Grid container spacing={2} sx={{ mt: 1, mb: 2, px: 1 }}>
                {listContext.data?.map((record: Product) => (
                    <Grid item xs={12} sm={6} key={record.id}>
                        <EnhancedProductCard />
                    </Grid>
                ))}
            </Grid>
        );
    }

    // For desktop/table view
    return (
        <Datagrid rowClick="show">
            <TextField source="name" label="Product Name" />
            <TextField source="sku" label="SKU" />
            <CategoryChip label="Category" />
            <PrincipalChip label="Principal" />
            <PriceField source="price" label="Price" />
            <TextField source="packageSize" label="Package Size" />
            <BooleanField source="active" label="Active" />
        </Datagrid>
    );
};
