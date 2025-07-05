import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@/components/ui-kit';
import {
    PencilSquareIcon as EditIcon,
    EyeIcon as ViewIcon,
} from '@heroicons/react/24/outline';
import * as React from 'react';
import {
    BooleanField,
    BooleanInput,
    BulkActionsToolbar,
    CreateButton,
    Datagrid,
    ExportButton,
    FilterButton,
    List,
    NumberInput,
    ReferenceField,
    SelectInput,
    TextField,
    TextInput,
    TopToolbar,
    useGetList,
    useListContext,
    useRecordContext,
} from 'react-admin';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTwTheme } from '../hooks/useTwTheme';
import { Product, Setting } from '../types';
import { PriceField } from './PriceField';
import { ProductBulkActions } from './ProductBulkActions';

// Product List Actions in Top Toolbar
const ProductListActions = () => (
    <TopToolbar>
        <FilterButton />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="Add Product"
            className="ml-2 min-h-11 px-3"
        />
    </TopToolbar>
);

// Category Chip Component
interface CategoryChipProps {
    label?: string;
    source?: string;
    record?: Product;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
    label,
    source,
    record: propRecord,
}) => {
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
            style={{
                backgroundColor: categoryColors[record.category] || '#9e9e9e',
            }}
            className="text-white font-medium"
        />
    );
};

// Principal Chip Component
interface PrincipalChipProps {
    label?: string;
    source?: string;
    record?: Product;
}

const PrincipalChip: React.FC<PrincipalChipProps> = ({
    label,
    source,
    record: propRecord,
}) => {
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
    const theme = useTwTheme();

    if (!record) return null;

    return (
        <Card
            component="article"
            role="button"
            tabIndex={0}
            aria-label={`Product: ${record.name}, SKU: ${record.sku}, Price: ${record.pricePerUnit ? `$${record.pricePerUnit}` : 'Not set'
                }`}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = `/products/${record.id}/show`;
                }
            }}
            className="mb-2 cursor-pointer hover:shadow-lg focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 min-h-45"
        >
            <CardContent className="pb-1">
                {/* Product Header */}
                <Box className="flex justify-between mb-2">
                    <Box className="flex-grow min-w-0">
                        <Typography
                            variant="h6"
                            component="h3"
                            className="font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap mb-1"
                        >
                            {record.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            SKU: {record.sku}
                        </Typography>
                    </Box>
                    <Box className="ml-2">
                        <PriceField variant="h6" />
                    </Box>
                </Box>

                {/* Product Details */}
                <Stack
                    direction="row"
                    spacing={1}
                    className="mb-2 flex-wrap gap-1"
                >
                    <CategoryChip />
                    <Chip
                        label={record.active ? 'Active' : 'Inactive'}
                        size="small"
                        className={
                            record.active
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }
                    />
                </Stack>

                {/* Principal */}
                <Box className="mb-1">
                    <PrincipalChip />
                </Box>

                {/* Package Info */}
                {record.packageSize && (
                    <Typography variant="body2" className="text-gray-500">
                        Package: {record.packageSize} • {record.unitOfMeasure}
                    </Typography>
                )}
            </CardContent>

            {/* Quick Actions */}
            <Box className="flex justify-between items-center px-4 py-2 border-t">
                <Box className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() =>
                            (window.location.href = `/products/${record.id}/show`)
                        }
                        className="min-w-11 min-h-11 text-blue-500"
                        aria-label={`View product: ${record.name}`}
                    >
                        <ViewIcon />
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() =>
                            (window.location.href = `/products/${record.id}/edit`)
                        }
                        className="min-w-11 min-h-11 text-gray-500"
                        aria-label={`Edit product: ${record.name}`}
                    >
                        <EditIcon />
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

// Mobile Grid Layout for Products
const ProductMobileGrid = () => {
    const { data, isLoading } = useListContext<Product>();

    if (isLoading) return <Typography>Loading products...</Typography>;

    if (!data || data.length === 0) {
        return (
            <Box className="p-3 text-center">
                <Typography variant="h6" className="text-gray-500 mb-2">
                    No Products Found
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-2">
                    No products match your current filters.
                </Typography>
                <CreateButton
                    variant="contained"
                    label="Add First Product"
                    className="mt-1"
                />
            </Box>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 mb-2 px-1">
            {data.map((record: Product) => (
                <div key={record.id}>
                    <EnhancedProductCard />
                </div>
            ))}
        </div>
    );
};

// Desktop Table Layout for Products
const ProductDesktopTable = () => (
    <Datagrid rowClick="show">
        <TextField source="name" label="Product Name" />
        <TextField source="sku" label="SKU" />
        <CategoryChip label="Category" />
        <PrincipalChip label="Principal" />
        <PriceField source="pricePerUnit" label="Price" />
        <TextField source="packageSize" label="Package Size" />
        <BooleanField source="active" label="Active" />
    </Datagrid>
);

// Responsive Product List Content
const ProductListContent = () => {
    const isMobile = useBreakpoint('md');

    return isMobile ? <ProductMobileGrid /> : <ProductDesktopTable />;
};

// Product filters for List component
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

    const principalChoices =
        principalSettings?.map(setting => ({
            id: setting.id,
            name: setting.label,
        })) || [];

    return [
        <TextInput
            key="search-name"
            source="name"
            label="Search by name"
            alwaysOn
        />,
        <TextInput key="search-sku" source="sku" label="Search by SKU" />,
        <SelectInput
            key="category"
            source="category"
            label="Category"
            choices={categoryChoices}
        />,
        <SelectInput
            key="principal"
            source="principalId"
            label="Principal/Brand"
            choices={principalChoices}
        />,
        <BooleanInput
            key="active"
            source="active"
            label="Active products only"
        />,
        <NumberInput
            key="price-min"
            source="price_gte"
            label="Min Price ($)"
        />,
        <NumberInput
            key="price-max"
            source="price_lte"
            label="Max Price ($)"
        />,
    ];
};

// Main Product List Component
export const ProductList = () => {
    const filters = useProductFilters();

    // Debug logging for ProductList component
    React.useEffect(() => {
        console.log('🛍️ ProductList component mounted with filters');
    }, []);

    return (
        <List
            actions={<ProductListActions />}
            filters={filters}
            sort={{ field: 'name', order: 'ASC' }}
            perPage={25}
            title="Food Service Products"
            empty={
                <Box className="p-3 text-center">
                    <Typography variant="h6" className="text-gray-500 mb-2">
                        No Products Found
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-2">
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
