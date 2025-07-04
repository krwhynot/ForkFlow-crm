import * as React from 'react';
import { TextInput, SelectInput, BooleanInput, useGetList } from 'react-admin';

import { Setting } from '../types';

/**
 * ProductListFilter - Filter components for products
 *
 * Note: This file is kept for backward compatibility and potential future use.
 * The main ProductList component now uses inline filters with FilterForm.
 *
 * These filter components can be used in other contexts if needed.
 */

// Get filter choices for principals
const usePrincipalChoices = () => {
    const { data: principalSettings } = useGetList<Setting>('settings', {
        filter: { category: 'principal', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return React.useMemo(
        () =>
            principalSettings?.map(setting => ({
                id: setting.id,
                name: setting.label,
            })) || [],
        [principalSettings]
    );
};

// Category choices for products
const categoryChoices = [
    { id: 'Dairy', name: 'Dairy' },
    { id: 'Meat', name: 'Meat' },
    { id: 'Produce', name: 'Produce' },
    { id: 'Frozen', name: 'Frozen' },
    { id: 'Dry Goods', name: 'Dry Goods' },
    { id: 'Beverages', name: 'Beverages' },
    { id: 'Cleaning', name: 'Cleaning' },
];

// Individual filter components for reuse
export const ProductNameFilter = (props: any) => (
    <TextInput
        source="name"
        label="Search by name"
        variant="outlined"
        size="small"
        alwaysOn
        {...props}
    />
);

export const ProductSKUFilter = (props: any) => (
    <TextInput
        source="sku"
        label="Search by SKU"
        variant="outlined"
        size="small"
        {...props}
    />
);

export const ProductCategoryFilter = (props: any) => (
    <SelectInput
        source="category"
        label="Category"
        choices={categoryChoices}
        variant="outlined"
        size="small"
        {...props}
    />
);

export const ProductPrincipalFilter = (props: any) => {
    const principalChoices = usePrincipalChoices();

    return (
        <SelectInput
            source="principalId"
            label="Principal/Brand"
            choices={principalChoices}
            variant="outlined"
            size="small"
            {...props}
        />
    );
};

export const ProductActiveFilter = (props: any) => (
    <BooleanInput source="active" label="Active products only" {...props} />
);

// Array of all product filters (for use with FilterForm)
export const getProductFilters = () => [
    <ProductNameFilter key="search-name" />,
    <ProductSKUFilter key="search-sku" />,
    <ProductCategoryFilter key="category" />,
    <ProductPrincipalFilter key="principal" />,
    <ProductActiveFilter key="active" />,
];

// Legacy component for backward compatibility
export const ProductListFilter = () => {
    console.warn(
        'ProductListFilter is deprecated. Use getProductFilters() with FilterForm instead.'
    );

    return (
        <div style={{ padding: '16px', minWidth: '200px' }}>
            <h3>Product Filters (Legacy)</h3>
            <p>This component is no longer used in the main ProductList.</p>
        </div>
    );
};
