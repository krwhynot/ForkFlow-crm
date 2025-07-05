# ForkFlow CRM - Complete Territory Removal Guide

## Overview

This guide provides comprehensive instructions for removing all territory-related components, logic, and database structures from the entire ForkFlow CRM project. After completing these steps, the application will operate solely on user-based access control without any territory filtering.

## 1. Database Schema Changes

### 1.1 Drop Territory-Related Tables

```sql
-- Drop foreign key constraints first
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_territory_id_fkey;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_territory_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_territory_id_fkey;
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_territory_id_fkey;
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_territory_id_fkey;

-- Drop territory-related columns
ALTER TABLE contacts DROP COLUMN IF EXISTS territory_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS territory_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS territory_id;
ALTER TABLE opportunities DROP COLUMN IF EXISTS territory_id;
ALTER TABLE interactions DROP COLUMN IF EXISTS territory_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS territory_id;

-- Drop territory tables
DROP TABLE IF EXISTS territories CASCADE;
DROP TABLE IF EXISTS territory_assignments CASCADE;
DROP TABLE IF EXISTS user_territories CASCADE;
```

### 1.2 Remove Territory-Based Row Level Security Policies

```sql
-- Drop existing territory-based policies
DROP POLICY IF EXISTS "territory_contacts" ON contacts;
DROP POLICY IF EXISTS "territory_organizations" ON organizations;
DROP POLICY IF EXISTS "territory_tasks" ON tasks;
DROP POLICY IF EXISTS "territory_opportunities" ON opportunities;
DROP POLICY IF EXISTS "territory_interactions" ON interactions;
DROP POLICY IF EXISTS "territory_users" ON profiles;

-- Create user-based policies instead
CREATE POLICY "contacts_user_access"
  ON contacts
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "organizations_user_access"
  ON organizations
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "tasks_user_access"
  ON tasks
  FOR ALL
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "opportunities_user_access"
  ON opportunities
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "interactions_user_access"
  ON interactions
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "profiles_user_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid());
```

## 2. TypeScript Type Definitions

### 2.1 Update Type Definitions

```typescript
// src/types/index.ts - Remove territory-related types

// Remove these interfaces/types:
// - Territory
// - TerritoryAssignment
// - UserTerritory

// Update existing types to remove territory_id fields:
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  // territory_id: string; // REMOVE THIS LINE
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  // territory_id: string; // REMOVE THIS LINE
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  // territory_id: string; // REMOVE THIS LINE
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string;
  // territory_id: string; // REMOVE THIS LINE
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  type: string;
  description: string;
  contact_id: string;
  organization_id: string;
  // territory_id: string; // REMOVE THIS LINE
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  // territory_id: string; // REMOVE THIS LINE
  created_at: string;
  updated_at: string;
}
```

## 3. Remove Territory-Related Components

### 3.1 Delete Territory Component Files

```bash
# Delete territory-related component files
rm -rf src/components/territory/
rm -rf src/pages/territory/
rm -f src/components/TerritorySelector.tsx
rm -f src/components/TerritoryFilter.tsx
rm -f src/components/TerritoryMap.tsx
rm -f src/hooks/useTerritory.ts
rm -f src/context/TerritoryContext.tsx
rm -f src/providers/territoryProvider.ts
```

### 3.2 Update Resource Components

```typescript
// src/resources/contacts/ContactList.tsx
import { List, Datagrid, TextField, EmailField, DateField } from 'react-admin';

const contactFilters = [
  ,
  ,
  // Remove territory filter:
  // 
  //   
  // 
];

export const ContactList = () => (
  
    
      
      
      
      
      {/* Remove territory field: */}
      {/* 
        
       */}
      
    
  
);
```

### 3.3 Update Create/Edit Forms

```typescript
// src/resources/contacts/ContactCreate.tsx
import { Create, SimpleForm, TextInput, required } from 'react-admin';

export const ContactCreate = () => (
  
    
      
      
      
      
      
      
      {/* Remove territory selection: */}
      {/* 
        
       */}
    
  
);
```

## 4. Update Dashboard Widgets

### 4.1 Remove Territory Filters from Widgets

