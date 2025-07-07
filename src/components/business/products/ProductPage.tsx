import React from 'react';
import {
    CubeIcon,
    PlusIcon,
    TagIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../../core/cards';
import { Typography } from '../../core/typography';
import { Button } from '../../core/buttons';
import { QuickActionButton } from '../../core/patterns';

interface ProductPageProps {
    title?: string;
    className?: string;
}

/**
 * Product Page - Placeholder component for future product catalog management
 */
export const ProductPage: React.FC<ProductPageProps> = ({
    title = 'Products',
    className
}) => {
    const productFeatures = [
        {
            icon: <CubeIcon className="h-8 w-8 text-primary-500" />,
            title: 'Product Catalog',
            description: 'Comprehensive database of all your food products with detailed specifications',
            status: 'In Development'
        },
        {
            icon: <TagIcon className="h-8 w-8 text-warm-500" />,
            title: 'Category Management',
            description: 'Organize products by category, brand, supplier, and custom attributes',
            status: 'Planned'
        },
        {
            icon: <CurrencyDollarIcon className="h-8 w-8 text-success-500" />,
            title: 'Pricing Management',
            description: 'Track pricing across different customers and market segments',
            status: 'Coming Soon'
        },
        {
            icon: <ChartBarIcon className="h-8 w-8 text-accent-500" />,
            title: 'Sales Analytics',
            description: 'Analyze product performance and identify top-selling items',
            status: 'Future Release'
        },
        {
            icon: <ShoppingCartIcon className="h-8 w-8 text-secondary-500" />,
            title: 'Order Integration',
            description: 'Connect products with customer orders and sales opportunities',
            status: 'Roadmap'
        }
    ];

    const productCategories = [
        { name: 'Dairy Products', count: '--', color: 'bg-blue-100 text-blue-700' },
        { name: 'Fresh Produce', count: '--', color: 'bg-green-100 text-green-700' },
        { name: 'Meat & Poultry', count: '--', color: 'bg-red-100 text-red-700' },
        { name: 'Frozen Foods', count: '--', color: 'bg-cyan-100 text-cyan-700' },
        { name: 'Beverages', count: '--', color: 'bg-orange-100 text-orange-700' },
        { name: 'Bakery Items', count: '--', color: 'bg-yellow-100 text-yellow-700' }
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <CubeIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Manage your product catalog and track sales performance
                                </Typography>
                            </div>
                        </div>
                        
                        <QuickActionButton
                            label="Add Product"
                            icon={<PlusIcon className="h-4 w-4" />}
                            onClick={() => console.log('Add product')}
                            variant="primary"
                            size="sm"
                            disabled
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Under Construction Notice */}
            <Card>
                <CardContent className="text-center py-16">
                    <CubeIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <Typography variant="h5" className="text-gray-600 mb-4">
                        Product Catalog Module In Development
                    </Typography>
                    <Typography variant="body1" className="text-gray-500 mb-8 max-w-2xl mx-auto">
                        We're building a comprehensive product management system tailored for food brokers. 
                        This will include detailed product specifications, pricing management, category organization, 
                        and integration with your sales opportunities. The product catalog will be available soon.
                    </Typography>
                    
                    <div className="flex justify-center space-x-4">
                        <Button variant="outlined" disabled>
                            Browse Catalog
                        </Button>
                        <Button variant="outlined" disabled>
                            Manage Categories
                        </Button>
                        <Button variant="outlined" disabled>
                            Product Analytics
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Product Categories Preview */}
            <div>
                <Typography variant="h6" className="text-secondary-800 mb-4">
                    Product Categories (Preview)
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productCategories.map((category, index) => (
                        <Card key={index} className="border-2 border-dashed border-gray-200 opacity-60">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Typography variant="subtitle2" className="text-secondary-800 mb-1">
                                            {category.name}
                                        </Typography>
                                        <Typography variant="caption" className="text-gray-500">
                                            {category.count} products
                                        </Typography>
                                    </div>
                                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${category.color}`}>
                                        Coming Soon
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Planned Features */}
            <div>
                <Typography variant="h6" className="text-secondary-800 mb-4">
                    Planned Features
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productFeatures.map((feature, index) => (
                        <Card key={index} className="border-2 border-dashed border-gray-200">
                            <CardContent className="text-center py-8">
                                <div className="mb-4">
                                    {feature.icon}
                                </div>
                                <Typography variant="h6" className="text-secondary-800 mb-2">
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 mb-4">
                                    {feature.description}
                                </Typography>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                                    {feature.status}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sample Product Data Structure */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" className="text-secondary-800">
                        Product Data Structure (Preview)
                    </Typography>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <Typography variant="body2" className="font-mono text-gray-700">
                            {`{
  "product": {
    "id": "prod_001",
    "name": "Premium Organic Whole Milk",
    "category": "Dairy Products",
    "brand": "FarmFresh Organics",
    "sku": "FF-MILK-001",
    "description": "Fresh organic whole milk from grass-fed cows",
    "specifications": {
      "size": "1 Gallon",
      "packaging": "Glass Bottle",
      "shelf_life": "14 days",
      "storage": "Refrigerated"
    },
    "pricing": {
      "wholesale": 4.99,
      "suggested_retail": 6.99,
      "bulk_discount": "5% for 50+ units"
    },
    "supplier": {
      "name": "Green Valley Dairy",
      "contact": "supplier@greenvalley.com"
    },
    "certifications": ["USDA Organic", "Non-GMO"]
  }
}`}
                        </Typography>
                    </div>
                    <Typography variant="caption" className="text-gray-500 mt-2 block">
                        * This is a preview of the data structure that will be used for product management
                    </Typography>
                </CardContent>
            </Card>

            {/* Placeholder Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Total Products
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Product Categories
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Top Performing
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Suppliers
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProductPage;