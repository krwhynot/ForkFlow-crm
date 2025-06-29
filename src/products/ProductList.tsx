import * as React from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    ReferenceField,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterForm,
    TextInput,
    SelectInput,
    BooleanInput,
    useListContext,
    useGetList,
    useRecordContext,
    BulkActionsToolbar,
} from 'react-admin';
import {
    Box,
    Chip,
    Typography,
    useMediaQuery,
    useTheme,
    Stack,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Grid,
} from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { Product, Setting } from '../types';
import { ProductBulkActions } from './ProductBulkActions';
import { PriceField } from './PriceField';

// Product List Actions in Top Toolbar
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

// Category Chip Component
interface CategoryChipProps {
    label?: string;
    source?: string;
    record?: Product;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ label, source, record: propRecord }) => {
    const contextRecord = useRecordContext<Product>();
    const record = propRecord || contextRecord;
    
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

// Principal Chip Component
interface PrincipalChipProps {
    label?: string;
    source?: string;
    record?: Product;
}

const PrincipalChip: React.FC<PrincipalChipProps> = ({ label, source, record: propRecord }) => {
    const contextRecord = useRecordContext<Product>();
    const record = propRecord || contextRecord;
    
    if (!record?.principalId) return null;

    return (
        <ReferenceField
            source="principalId"
            reference="settings"
            label="Principal"
            link={false}
            record={record}
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

// Mobile Grid Layout for Products
const ProductMobileGrid = () => {
    const { data, isLoading } = useListContext<Product>();

    if (isLoading) return <Typography>Loading products...</Typography>;

    if (!data || data.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Products Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No products match your current filters.
                </Typography>
                <CreateButton 
                    variant="contained" 
                    label="Add First Product"
                    sx={{ mt: 1 }}
                />
            </Box>
        );
    }

    return (
        <Grid container spacing={2} sx={{ mt: 1, mb: 2, px: 1 }}>
            {data.map((record: Product) => (
                <Grid item xs={12} sm={6} key={record.id}>
                    <EnhancedProductCard />
                </Grid>
            ))}
        </Grid>
    );
};

// Desktop Table Layout for Products
const ProductDesktopTable = () => (
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

// Responsive Product List Content
const ProductListContent = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    return isMobile ? <ProductMobileGrid /> : <ProductDesktopTable />;
};

// Product filters for FilterForm
const useProductFilters = () => {
    const { data: principalSettings } = useGetList<Setting>('settings', {
        filter: { category: 'principal', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const categoryChoices = [
        { id: 'Dairy', name: 'Dairy' },
        { id: 'Meat', name: 'Meat' },
        { id: 'Produce', name: 'Produce' },
        { id: 'Frozen', name: 'Frozen' },
        { id: 'Dry Goods', name: 'Dry Goods' },
        { id: 'Beverages', name: 'Beverages' },
        { id: 'Cleaning', name: 'Cleaning' },
    ];

    const principalChoices = principalSettings?.map(setting => ({
        id: setting.id,
        name: setting.label,
    })) || [];

    return [
        <TextInput
            key="search-name"
            source="name"
            label="Search by name"
            variant="outlined"
            size="small"
            alwaysOn
            sx={{ mb: 2 }}
        />,
        <TextInput
            key="search-sku"
            source="sku"
            label="Search by SKU"
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
        />,
        <SelectInput
            key="category"
            source="category"
            label="Category"
            choices={categoryChoices}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
        />,
        <SelectInput
            key="principal"
            source="principalId"
            label="Principal/Brand"
            choices={principalChoices}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
        />,
        <BooleanInput
            key="active"
            source="active"
            label="Active products only"
            sx={{ mb: 2 }}
        />,
    ];
};

// Main Product List Component
export const ProductList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const filters = useProductFilters();

    // Debug logging for ProductList component
    React.useEffect(() => {
        console.log('🛍️ ProductList component mounted', {
            isMobile,
            screenWidth: window.innerWidth
        });
    }, [isMobile]);

    return (
        <List
            actions={<ProductListActions />}
            sort={{ field: 'name', order: 'ASC' }}
            perPage={25}
            title="Food Service Products"
            aside={
                !isMobile ? (
                    <Box sx={{ width: 250, p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Filter Products
                        </Typography>
                        <FilterForm filters={filters} />
                    </Box>
                ) : undefined
            }
            sx={{ 
                '& .RaList-content': { px: { xs: 1, sm: 2 } },
                '& .RaList-main': { width: '100%' }
            }}
            empty={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Products Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Add your first product to get started.
                    </Typography>
                    <CreateButton 
                        variant="contained" 
                        label="Add First Product"
                    />
                </Box>
            }
        >
            <BulkActionsToolbar>
                <ProductBulkActions />
            </BulkActionsToolbar>
            <ProductListContent />
        </List>
    );
};