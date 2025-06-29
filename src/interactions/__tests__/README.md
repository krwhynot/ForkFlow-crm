# Interaction Tracking Testing Suite

This directory contains comprehensive tests for the Interaction Tracking API implementation, covering unit tests, integration tests, and end-to-end workflows.

## Test Structure

```
__tests__/
├── README.md                          # This documentation
├── setup.ts                          # Test setup and utilities
├── InteractionAPI.test.ts            # API layer unit tests
├── InteractionCreate.test.tsx        # React component tests
├── gpsService.test.ts                # GPS service unit tests
└── e2e/
    └── InteractionWorkflow.e2e.test.ts # End-to-end workflow tests
```

## Test Categories

### 1. Unit Tests

#### InteractionAPI.test.ts
Tests the core interaction API methods including:
- **createInteraction**: Validation, offline queuing, GPS integration
- **updateInteraction**: Data sanitization, performance tracking
- **getCurrentLocation**: GPS acquisition, caching, error handling
- **uploadInteractionAttachment**: File validation, compression, mobile optimization
- **Performance Monitoring**: Metrics tracking for all operations
- **Offline Functionality**: Queue management, sync operations

#### gpsService.test.ts
Tests the GPS service functionality:
- **Location Acquisition**: Success scenarios, error handling, timeouts
- **Caching**: Cache validity, expiration, corruption handling
- **Permission Handling**: Denied, unavailable, timeout scenarios
- **Mobile Optimization**: High accuracy mode, low accuracy warnings
- **Performance**: Cache utilization, redundant call prevention

### 2. Component Tests

#### InteractionCreate.test.tsx
Tests the React component behavior:
- **Form Rendering**: Proper field display, validation messages
- **GPS Integration**: Auto-capture, manual triggers, status indicators
- **Offline Mode**: Offline indicators, queuing notifications
- **User Interactions**: Button clicks, form submission, error handling
- **Mobile Responsiveness**: Touch targets, viewport adaptation

### 3. End-to-End Tests

#### InteractionWorkflow.e2e.test.ts
Tests complete user workflows:
- **Full Interaction Creation**: From form to database with GPS and attachments
- **Offline Scenarios**: Creation, queuing, and automatic sync
- **File Uploads**: Attachment handling, validation, compression
- **Mobile Usage**: Touch interactions, viewport responsiveness
- **Performance Monitoring**: Dashboard access, metrics export
- **Accessibility**: ARIA compliance, keyboard navigation

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Start development server (required for E2E tests)
make start
```

### Unit and Component Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test files
npm test InteractionAPI.test.ts
npm test InteractionCreate.test.tsx
npm test gpsService.test.ts

# Watch mode for development
npm test -- --watch
```

### End-to-End Tests
```bash
# Install Playwright (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (for debugging)
npm run test:e2e -- --headed

# Run specific E2E test
npm run test:e2e -- --grep "Complete Interaction Creation"
```

### All Tests
```bash
# Run complete test suite
npm run test:all
```

## Test Configuration

### Vitest Configuration (vitest.config.ts)
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/interactions/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
      ],
    },
  },
});
```

### Playwright Configuration (playwright.config.ts)
```typescript
export default defineConfig({
  testDir: './src/interactions/__tests__/e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

## Mock Services and Data

### GPS Service Mocking
```typescript
// Success scenario
mockGeolocationSuccess({
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
});

// Error scenario
mockGeolocationError(1, 'Permission denied');
```

### Offline/Online Mode
```typescript
// Simulate offline mode
mockOfflineMode();

// Restore online mode
mockOnlineMode();
```

### File Creation
```typescript
// Create mock file for upload tests
const testFile = createMockFile('test.jpg', 'image/jpeg', 1024);
```

## Test Data Factories

### Interaction Data
```typescript
const interaction = createMockInteraction({
  subject: 'Custom Subject',
  latitude: 37.7749,
  longitude: -122.4194,
});
```

### Organization Data
```typescript
const organization = createMockOrganization({
  name: 'Custom Organization',
  type: 'prospect',
});
```

## Performance Testing

### Measuring Performance
```typescript
const { result, duration } = await measurePerformance(async () => {
  return await dataProvider.createInteraction(params);
});

expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
```

### Waiting for Conditions
```typescript
await waitForCondition(
  () => screen.getByText('Location captured').isVisible(),
  5000 // timeout
);
```

## Coverage Requirements

The test suite aims for:
- **Line Coverage**: > 90%
- **Function Coverage**: > 95%
- **Branch Coverage**: > 85%
- **Statement Coverage**: > 90%

### Key Coverage Areas
1. **API Methods**: All CRUD operations and mobile features
2. **Error Handling**: Network errors, validation failures, GPS issues
3. **Offline Scenarios**: Queuing, sync, conflict resolution
4. **Performance Tracking**: All monitored operations
5. **Mobile Features**: GPS, file upload, responsive design
6. **Accessibility**: ARIA compliance, keyboard navigation

## Debugging Tests

### Debug Unit Tests
```bash
# Run tests with debug info
npm test -- --reporter=verbose

# Debug specific test
npm test -- --grep "should create interaction successfully"
```

### Debug E2E Tests
```bash
# Run in headed mode
npm run test:e2e -- --headed

# Debug with browser dev tools
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace on
```

### Common Debug Scenarios

#### GPS Not Working in Tests
```typescript
// Ensure GPS is properly mocked
beforeEach(() => {
  mockGeolocationSuccess({
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
  });
});
```

#### Offline Mode Not Triggering
```typescript
// Verify offline mode is set before test
beforeEach(() => {
  mockOfflineMode();
  // Verify
  expect(navigator.onLine).toBe(false);
});
```

#### Component Not Rendering
```typescript
// Ensure proper test context
render(
  <TestContext dataProvider={mockDataProvider}>
    <InteractionCreate />
  </TestContext>
);
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Interaction Tracking

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Start dev server
        run: npm run dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:5173
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### Test Organization
1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Clear Test Names**: Use descriptive names that explain the scenario
3. **Setup/Teardown**: Use `beforeEach`/`afterEach` for consistent state
4. **Mock External Dependencies**: Isolate units under test

### Test Data
1. **Use Factories**: Create reusable data factories for consistency
2. **Minimal Data**: Only include necessary fields in test data
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Real-World Scenarios**: Include realistic data patterns

### Assertions
1. **Specific Assertions**: Test exact expected behavior
2. **Error Messages**: Verify error messages are user-friendly
3. **Side Effects**: Test all observable effects of operations
4. **Performance**: Include performance assertions for critical paths

### Maintenance
1. **Keep Tests Updated**: Update tests when features change
2. **Remove Obsolete Tests**: Delete tests for removed features
3. **Review Test Failures**: Investigate and fix flaky tests
4. **Monitor Coverage**: Ensure coverage remains high

## Troubleshooting

### Common Issues

#### Tests Timeout
- Check if development server is running for E2E tests
- Increase timeout values for slow operations
- Verify mock implementations don't introduce delays

#### Flaky Tests
- Ensure proper cleanup between tests
- Add explicit waits for async operations
- Check for race conditions in test setup

#### Coverage Gaps
- Review coverage reports to identify untested code
- Add tests for error paths and edge cases
- Ensure all public methods are tested

### Getting Help
1. Check test logs for specific error messages
2. Review mock implementations for accuracy
3. Verify test environment matches production requirements
4. Consult team documentation for project-specific patterns