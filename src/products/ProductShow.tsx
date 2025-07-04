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
import { Product } from '../types';
import { Card } from '../components/Card/Card';
import { CardContent } from '../components/Card/CardContent';
import { Grid } from '@/components/ui-kit';
import { Typography } from '../components/Typography/Typography';
import { Chip } from '../components/DataDisplay/Chip';
import { Box } from '../components/Layout/Box';
import { Divider } from '@/components/ui-kit';
import { Stack } from '../components/Layout/Stack';
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
        <Card className="mb-2">
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                        <Typography
                            variant="h4"
                            component="h1"
                            className="mb-2"
                        >
                            <TextField source="name" variant="h4" />
                        </Typography>
                        <Stack direction="row" spacing={1} className="mb-2">
                            <Chip
                                label={<TextField source="category" />}
                                className="border-blue-500 text-blue-500"
                            />
                            <BooleanField source="active" />
                            {/* Active Status Chip */}
                            {record?.active ? (
                                <Chip
                                    label="Active"
                                    className="bg-green-500 text-white"
                                    size="small"
                                />
                            ) : (
                                <Chip
                                    label="Inactive"
                                    className="bg-gray-200 text-gray-700"
                                    size="small"
                                />
                            )}
                        </Stack>
                        <Typography variant="body1" className="text-gray-500">
                            <TextField source="description" />
                        </Typography>
                    </div>
                    <div className="text-left md:text-right">
                        <PriceField
                            variant="h3"
                            color="primary.main"
                            className="mb-1"
                        />
                        <Typography variant="body2" className="text-gray-500">
                            per <TextField source="unitOfMeasure" />
                        </Typography>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ProductDetails = () => {
    const record = useRecordContext();

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" className="mb-2">
                    Product Details
                </Typography>
                <Divider className="mb-2" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
                            >
                                SKU
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="sku" />
                            </Typography>
                        </Box>

                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
                            >
                                Package Size
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="packageSize" />
                            </Typography>
                        </Box>

                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
                            >
                                Unit of Measure
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="unitOfMeasure" />
                            </Typography>
                        </Box>
                    </div>

                    <div>
                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
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

                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
                            >
                                Status
                            </Typography>
                            <BooleanField source="active" />
                            {/* Active Status Display */}
                            {record?.active ? (
                                <Typography
                                    variant="body1"
                                    className="text-green-600"
                                >
                                    Active
                                </Typography>
                            ) : (
                                <Typography
                                    variant="body1"
                                    className="text-gray-500"
                                >
                                    Inactive
                                </Typography>
                            )}
                        </Box>

                        <Box className="mb-2">
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500 mb-1"
                            >
                                Created By
                            </Typography>
                            <Typography variant="body1">
                                <TextField source="createdBy" />
                            </Typography>
                        </Box>
                    </div>
                </div>
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
    <Card className="mb-2">
        <CardContent>
            <Box className="flex items-center mb-2">
                <TrendingUpIcon className="mr-1 text-blue-500" />
                <Typography variant="h6" className="font-semibold">
                    Price History
                </Typography>
            </Box>
            <Divider className="mb-2" />
            <Typography variant="body2" className="text-gray-500 italic">
                Historical pricing data and trends will be displayed here. Track
                price changes over time, seasonal variations, and market trends
                for this product.
            </Typography>
            <Box className="mt-2 h-52 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Typography variant="body2" className="text-gray-500">
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
        <Card className="mb-2">
            <CardContent>
                <Box className="flex items-center mb-2">
                    <PhotoIcon className="mr-1 text-blue-500" />
                    <Typography variant="h6" className="font-semibold">
                        Product Images
                    </Typography>
                </Box>
                <Divider className="mb-2" />

                {/* Upload Area */}
                <Box
                    component="label"
                    className="block p-2 border-2 border-dashed border-blue-500 rounded-lg text-center cursor-pointer mb-2 bg-gray-50 hover:bg-gray-100"
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={e => {
                            if (e.target.files) {
                                handleImageUpload(Array.from(e.target.files));
                            }
                        }}
                    />
                    <PhotoIcon className="text-5xl text-blue-500 mb-1" />
                    <Typography variant="body1" className="text-blue-500">
                        {uploading ? 'Uploading...' : 'Click to upload images'}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                        JPG, PNG, GIF up to 10MB each
                    </Typography>
                </Box>

                {/* Image Gallery */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((imageSrc, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                            >
                                <img
                                    src={imageSrc}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() =>
                                        window.open(imageSrc, '_blank')
                                    }
                                />
                                <div
                                    className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleRemoveImage(index);
                                    }}
                                >
                                    <Typography className="text-white text-xs">
                                        ×
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Box className="p-3 text-center text-gray-500 italic">
                        No images uploaded yet. Use the upload area above to add
                        product photos.
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
        <Card className="mb-2">
            <CardContent>
                <Box className="flex items-center mb-2">
                    <BusinessIcon className="mr-1 text-blue-500" />
                    <Typography variant="h6" className="font-semibold">
                        Principal/Brand Information
                    </Typography>
                </Box>
                <Divider className="mb-2" />

                <Box className="flex items-center mb-2">
                    <Box className="w-15 h-15 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mr-2 bg-gray-50">
                        <BusinessIcon className="text-gray-400" />
                    </Box>
                    <Box>
                        <ReferenceField
                            source="principalId"
                            reference="settings"
                            link={false}
                        >
                            <Typography variant="h6" className="font-semibold">
                                <TextField source="label" />
                            </Typography>
                        </ReferenceField>
                        <Typography variant="body2" className="text-gray-500">
                            Food Service Principal
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body2" className="text-gray-500 italic">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ProductDetails />
                        <RelatedOpportunities />
                        <PriceHistory />
                    </div>
                    <div className="lg:col-span-1">
                        <EnhancedPrincipalDisplay />
                        <ProductImages />
                    </div>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};
