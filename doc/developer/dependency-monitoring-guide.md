# Dependency Monitoring & Drift Detection Guide

This guide explains how to use ForkFlow CRM's automated dependency monitoring and drift detection system to maintain architectural compliance over time.

## Overview

The dependency monitoring system provides:
- **Real-time validation** of architectural rules during development
- **Drift detection** to track coupling and complexity changes over time
- **CI/CD integration** for automated compliance checking
- **Baseline management** for tracking architectural evolution

## Quick Start

### Basic Dependency Health Check

```bash
# Check current architectural compliance
npm run deps:health

# This runs both validation and drift detection
```

### Setting Up Baseline

When starting to monitor dependency drift:

```bash
# Create initial baseline snapshot
npm run deps:drift:baseline

# This saves current state as the reference point
```

## Available Commands

### Core Validation Commands

```bash
# Basic architectural validation
npm run deps:validate        # Check architectural rules
npm run deps:circular        # Check for circular dependencies

# Comprehensive analysis
npm run deps:check          # Validation + analysis + graph
npm run deps:full-report    # Complete dependency report
```

### Drift Detection Commands

```bash
# Drift detection and monitoring
npm run deps:drift          # Check for architectural drift
npm run deps:drift:baseline # Update baseline with current state
npm run deps:drift:check    # Run drift check with success message
npm run deps:health         # Complete health check (validation + drift)
```

### Analysis and Reporting

```bash
# Generate detailed reports
npm run deps:analyze        # JSON analysis output
npm run deps:graph          # DOT graph format
npm run deps:report         # HTML report
npm run deps:metrics        # Text metrics summary
```

## Understanding Drift Detection

### What is Dependency Drift?

Dependency drift occurs when:
- **Coupling increases** between components
- **Architectural boundaries** are violated
- **New circular dependencies** are introduced
- **Component complexity** grows significantly

### Baseline Management

The drift detector maintains a baseline snapshot in `.dependency-baselines/`:

```
.dependency-baselines/
└── dependency-baseline.json    # Reference snapshot for comparison
```

**Important**: Add this directory to your `.gitignore` for local development, but consider committing baselines for team environments.

### Drift Detection Process

1. **Current Analysis**: Analyzes current codebase dependencies
2. **Baseline Comparison**: Compares with stored baseline
3. **Change Detection**: Identifies significant architectural changes
4. **Report Generation**: Creates detailed drift report
5. **Recommendations**: Suggests remediation actions

## CI/CD Integration

### Pre-commit Hooks

The system includes automatic pre-commit validation:

```bash
# Pre-commit hook runs automatically on git commit
# Validates architectural rules and checks for drift
```

**Hook Configuration** (`.husky/pre-commit`):
```bash
# Dependency validation (blocking)
npm run deps:validate

# Drift detection (informational)
npm run deps:drift
```

### GitHub Actions Integration

Add to your `.github/workflows/` directory:

```yaml
# .github/workflows/dependency-validation.yml
name: Dependency Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate architectural rules
      run: npm run deps:validate
    
    - name: Check for dependency drift
      run: npm run deps:drift
      continue-on-error: true  # Don't fail build on drift warnings
    
    - name: Upload drift report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: dependency-drift-report
        path: dependency-drift-report.json
```

### Branch Protection Rules

Configure branch protection to require dependency validation:

1. Go to **Settings** → **Branches** → **Add rule**
2. Require status checks: `dependency-check`
3. Require up-to-date branches before merging

## Interpreting Reports

### Drift Report Structure

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "hasChanges": true,
  "violations": [
    {
      "type": "architectural-violation",
      "severity": "error",
      "message": "Core components now depend on 3 feature components (was 0)"
    }
  ],
  "metrics": {
    "moduleCountChange": 5,
    "dependencyCountChange": 25,
    "averageCouplingChange": 0.3
  },
  "recommendations": [
    "Review and refactor components to maintain architectural boundaries"
  ]
}
```

### Violation Types

| Type | Severity | Description | Action Required |
|------|----------|-------------|-----------------|
| `architectural-violation` | Error | Core→Features or Features→Business dependencies | Immediate fix |
| `circular-dependency` | Error | New circular imports detected | Immediate fix |
| `compliance-regression` | Error | Increased architectural violations | Review and fix |
| `coupling-increase` | Warning | Significant coupling growth | Consider refactoring |
| `module-count-change` | Warning | Large change in module count | Review if intentional |

### Metrics Explanation

- **Module Count Change**: Net change in TypeScript files
- **Dependency Count Change**: Net change in import relationships
- **Average Coupling Change**: Change in average dependencies per module
- **Complexity Change**: Change in module complexity metrics

## Best Practices

### Regular Monitoring

```bash
# Weekly architectural health check
npm run deps:health

# Monthly baseline updates (for long-running projects)
npm run deps:drift:baseline
```

### Team Workflow

1. **Before major refactoring**: Create baseline snapshot
2. **During development**: Monitor with `deps:health`
3. **Before code review**: Check drift report for significant changes
4. **After merging**: Update baseline if architecture intentionally changed

### Handling Violations

#### Architectural Violations

```bash
# 1. Identify violating imports
npm run deps:validate

# 2. Review architectural rules
cat .dependency-cruiser.js

# 3. Refactor to maintain boundaries
# Example: Move shared logic to appropriate tier
```

#### Circular Dependencies

```bash
# 1. Identify circular imports
npm run deps:circular

# 2. Use shared service pattern (like UserService)
# 3. Consider dependency injection
# 4. Extract shared interfaces
```

#### Coupling Increases

```bash
# 1. Identify high-coupling modules
npm run deps:drift

# 2. Review drift report details
# 3. Consider component decomposition
# 4. Extract reusable utilities
```

## Customization

### Adjusting Sensitivity

Edit `scripts/dependency-drift-detector.js`:

```javascript
// Adjust thresholds for drift detection
const COUPLING_INCREASE_THRESHOLD = 1.5;  // 50% increase
const MODULE_CHANGE_THRESHOLD = 5;         // 5 modules
const DEPENDENCY_CHANGE_THRESHOLD = 50;    // 50 dependencies
```

### Custom Architectural Rules

Edit `.dependency-cruiser.js`:

```javascript
{
  name: 'custom-rule',
  severity: 'warn',
  comment: 'Custom architectural constraint',
  from: { path: '^src/custom-domain/' },
  to: { path: '^src/restricted-area/' }
}
```

### Excluding Files

```javascript
// In .dependency-cruiser.js options
doNotFollow: {
  path: ['node_modules', 'test-files', 'stories']
}
```

## Troubleshooting

### Common Issues

**"No baseline found"**
- Run `npm run deps:drift:baseline` to create initial baseline

**"Dependency analysis failed"**
- Check TypeScript compilation: `npm run build`
- Verify dependency-cruiser config: `.dependency-cruiser.js`

**"Pre-commit hook too slow"**
- Consider running drift detection only in CI
- Adjust hook to run validation only

**"False positive violations"**
- Review architectural rules for edge cases
- Consider adjusting violation thresholds
- Add specific exclusions to rules

### Performance Optimization

For large codebases:
- Exclude test files and stories from analysis
- Focus analysis on `src/` directory only
- Consider sampling approach for very large projects

### Debugging

```bash
# Verbose dependency analysis
dependency-cruiser src --validate --verbose

# Debug drift detection
node scripts/dependency-drift-detector.js --help
```

This monitoring system ensures your architectural decisions remain enforced over time, preventing gradual degradation of code quality and maintainability.