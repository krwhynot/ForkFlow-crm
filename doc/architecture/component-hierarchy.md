# ForkFlow CRM Component Hierarchy

This document provides a comprehensive overview of the ForkFlow CRM component architecture, showing how the 528 TypeScript files are organized within our 3-tier component structure.

## Architecture Overview

The ForkFlow CRM application follows a hierarchical component architecture with clear separation of concerns across three distinct layers:

```
App Entry Point
├── CRM.tsx (Root Application)
│   ├── ConfigurationProvider (Global Context)
│   ├── Admin (React-Admin Core)
│   │   ├── AuthProvider (Authentication Layer)
│   │   ├── DataProvider (Data Access Layer)
│   │   ├── Layout (Application Shell)
│   │   └── Resources (Domain Modules)
│   └── CustomRoutes (Additional Pages)
└── Component Layers
    ├── Core Components (Generic UI Primitives)
    ├── Features Components (App-Specific Functionality)
    └── Business Components (Domain Logic)
```

## Detailed Component Tree

### 1. Application Root Layer

**Entry Point: `/src/root/CRM.tsx`**
- **Purpose**: Application bootstrap and provider configuration
- **Key Components**:
  - `ConfigurationProvider` - Global configuration context
  - `Admin` (react-admin) - Core application framework
  - Authentication provider selection (dev/fakerest/supabase)
  - Data provider selection (fakerest/supabase)

**Configuration & Context:**
```
src/root/
├── CRM.tsx                    # Main application component
├── ConfigurationContext.tsx   # Global configuration provider
├── defaultConfiguration.ts    # Default app configuration
└── i18nProvider.ts            # Internationalization provider
```

### 2. Layout & Infrastructure Layer

**Layout System: `/src/layout/`**
- `Layout.tsx` - Main application layout wrapper
- `Header.tsx` - Application header with navigation and user menu

**Provider Architecture:**
```
src/providers/
├── commons/
│   └── userService.ts         # Shared user data service (breaks circular deps)
├── fakerest/                  # Development data provider
│   ├── authProvider.ts
│   ├── dataProvider.ts
│   └── index.ts
└── supabase/                  # Production data provider
    ├── authProvider.ts
    ├── dataProvider.ts
    └── index.ts
```

### 3. Three-Tier Component Architecture

#### Tier 1: Core Components (`/src/components/core/`)
**Purpose**: Generic, reusable UI primitives with no business logic

```
core/
├── buttons/                   # Interactive elements
│   ├── Button.tsx            # Primary button component
│   ├── ToggleButton.tsx      # Toggle functionality
│   └── ToggleButtonGroup.tsx # Button groups
├── cards/                     # Content containers
│   ├── Card.tsx              # Basic card container
│   ├── CardContent.tsx       # Card content area
│   ├── CardHeader.tsx        # Card header section
│   └── CardTitle.tsx         # Card title component
├── data-display/              # Information presentation
│   └── Chip.tsx              # Tag/label component
├── dialogs/                   # Modal interactions
│   ├── Dialog.tsx            # Base modal component
│   ├── DialogContent.tsx     # Modal content area
│   └── DialogTitle.tsx       # Modal title section
├── layout/                    # Structural components
│   ├── Box.tsx               # Generic container
│   └── Stack.tsx             # Flex layout utility
├── navigation/                # Navigation utilities
│   ├── RelatedEntitiesSection.tsx  # Entity relationship navigation
│   └── RelationshipBreadcrumbs.tsx # Relationship breadcrumbs
├── progress/                  # Loading states
│   ├── CircularProgress.tsx  # Circular loading indicator
│   └── LinearProgress.tsx    # Linear progress bar
└── typography/                # Text components
    └── Typography.tsx        # Text styling component
```

**Dependencies**: None (no imports from features or business layers)

#### Tier 2: Features Components (`/src/components/features/`)
**Purpose**: Application-specific functionality that can be reused across business domains

```
features/
├── auth/                      # Authentication features
│   ├── AuthStatusIndicator.tsx    # Authentication status display
│   ├── RoleBasedComponent.tsx     # Role-based rendering
│   └── RoleChip.tsx              # User role display
├── dashboard/                 # Dashboard-specific widgets
│   ├── ActivityLog.tsx           # Activity tracking widget
│   ├── ContactsList.tsx          # Dashboard contacts widget
│   ├── DashboardHeader.tsx       # Dashboard header component
│   ├── DashboardSidebar.tsx      # Dashboard navigation
│   ├── InteractionsChart.tsx     # Interactions visualization
│   ├── KanbanSection.tsx         # Kanban board sections
│   ├── MetricCard.tsx            # Metric display cards
│   ├── OpportunitiesChart.tsx    # Opportunities visualization
│   ├── PipelineSummary.tsx       # Sales pipeline summary
│   ├── PriorityOrganizations.tsx # Priority org widget
│   ├── ProductsGrid.tsx          # Products display grid
│   ├── QuickInteractionEntry.tsx # Quick interaction form
│   ├── TodaysFollowups.tsx       # Today's follow-ups widget
│   ├── WeeklyActivity.tsx        # Weekly activity summary
│   └── WeeklyGoals.tsx           # Weekly goals tracking
├── layout/                    # App-specific layouts
│   └── DashboardLayout.tsx       # Dashboard page layout
├── mobile/                    # Mobile-specific features
│   └── LocationProvider.tsx     # GPS/location services
└── security/                  # Security features
    ├── SecurityDashboard.tsx    # Security monitoring dashboard
    ├── SecurityStatusBar.tsx    # Security status indicator
    └── SessionTimeout.tsx       # Session management
```

