# Component Integration Guide

This guide explains how to work with ForkFlow CRM's 3-tier component architecture, providing practical examples and best practices for adding new components and features.

## Quick Reference

### Component Tier Decision Tree

```
Does your component contain business logic specific to a domain?
├─ YES → Business Components (/src/components/business/)
└─ NO → Is it specific to the ForkFlow CRM application?
    ├─ YES → Features Components (/src/components/features/)
    └─ NO → Core Components (/src/components/core/)
```

### Import Rules Summary

```typescript
// ✅ ALLOWED
Core → External Libraries
Features → Core + External Libraries  
Business → Features + Core + External Libraries

// ❌ FORBIDDEN  
Core → Features or Business
Features → Business
Business → Other Business Domains
Any Tier → ui-kit (use appropriate tier instead)
```

## 1. Adding Core Components

### When to Create Core Components

- Generic UI primitives (buttons, inputs, cards)
- Layout utilities (containers, grids, spacers)
- Basic data display (text, chips, avatars)
- No business logic or app-specific behavior

### Example: Creating a New Core Component

**Step 1: Create the component file**

```typescript
// src/components/core/data-display/Badge.tsx
import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    size = 'medium',
    children,
    className,
}) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium';
    
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
    };
    
    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        medium: 'px-3 py-1 text-sm',
        large: 'px-4 py-2 text-base',
    };
    
    return (
        <span 
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    );
};
```

**Step 2: Add to directory index**

```typescript
// src/components/core/data-display/index.ts
export { Badge } from './Badge';
export { Chip } from './Chip';
// ... other exports
```

**Step 3: Add to core index**

```typescript
// src/components/core/index.ts
export * from './data-display';
// ... other exports
```

**Step 4: Create tests (recommended)**

```typescript
// src/components/core/data-display/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
    it('renders children correctly', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
        render(<Badge variant="success">Success</Badge>);
        const badge = screen.getByText('Success');
        expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
});
```

## 2. Adding Features Components

### When to Create Features Components

- App-specific functionality (dashboard widgets, auth components)
- Reusable across multiple business domains
- Contains application logic but not domain-specific business rules
- Complex UI patterns specific to ForkFlow CRM

### Example: Creating a Dashboard Widget

**Step 1: Create the feature component**

```typescript
// src/components/features/dashboard/RecentActivities.tsx
import React from 'react';
import { useGetList } from 'react-admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../core/cards';
import { Badge } from '../../core/data-display';
import { formatRelativeTime } from '../../../utils/formatters';

export interface RecentActivitiesProps {
    limit?: number;
    className?: string;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
    limit = 5,
    className 
}) => {
    const { data: activities, loading, error } = useGetList('activities', {
        pagination: { page: 1, perPage: limit },
        sort: { field: 'createdAt', order: 'DESC' },
    });

    if (loading) return <div>Loading activities...</div>;
    if (error) return <div>Error loading activities</div>;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activities?.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <p className="text-xs text-gray-500">
                                    {formatRelativeTime(activity.createdAt)}
                                </p>
                            </div>
                            <Badge variant={getActivityVariant(activity.type)}>
                                {activity.type}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const getActivityVariant = (type: string) => {
    switch (type) {
        case 'contact': return 'success';
        case 'opportunity': return 'warning';
        case 'task': return 'default';
        default: return 'default';
    }
};
```

**Step 2: Add to features index**

```typescript
// src/components/features/dashboard/index.ts
export { RecentActivities } from './RecentActivities';
export { TodaysFollowups } from './TodaysFollowups';
// ... other dashboard features
```

**Step 3: Use in business components or pages**

```typescript
// src/components/business/dashboard/DashboardPage.tsx
import { RecentActivities } from '../../features/dashboard';

export const DashboardPage = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivities limit={10} />
        {/* Other dashboard components */}
    </div>
);
```

## 3. Adding Business Components

### When to Create Business Components

- Domain-specific business logic
- Entry points for business domain pages
- Contains workflow and business rules
- Orchestrates features and core components

### Example: Creating a New Business Domain

**Step 1: Create domain page component**

```typescript
// src/components/business/customers/CustomerPage.tsx
import React, { useState } from 'react';
import { useGetList } from 'react-admin';
import { DashboardLayout } from '../../features/layout';
import { DataTable } from '../../features/data-display';
import { CustomerFilters } from './CustomerFilters';
import { CustomerActions } from './CustomerActions';
import { Customer } from '../../../types';

export const CustomerPage: React.FC = () => {
    const [filters, setFilters] = useState({});
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

    const { data: customers, loading } = useGetList('customers', {
        filter: filters,
        sort: { field: 'name', order: 'ASC' },
        pagination: { page: 1, perPage: 25 },
    });

    const columns = [
        { field: 'name', headerName: 'Customer Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'organization', headerName: 'Organization', flex: 1 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'lastContact', headerName: 'Last Contact', width: 140 },
    ];

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Customer Management</h1>
                    <CustomerActions selectedCustomers={selectedCustomers} />
                </div>

                <CustomerFilters 
                    filters={filters} 
                    onFiltersChange={handleFiltersChange} 
                />

                <DataTable
                    data={customers || []}
                    columns={columns}
                    loading={loading}
                    onSelectionChange={setSelectedCustomers}
                    exportEnabled
                    searchEnabled
                />
            </div>
        </DashboardLayout>
    );
};
```

