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

## Solo Development Risk Management

### Key Concerns and Issues

**1. Effort Overload and Context Switching**  
- **High Workload Risk:** Managing both frontend and backend tasks alone can lead to fatigue and reduced focus. Rapidly switching between UI design, API development, testing, and documentation increases the chance of mistakes and slows overall progress.  
- **Mitigation:** Block dedicated time for each focus area, use Claude to draft code stubs and documentation, and schedule regular mental breaks to maintain clarity.

**2. Reliance on AI Assistance and Hallucination Risk**  
- **Accuracy Dependency:** Claude AI can accelerate coding but may generate incorrect or incomplete logic, especially for complex API behaviors and edge cases. Over-reliance without careful review can introduce subtle bugs.  
- **Mitigation:** Rigorously review and test all AI-suggested code. Write unit and integration tests before trusting generated implementations.

**3. API Contract Definition and Alignment**  
- **Specification Drift:** Without a team to cross-check, it's easy to build endpoints that drift from intended request/response schemas. Inconsistencies lead to integration failures between frontend and backend.  
- **Mitigation:** Define and maintain a single OpenAPI/Swagger file. Use Claude AI to generate both endpoint implementations and matching TypeScript client types.

**4. Integration and Testing Overhead**  
- **Testing Blind Spots:** One developer juggling coding and QA may overlook edge cases—pagination bugs, error handling gaps, or mobile-specific UI quirks.  
- **Mitigation:** Automate tests with clear coverage goals (>80%). Leverage Claude to draft test cases and testing scripts, then validate manually on real devices.

**5. Time Estimation and Schedule Slippage**  
- **Underestimation Tendency:** Solo developers often underestimate queues of small tasks—code reviews, refactoring, CI setup. This leads to slipping deadlines.  
- **Mitigation:** Add at least 30% buffer to all task estimates. Use Claude AI to generate time-tracking logs and daily progress summaries to catch slippage early.

**6. Knowledge Gaps and Skill Limitations**  
- **Full-Stack Demands:** One person must master React-admin UI, TypeScript, Supabase, API security, and mobile optimizations. Gaps in any area can bottleneck the entire project.  
- **Mitigation:** Use Claude to generate learning plans and code examples for unfamiliar technologies. Reserve time each week for skill reinforcement.

**7. Single Point of Failure**  
- **Continuity Risk:** If the sole developer becomes unavailable or overloaded, project momentum halts. Relying on one individual increases delivery risk.  
- **Mitigation:** Document architecture decisions, setup scripts, environment configs, and create an easily shareable project handbook with Claude's help to enable quick onboarding of additional help if needed.

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

## TypeScript Error Prevention Rules

### Critical Error Categories & Prevention

