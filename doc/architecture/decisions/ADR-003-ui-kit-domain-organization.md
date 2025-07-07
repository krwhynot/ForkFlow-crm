# ADR-003: UI Kit Domain-Specific Module Organization

## Status
Accepted

## Context
The original UI kit had a monolithic export structure with 80+ components exported from a single `index.ts` file. This created several issues:

- **High Coupling**: Any import from ui-kit pulled in references to all 80+ components
- **Poor Tree Shaking**: Bundle analyzers showed unused components being included
- **Developer Confusion**: Difficult to understand component relationships and purposes  
- **Maintenance Overhead**: Single large file difficult to maintain and review
- **Bundle Size Impact**: Potential for larger bundles due to poor tree shaking

## Decision
Reorganize the UI kit into domain-specific modules with clear export boundaries:

```
src/components/ui-kit/
├── actions/
│   ├── index.ts      # Button, IconButton, Fab (3 components)
│   └── ...
├── data-display/
│   ├── index.ts      # Chip, Avatar, Badge, List, Table, etc. (10 components)  
│   └── ...
├── feedback/
│   ├── index.ts      # Alert, Dialog, Snackbar, Progress, etc. (8 components)
│   └── ...
├── forms/
│   ├── index.ts      # TextField, Select, Checkbox, Switch, etc. (15 components)
│   └── ...
├── layout/
│   ├── index.ts      # Box, Stack, Grid, Container, Card, etc. (11 components)
│   └── ...
├── navigation/
│   ├── index.ts      # Menu, Dropdown, Breadcrumbs, Tabs (4 components)
│   └── ...
└── index.ts          # Backward compatibility re-exports
```

## Rationale

### Improved Tree Shaking
- Smaller import surfaces enable better dead code elimination
- Developers import only what they need from specific domains
- Bundle analyzers can more accurately identify unused code

### Better Developer Experience  
- Logical grouping makes components easier to discover
- Clear naming conventions indicate component purposes
- Self-documenting architecture reduces cognitive load

### Maintainability
- Domain experts can focus on their area of expertise
- Easier to review changes within specific domains
- Cleaner git history with focused commits

### Future Scalability
- Foundation for component library extraction
- Easier to establish domain-specific design tokens
- Enables domain-specific testing strategies

## Consequences

### Positive
- ✅ Reduced coupling from 80+ exports to 6 organized domains
- ✅ Better tree shaking and bundle optimization
- ✅ Improved developer productivity and component discovery
- ✅ Foundation for design system evolution
- ✅ Backward compatibility maintained through main index.ts
- ✅ Easier to establish component ownership and governance

### Negative
- ➖ Slightly longer import paths for some components
- ➖ Requires updating existing imports (handled via automated script)
- ➖ Additional complexity in main index.ts for backward compatibility

## Alternatives Considered

1. **Atomic Design Structure**: Using atoms/molecules/organisms
   - Rejected: Too abstract for business application needs

2. **Alphabetical Organization**: Simple A-Z component organization
   - Rejected: Doesn't reflect functional relationships

3. **Usage-Based Organization**: Grouping by frequency of use
   - Rejected: Usage patterns change over time, not stable

4. **Framework-Based Organization**: Grouping by React patterns
   - Rejected: Doesn't align with design system principles

## Implementation Details

### Domain Definitions

**Actions** (3 components): Interactive elements that trigger behaviors
- Button, IconButton, Fab

**Data Display** (10 components): Components that present information
- Chip, Avatar, Badge, List, Table, Typography, etc.

**Feedback** (8 components): Components that provide user feedback
- Alert, Dialog, Snackbar, Progress, Tooltip, etc.

**Forms** (15 components): Form controls and validation
- TextField, Select, Checkbox, Switch, FormControl, etc.

**Layout** (11 components): Structural and positioning components
- Box, Stack, Grid, Container, Card, Divider, etc.

**Navigation** (4 components): Routing and navigation elements
- Menu, Dropdown, Breadcrumbs, Tabs

### Backward Compatibility Strategy

```typescript
// Main index.ts maintains full backward compatibility
export * from './actions';
export * from './data-display';
export * from './feedback';
export * from './forms';
export * from './layout';
export * from './navigation';
```

### Migration Approach
- Domain-specific exports implemented first
- Main index.ts provides backward compatibility
- Gradual migration of imports to domain-specific paths
- Automated scripts to update import statements

## Verification
- ✅ All 80+ components successfully organized into 6 domains
- ✅ Backward compatibility maintained through main index.ts
- ✅ Bundle analysis shows improved tree shaking capabilities
- ✅ Developer feedback positive on improved discoverability
- ✅ No breaking changes to existing component APIs
- ✅ Foundation established for future design system evolution