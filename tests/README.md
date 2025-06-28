# ForkFlow CRM - End-to-End Testing Suite

This directory contains comprehensive end-to-end tests for the ForkFlow CRM Organization Management interface using Playwright.

## Test Coverage

### Organization Management Tests

1. **CRUD Workflow Tests** (`organizations/crud-workflow.spec.ts`)
   - Create, Read, Update, Delete organization operations
   - Form submission and validation
   - Navigation and redirects
   - Bulk operations
   - Performance benchmarks

2. **Form Validation Tests** (`organizations/form-validation.spec.ts`)
   - Required field validation
   - Format validation (phone, email, URL, ZIP)
   - Field length limits
   - Real-time validation
   - GPS coordinate validation
   - Dropdown selections
   - Form accessibility

3. **Search and Filter Tests** (`organizations/search-filter.spec.ts`)
   - Text search across multiple fields
   - Priority, segment, and distributor filters
   - Geographic filters (city, state, ZIP)
   - Relationship filters (contacts, opportunities)
   - Date range filters
   - Multiple filter combinations
   - Filter UI and performance

4. **Mobile Responsive Tests** (`organizations/mobile-responsive.spec.ts`)
   - Mobile device compatibility (iPhone, Android)
   - Tablet device compatibility (iPad)
   - Touch interactions and gesture support
   - Responsive form layouts
   - Mobile navigation patterns
   - Orientation changes
   - Cross-device consistency

5. **Visual Regression Tests** (`organizations/visual-regression.spec.ts`)
   - Screenshot comparisons for UI consistency
   - Component visual states
   - Theme variations (light/dark)
   - Mobile and tablet layouts
   - Error and loading states
   - Cross-browser visual consistency

6. **Error Handling Tests** (`organizations/error-handling.spec.ts`)
   - Network error scenarios (timeouts, 500 errors, offline)
   - Data validation edge cases
   - Concurrency and race conditions
   - Resource limits and performance edge cases
   - Browser compatibility issues
   - GPS and geolocation errors

7. **Accessibility Tests** (`organizations/accessibility.spec.ts`)
   - WCAG 2.1 AA compliance
   - Keyboard navigation support
   - Screen reader compatibility
   - Focus management
   - Color contrast requirements
   - Touch target sizes (44px minimum)
   - ARIA attributes and labels

8. **Performance Tests** (`organizations/performance.spec.ts`)
   - Page load performance
   - Form interaction speed
   - Search and filter performance
   - Memory usage monitoring
   - Network optimization
   - Rendering performance

## Test Structure

```
tests/
├── fixtures/           # Test data factories and mock data
│   ├── index.ts        # Main exports
│   └── organizationFactory.ts  # Organization test data
├── helpers/            # Test helper functions and utilities
│   ├── index.ts        # Helper exports
│   ├── organizationHelpers.ts  # Organization-specific helpers
│   └── testUtils.ts    # General test utilities
├── setup/              # Global test setup and teardown
│   ├── global-setup.ts    # Pre-test initialization
│   └── global-teardown.ts # Post-test cleanup
└── organizations/      # Organization management tests
    ├── crud-workflow.spec.ts
    ├── form-validation.spec.ts
    ├── search-filter.spec.ts
    ├── mobile-responsive.spec.ts
    ├── visual-regression.spec.ts
    ├── error-handling.spec.ts
    ├── accessibility.spec.ts
    └── performance.spec.ts
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# View test reports
npm run test:e2e:report
```

### Organization-Specific Tests

```bash
# Run all organization tests
npm run test:e2e:organizations

# Run specific test suites
npm run test:e2e:organizations:crud
npm run test:e2e:organizations:validation
npm run test:e2e:organizations:search
npm run test:e2e:organizations:mobile
npm run test:e2e:organizations:visual
npm run test:e2e:organizations:errors
npm run test:e2e:organizations:accessibility
npm run test:e2e:organizations:performance
```

### Browser-Specific Tests

```bash
# Test on specific browsers
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari

# Test mobile devices
npm run test:e2e:mobile
```

### CI/CD Integration

