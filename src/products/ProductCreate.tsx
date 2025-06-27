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
} from 'react-admin';
import { CardContent, Grid } from '@mui/material';

const ProductCreateToolbar = () => (
    <Toolbar>
        <SaveButton />
    </Toolbar>
);

export const ProductCreate = () => {
    return (
        <Create
            redirect="show"
            transform={(data) => ({
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: data.active !== false, // Default to true
            })}
        >
            <Form>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="name"
                                label="Product Name"
                                validate={required()}
                                helperText="Full product name as it appears in catalogs"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="sku"
                                label="SKU"
                                validate={required()}
                                helperText="Stock Keeping Unit identifier"
                                fullWidth
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <ReferenceInput 
                                source="principalId" 
                                reference="settings" 
                                filter={{ category: 'principal', active: true }}
                            >
                                <SelectInput
                                    optionText="label"
                                    optionValue="id"
                                    label="Principal"
                                    validate={required()}
                                    helperText="Food service principal/brand"
                                    fullWidth
                                />
                            </ReferenceInput>
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
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="price"
                                label="Price"
                                validate={required()}
                                helperText="Price per unit (USD)"
                                min={0}
                                step={0.01}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="unitOfMeasure"
                                label="Unit of Measure"
                                helperText="e.g., case, lb, gallon, each"
                                fullWidth
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="packageSize"
                                label="Package Size"
                                helperText="e.g., 12/1 lb, 24 count case, 5 lb bag"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <BooleanInput
                                source="active"
                                label="Active"
                                defaultValue={true}
                                helperText="Whether this product is available for sale"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextInput
                                source="description"
                                label="Description"
                                helperText="Detailed product description"
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <ProductCreateToolbar />
            </Form>
        </Create>
    );
};