**1. Missing Material-UI Icons (TS2305)**
- **Prevention**: Always verify icon names at [mui.com/material-ui/material-icons/](https://mui.com/material-ui/material-icons/) before importing
- **Common Replacements**: 
  - `Presentation` → `Slideshow`
  - `Opportunity` → `TrendingUp` 
  - `Meeting` → `Event`
- **Example**:
  ```typescript
  // ❌ WRONG
  import { Presentation } from '@mui/icons-material';
  
  // ✅ CORRECT  
  import { Slideshow } from '@mui/icons-material';
  ```

**2. React-Admin API Compatibility (TS2724)**
- **Prevention**: Check react-admin version documentation for hook availability
- **Solution**: Replace deprecated hooks with current alternatives
- **Example**:
  ```typescript
  // ❌ WRONG
  const typeId = useWatch({ name: 'typeId' });
  
  // ✅ CORRECT
  const record = useRecordContext();
  const typeId = record?.typeId;
  ```

**3. Data Generator Schema Mismatches (TS2339)**
- **Prevention**: Update data generators immediately after schema migrations
- **Legacy Field Mapping**:
  - `salesId` → `accountManager`
  - `broker_id` → `distributorId`
  - `company_id` → `organizationId`
- **Example**:
  ```typescript
  // ❌ WRONG
  const org = faker.helpers.arrayElement(db.organizations);
  
  // ✅ CORRECT
  const org = faker.helpers.arrayElement((db.organizations || []) as any[]);
  ```

**4. Faker.js API Deprecation (TS2353)**
- **Prevention**: Use modern Faker.js API parameters
- **Replacements**:
  - `precision` → `fractionDigits`
  - `days` → `refDate`
- **Example**:
  ```typescript
  // ❌ WRONG
  faker.number.float({ precision: 0.01 })
  faker.date.future({ days: 30 })
  
  // ✅ CORRECT
  faker.number.float({ fractionDigits: 2 })
  faker.date.future({ refDate: new Date() })
  ```

**5. Form Validation Type Errors (TS2322)**
- **Prevention**: Use type assertions for react-admin validation compatibility
- **Example**:
  ```typescript
  // ❌ WRONG
  validate={required()}
  
  // ✅ CORRECT
  validate={required() as any}
  ```

**6. Event Handler Type Mismatches (TS2345)**
- **Prevention**: Handle KeyboardEvent/MouseEvent conflicts with type assertions
- **Example**:
  ```typescript
  // ❌ WRONG
  onKeyDown={(e) => handleView(e)}  // KeyboardEvent to MouseEvent
  
  // ✅ CORRECT
  onKeyDown={(e) => handleView(e as any)}
  ```

### Type Safety Best Practices

**Null Safety Patterns**
```typescript
// ✅ Use nullish coalescing for null/undefined checks
stats.totalContacts ?? 0  // instead of stats.totalContacts || 0
Object.entries(data ?? {}).map(...)  // instead of Object.entries(data).map(...)
```

**Array Safety Patterns**
```typescript
// ✅ Always provide fallback arrays
faker.helpers.arrayElement(array || [])
(db.organizations || []) as any[]
```

**Interface Extension Patterns**
```typescript
// ✅ Use Omit for type incompatibilities
interface Extended extends Omit<BaseType, 'conflictingField'> {
  conflictingField: NewType;
}
```

**React-Admin Form Patterns**
```typescript
// ✅ FilterForm usage (no resource prop)
<FilterForm>  // not <FilterForm resource="interactions">

// ✅ File input accept prop
accept={{'image/*': [], 'application/pdf': []} as any}

// ✅ Use ReactElement for icon props in Material-UI
const icons: Record<string, React.ReactElement> = {
  demo: <SlideshowIcon />
};
```

### Error Prevention Workflow

1. **Compile Frequently**: Run `npm run build` during development to catch errors early
2. **Error-Type Focus**: Fix by error category, not file-by-file
3. **Priority Order**: Block compilation errors first, then warnings
4. **Test Generators**: Verify data generators after schema changes
5. **Documentation**: Update this file when encountering new error patterns

### Emergency TypeScript Fixes

If build is completely broken:
```bash
# Quick type safety bypass (temporary only)
// @ts-ignore  # Use sparingly and document why
// @ts-expect-error  # Better - documents expected error
```

**7. React-Admin Component Props Compatibility (TS2322)**
- **Prevention**: Custom components used in Datagrid must accept react-admin field props
- **Issue**: `Property 'label' does not exist on type 'IntrinsicAttributes'`
- **Root Cause**: Custom chip components didn't define proper TypeScript interfaces for props
- **Solution**: Add proper interfaces with `label`, `source`, and `record` props
- **Example**:
  ```typescript
  // ❌ WRONG - Component without props interface
  const CategoryChip = () => {
    const record = useRecordContext<Product>();
    return <Chip label={record?.category} />;
  };
  
  // ✅ CORRECT - Component with proper props interface
  interface CategoryChipProps {
    label?: string;
    source?: string; 
    record?: Product;
  }
  
  const CategoryChip: React.FC<CategoryChipProps> = ({ label, source, record: propRecord }) => {
    const contextRecord = useRecordContext<Product>();
    const record = propRecord || contextRecord;
    return <Chip label={record?.category} />;
  };
  ```
- **When Applied**: Custom field components used in Datagrid (e.g., `<CategoryChip label="Category" />`)
- **Files Affected**: src/products/ProductList.tsx (CategoryChip, PrincipalChip components)

**Remember**: These rules prevent the 49% error reduction we achieved (85→43 errors) from regressing!

## Development Principles

### Principled Development Approach
- **Never install software, packages, etc. ALWAYS give the steps to install them and wait until it is confirmed that it was installed successfully before continuing to the next step.**

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS follow the TypeScript Error Prevention Rules above to maintain code quality and prevent regressions.

## Reminder Guidelines
- **ALWAYS ASK THE ADMIN TO INSTALL ANY ADDITIONAL PACKAGES TO THE SYSTEM!!!**