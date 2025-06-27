import {
    CreateButton,
    Datagrid,
    FilterButton,
    List,
    SelectInput,
    TextField,
    TextInput,
    TopToolbar,
    useListContext,
    useRecordContext,
    NumberField,
    BooleanField,
    ReferenceField,
} from 'react-admin';
import { Box, Chip, Typography } from '@mui/material';
import { Product } from '../types';

const ProductListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
    </TopToolbar>
);

const productFilters = [
    <TextInput source="q" label="Search Products" alwaysOn />,
    <SelectInput
        source="category"
        label="Category"
        choices={[
            { id: 'Dairy', name: 'Dairy' },
            { id: 'Meat', name: 'Meat' },
            { id: 'Produce', name: 'Produce' },
            { id: 'Frozen', name: 'Frozen' },
            { id: 'Dry Goods', name: 'Dry Goods' },
            { id: 'Beverages', name: 'Beverages' },
            { id: 'Cleaning', name: 'Cleaning' },
        ]}
    />,
    <SelectInput
        source="active"
        label="Status"
        choices={[
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' },
        ]}
    />,
];

const CategoryChip = (props: { label?: string }) => {
    const record = useRecordContext<Product>(props);
    if (!record?.category) return null;
    
    const categoryColors: Record<string, string> = {
        'Dairy': '#1976d2',
        'Meat': '#d32f2f',
        'Produce': '#388e3c',
        'Frozen': '#0288d1',
        'Dry Goods': '#f57c00',
        'Beverages': '#7b1fa2',
        'Cleaning': '#5d4037',
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

const PriceField = (props: { label?: string }) => {
    const record = useRecordContext<Product>(props);
    if (!record?.price) return null;
    
    return (
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
            ${record.price.toFixed(2)}
        </Typography>
    );
};

const ProductCard = (props: { label?: string }) => {
    const record = useRecordContext<Product>(props);
    if (!record) return null;
    
    return (
        <Box
            sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': { boxShadow: 2 }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {record.name}
                </Typography>
                <PriceField />
            </Box>
            
            <Box display="flex" gap={1} mb={1}>
                <CategoryChip />
                <Chip
                    label={record.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={record.active ? 'success' : 'default'}
                    variant={record.active ? 'filled' : 'outlined'}
                />
            </Box>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
                SKU: {record.sku}
            </Typography>
            
            {record.packageSize && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Package: {record.packageSize}
                </Typography>
            )}
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <PrincipalChip />
                <Typography variant="caption" color="textSecondary">
                    {record.unitOfMeasure}
                </Typography>
            </Box>
        </Box>
    );
};

export const ProductList = () => {
    return (
        <List
            filters={productFilters}
            actions={<ProductListActions />}
            sort={{ field: 'name', order: 'ASC' }}
            perPage={25}
            title="Food Service Products"
        >
            <ProductDatagrid />
        </List>
    );
};

const ProductDatagrid = () => {
    const listContext = useListContext();
    
    if (listContext.isLoading) return null;
    
    // For mobile/card view
    if (window.innerWidth < 768) {
        return (
            <Box>
                {listContext.data?.map((record: Product) => (
                    <Box key={record.id} sx={{ mb: 2 }}>
                        <ProductCard />
                    </Box>
                ))}
            </Box>
        );
    }
    
    // For desktop/table view
    return (
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" label="Product Name" />
            <TextField source="sku" label="SKU" />
            <CategoryChip label="Category" />
            <PrincipalChip label="Principal" />
            <NumberField 
                source="price" 
                label="Price" 
                options={{ 
                    style: 'currency', 
                    currency: 'USD' 
                }} 
            />
            <TextField source="packageSize" label="Package Size" />
            <BooleanField source="active" label="Active" />
        </Datagrid>
    );
};