**Step 2: Create supporting components**

```typescript
// src/components/business/customers/CustomerFilters.tsx
import React from 'react';
import { Card } from '../../core/cards';
import { Button } from '../../core/buttons';
import { Select, Input } from '../../core/forms';

export interface CustomerFiltersProps {
    filters: any;
    onFiltersChange: (filters: any) => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    // Filter implementation
    return (
        <Card>
            {/* Filter UI */}
        </Card>
    );
};
```

**Step 3: Create domain index**

```typescript
// src/components/business/customers/index.ts
export { CustomerPage } from './CustomerPage';
export { CustomerFilters } from './CustomerFilters';
export { CustomerActions } from './CustomerActions';
```

**Step 4: Register with react-admin (if needed)**

```typescript
// src/customers/index.tsx
import { CustomerPage } from '../components/business/customers';

export default {
    list: CustomerPage,
    // Other CRUD operations...
};
```

## 4. Working with Existing Domains

### Adding to Existing Business Domains

When extending existing domains (contacts, organizations, etc.), follow these patterns:

**Example: Adding a new contact feature**

```typescript
// src/contacts/ContactImport.tsx (Domain-specific)
import React from 'react';
import { useCreate, useNotify } from 'react-admin';
import { FileUpload } from '../components/features/file-upload';
import { ImportPreview } from '../components/features/data-import';

export const ContactImport: React.FC = () => {
    // Domain-specific import logic
    return (
        <div>
            <FileUpload onFileSelect={handleFileSelect} />
            <ImportPreview data={previewData} onConfirm={handleImport} />
        </div>
    );
};
```

### Extending Feature Components

```typescript
// src/components/features/file-upload/CsvUpload.tsx
import React from 'react';
import { Card } from '../../core/cards';
import { Button } from '../../core/buttons';

export interface CsvUploadProps {
    onFileSelect: (file: File) => void;
    acceptedTypes?: string[];
}

export const CsvUpload: React.FC<CsvUploadProps> = ({
    onFileSelect,
    acceptedTypes = ['.csv', '.xlsx'],
}) => {
    // Generic file upload logic
    return (
        <Card>
            {/* File upload UI */}
        </Card>
    );
};
```

## 5. Best Practices

### Component Design Principles

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Build complex UIs by composing simpler components
3. **Consistent APIs**: Follow established patterns for props and interfaces
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

### Naming Conventions

```typescript
// Component files: PascalCase
CustomerPage.tsx
RecentActivities.tsx
DataTable.tsx

// Props interfaces: ComponentNameProps
interface CustomerPageProps {
    // ...
}

// Event handlers: handle + Action
const handleFilterChange = () => { };
const handleSelectionChange = () => { };

// Boolean props: is/has/can/should + Adjective
interface ButtonProps {
    isLoading?: boolean;
    hasIcon?: boolean;
    canSubmit?: boolean;
}
```

### TypeScript Patterns

```typescript
// Use strict typing for props
interface ComponentProps {
    id: string;                    // Required
    title?: string;               // Optional
    onClick: (id: string) => void; // Function
    variant: 'primary' | 'secondary'; // Union type
    data: Customer[];             // Array
    className?: string;           // Optional styling
}

// Use generic types for reusable components
interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
}
```

### Testing Patterns

```typescript
// Test component behavior, not implementation
describe('CustomerPage', () => {
    it('displays customer list', async () => {
        render(<CustomerPage />);
        await waitFor(() => {
            expect(screen.getByText('Customer Management')).toBeInTheDocument();
        });
    });

    it('filters customers when filters are applied', async () => {
        render(<CustomerPage />);
        // Test filter functionality
    });
});
```

## 6. Migration from UI Kit

When migrating components from the legacy ui-kit:

### Step 1: Identify Component Tier

```typescript
// Old import (to be avoided)
import { DataTable } from '../ui-kit';

// New import options
import { DataTable } from '../core/data-display';     // If generic
import { DataTable } from '../features/dashboard';    // If app-specific
```

### Step 2: Update Component Dependencies

```typescript
// Update internal component imports
// Old
import { Button } from '../ui-kit';

// New
import { Button } from '../../core/buttons';
```

### Step 3: Verify Architectural Rules

```bash
# Run dependency validation
npm run deps:validate

# Check for violations
npm run deps:check
```

This guide ensures consistent, maintainable component development that follows ForkFlow CRM's architectural principles while providing flexibility for future growth and changes.