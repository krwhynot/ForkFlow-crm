import { faker } from '@faker-js/faker';
import { Product } from '../../../types';
import { Db } from './types';
import { weightedBoolean } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateProducts = (db: Db): Product[] => {
    const products: Product[] = [];

    // Get principal settings for relationships (with safety checks)
    const principalSettings =
        db.settings?.filter(s => s.category === 'principal' && s.active) || [];

    if (principalSettings.length === 0) {
        console.warn('No principal settings found for product generation');
        return products;
    }

    // Food service product categories with realistic items
    const productCategories = {
        Dairy: {
            items: [
                'Whole Milk',
                'Heavy Cream',
                'Butter Unsalted',
                'Cheddar Cheese Block',
                'Mozzarella Shredded',
                'Greek Yogurt',
                'Sour Cream',
                'Cream Cheese',
                'Parmesan Grated',
                'American Cheese Slices',
            ],
            unitOfMeasures: ['gallon', 'quart', 'lb', 'case'],
            packageSizes: [
                '1 gallon',
                '4/1 gallon',
                '36/1 lb',
                '12/8 oz',
                '6/5 lb',
            ],
        },
        Meat: {
            items: [
                'Ground Beef 80/20',
                'Chicken Breast Boneless',
                'Pork Tenderloin',
                'Bacon Strips',
                'Italian Sausage',
                'Ribeye Steaks',
                'Turkey Deli Sliced',
                'Ham Spiral Cut',
                'Salmon Fillets',
            ],
            unitOfMeasures: ['lb', 'case', 'each'],
            packageSizes: [
                '10 lb case',
                '4/5 lb',
                '2/8 lb',
                '12/1 lb',
                '6/2 lb',
            ],
        },
        Produce: {
            items: [
                'Romaine Lettuce',
                'Roma Tomatoes',
                'Yellow Onions',
                'Russet Potatoes',
                'Baby Carrots',
                'Bell Peppers Mixed',
                'Broccoli Crowns',
                'Celery Hearts',
                'Mushrooms Button',
                'Avocados',
            ],
            unitOfMeasures: ['lb', 'case', 'each', 'bag'],
            packageSizes: [
                '24 ct case',
                '25 lb bag',
                '50 lb case',
                '12/1 lb',
                '5 lb bag',
            ],
        },
        Frozen: {
            items: [
                'French Fries Straight Cut',
                'Chicken Wings',
                'Pizza Dough Balls',
                'Mixed Vegetables',
                'Fish Fillets Breaded',
                'Onion Rings Battered',
                'Garlic Bread',
                'Fruit Mix Berry',
                'Hash Browns',
            ],
            unitOfMeasures: ['case', 'bag', 'lb'],
            packageSizes: [
                '6/5 lb',
                '4/5 lb',
                '12/2 lb',
                '20 lb case',
                '8/3 lb',
            ],
        },
        'Dry Goods': {
            items: [
                'All Purpose Flour',
                'White Rice Long Grain',
                'Pasta Penne',
                'Black Beans Canned',
                'Olive Oil Extra Virgin',
                'Salt Iodized',
                'Sugar Granulated',
                'Baking Powder',
                'Vanilla Extract',
            ],
            unitOfMeasures: ['lb', 'case', 'gallon'],
            packageSizes: [
                '50 lb bag',
                '24/1 lb',
                '6/1 gallon',
                '12/32 oz',
                '4/1 gallon',
            ],
        },
        Beverages: {
            items: [
                'Coffee Grounds Colombian',
                'Orange Juice',
                'Coca Cola Syrup',
                'Iced Tea Mix',
                'Bottled Water',
                'Energy Drink Mix',
                'Lemonade Concentrate',
                'Hot Chocolate Mix',
            ],
            unitOfMeasures: ['case', 'gallon', 'bag', 'box'],
            packageSizes: [
                '24/16 oz',
                '4/1 gallon',
                '6/5 lb',
                '12/32 oz',
                '20 lb bag',
            ],
        },
        Cleaning: {
            items: [
                'Dish Soap Commercial',
                'Sanitizer Solution',
                'Paper Towels',
                'Toilet Paper',
                'Trash Bags Heavy Duty',
                'Floor Cleaner',
                'Glass Cleaner',
                'Degreaser Kitchen',
            ],
            unitOfMeasures: ['case', 'gallon', 'each'],
            packageSizes: [
                '4/1 gallon',
                '12 roll case',
                '24 roll case',
                '100 ct box',
                '6/32 oz',
            ],
        },
    };

    // Generate products for each principal
    principalSettings.forEach((principal, principalIndex) => {
        const productsPerPrincipal = 15 + Math.floor(Math.random() * 25); // 15-40 products per principal

        for (let i = 0; i < productsPerPrincipal; i++) {
            const categoryNames = Object.keys(productCategories);
            const selectedCategory = faker.helpers.arrayElement(categoryNames);
            const categoryData =
                productCategories[
                    selectedCategory as keyof typeof productCategories
                ];

            const productName = faker.helpers.arrayElement(categoryData.items);
            const unitOfMeasure = faker.helpers.arrayElement(
                categoryData.unitOfMeasures
            );
            const packageSize = faker.helpers.arrayElement(
                categoryData.packageSizes
            );

            // Generate realistic SKU based on principal and product
            const principalCode = principal.key.toUpperCase().slice(0, 3);
            const categoryCode = selectedCategory.slice(0, 3).toUpperCase();
            const productCode = String(i + 1).padStart(4, '0');
            const sku = `${principalCode}-${categoryCode}-${productCode}`;

            // Generate realistic pricing based on category
            const basePrices = {
                Dairy: [8, 45],
                Meat: [15, 120],
                Produce: [12, 85],
                Frozen: [18, 95],
                'Dry Goods': [5, 75],
                Beverages: [8, 65],
                Cleaning: [12, 55],
            };
            const [minPrice, maxPrice] =
                basePrices[selectedCategory as keyof typeof basePrices];
            const price = faker.number.float({
                min: minPrice,
                max: maxPrice,
                multipleOf: 0.01,
            });

            // Create detailed description
            const descriptions = [
                `Premium quality ${productName.toLowerCase()} sourced from trusted suppliers.`,
                `Restaurant grade ${productName.toLowerCase()} perfect for high-volume food service.`,
                `Commercial ${productName.toLowerCase()} designed for professional kitchens.`,
                `Fresh ${productName.toLowerCase()} with consistent quality and reliable delivery.`,
                `Industry standard ${productName.toLowerCase()} meeting all food safety requirements.`,
            ];

            const productId = principalIndex * 50 + i + 1;

            products.push({
                id: productId,
                name: productName,
                principalId: principal.id,
                category: selectedCategory,
                description: weightedBoolean(0.8)
                    ? faker.helpers.arrayElement(descriptions)
                    : undefined,
                sku,
                unitOfMeasure,
                packageSize: weightedBoolean(0.9) ? packageSize : undefined,
                price,
                active: weightedBoolean(0.95), // 95% of products are active
                createdAt: safeDate(
                    new Date(
                        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
                    )
                ), // Random date within last year
                updatedAt: safeDate(
                    new Date(
                        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                    )
                ), // Random date within last month
                createdBy: faker.helpers.arrayElement([
                    'john.smith@forkflow.com',
                    'sarah.johnson@forkflow.com',
                    'mike.davis@forkflow.com',
                    'lisa.wilson@forkflow.com',
                ]),
            } as Product);
        }
    });

    return products;
};
