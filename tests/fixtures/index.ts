// Re-export all test fixtures and factories for easy importing

export * from './organizationFactory';

// Additional test data
export const testUsers = {
  admin: {
    email: 'admin@forkflow.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
  },
  broker: {
    email: 'broker@forkflow.com',
    password: 'broker123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'broker',
  },
  demo: {
    email: 'demo@forkflow.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
  },
};

export const testContacts = {
  basic: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    title: 'General Manager',
  },
  withAvatar: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@restaurant.com',
    phone: '(555) 987-6543',
    title: 'Head Chef',
    avatar: { src: 'https://via.placeholder.com/100' },
  },
};

export const testDeals = {
  basic: {
    name: 'Q1 Produce Contract',
    amount: 15000,
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: '2024-03-31',
  },
  large: {
    name: 'Annual Protein Supply Agreement',
    amount: 250000,
    stage: 'negotiation',
    probability: 90,
    expectedCloseDate: '2024-02-15',
  },
};

// Test environment configuration
export const testConfig = {
  baseUrl: 'http://localhost:5173',
  timeout: {
    default: 10000,
    navigation: 15000,
    action: 5000,
  },
  retry: {
    maxAttempts: 3,
    delay: 1000,
  },
  viewport: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  },
  coordinates: {
    sanFrancisco: { latitude: 37.7749, longitude: -122.4194 },
    newYork: { latitude: 40.7128, longitude: -74.0060 },
    chicago: { latitude: 41.8781, longitude: -87.6298 },
  },
};