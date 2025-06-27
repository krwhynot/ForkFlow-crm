import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    BooleanField,
    ReferenceField,
    EditButton,
    DeleteButton,
    TopToolbar,
} from 'react-admin';
import { 
    Card, 
    CardContent, 
    Grid, 
    Typography, 
    Chip, 
    Box,
    Divider,
    Stack
} from '@mui/material';
import { Product } from '../types';

const ProductShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const ProductHeader = () => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        <TextField source="name" variant="h4" />
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip 
                            label={<TextField source="category" />}
                            color="primary"
                            variant="outlined"
                        />
                        <BooleanField 
                            source="active"
                            TrueComponent={() => (
                                <Chip label="Active" color="success" size="small" />
                            )}
                            FalseComponent={() => (
                                <Chip label="Inactive" color="default" size="small" />
                            )}
                        />
                    </Stack>
                    <Typography variant="body1" color="textSecondary">
                        <TextField source="description" />
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box textAlign={{ xs: 'left', md: 'right' }}>
                        <Typography variant="h3" color="primary" gutterBottom>
                            <NumberField 
                                source="price" 
                                options={{ 
                                    style: 'currency', 
                                    currency: 'USD' 
                                }} 
                            />
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            per <TextField source="unitOfMeasure" />
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

const ProductDetails = () => (
    <Card>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                Product Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            SKU
                        </Typography>
                        <Typography variant="body1">
                            <TextField source="sku" />
                        </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Package Size
                        </Typography>
                        <Typography variant="body1">
                            <TextField source="packageSize" />
                        </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Unit of Measure
                        </Typography>
                        <Typography variant="body1">
                            <TextField source="unitOfMeasure" />
                        </Typography>
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Principal/Brand
                        </Typography>
                        <ReferenceField 
                            source="principalId" 
                            reference="settings" 
                            link={false}
                        >
                            <TextField source="label" />
                        </ReferenceField>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Status
                        </Typography>
                        <BooleanField 
                            source="active"
                            TrueComponent={() => (
                                <Typography variant="body1" color="success.main">
                                    Active
                                </Typography>
                            )}
                            FalseComponent={() => (
                                <Typography variant="body1" color="text.secondary">
                                    Inactive
                                </Typography>
                            )}
                        />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Created By
                        </Typography>
                        <Typography variant="body1">
                            <TextField source="createdBy" />
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

export const ProductShow = () => {
    return (
        <Show actions={<ProductShowActions />}>
            <SimpleShowLayout>
                <ProductHeader />
                <ProductDetails />
            </SimpleShowLayout>
        </Show>
    );
};