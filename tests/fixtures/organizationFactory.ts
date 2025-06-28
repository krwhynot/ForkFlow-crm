import { Organization } from '../../src/types';

export interface OrganizationTestData {
  basic: Partial<Organization>;
  complete: Partial<Organization>;
  invalid: Partial<Organization>;
  minimal: Partial<Organization>;
}

export const organizationTestData: OrganizationTestData = {
  basic: {
    name: 'Golden Gate Restaurant',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(415) 555-0123',
    website: 'https://goldengaterestaurant.com',
    accountManager: 'john.smith@forkflow.com',
  },
  
  complete: {
    name: 'Pacific Coast Seafood & Grill',
    address: '456 Ocean Boulevard',
    city: 'Santa Monica',
    state: 'CA',
    zipCode: '90405',
    phone: '(310) 555-0456',
    website: 'https://pacificcoastseafood.com',
    accountManager: 'sarah.jones@forkflow.com',
    notes: 'Premium seafood restaurant focusing on sustainable catch. High-volume location with strong weekend traffic.',
    latitude: 34.0194,
    longitude: -118.4912,
    // These would be actual Setting IDs in a real test environment
    priorityId: 'high-priority-setting-id',
    segmentId: 'fine-dining-segment-id',
    distributorId: 'sysco-distributor-id',
  },
  
  minimal: {
    name: 'Joe\'s Corner Deli',
    address: '789 Pine Street',
    city: 'Portland',
    state: 'OR',
    zipCode: '97205',
  },
  
  invalid: {
    name: '', // Missing required field
    address: '999 Invalid Street',
    city: 'Test City',
    state: 'XX', // Invalid state
    zipCode: '12345-invalid', // Invalid format
    phone: 'not-a-phone-number',
    website: 'invalid-url',
    accountManager: 'not-an-email',
  },
};

export const foodServiceOrganizations = [
  {
    name: 'Bella Vista Italian Kitchen',
    address: '1847 Union Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94123',
    phone: '(415) 555-1847',
    website: 'https://bellavistaitalian.com',
    notes: 'Family-owned Italian restaurant, 3rd generation. Strong pasta and wine program.',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    name: 'Metro Diner & Breakfast',
    address: '2156 Broadway',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94612',
    phone: '(510) 555-2156',
    website: 'https://metrodineroak.com',
    notes: 'High-volume breakfast and lunch spot. Known for large portions and quick service.',
    latitude: 37.8044,
    longitude: -122.2712,
  },
  {
    name: 'The Steakhouse Premium',
    address: '789 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    phone: '(415) 555-0789',
    website: 'https://steakhousepremium.com',
    notes: 'Upscale steakhouse targeting business clientele. Premium beef program with extensive wine list.',
    latitude: 37.7849,
    longitude: -122.4094,
  },
  {
    name: 'Campus Cafe & Catering',
    address: '345 College Avenue',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94704',
    phone: '(510) 555-0345',
    website: 'https://campuscafecatering.com',
    notes: 'Casual dining with large catering operation. Serves UC Berkeley campus events.',
    latitude: 37.8715,
    longitude: -122.2730,
  },
  {
    name: 'Fusion Street Food Truck',
    address: 'Various Locations',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110',
    phone: '(408) 555-FOOD',
    website: 'https://fusionstreetfood.com',
    notes: 'Mobile food service. Korean-Mexican fusion menu. High social media presence.',
    latitude: 37.3382,
    longitude: -121.8863,
  },
];

export class OrganizationFactory {
  static create(overrides: Partial<Organization> = {}): Partial<Organization> {
    const randomOrg = foodServiceOrganizations[
      Math.floor(Math.random() * foodServiceOrganizations.length)
    ];
    
    return {
      ...randomOrg,
      accountManager: 'john.smith@forkflow.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  }
  
  static createMany(count: number, overrides: Partial<Organization> = {}): Partial<Organization>[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        ...overrides,
        name: `${overrides.name || 'Test Organization'} ${index + 1}`,
      })
    );
  }
  
  static createWithGPS(overrides: Partial<Organization> = {}): Partial<Organization> {
    return this.create({
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1, // SF area coordinates
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      ...overrides,
    });
  }
  
  static createInvalid(field: keyof Organization): Partial<Organization> {
    const base = this.create();
    const invalidValues: Record<string, any> = {
      name: '',
      phone: 'invalid-phone',
      website: 'not-a-url',
      zipCode: '12345-invalid',
      accountManager: 'not-an-email',
      latitude: 200, // Invalid latitude
      longitude: 200, // Invalid longitude
    };
    
    return {
      ...base,
      [field]: invalidValues[field] || 'invalid-value',
    };
  }
}

// Mock settings data for testing
export const mockSettings = {
  priorities: [
    { id: 'priority-1', key: 'high', label: 'High Priority', color: '#ff4444', category: 'priority', active: true, sortOrder: 1 },
    { id: 'priority-2', key: 'medium', label: 'Medium Priority', color: '#ffaa44', category: 'priority', active: true, sortOrder: 2 },
    { id: 'priority-3', key: 'low', label: 'Low Priority', color: '#44ff44', category: 'priority', active: true, sortOrder: 3 },
  ],
  segments: [
    { id: 'segment-1', key: 'fine-dining', label: 'Fine Dining', color: '#8b4513', category: 'segment', active: true, sortOrder: 1 },
    { id: 'segment-2', key: 'casual-dining', label: 'Casual Dining', color: '#4682b4', category: 'segment', active: true, sortOrder: 2 },
    { id: 'segment-3', key: 'quick-service', label: 'Quick Service', color: '#ff6347', category: 'segment', active: true, sortOrder: 3 },
    { id: 'segment-4', key: 'catering', label: 'Catering', color: '#9370db', category: 'segment', active: true, sortOrder: 4 },
  ],
  distributors: [
    { id: 'dist-1', key: 'sysco', label: 'Sysco', color: '#0066cc', category: 'distributor', active: true, sortOrder: 1 },
    { id: 'dist-2', key: 'us-foods', label: 'US Foods', color: '#cc0000', category: 'distributor', active: true, sortOrder: 2 },
    { id: 'dist-3', key: 'performance-food', label: 'Performance Food Group', color: '#009900', category: 'distributor', active: true, sortOrder: 3 },
    { id: 'dist-4', key: 'local-distributor', label: 'Local Distributor', color: '#ff9900', category: 'distributor', active: true, sortOrder: 4 },
  ],
};