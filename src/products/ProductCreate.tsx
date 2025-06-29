import * as React from 'react';
import {
    Create,
    Form,
    NumberInput,
    SelectInput,
    TextInput,
    BooleanInput,
    Toolbar,
    SaveButton,
    required,
    ReferenceInput,
    useGetList,
} from 'react-admin';
import { CardContent, Grid, Typography, Box, Chip, Stack } from '@mui/material';
import {
    Business as BusinessIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';

import { Setting } from '../types';
import { PriceField, formatPrice } from './PriceField';

const ProductCreateToolbar = () => (
    <Toolbar>
        <SaveButton
            sx={{
                minHeight: 44,
                px: 3,
            }}
        />
    </Toolbar>
);

// Enhanced Principal Selection Component
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
                validate={required() as any}
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

// Price Input with Preview
const PriceInputWithPreview = () => {
    const [price, setPrice] = React.useState<number>(0);

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
                    setPrice(parseFloat(event.target.value) || 0);
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        minHeight: '44px',
                    },
                }}
            />
            {price > 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon
                        sx={{ mr: 1, color: 'success.main', fontSize: 'small' }}
                    />
                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontWeight: 500 }}
                    >
                        Preview: {formatPrice(price)}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export const ProductCreate = () => {
    return (
        <Create
            redirect="show"
            transform={data => ({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: data.active !== false, // Default to true
            })}
        >
            <Form>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                        Add New Product
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
                            <PriceInputWithPreview />
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
                                    defaultValue={true}
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
                <ProductCreateToolbar />
            </Form>
        </Create>
    );
};
