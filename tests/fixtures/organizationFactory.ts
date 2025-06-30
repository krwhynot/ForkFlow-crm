import { Organization } from '../../src/types';

/**
 * Interface for test organization data variations.
 */
export interface OrganizationTestData {
  basic: Partial<Organization>;
  complete: Partial<Organization>;
  minimal: Partial<Organization>;
  edge: Partial<Organization>[];
  invalid: Partial<Organization>[];
}

/**
 * Deterministic, realistic food-service organization test data.
 */
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
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
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
    notes: 'Premium seafood restaurant focusing on sustainable catch.',
    latitude: 34.0194,
    longitude: -118.4912,
    priorityId: 1,
    segmentId: 1,
    distributorId: 1,
    createdAt: '2024-01-02T11:00:00.000Z',
    updatedAt: '2024-01-02T11:00:00.000Z',
  },
  minimal: {
    name: "Joe's Corner Deli",
    address: '789 Pine Street',
    city: 'Portland',
    state: 'OR',
    zipCode: '97205',
    createdAt: '2024-01-03T12:00:00.000Z',
    updatedAt: '2024-01-03T12:00:00.000Z',
  },
  edge: [
    {
      name: 'A', // Shortest name
      address: '',
      city: '',
      state: 'C',
      zipCode: '1',
      createdAt: '2024-01-04T13:00:00.000Z',
      updatedAt: '2024-01-04T13:00:00.000Z',
    },
    {
      name: 'Z'.repeat(255), // Longest name
      address: '9'.repeat(255),
      city: 'Y'.repeat(100),
      state: 'CA',
      zipCode: '99999',
      createdAt: '2024-01-05T14:00:00.000Z',
      updatedAt: '2024-01-05T14:00:00.000Z',
    },
    {
      name: 'Emoji 🍕🍔',
      address: 'Unicode Café',
      city: 'München',
      state: 'BY',
      zipCode: '80331',
      createdAt: '2024-01-06T15:00:00.000Z',
      updatedAt: '2024-01-06T15:00:00.000Z',
    },
  ],
  invalid: [
    {
      name: '', // Missing required
      address: '999 Invalid Street',
      city: 'Test City',
      state: 'XX', // Invalid state
      zipCode: '12345-invalid', // Invalid format
      phone: 'not-a-phone-number',
      website: 'invalid-url',
      accountManager: 'not-an-email',
      createdAt: '2024-01-07T16:00:00.000Z',
      updatedAt: '2024-01-07T16:00:00.000Z',
    },
    {
      name: 'Valid Name',
      address: '', // Missing address
      city: '',
      state: '',
      zipCode: '',
      createdAt: '2024-01-08T17:00:00.000Z',
      updatedAt: '2024-01-08T17:00:00.000Z',
    },
    {
      name: 'Negative GPS',
      latitude: -999,
      longitude: -999,
      createdAt: '2024-01-09T18:00:00.000Z',
      updatedAt: '2024-01-09T18:00:00.000Z',
    },
  ],
};

/**
 * Factory for creating test organizations for E2E tests.
 */
export class OrganizationFactory {
  /**
   * Create a deterministic, basic valid organization.
   */
  static create(overrides: Partial<Organization> = {}): Partial<Organization> {
    return { ...organizationTestData.basic, ...overrides };
  }

  /**
   * Create an array of deterministic valid organizations.
   */
  static createMany(count: number, overrides: Partial<Organization> = {}): Partial<Organization>[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        name: `${organizationTestData.basic.name} ${i + 1}`,
        ...overrides,
      })
    );
  }

  /**
   * Create a valid organization with explicit GPS coordinates.
   */
  static createWithGPS(lat: number, lng: number, overrides: Partial<Organization> = {}): Partial<Organization> {
    return this.create({ latitude: lat, longitude: lng, ...overrides });
  }

  /**
   * Create a deterministic invalid organization (missing/invalid fields).
   */
  static createInvalid(): Partial<Organization> {
    // Always return the first invalid case for repeatability
    return { ...organizationTestData.invalid[0] };
  }

  /**
   * Utility to clean up created organizations by IDs (stub for now).
   * @param ids Array of organization IDs to clean up
   */
  static async cleanupCreated(ids: number[]): Promise<void> {
    // Implement actual cleanup in helpers (API/db call)
    // This is a stub for E2E infra
    return;
  }
}

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