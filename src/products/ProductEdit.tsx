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
} from 'react-admin';
import { CardContent, Grid } from '@mui/material';

const ProductEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <DeleteButton />
    </Toolbar>
);

export const ProductEdit = () => {
    return (
        <Edit
            transform={(data) => ({
                ...data,
                updatedAt: new Date().toISOString(),
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
                <ProductEditToolbar />
            </Form>
        </Edit>
    );
};