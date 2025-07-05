import {
    CurrencyDollarIcon as MoneyIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import {
    BooleanInput,
    Create,
    Form,
    NumberInput,
    ReferenceInput,
    SaveButton,
    SelectInput,
    TextInput,
    Toolbar,
    required,
    useGetList,
} from 'react-admin';
import { CardContent } from '../components/Card/CardContent';
import { Box } from '../components/Layout/Box';
import { Typography } from '../components/Typography/Typography';

import { Setting } from '../types';
import { formatPrice } from './PriceField';

const ProductCreateToolbar = () => (
    <Toolbar>
        <SaveButton />
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
                    <Box className="flex items-center">
                        <Box
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                                backgroundColor: choice.color || '#e0e0e0',
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
            />
            {price > 0 && (
                <Box className="mt-1 flex items-center">
                    <MoneyIcon className="mr-1 text-green-600 text-sm" />
                    <Typography
                        variant="body2"
                        className="text-green-600 font-medium"
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
                    <Typography variant="h5" className="font-semibold mb-6">
                        Add New Product
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information Section */}
                        <div className="col-span-2">
                            <Typography
                                variant="h6"
                                className="font-semibold mb-4"
                            >
                                Basic Information
                            </Typography>
                        </div>

                        <div>
                            <TextInput
                                source="name"
                                label="Product Name"
                                validate={required()}
                                helperText="Full product name as it appears in catalogs"
                                fullWidth
                            />
                        </div>
                        <div>
                            <TextInput
                                source="sku"
                                label="SKU"
                                validate={required()}
                                helperText="Stock Keeping Unit identifier"
                                fullWidth
                            />
                        </div>

                        {/* Brand and Category Section */}
                        <div className="col-span-2">
                            <Typography
                                variant="h6"
                                className="font-semibold mb-4 mt-4"
                            >
                                Brand & Category
                            </Typography>
                        </div>

                        <div>
                            <EnhancedPrincipalSelection />
                        </div>
                        <div>
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
                            />
                        </div>

                        {/* Pricing and Packaging Section */}
                        <div className="col-span-2">
                            <Typography
                                variant="h6"
                                className="font-semibold mb-4 mt-4"
                            >
                                Pricing & Packaging
                            </Typography>
                        </div>

                        <div>
                            <PriceInputWithPreview />
                        </div>
                        <div>
                            <TextInput
                                source="unitOfMeasure"
                                label="Unit of Measure"
                                helperText="e.g., case, lb, gallon, each"
                                fullWidth
                            />
                        </div>

                        <div>
                            <TextInput
                                source="packageSize"
                                label="Package Size"
                                helperText="e.g., 12/1 lb, 24 count case, 5 lb bag"
                                fullWidth
                            />
                        </div>
                        <div>
                            <Box className="flex items-center min-h-11">
                                <BooleanInput
                                    source="active"
                                    label="Product is Active"
                                    defaultValue={true}
                                    helperText="Whether this product is available for sale"
                                />
                            </Box>
                        </div>

                        {/* Description Section */}
                        <div className="col-span-2">
                            <Typography
                                variant="h6"
                                className="font-semibold mb-4 mt-4"
                            >
                                Description
                            </Typography>
                        </div>

                        <div className="col-span-2">
                            <TextInput
                                source="description"
                                label="Product Description"
                                helperText="Detailed product description for catalogs and sales materials"
                                multiline
                                rows={4}
                                fullWidth
                            />
                        </div>
                    </div>
                </CardContent>
                <ProductCreateToolbar />
            </Form>
        </Create>
    );
};