```typescript
// src/dashboard/widgets/WeeklyTasksWidget.tsx
import React from 'react';
import { Card, Text, Metric, ProgressBar, Flex } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { CheckCircle } from '@mui/icons-material';

export const WeeklyTasksWidget: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: tasks, isLoading } = useGetList('tasks', {
    pagination: { page: 1, perPage: 100 },
    filter: { 
      assigned_to: identity?.id, // User-based filtering
      due_date: { 
        $gte: new Date().toISOString().split('T')[0] 
      }
      // Remove territory filter:
      // territory_id: identity?.territory_id
    },
  });

  // Rest of component remains the same...
};
```

### 4.2 Update All Widget Components

Apply the same pattern to all widget components:

```typescript
// src/dashboard/widgets/NewlyAddedContactsWidget.tsx
const { data: contacts, isLoading } = useGetList('contacts', {
  pagination: { page: 1, perPage: 5 },
  sort: { field: 'created_at', order: 'DESC' },
  filter: {
    created_by: identity?.id // User-based filtering only
    // Remove: territory_id: identity?.territory_id
  }
});

// src/dashboard/widgets/OpportunitiesStageChart.tsx
const { data: opportunities, isLoading } = useGetList('opportunities', {
  pagination: { page: 1, perPage: 1000 },
  filter: {
    created_by: identity?.id // User-based filtering only
    // Remove: territory_id: identity?.territory_id
  }
});
```

## 5. Update Data Provider

### 5.1 Remove Territory Logic from Supabase Provider

```typescript
// src/providers/supabaseProvider.ts
import { supabaseClient } from './supabaseClient';
import { DataProvider } from 'react-admin';

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = supabaseClient
      .from(resource)
      .select('*', { count: 'exact' });

    // Apply user-based filtering automatically through RLS
    // Remove territory filtering logic:
    // if (params.filter?.territory_id) {
    //   query.eq('territory_id', params.filter.territory_id);
    // }

    if (params.filter) {
      Object.keys(params.filter).forEach(key => {
        if (key !== 'q') {
          query.eq(key, params.filter[key]);
        }
      });
    }

    if (params.filter?.q) {
      query.ilike('name', `%${params.filter.q}%`);
    }

    const { data, error, count } = await query
      .order(field || 'created_at', { ascending: order === 'ASC' })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  },
  // ... other methods
};
```

## 6. Update Authentication Provider

### 6.1 Remove Territory from User Session

```typescript
// src/providers/authProvider.ts
import { AuthProvider } from 'react-admin';
import { supabaseClient } from './supabaseClient';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return Promise.resolve();
  },

  getIdentity: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      fullName: profile?.first_name + ' ' + profile?.last_name,
      email: user.email,
      role: profile?.role,
      // Remove territory information:
      // territory_id: profile?.territory_id,
      // territory_name: profile?.territory?.name,
    };
  },

  // ... other methods
};
```

## 7. Update Navigation and Routing

### 7.1 Remove Territory Routes

```typescript
// src/App.tsx
import { Admin, Resource } from 'react-admin';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { UnifiedDashboard } from './dashboard/UnifiedDashboard';

const App = () => (
  
    
    
    
    
    
    
    {/* Remove territory resource: */}
    {/*  */}
  
);

export default App;
```

### 7.2 Update Menu Configuration

```typescript
// src/components/Menu.tsx
import { Menu } from 'react-admin';
import { Dashboard, People, Business, Assignment, Timeline, LocalOffer } from '@mui/icons-material';

export const CustomMenu = () => (
  
    
    
    
    
    
    
    
    {/* Remove territory menu items: */}
    {/*  */}
  
);
```

## 8. Update Environment Variables

### 8.1 Remove Territory-Related Environment Variables

```bash
# .env - Remove territory-related variables
# REACT_APP_DEFAULT_TERRITORY=
# REACT_APP_TERRITORY_MAPPING_ENABLED=
# REACT_APP_TERRITORY_BOUNDARIES_API=
```

## 9. Update Test Files

### 9.1 Remove Territory Tests

```bash
# Remove territory-related test files
rm -f src/components/territory/__tests__/*
rm -f src/hooks/__tests__/useTerritory.test.ts
rm -f src/context/__tests__/TerritoryContext.test.tsx
```

### 9.2 Update Existing Tests

