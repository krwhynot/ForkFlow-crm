import { CalendarIcon, CubeIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Product {
    id: string;
    name: string;
    category: string;
    principal: string;
    price: number;
    unit: string;
    addedDate: string;
    addedBy: string;
    status: 'active' | 'inactive' | 'pending';
    description: string;
    sku: string;
}

// Mock data - replace with actual hook
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Organic Tomato Sauce',
        category: 'Condiments',
        principal: 'Farm Fresh Foods',
        price: 3.99,
        unit: 'jar',
        addedDate: '2024-01-14T11:20:00Z',
        addedBy: 'John Doe',
        status: 'active',
        description: 'Premium organic tomato sauce made from vine-ripened tomatoes',
        sku: 'FFF-OTS-001'
    },
    {
        id: '2',
        name: 'Artisan Sourdough Bread',
        category: 'Bakery',
        principal: 'Golden Grain Bakery',
        price: 5.49,
        unit: 'loaf',
        addedDate: '2024-01-13T15:30:00Z',
        addedBy: 'Jane Smith',
        status: 'active',
        description: 'Handcrafted sourdough bread with traditional fermentation',
        sku: 'GGB-ASB-002'
    },
    {
        id: '3',
        name: 'Premium Olive Oil',
        category: 'Oils & Vinegars',
        principal: 'Mediterranean Imports',
        price: 12.99,
        unit: 'bottle',
        addedDate: '2024-01-12T09:45:00Z',
        addedBy: 'Bob Wilson',
        status: 'pending',
        description: 'Extra virgin olive oil from Mediterranean olive groves',
        sku: 'MI-POO-003'
    },
    {
        id: '4',
        name: 'Grass-Fed Beef Patties',
        category: 'Meat & Poultry',
        principal: 'Ranch Direct',
        price: 8.99,
        unit: 'lb',
        addedDate: '2024-01-11T14:15:00Z',
        addedBy: 'Alice Brown',
        status: 'active',
        description: '100% grass-fed beef patties, hormone-free',
        sku: 'RD-GFBP-004'
    }
];

const getCategoryColor = (category: string) => {
    const colors = {
        'Condiments': 'bg-red-100 text-red-800',
        'Bakery': 'bg-yellow-100 text-yellow-800',
        'Oils & Vinegars': 'bg-green-100 text-green-800',
        'Meat & Poultry': 'bg-pink-100 text-pink-800',
        'Dairy': 'bg-blue-100 text-blue-800',
        'Produce': 'bg-green-100 text-green-800',
        'Beverages': 'bg-purple-100 text-purple-800',
        'Frozen': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: Product['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(price);
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }
};

export default function RecentProducts() {
    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <CubeIcon className="w-5 h-5 text-indigo-500" />
                        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                            Recent Products
                        </Typography>
                    </div>
                    <Chip className="bg-indigo-100 text-indigo-800 text-xs">
                        {mockProducts.length} New
                    </Chip>
                </div>

                <div className="space-y-3">
                    {mockProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle product click
                                }
                            }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <CubeIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="body2" className="font-medium text-gray-900">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" className="text-xs text-gray-500">
                                        {formatTimeAgo(product.addedDate)}
                                    </Typography>
                                </div>

                                <Typography variant="body2" className="text-gray-600 mb-2 line-clamp-2">
                                    {product.description}
                                </Typography>

                                <div className="flex items-center space-x-2 mb-2">
                                    <TagIcon className="w-4 h-4 text-gray-400" />
                                    <Typography variant="body2" className="text-gray-600">
                                        {product.principal}
                                    </Typography>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Chip className={getCategoryColor(product.category)}>
                                        {product.category}
                                    </Chip>
                                    <Chip className={getStatusColor(product.status)}>
                                        {product.status}
                                    </Chip>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                                        <span className="font-medium text-gray-900">
                                            {formatPrice(product.price)} / {product.unit}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500">SKU: {product.sku}</span>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center space-x-2">
                                    <Avatar
                                        name={product.addedBy}
                                        size="sm"
                                        className="w-5 h-5"
                                    />
                                    <Typography variant="body2" className="text-xs text-gray-500">
                                        Added by {product.addedBy}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View All Products
                    </button>
                </div>
            </div>
        </Card>
    );
} 