```bash
# Run tests for continuous integration
npm run test:e2e:ci

# Update visual regression snapshots
npm run test:e2e:update-snapshots
```

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Multiple Browsers**: Chrome, Firefox, Safari
- **Mobile Devices**: iPhone 12, Pixel 5
- **Video Recording**: On failure
- **Screenshots**: On failure
- **Trace Collection**: On retry
- **Global Setup/Teardown**: Automatic test data management

### Environment Setup

1. **Development Server**: Automatically starts `npm run dev`
2. **Test Authentication**: Automatic login with demo credentials
3. **Test Data**: Consistent test organizations and settings
4. **GPS Mocking**: San Francisco coordinates for location testing

## Test Data Management

### Organization Factory (`fixtures/organizationFactory.ts`)

Provides realistic test data for food service organizations:

```typescript
// Basic organization data
const testOrg = OrganizationFactory.create();

// Organization with GPS coordinates
const gpsOrg = OrganizationFactory.createWithGPS();

// Multiple organizations
const orgs = OrganizationFactory.createMany(5);

// Invalid data for error testing
const invalidOrg = OrganizationFactory.createInvalid('phone');
```

### Mock Settings Data

Pre-configured priority, segment, and distributor settings for consistent testing.

## Best Practices

### Writing Tests

1. **Use Page Object Model**: Leverage `OrganizationTestHelpers` for consistent interactions
2. **Wait for Stability**: Use `waitForLoadState('networkidle')` before assertions
3. **Isolate Tests**: Each test should be independent and create its own data
4. **Mock External Dependencies**: GPS, network conditions, file uploads
5. **Test Real User Scenarios**: Focus on complete workflows, not just individual functions

### Performance Testing

1. **Set Reasonable Thresholds**: Page loads < 3s, form submissions < 3s
2. **Test with Realistic Data**: Use factory to create sufficient test data
3. **Monitor Memory Usage**: Check for memory leaks during navigation
4. **Network Simulation**: Test slow 3G conditions

### Visual Testing

1. **Disable Animations**: Use `animations: 'disabled'` for consistent screenshots
2. **Wait for Stability**: Ensure content is fully loaded before screenshots
3. **Test Multiple Viewports**: Mobile, tablet, desktop layouts
4. **Theme Variations**: Light, dark, high contrast modes

### Accessibility Testing

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader Support**: Verify ARIA labels and live regions
3. **Color Contrast**: Ensure sufficient contrast ratios
4. **Touch Targets**: Minimum 44px for mobile interactions

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout in test or use `waitFor` helpers
2. **Flaky Tests**: Add proper waits and reduce race conditions
3. **Screenshot Differences**: Update snapshots after UI changes
4. **Mobile Test Failures**: Verify touch target sizes and responsive layout

### Debugging

1. **Use UI Mode**: `npm run test:e2e:ui` for interactive debugging
2. **Enable Trace Viewer**: View detailed execution traces
3. **Run Single Tests**: Focus on specific failing test files
4. **Check Console Logs**: Monitor browser console for errors

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    npx playwright install --with-deps
    npm run test:e2e:ci
```

### Test Results

- **HTML Reports**: Detailed test execution reports
- **Screenshots**: Failure screenshots and visual diffs
- **Videos**: Complete test execution recordings
- **Traces**: Step-by-step execution traces

## Extending Tests

To add new test suites:

1. Create new spec file in appropriate directory
2. Use existing helpers and factories for consistency
3. Follow naming convention: `feature-name.spec.ts`
4. Add corresponding npm script to package.json
5. Update this README with new test coverage

## Performance Benchmarks

Current performance targets:

- **Page Load**: < 3 seconds
- **Form Submission**: < 3 seconds
- **Search/Filter**: < 2 seconds
- **Mobile Load**: < 5 seconds
- **Memory Usage**: < 50% increase during navigation

## Test Data Requirements

Ensure the following test data exists:

- **Organizations**: Various food service types
- **Settings**: Priority, segment, distributor options
- **Mock GPS**: San Francisco coordinates
- **User Authentication**: Demo user credentials

## Maintenance

Regular maintenance tasks:

1. **Update Snapshots**: After UI changes
2. **Review Performance**: Monitor benchmark degradation
3. **Update Dependencies**: Keep Playwright current
4. **Expand Coverage**: Add tests for new features
5. **Clean Test Data**: Periodic cleanup of test artifacts