# ForkFlow CRM Data Flow Patterns

This document explains how data flows through the ForkFlow CRM application, from authentication and data providers through components and state management.

## Data Flow Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
├─────────────────────────────────────────────────────────────────┤
│  React Application (ForkFlow CRM)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  UI Components  │  │  State Mgmt     │  │  Data Providers │  │
│  │  (3-tier arch)  │  │  (React-Admin)  │  │  (Auth + Data)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services                            │
│  ┌─────────────────┐           ┌─────────────────┐              │
│  │    Supabase     │           │   Fake REST     │              │
│  │  (Production)   │           │ (Development)   │              │
│  │  - PostgreSQL   │           │  - In-memory    │              │
│  │  - Auth         │           │  - Mock data    │              │
│  │  - Real-time    │           │  - Faker.js     │              │
│  │  - Storage      │           │                 │              │
│  └─────────────────┘           └─────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Provider Architecture & Data Sources

### Provider Selection Strategy

The application dynamically selects data and authentication providers based on environment configuration:

```typescript
// src/root/CRM.tsx
const isDemoMode = import.meta.env.VITE_IS_DEMO === 'true';
const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

const defaultDataProvider = isDemoMode ? fakerestDataProvider : supabaseDataProvider;
const defaultAuthProvider = isDemoMode ? fakerestAuthProvider : supabaseAuthProvider;
const finalAuthProvider = skipAuth ? devAuthProvider : authProvider;
```

### Authentication Provider Flow

```
User Login Request
       │
       ▼
┌─────────────────┐    Environment     ┌─────────────────┐
│   Auth Router   │ ──── Check ─────── │  Provider Type  │
└─────────────────┘                    └─────────────────┘
       │                                        │
       ▼                                        ▼
┌─────────────────┐                   ┌─────────────────┐
│ Development     │                   │   Production    │
│ devAuthProvider │                   │supabaseAuthProv │
│ (Skip Auth)     │                   │ (Full Auth)     │
└─────────────────┘                   └─────────────────┘
       │                                        │
       ▼                                        ▼
┌─────────────────┐                   ┌─────────────────┐
│ Demo/Testing    │                   │   Supabase      │
│fakerestAuthProv │                   │   - JWT Auth    │
│ (Mock Auth)     │                   │   - OAuth       │
└─────────────────┘                   │   - Session Mgmt│
                                      └─────────────────┘
```

### Data Provider Flow

```
Component Data Request
         │
         ▼
┌─────────────────┐     React-Admin     ┌─────────────────┐
│   react-admin   │ ───── Hook ──────── │  Data Provider  │
│   Data Hooks    │                     │   (Selected)    │
└─────────────────┘                     └─────────────────┘
         │                                        │
         ▼                                        ▼
┌─────────────────┐                   ┌─────────────────┐
│  Fake REST      │                   │    Supabase     │
│  Development    │                   │   Production    │
│  - In-memory    │                   │  - PostgreSQL   │
│  - Faker.js     │                   │  - Row Level    │
│  - Instant      │                   │    Security     │
└─────────────────┘                   │  - Real-time    │
                                      └─────────────────┘
```

## 2. React-Admin Data Flow Integration

### React-Admin Resource Pattern

Each business domain follows the react-admin resource pattern with standardized CRUD operations:

```typescript
// Resource registration in CRM.tsx
<Resource name="contacts" {...contacts} />
<Resource name="organizations" {...organizations} />
<Resource name="opportunities" {...opportunities} />

// Domain resource configuration (e.g., src/contacts/index.tsx)
export default {
    list: ContactPage,      // Business component
    create: ContactCreate,  // Domain form
    edit: ContactEdit,      // Domain form
    show: ContactShow,      // Domain view
};
```

### Data Hook Flow

```
Component Render
       │
       ▼
┌─────────────────┐
│  react-admin    │
│  Data Hook      │
│  (useGetList,   │
│   useGetOne,    │
│   useCreate,    │
│   useUpdate,    │
│   useDelete)    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  React Query    │
│  Cache Layer    │
│  - Caching      │
│  - Deduplication│
│  - Background   │
│    Updates      │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Data Provider  │
│  Implementation │
│  (Supabase or   │
│   FakeRest)     │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│   Backend API   │
│   Response      │
└─────────────────┘
```

## 3. Authentication & Authorization Flow

### User Authentication Journey

```
1. User Access Request
       │
       ▼
2. Auth Check (authProvider.checkAuth)
       │
       ├─ Authenticated ──────────────┐
       │                              │
       ▼                              ▼
3. Not Authenticated          4. Permission Check
       │                       (authProvider.getPermissions)
       ▼                              │
4. Redirect to Login                  ▼
       │                       5. Resource Access Granted
       ▼                              │
5. Login Form                         ▼
   (UniversalLoginPage)        6. Component Renders
       │                       with User Context
       ▼
6. authProvider.login
       │
       ▼
7. Success → Dashboard
   Failure → Error Message
```

### Permission-Based Component Rendering