```typescript
// src/components/__tests__/ContactList.test.tsx
import { render, screen } from '@testing-library/react';
import { ContactList } from '../ContactList';

// Remove territory-related test cases
describe('ContactList', () => {
  it('renders contact list without territory filter', () => {
    render();
    expect(screen.queryByText('Territory')).not.toBeInTheDocument();
  });
  
  // Remove territory filter tests:
  // it('filters by territory', () => { ... });
});
```

## 10. Update Package Dependencies

### 10.1 Remove Territory-Related Dependencies

```bash
# Remove packages that were only used for territory functionality
npm uninstall territory-management-lib
npm uninstall geospatial-territory-utils
npm uninstall territory-boundary-parser
```

### 10.2 Update package.json Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 11. Update Documentation

### 11.1 Remove Territory References from README

```markdown
# ForkFlow CRM

A web-first, mobile-friendly CRM designed for food brokers who visit restaurants and stores.

## Features

- Customer and contact management
- Visit tracking with GPS
- Follow-up reminders
- Activity logging
- Mobile-optimized interface

```

### 11.2 Update API Documentation

Remove all territory-related endpoints and parameters from API documentation.

## 12. Database Migration Script

### 12.1 Create Migration Script

```sql
-- migration_remove_territory.sql
-- Run this script to remove all territory-related data and structures

BEGIN;

-- Step 1: Remove foreign key constraints
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_territory_id_fkey;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_territory_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_territory_id_fkey;
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_territory_id_fkey;
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_territory_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_territory_id_fkey;

-- Step 2: Remove territory columns
ALTER TABLE contacts DROP COLUMN IF EXISTS territory_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS territory_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS territory_id;
ALTER TABLE opportunities DROP COLUMN IF EXISTS territory_id;
ALTER TABLE interactions DROP COLUMN IF EXISTS territory_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS territory_id;

-- Step 3: Drop territory tables
DROP TABLE IF EXISTS territory_assignments CASCADE;
DROP TABLE IF EXISTS user_territories CASCADE;
DROP TABLE IF EXISTS territories CASCADE;

-- Step 4: Remove territory-based policies
DROP POLICY IF EXISTS "territory_contacts" ON contacts;
DROP POLICY IF EXISTS "territory_organizations" ON organizations;
DROP POLICY IF EXISTS "territory_tasks" ON tasks;
DROP POLICY IF EXISTS "territory_opportunities" ON opportunities;
DROP POLICY IF EXISTS "territory_interactions" ON interactions;
DROP POLICY IF EXISTS "territory_profiles" ON profiles;

-- Step 5: Create user-based policies
CREATE POLICY "user_contacts" ON contacts FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "user_organizations" ON organizations FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "user_tasks" ON tasks FOR ALL TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "user_opportunities" ON opportunities FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "user_interactions" ON interactions FOR ALL TO authenticated USING (created_by = auth.uid());
CREATE POLICY "user_profiles" ON profiles FOR ALL TO authenticated USING (id = auth.uid());

COMMIT;
```

## 13. Verification Steps

### 13.1 Code Verification

```bash
# Search for any remaining territory references
grep -r "territory" src/ --exclude-dir=node_modules
grep -r "Territory" src/ --exclude-dir=node_modules

# Check for unused imports
npx unused-imports src/
```

### 13.2 Database Verification

```sql
-- Verify no territory columns remain
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE column_name LIKE '%territory%' 
AND table_schema = 'public';

-- Verify no territory tables remain
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%territory%';
```

### 13.3 Application Testing

1. **Login as different users** and verify data isolation
2. **Test all CRUD operations** to ensure they work without territory filtering
3. **Check dashboard widgets** display user-specific data only
4. **Verify search and filtering** works without territory constraints
5. **Test mobile responsiveness** remains intact

## 14. Rollback Plan

### 14.1 Create Rollback Script

```sql
-- rollback_territory_removal.sql
-- Use this script to rollback territory removal if needed

BEGIN;

-- Recreate territory tables
CREATE TABLE territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add territory columns back
ALTER TABLE contacts ADD COLUMN territory_id UUID REFERENCES territories(id);
ALTER TABLE organizations ADD COLUMN territory_id UUID REFERENCES territories(id);
-- ... continue for all tables

COMMIT;
```

This comprehensive guide ensures complete removal of territory functionality from the ForkFlow CRM project while maintaining data integrity and user access control through user-based Row Level Security policies.
