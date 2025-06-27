# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture

This is **ForkFlow-CRM**, a food broker CRM system built with React + react-admin + Supabase. It's designed as a mobile-first, website-friendly CRM for food brokers who visit restaurants and stores.

### Tech Stack
- **Frontend**: React 18 + TypeScript + react-admin 5.4 + Material-UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, REST API, Edge Functions)
- **Data Visualization**: Nivo charts (@nivo/bar, @nivo/core)
- **Maps**: Google Maps JavaScript API integration
- **State Management**: react-admin's built-in patterns
- **File Processing**: Papa Parse for CSV import/export
- **UI Philosophy**: Mobile-first with 44px+ touch targets

### Key Architectural Patterns
- **Data Providers**: Uses both Supabase (`ra-supabase`) and fake REST (`ra-data-fakerest`) providers
- **Authentication**: Supabase Auth with Google, Azure, Keycloak, and Auth0 integration
- **Real-time**: Supabase real-time subscriptions for live updates
- **Row Level Security**: Database access controlled via Supabase RLS policies
- **Activity Logging**: Comprehensive activity tracking system in `src/activity/`

## Development Commands

### Essential Commands (use these frequently)
```bash
# Full development stack
make start                    # Starts Supabase + React dev server
make install                  # Install all dependencies

# Individual services
make start-supabase          # Start Supabase locally only
make start-app               # Start React dev server only
npm run dev                  # Alternative to make start-app

# Database operations
make supabase-migrate-database  # Apply migrations
make supabase-reset-database   # Reset and clear database
```

### Testing and Quality
```bash
make test                    # Run unit tests (Vitest)
make lint                    # Run ESLint + Prettier checks
npm run lint:apply           # Auto-fix linting issues
npm run prettier:apply       # Auto-format code
```

### Build Commands
```bash
make build                   # Production build
make build-lib               # Library build
npm run build-storybook      # Storybook build
npm run storybook            # Start Storybook dev server
```

## Project Structure

### Core Domains
- `src/companies/` - Company management with logo handling and company cards
- `src/contacts/` - Contact management with avatar, tags, and CSV import/export
- `src/deals/` - Sales pipeline with Kanban board and deal stages
- `src/notes/` - Note-taking system with file attachments for contacts and deals
- `src/tasks/` - Task management and reminders
- `src/dashboard/` - Main dashboard with charts, activity logs, and welcome flow

### Infrastructure
- `src/providers/` - Data providers (Supabase and fake REST)
- `src/activity/` - Activity logging and tracking system
- `src/root/` - App configuration, i18n, and context providers
- `src/login/` - Authentication flows and user signup
- `src/layout/` - Header and main layout components

### Supabase Integration
- `supabase/migrations/` - Database schema and migrations
- `supabase/functions/` - Edge functions (email processing, user management)
- `src/providers/supabase/` - Supabase client configuration and auth provider

## Development Guidelines

### React + TypeScript Patterns
- Use functional components with TypeScript interfaces
- Prefer `interface` over `type` for component props
- Follow react-admin patterns for data fetching and form handling
- Mobile-first responsive design with proper touch targets

### Database and API
- Always use TypeScript types from `src/types.ts`
- Implement proper error handling for all Supabase operations
- Use Row Level Security policies for data isolation
- Clean up real-time subscriptions in useEffect cleanup

### Key Configuration Files
- `.cursorrules` - Project-specific AI assistant rules
- `.cursor/rules/` - Detailed development guidelines for React, TypeScript, Supabase patterns
- `src/types.ts` - Comprehensive TypeScript definitions for all entities
- `makefile` - Development workflow automation

### Special Features
- **Email Integration**: CC the CRM to automatically save emails as notes
- **GPS Tracking**: Visit tracking with location coordinates
- **CSV Import/Export**: Full contact data management
- **Activity Logging**: Comprehensive tracking of all CRM activities
- **Kanban Pipeline**: Visual deal management with drag-and-drop

### Local Development URLs
- App: http://localhost:5173/
- Supabase Dashboard: http://localhost:54323/
- REST API: http://127.0.0.1:54321
- Email Testing: http://localhost:54324/ (Inbucket)

## Testing
Unit tests use Vitest and are located alongside source files with `.test.ts` or `.test.tsx` extensions. Always run `make test` before committing changes.

## Error Management

### Error Logging Strategy
- Create a log of all errors and their final fix note if they have not been fixed yet

### Problem-Solving Strategies
- Do not be so positive that a fix will work; always confirm with a test or search with Exa, Perplexity, or Context7

### Confidence Levels
- Always state the confidence level of a task
- For any confidence an 8 or below, do more research with Exa and Perplexity or Context7

## Development Wisdom
- MCP tools are your best friend and should be use as often as possible

## Schema and Type Management

### Field Name and Type Guidelines
- **Rule: Always Use the New Schema Field Names and Types**
  - Scope: Applies to all TypeScript, React, and Supabase-related files in the project.
  - Guidelines:
    - Always use the latest schema field names as defined in your Supabase/Postgres database and TypeScript types.
    - Do not use legacy/old field names (e.g., use organizationId not company_id, createdAt not created_at, linkedInUrl not linkedin_url, etc.).
    - When updating or creating components, hooks, or data providers, reference the TypeScript types generated from the Supabase schema.
    - If you encounter a field that is not present in the new schema, refactor the code to use the correct new field or remove the usage.
    - When mapping or transforming data, always convert legacy field names to the new schema before using them in the application.
    - Update all test data, mock data, and stories to use the new schema field names and types.
    - Document any schema-related changes in the code comments and update relevant documentation.
  - Rationale: This ensures type safety, reduces bugs, and keeps the codebase aligned with the current database structure. It also makes onboarding and future migrations easier.