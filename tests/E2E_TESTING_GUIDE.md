# E2E Testing Guide - ForkFlow CRM

## 🎯 Overview

This guide provides comprehensive instructions for running E2E tests on the ForkFlow CRM application. The testing infrastructure has been optimized to resolve the original 81.4% failure rate by addressing core application loading and configuration issues.

## 🔧 Setup and Prerequisites

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers (required for E2E tests)
npx playwright install

# Install system dependencies (Linux/CI environments)
npx playwright install-deps
```

### 2. Start Development Server
```bash
# Start the dev server (required for tests)
npm run dev

# Verify server is running
curl http://localhost:5173
```

## 🚀 Running Tests

### Basic Test Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e:organizations

# Run tests in headed mode (with browser UI)
npx playwright test --headed

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/smoke/app-loading.spec.ts
```

### Mobile and Responsive Testing
```bash
# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Run tablet tests
npx playwright test --project="Tablet Chrome"

# Run responsive tests
npx playwright test tests/responsive/
```

### Accessibility Testing
```bash
# Run accessibility compliance tests
npx playwright test tests/accessibility/

# Run specific accessibility test
npx playwright test tests/accessibility/component-accessibility.spec.ts
```

## 📁 Test Structure

### Test Categories

#### 1. **Smoke Tests** (`tests/smoke/`)
- Basic application loading
- Core functionality verification
- Environment validation

#### 2. **Component Tests** (`tests/organizations/`, `tests/products/`, etc.)
- CRUD operations
- Form validation
- User interactions
- Business logic

#### 3. **Responsive Tests** (`tests/responsive/`)
- Mobile viewport testing
- Touch target validation
- Responsive layout verification

#### 4. **Accessibility Tests** (`tests/accessibility/`)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

## 🛠️ Infrastructure Improvements

### Test Mode Configuration
The application automatically detects test mode through:
- URL parameter: `?test=true`
- localStorage: `test-mode=true`
- Environment: `NODE_ENV=test`
- Headers: `X-Test-Mode=true`

### Data Provider Switching
```typescript
// Automatic provider selection
const isTestMode = detectTestMode();
const dataProvider = isTestMode ? fakeDataProvider : supabaseDataProvider;
```

### Authentication Bypass
```typescript
// Test authentication setup
await page.evaluate(() => {
  localStorage.setItem('auth', JSON.stringify({
    user: { id: 'test-user-1', email: 'demo@forkflow.com' },
    token: 'test-token'
  }));
});
```

## 📋 Test Utilities

### Enhanced TestUtils Class
```typescript
// Wait for app to be ready
await utils.waitForAppReady();

// Setup test environment
await utils.setupTestAuth();
await utils.seedTestData();

// Mobile testing
await utils.simulateMobileDevice();

// Accessibility checks
await utils.checkPageAccessibility();
```

### Key Helper Methods
- `waitForAppReady()` - Comprehensive app initialization detection
- `setupTestAuth()` - Bypass authentication for testing
- `seedTestData()` - Ensure consistent test data
- `simulateMobileDevice()` - Mobile viewport simulation
- `checkPageAccessibility()` - Basic accessibility validation

## 🎨 Accessibility Improvements

### Component Enhancements Made

#### InteractionCard
- Added `aria-label` to interactive elements
- Keyboard navigation support (`Enter`/`Space`)
- Focus management with visible outlines
- Proper semantic HTML structure

#### ProductCard
- Role-based navigation
- Descriptive ARIA labels
- Touch-friendly button sizes (44px minimum)

#### OrganizationCard
- Comprehensive card descriptions
- Keyboard accessibility
- Focus indicators

## 📱 Mobile Responsiveness

### Touch Target Requirements
- Minimum 44px x 44px for all interactive elements
- Proper spacing between touch targets
- Gesture-friendly navigation

### Viewport Testing
- Mobile: 375px width (iPhone 12 standard)
- Tablet: 768px width (iPad standard)
- Desktop: 1280px width

## 🔍 Debugging Tests

### Common Issues and Solutions

#### 1. App Stuck in Loading State
```bash
# Check if test mode is properly configured
await page.evaluate(() => localStorage.getItem('test-mode'));

# Verify data provider switching
await page.evaluate(() => localStorage.getItem('data-provider'));
```

#### 2. Authentication Issues
```bash
# Verify test auth setup
await page.evaluate(() => localStorage.getItem('auth'));

# Check for login redirects
await page.waitForURL(url => !url.includes('/login'));
```

#### 3. Slow Test Execution
```bash
# Run with increased timeouts
npx playwright test --timeout=30000

# Use specific browser
npx playwright test --project=chromium
```

### Debug Mode
```bash
# Run with console output
npx playwright test --reporter=line

# Generate trace files
npx playwright test --trace=on

# Take screenshots on failure
npx playwright test --screenshot=only-on-failure
```

## 📊 Performance Benchmarks

### Target Metrics
- **App Load Time**: < 3 seconds
- **Page Navigation**: < 2 seconds
- **Form Submission**: < 5 seconds
- **Touch Response**: < 100ms

### Test Coverage Goals
- **Smoke Tests**: 100% pass rate
- **Component Tests**: > 95% pass rate
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: All touch targets meet 44px requirement

## 🚨 Troubleshooting

### Browser Issues
```bash
# Reinstall browsers
npx playwright install --force

# Check browser installation
npx playwright install chromium
```

### Permission Issues
```bash
# Grant permissions in test context
await context.grantPermissions(['geolocation']);
await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
```

### Network Issues
```bash
# Wait for network idle
await page.waitForLoadState('networkidle');

# Mock network responses
await page.route('**/api/**', route => route.fulfill({ body: '{}' }));
```

## 📈 Success Metrics

### Before Fixes
- **Total Tests**: 1,050
- **Failures**: 855 (81.4% failure rate)
- **Primary Issue**: App stuck in "Loading..." state

### After Implementation
- **Infrastructure**: Fixed data provider and auth issues
- **Expected**: < 50% failure rate for basic functionality
- **Target**: < 5% failure rate for comprehensive testing

## 🎯 Best Practices

### Writing Tests
1. Use descriptive test names
2. Setup test environment in `beforeEach`
3. Clean up after tests
4. Use page objects for complex interactions
5. Add accessibility checks to all component tests

### Debugging
1. Use `page.pause()` for interactive debugging
2. Add console logs for complex interactions
3. Take screenshots at key points
4. Use trace viewer for detailed analysis

### Performance
1. Run tests in parallel when possible
2. Use specific selectors over generic ones
3. Minimize network requests in tests
4. Use mock data for consistent results

## 🔗 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Web Best Practices](https://web.dev/mobile/)
- [Testing Best Practices](https://testing-library.com/docs/)

---

This testing infrastructure provides a solid foundation for ensuring the ForkFlow CRM application meets high standards for functionality, accessibility, and mobile usability.