import { faker } from '@faker-js/faker';
import { Organization } from '../../../types';
import { Db } from './types';
import { weightedBoolean } from './utils';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateOrganizations = (db: Db): Organization[] => {
    // Get settings for relationships (with safety checks)
    const prioritySettings =
        db.settings?.filter(s => s.category === 'priority' && s.active) || [];
    const segmentSettings =
        db.settings?.filter(s => s.category === 'segment' && s.active) || [];
    const distributorSettings =
        db.settings?.filter(s => s.category === 'distributor' && s.active) ||
        [];

    // Sample organization names for food service businesses
    const organizationNames = [
        'Bella Vista Restaurant',
        'Metro Grocery Chain',
        'Golden Fork Bistro',
        'Fresh Market Foods',
        'Riverside Dining',
        'Urban Kitchen',
        'Sunshine Cafe',
        'Harbor View Restaurant',
        'Mountain Peak Eatery',
        'City Square Deli',
        'Ocean Breeze Seafood',
        'Garden Gate Restaurant',
        'Prairie Wind Steakhouse',
        'Moonlight Diner',
        'Silver Spoon Catering',
        'Crossroads Grill',
        'Maple Street Bakery',
        'Cornerstone Cafe',
        'Sunset Boulevard Restaurant',
        'Pine Tree Tavern',
        'Crystal Lake Resort',
        'Valley View Country Club',
        'Harmony Health Foods',
        'Emerald City Bistro',
        'Copper Canyon Restaurant',
    ];

    const cities = [
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
        'San Antonio',
        'San Diego',
        'Dallas',
        'San Jose',
        'Austin',
        'Jacksonville',
        'Fort Worth',
        'Columbus',
        'Charlotte',
        'Indianapolis',
        'San Francisco',
        'Seattle',
        'Denver',
        'Boston',
    ];

    const states = [
        'NY',
        'CA',
        'IL',
        'TX',
        'AZ',
        'PA',
        'TX',
        'CA',
        'TX',
        'CA',
        'TX',
        'FL',
        'TX',
        'OH',
        'NC',
        'IN',
        'CA',
        'WA',
        'CO',
        'MA',
    ];

    const streetPrefixes = [
        'Main St',
        'Oak Ave',
        'Park Blvd',
        'First St',
        'Broadway',
        'Market St',
        'Center Ave',
        'Union St',
    ];
    const accountManagers = [
        'john.smith@forkflow.com',
        'sarah.johnson@forkflow.com',
        'mike.davis@forkflow.com',
        'lisa.wilson@forkflow.com',
        'david.brown@forkflow.com',
        'emily.jones@forkflow.com',
        'chris.miller@forkflow.com',
        'amanda.taylor@forkflow.com',
    ];

    return organizationNames.map((name, index) => {
        const cityIndex = index % cities.length;
        const id = index + 1;

        return {
            id,
            name,
            priorityId:
                weightedBoolean(0.7) && prioritySettings.length > 0
                    ? faker.helpers.arrayElement(prioritySettings).id
                    : undefined,
            segmentId:
                weightedBoolean(0.8) && segmentSettings.length > 0
                    ? faker.helpers.arrayElement(segmentSettings).id
                    : undefined,
            distributorId:
                weightedBoolean(0.6) && distributorSettings.length > 0
                    ? faker.helpers.arrayElement(distributorSettings).id
                    : undefined,
            accountManager: faker.helpers.arrayElement(accountManagers),
            address: `${Math.floor(Math.random() * 9999) + 1} ${faker.helpers.arrayElement(streetPrefixes)}`,
            city: cities[cityIndex],
            state: states[cityIndex],
            zipCode: String(Math.floor(Math.random() * 90000) + 10000),
            phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            website: weightedBoolean(0.7)
                ? `https://www.${name
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .replace(/[^a-z0-9]/g, '')}.com`
                : undefined,
            notes: weightedBoolean(0.4)
                ? `Key account in the ${cities[cityIndex]} market. ${faker.helpers.arrayElement(
                      [
                          'Strong relationship with management team.',
                          'Focus on premium product lines.',
                          'Price-sensitive buyer, needs competitive pricing.',
                          'Expanding to multiple locations.',
                          'Seasonal business with peak summer demand.',
                          'Long-term partnership opportunity.',
                          'New management team, building relationships.',
                          'High-volume potential customer.',
                      ]
                  )}`
                : undefined,
            latitude: 40.7128 + (Math.random() - 0.5) * 20, // Rough US latitude range
            longitude: -74.006 + (Math.random() - 0.5) * 60, // Rough US longitude range
            createdAt: safeDate(
                new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
            ), // Random date within last year
            updatedAt: safeDate(
                new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            ), // Random date within last month
            createdBy: faker.helpers.arrayElement(accountManagers),
        } as Organization;
    });
};
