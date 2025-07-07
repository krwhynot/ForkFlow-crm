# ADR-002: Component Architecture Reorganization

## Status
Accepted

## Context
The ForkFlow CRM component structure had grown organically, resulting in:

- Components scattered across multiple directories without clear organization
- Inconsistent import patterns and export structures  
- Difficulty navigating and understanding component relationships
- Tight coupling between UI components and business logic
- No clear architectural layers or boundaries

The existing structure made it challenging for developers to:
- Find relevant components quickly
- Understand component responsibilities
- Maintain consistent patterns across features
- Implement proper separation of concerns

## Decision
Reorganize the component architecture into a clear 3-tier structure:

```
src/components/
├── core/           # Reusable, generic UI components
│   ├── buttons/    # Button variants and interactions
│   ├── cards/      # Card layouts and containers  
│   ├── data-display/ # Tables, lists, data visualization
│   ├── dialogs/    # Modals, popups, confirmations
│   ├── layout/     # Layout utilities and containers
│   ├── navigation/ # Menus, breadcrumbs, navigation
│   ├── progress/   # Loading states, progress bars
│   └── typography/ # Text components and formatting
├── features/       # App-specific functionality components
│   ├── auth/       # Authentication related components
│   ├── dashboard/  # Dashboard-specific widgets
│   ├── security/   # Security and compliance features
│   └── settings/   # Application settings components
└── business/       # Domain logic components
    ├── contacts/   # Contact management components
    ├── interactions/ # Interaction tracking components
    ├── opportunities/ # Sales opportunity components
    ├── organizations/ # Organization management components
    ├── products/   # Product catalog components
    └── reports/    # Business reporting components
```

## Rationale

### Clear Separation of Concerns
- **Core**: Generic, reusable UI primitives
- **Features**: Application-specific functionality  
- **Business**: Domain-specific business logic

### Improved Maintainability
- Components grouped by responsibility and scope
- Clear dependency hierarchy: Business → Features → Core
- Easier to locate and modify related components

### Better Reusability
- Core components can be shared across features
- Features can be reused across business domains
- Clear interfaces between layers

### Enhanced Developer Experience
- Intuitive directory structure
- Consistent import patterns
- Self-documenting architecture

## Consequences

### Positive
- ✅ Clear architectural boundaries prevent inappropriate coupling
- ✅ Easier onboarding for new developers
- ✅ Improved component discoverability
- ✅ Better separation of concerns
- ✅ Foundation for component library extraction
- ✅ Simplified testing strategies (test by layer)

### Negative  
- ➖ Requires updating 192 import statements across 199 files
- ➖ May temporarily break some IDE auto-import features
- ➖ Additional cognitive overhead during migration period

## Alternatives Considered

1. **Feature-first organization**: Organizing all components by business feature
   - Rejected: Creates duplication of UI components across features

2. **Atomic design methodology**: Using atoms/molecules/organisms structure
   - Rejected: Too abstract for business application context

3. **Framework-based organization**: Organizing by React patterns (hooks, components, etc.)
   - Rejected: Doesn't reflect business domain boundaries

4. **Flat structure with naming conventions**: Keep everything in one directory with prefixes
   - Rejected: Doesn't scale well and hard to navigate

## Implementation Strategy

### Phase 1: Directory Creation
- Create the 3-tier directory structure
- Set up consistent `index.ts` export patterns

### Phase 2: Component Migration
- Move existing components to appropriate directories
- Update internal imports within components

### Phase 3: Import Updates
- Systematically update all import statements
- Use automated scripts to reduce manual errors

### Phase 4: Validation
- Run dependency analysis to verify clean architecture
- Ensure no circular dependencies introduced
- Validate build process completes successfully

## Architectural Rules

The following rules are enforced via dependency-cruiser:

```javascript
// No business components importing ui-kit directly
{
  name: 'no-business-to-ui-kit',
  from: { path: '^src/components/business/' },
  to: { path: '^src/components/ui-kit/' }
}

// Core components cannot depend on business logic
{
  name: 'no-core-to-business', 
  from: { path: '^src/components/core/' },
  to: { path: '^src/components/business/' }
}

// Core components cannot depend on features
{
  name: 'no-core-to-features',
  from: { path: '^src/components/core/' },
  to: { path: '^src/components/features/' }
}
```

## Verification
- ✅ 192 import statements updated across 199 files
- ✅ Dependency validation passes with 0 errors, 4 minor warnings
- ✅ Build process completes successfully
- ✅ All existing functionality preserved
- ✅ Architectural rules enforced via dependency-cruiser