**Dependencies**: Can import from core components and external libraries

#### Tier 3: Business Components (`/src/components/business/`)
**Purpose**: Domain-specific business logic components

```
business/
├── contacts/                  # Contact management domain
│   └── ContactPage.tsx           # Contact management interface
├── interactions/              # Interaction tracking domain
│   └── InteractionPage.tsx       # Interaction management interface
├── opportunities/             # Sales opportunities domain
│   └── OpportunityPage.tsx       # Opportunity management interface
├── organizations/             # Organization management domain
│   └── OrganizationPage.tsx      # Organization management interface
├── products/                  # Product catalog domain
│   └── ProductPage.tsx           # Product management interface
└── reports/                   # Business reporting domain
    └── ReportsPage.tsx           # Reporting interface
```

**Dependencies**: Can import from core and features components, but NOT from other business domains

### 4. Domain Module Structure

Each business domain follows a consistent structure pattern:

**Example: Contacts Domain (`/src/contacts/`)**
```
contacts/
├── index.tsx                  # Resource configuration for react-admin
├── ContactList.tsx            # List view component
├── ContactShow.tsx            # Detail view component
├── ContactEdit.tsx            # Edit form component
├── ContactCreate.tsx          # Creation form component
├── ContactCard.tsx            # Card display component
├── ContactFilters.tsx         # Filtering components
├── ContactInputs.tsx          # Form input components
└── Avatar.tsx                 # Contact avatar component
```

**Resource Registration Pattern:**
```typescript
// Each domain exports a resource configuration
export default {
    list: ContactPage,      // Uses business component
    create: ContactCreate,  // Domain-specific forms
    edit: ContactEdit,      // Domain-specific forms
    show: ContactShow,      # Domain-specific views
};
```

### 5. UI Kit Layer (`/src/components/ui-kit/`)

**Legacy Support**: Maintains backward compatibility during migration
- **Domain Organization**: 6 organized domains (actions, data-display, feedback, forms, layout, navigation)
- **Backward Compatibility**: Full re-exports in main index.ts
- **Future**: Will be gradually replaced by core/features/business architecture

### 6. Specialized Components

**Activity System (`/src/activity/`)**
- `ActivityLog.tsx` - Activity tracking display
- `ActivityLogIterator.tsx` - Activity pagination

**Authentication (`/src/login/`)**
- `UniversalLoginPage.tsx` - Universal login interface
- `SignupPage.tsx` - User registration
- `UserProfilePage.tsx` - User profile management

**Settings (`/src/settings/`)**
- `SettingsPage.tsx` - Application settings interface

## Component Dependencies & Rules

### Architectural Rules (Enforced by dependency-cruiser)

1. **No Circular Dependencies**: Prevented at build time
2. **Layer Separation**: Core components cannot import from features or business
3. **Business Isolation**: Business components cannot import ui-kit directly
4. **Clear Hierarchy**: Dependencies flow downward through tiers

### Import Patterns

```typescript
// ✅ CORRECT: Core component (no business dependencies)
import { Button } from '../buttons/Button';
import { Card } from '../cards/Card';

// ✅ CORRECT: Feature component (can use core)
import { Button } from '../../core/buttons/Button';
import { MetricCard } from './MetricCard';

// ✅ CORRECT: Business component (can use core + features)
import { DashboardLayout } from '../../features/layout/DashboardLayout';
import { Button } from '../../core/buttons/Button';

// ❌ INCORRECT: Core importing from business
import { ContactPage } from '../../business/contacts/ContactPage';

// ❌ INCORRECT: Business importing ui-kit directly
import { Button } from '../../ui-kit/Button';
```

## Component Count Summary

- **Total TypeScript Files**: 528
- **Core Components**: ~20 files (buttons, cards, dialogs, layout, progress, typography)
- **Features Components**: ~35 files (auth, dashboard, layout, mobile, security)
- **Business Components**: ~6 files (domain entry points)
- **Domain Modules**: ~200 files (contacts, organizations, products, etc.)
- **UI Kit Components**: ~80 files (legacy support during migration)
- **Infrastructure**: ~50 files (providers, utilities, configuration)
- **Application Logic**: ~137 files (domain-specific implementations)

## Testing Strategy by Component Tier

### Core Components
- **Unit Tests**: Test component rendering and props
- **Storybook**: Visual component documentation
- **Accessibility Tests**: WCAG compliance validation

### Features Components  
- **Integration Tests**: Test component interactions
- **Mock Dependencies**: Mock external services
- **User Journey Tests**: Test feature workflows

### Business Components
- **End-to-End Tests**: Test complete business flows
- **Data Integration Tests**: Test with real data providers
- **Business Logic Tests**: Validate domain rules

This hierarchy ensures maintainable, scalable, and testable code while providing clear boundaries for different types of components and their responsibilities.