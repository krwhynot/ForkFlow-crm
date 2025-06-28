import * as React from 'react';
import {
    Edit,
    Form,
    NumberInput,
    SelectInput,
    TextInput,
    BooleanInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
    ReferenceInput,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { CardContent, Grid, Typography, Box, Chip, Stack } from '@mui/material';
import {
    Business as BusinessIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';

import { Setting, Product } from '../types';
import { PriceField, formatPrice } from './PriceField';

const ProductEditToolbar = () => (
    <Toolbar>
        <SaveButton
            sx={{
                minHeight: 44,
                px: 3,
            }}
        />
        <DeleteButton
            sx={{
                minHeight: 44,
                px: 3,
            }}
        />
    </Toolbar>
);

// Enhanced Principal Selection Component for Edit
const EnhancedPrincipalSelection = () => {
    const { data: principals } = useGetList<Setting>('settings', {
        filter: { category: 'principal', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return (
        <ReferenceInput
            source="principalId"
            reference="settings"
            filter={{ category: 'principal', active: true }}
        >
            <SelectInput
                optionText={choice => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: choice.color || '#e0e0e0',
                                mr: 1,
                            }}
                        />
                        {choice.label}
                    </Box>
                )}
                optionValue="id"
                label="Principal/Brand"
                validate={required()}
                helperText="Food service principal/brand"
                fullWidth
                sx={{
                    '& .MuiSelect-select': {
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                    },
                }}
            />
        </ReferenceInput>
    );
};

// Price Input with Current Value Display
const PriceInputWithDisplay = () => {
    const record = useRecordContext<Product>();
    const [currentPrice, setCurrentPrice] = React.useState<number>(
        record?.price || 0
    );

    React.useEffect(() => {
        if (record?.price) {
            setCurrentPrice(record.price);
        }
    }, [record?.price]);

    return (
        <Box>
            <NumberInput
                source="price"
                label="Price (USD)"
                validate={required()}
                helperText="Price per unit"
                min={0}
                step={0.01}
                fullWidth
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCurrentPrice(parseFloat(event.target.value) || 0);
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        minHeight: '44px',
                    },
                }}
            />
            {currentPrice > 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon
                        sx={{ mr: 1, color: 'success.main', fontSize: 'small' }}
                    />
                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontWeight: 500 }}
                    >
                        Current: {formatPrice(currentPrice)}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export const ProductEdit = () => {
    const record = useRecordContext<Product>();

    return (
        <Edit
            transform={data => ({
                ...data,
                updatedAt: new Date().toISOString(),
            })}
        >
            <Form>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                        Edit Product: {record?.name}
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Basic Information Section */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 2 }}
                            >
                                Basic Information
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="name"
                                label="Product Name"
                                validate={required()}
                                helperText="Full product name as it appears in catalogs"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '44px',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="sku"
                                label="SKU"
                                validate={required()}
                                helperText="Stock Keeping Unit identifier"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '44px',
                                    },
                                }}
                            />
                        </Grid>

                        {/* Brand and Category Section */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                            >
                                Brand & Category
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <EnhancedPrincipalSelection />
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                                helperText="Product category for organization"
                                fullWidth
                                sx={{
                                    '& .MuiSelect-select': {
                                        minHeight: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                }}
                            />
                        </Grid>

                        {/* Pricing and Packaging Section */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                            >
                                Pricing & Packaging
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <PriceInputWithDisplay />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="unitOfMeasure"
                                label="Unit of Measure"
                                helperText="e.g., case, lb, gallon, each"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '44px',
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="packageSize"
                                label="Package Size"
                                helperText="e.g., 12/1 lb, 24 count case, 5 lb bag"
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '44px',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: '44px',
                                }}
                            >
                                <BooleanInput
                                    source="active"
                                    label="Product is Active"
                                    helperText="Whether this product is available for sale"
                                    sx={{
                                        '& .MuiCheckbox-root': {
                                            minWidth: '44px',
                                            minHeight: '44px',
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Description Section */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                            >
                                Description
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextInput
                                source="description"
                                label="Product Description"
                                helperText="Detailed product description for catalogs and sales materials"
                                multiline
                                rows={4}
                                fullWidth
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: '100px',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <ProductEditToolbar />
            </Form>
        </Edit>
    );
};
