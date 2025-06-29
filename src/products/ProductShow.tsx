import * as React from 'react';
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
    useRecordContext,
} from 'react-admin';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Chip,
    Box,
    Divider,
    Stack,
} from '@mui/material';
import { Product } from '../types';
import { PriceField } from './PriceField';
import {
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon,
    PhotoCamera as PhotoIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { RelationshipBreadcrumbs } from '../components/navigation/RelationshipBreadcrumbs';
import { RelatedEntitiesSection } from '../components/navigation/RelatedEntitiesSection';

const ProductShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const ProductHeader = () => {
    const record = useRecordContext();

    return (
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
                            <BooleanField source="active" />
                            {/* Active Status Chip */}
                            {record?.active ? (
                                <Chip
                                    label="Active"
                                    color="success"
                                    size="small"
                                />
                            ) : (
                                <Chip
                                    label="Inactive"
                                    color="default"
                                    size="small"
                                />
                            )}
                        </Stack>
                        <Typography variant="body1" color="textSecondary">
                            <TextField source="description" />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box textAlign={{ xs: 'left', md: 'right' }}>
                            <PriceField
                                variant="h3"
                                color="primary.main"
                                sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                per <TextField source="unitOfMeasure" />
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const ProductDetails = () => {
    const record = useRecordContext();

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Product Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
                                SKU
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="sku" />
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
                                Package Size
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="packageSize" />
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
                                Unit of Measure
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="unitOfMeasure" />
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
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
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
                                Status
                            </Typography>
                            <BooleanField source="active" />
                            {/* Active Status Display */}
                            {record?.active ? (
                                <Typography
                                    variant="body1"
                                    color="success.main"
                                >
                                    Active
                                </Typography>
                            ) : (
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Inactive
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="subtitle2"
                                color="textSecondary"
                                gutterBottom
                            >
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
};

// Related Opportunities - Enhanced with Navigation Component
const RelatedOpportunities = () => {
    const record = useRecordContext<Product>();
    
    return (
        <RelatedEntitiesSection
            entityType="product"
            title="Related Opportunities"
            relatedType="opportunities"
            filter={{ productId: record?.id }}
            maxItems={5}
            createLink={`/opportunities/create?productId=${record?.id}`}
            viewAllLink={`/opportunities?filter=${JSON.stringify({ productId: record?.id })}`}
            emptyMessage="No opportunities featuring this product yet. Create one to start tracking sales pipeline."
        />
    );
};

// Price History Placeholder
const PriceHistory = () => (
    <Card sx={{ mb: 2 }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Price History
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
            >
                Historical pricing data and trends will be displayed here. Track
                price changes over time, seasonal variations, and market trends
                for this product.
            </Typography>
            <Box
                sx={{
                    mt: 2,
                    height: 200,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    📈 Interactive Price Chart Coming Soon
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

// Product Images with Upload Functionality
const ProductImages = () => {
    const record = useRecordContext<Product>();
    const [uploading, setUploading] = React.useState(false);
    const [images, setImages] = React.useState<string[]>([]);

    React.useEffect(() => {
        // Load existing images from record
        if (record?.images && Array.isArray(record.images)) {
            setImages(record.images);
        }
    }, [record?.images]);

    const handleImageUpload = async (files: File[]) => {
        setUploading(true);
        try {
            // For now, create local URLs - in production this would upload to storage
            const newImageUrls = files.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImageUrls]);
            
            // TODO: Implement actual upload to Supabase storage
            // const uploadedUrls = await uploadToSupabase(files);
            // setImages(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Product Images
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {/* Upload Area */}
                <Box
                    component="label"
                    sx={{
                        display: 'block',
                        p: 2,
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        textAlign: 'center',
                        cursor: 'pointer',
                        mb: 2,
                        backgroundColor: 'action.hover',
                        '&:hover': {
                            backgroundColor: 'action.selected',
                        },
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => {
                            if (e.target.files) {
                                handleImageUpload(Array.from(e.target.files));
                            }
                        }}
                    />
                    <PhotoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" color="primary">
                        {uploading ? 'Uploading...' : 'Click to upload images'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        JPG, PNG, GIF up to 10MB each
                    </Typography>
                </Box>

                {/* Image Gallery */}
                {images.length > 0 ? (
                    <Grid container spacing={2}>
                        {images.map((imageSrc, index) => (
                            <Grid item xs={6} sm={3} key={index}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        backgroundColor: 'grey.100',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={imageSrc}
                                        alt={`Product ${index + 1}`}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => window.open(imageSrc, '_blank')}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            borderRadius: '50%',
                                            minWidth: '24px',
                                            minHeight: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(index);
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'white', fontSize: '12px' }}
                                        >
                                            ×
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontStyle: 'italic',
                        }}
                    >
                        No images uploaded yet. Use the upload area above to add product photos.
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Enhanced Principal Display
const EnhancedPrincipalDisplay = () => {
    const record = useRecordContext<Product>();

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Principal/Brand Information
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            backgroundColor: 'grey.50',
                        }}
                    >
                        <BusinessIcon color="disabled" />
                    </Box>
                    <Box>
                        <ReferenceField
                            source="principalId"
                            reference="settings"
                            link={false}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                <TextField source="label" />
                            </Typography>
                        </ReferenceField>
                        <Typography variant="body2" color="text.secondary">
                            Food Service Principal
                        </Typography>
                    </Box>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                >
                    Principal branding, contact information, and product
                    portfolio details will be enhanced here in future updates.
                </Typography>
            </CardContent>
        </Card>
    );
};

export const ProductShow = () => {
    return (
        <Show actions={<ProductShowActions />}>
            <SimpleShowLayout>
                <RelationshipBreadcrumbs 
                    currentEntity="product"
                    showContext={true}
                />
                <ProductHeader />
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <ProductDetails />
                        <RelatedOpportunities />
                        <PriceHistory />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <EnhancedPrincipalDisplay />
                        <ProductImages />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};