```typescript
// Example from src/layout/Header.tsx
<CanAccess resource="analytics" action="list">
    <AnalyticsMenu />
</CanAccess>

<CanAccess resource="users" action="list">
    <UsersMenu />
</CanAccess>
```

### User Identity Flow

```
Component Mount
       │
       ▼
┌─────────────────┐
│  useGetIdentity │
│     Hook        │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  authProvider   │
│  .getIdentity() │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  User Context   │
│  Available in   │
│  Components     │
│  - ID           │
│  - Name         │
│  - Email        │
│  - Role         │
│  - Avatar       │
└─────────────────┘
```

## 4. State Management Patterns

### React-Admin + React Query State

The application uses react-admin's built-in state management, which is powered by React Query:

```
┌─────────────────┐
│   Component     │
│   Data Request  │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  React-Admin    │
│  Data Hook      │
│  - useGetList   │
│  - useGetOne    │
│  - useCreate    │
│  - useUpdate    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  React Query    │
│  Cache          │
│  - Query Cache  │
│  - Mutation     │
│    Cache        │
│  - Optimistic   │
│    Updates      │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Component      │
│  State Update   │
│  - Loading      │
│  - Data         │
│  - Error        │
└─────────────────┘
```

### Configuration Context Flow

```typescript
// Global configuration context (src/root/ConfigurationContext.tsx)
const ConfigurationProvider = ({ children, value }) => (
    <ConfigurationContext.Provider value={value}>
        {children}
    </ConfigurationContext.Provider>
);

// Usage in components
const { logo, title, noteStatuses, taskTypes } = useConfigurationContext();
```

### Local Component State

```typescript
// Example: Form state management
const [formData, setFormData] = useState(initialData);
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});

// Event handlers update local state
const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
};
```

## 5. Real-time Data Flow (Supabase)

### Subscription Pattern

```
Component Mount
       │
       ▼
┌─────────────────┐
│  useEffect      │
│  Subscription   │
│  Setup          │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Supabase       │
│  Real-time      │
│  Subscription   │
│  .on('*')       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Database       │
│  Change Event   │
│  - INSERT       │
│  - UPDATE       │
│  - DELETE       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Component      │
│  State Update   │
│  - React Query  │
│    Invalidation │
│  - UI Refresh   │
└─────────────────┘
```

### Example Real-time Implementation

```typescript
// Real-time subscription pattern
useEffect(() => {
    const subscription = supabase
        .channel('contacts-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'contacts' },
            (payload) => {
                // Invalidate React Query cache
                queryClient.invalidateQueries(['contacts']);
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}, []);
```

## 6. Error Handling & Loading States

### Error Boundary Pattern

```
Component Tree
       │
       ▼
┌─────────────────┐
│  ErrorBoundary  │
│  (React)        │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Component      │
│  Error Occurs   │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Error UI       │
│  - Error Message│
│  - Retry Button │
│  - Fallback UI  │
└─────────────────┘
```

### Loading State Management

```typescript
// React-admin hook loading states
const { data, loading, error } = useGetList('contacts');

if (loading) return <LoadingComponent />;
if (error) return <ErrorComponent error={error} />;
return <ContactsList data={data} />;
```

## 7. Data Validation & Transformation

### Input Validation Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  Form Validation│
│  (react-hook-   │
│   form + yup)   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Client-side    │
│  Validation     │
│  - Required     │
│  - Format       │
│  - Business     │
│    Rules        │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Data Provider  │
│  Transformation │
│  - Type Casting │
│  - Field Mapping│
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Backend        │
│  Validation     │
│  - Database     │
│    Constraints  │
│  - RLS Policies │
└─────────────────┘
```

### Data Transformation Pipeline

```typescript
// Example: Data transformation in data provider
const transformContactData = (rawData) => ({
    id: rawData.id,
    firstName: rawData.first_name,        // Snake to camel case
    lastName: rawData.last_name,
    email: rawData.email,
    organizationId: rawData.organization_id,
    createdAt: new Date(rawData.created_at), // Date parsing
    tags: rawData.tags || [],             // Default values
});
```

## 8. Performance Optimizations

### React Query Caching Strategy

```
┌─────────────────┐
│  Query Key      │
│  Strategy       │
│  ['resource',   │
│   'action',     │
│   params]       │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Cache Policy   │
│  - staleTime    │
│  - cacheTime    │
│  - refetchOn... │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Background     │
│  Updates        │
│  - Automatic    │
│    Refetch      │
│  - Invalidation │
└─────────────────┘
```

### Component Optimization

```typescript
// Memoization patterns
const MemoizedComponent = React.memo(({ data }) => {
    const processedData = useMemo(() => 
        expensiveTransformation(data), [data]
    );
    
    const handleClick = useCallback(() => {
        // Event handler
    }, []);
    
    return <div>{processedData}</div>;
});
```

This data flow architecture ensures efficient, scalable, and maintainable data management throughout the ForkFlow CRM application while providing excellent user experience through optimized caching, real-time updates, and proper error handling.