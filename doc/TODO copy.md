# 🚧 Field Renaming Migration Progress (2024-07-13)

## Batch Migration: Legacy → New Schema Field Names

### ✅ Completed
- [x] All usages of `company_id` → `organizationId` (data providers, generators, React-admin, utilities, activities, etc.)
- [x] All usages of `company_name` → `organization?.name`
- [x] All usages of `archived_at` → `archivedAt`
- [x] All usages of `expected_closing_date` → `expectedClosingDate`
- [x] All usages of `contact_ids` → `contactIds`
- [x] All usages of `email_jsonb` → `email`
- [x] All usages of `phone_jsonb` → `phone`
- [x] All usages of `sales_id` → `salesId`
- [x] All usages of `created_at` → `createdAt`

### ✅ Completed
- [x] `updated_at` → `updatedAt`

### 🔄 In Progress / Next Up

## 📋 Current Development Status (2025-06-27)

### ✅ Recently Completed
- **Task 1.3: Create Contacts Entity** (COMPLETED 2025-06-27)
  - ✅ Contacts table schema implemented with all B2B CRM fields
  - ✅ Foreign key relationships with Organizations and Settings established
  - ✅ Comprehensive Row Level Security (RLS) policies implemented
  - ✅ Enhanced B2B contacts data generator with realistic faker.js data
  - ✅ TypeScript types already properly defined
  - ✅ UI components already implemented and registered in CRM.tsx
  - ✅ Testing completed - TypeScript compilation successful

- **Task 2.1: Set Up Principals in Settings** (COMPLETED 2025-06-27)
  - ✅ 11 real food service principals added to fakerest data generator
  - ✅ PrincipalManager admin component created
  - ✅ Settings UI updated with principal support
  - ✅ Full CRUD operations for principal management

- **Task 2.2: Create Products Entity** (COMPLETED 2025-06-27)
  - ✅ 150+ realistic food service products across 7 categories
  - ✅ Complete Products CRUD UI with principal integration
  - ✅ Product data generator with proper principal relationships
  - ✅ Mobile-responsive product management interface

### 🎯 Next Priority Tasks
- **Task 2.3: Build Products UI Components** - ✅ COMPLETED (included in 2.2)
- **Task 2.4: Integrate Principals with Products** - Ready to start
- **Task 3.1: Create Opportunities Entity** - Next in Phase 3
- **Task 1.4: Build Organizations UI Components** - Can be done in parallel

### 🏗️ Implementation Notes
- Using **fakerest** data provider instead of Supabase for development
- All Settings system infrastructure is in place and functional
- Principal data includes proper brand colors and market importance ranking
- Mobile-first responsive design maintained throughout

---

# ForkFlow-CRM Development TODO List - B2B Food Service CRM

Now that your ForkFlow-CRM project is correctly set up with Supabase, here's a comprehensive, detailed TODO list to transform the Atomic CRM into a complete B2B food service CRM system. This follows the proper Organization/Contact/Product/Opportunity/Interaction schema with phased development and UI testing at each milestone.

## Project Overview

**Project Name:** ForkFlow-CRM  
**Purpose:** B2B Food Service Sales CRM for field representatives managing restaurant relationships  
**Tech Stack:** React + react-admin + TypeScript + Material-UI + Supabase (cloud)  
**Schema:** Organization → Contact → Opportunity → Interaction with Principal/Product integration  
**Development Approach:** Phased implementation with UI testing at each milestone  

## Phase 1: Organizations & Contacts Foundation (Week 1-2)

### 🏢 **Task 1.1: Implement Settings Management System**
**Priority:** Critical | **Effort:** 1 day
- [ ] Create Settings table in Supabase:
  - [ ] `id` (Primary Key)
  - [ ] `category` (string: priority, segment, distributor, role, influence, decision, principal, stage, interaction_type)
  - [ ] `key` (string: unique identifier)
  - [ ] `label` (string: display name)
  - [ ] `color` (string: hex color for UI)
  - [ ] `sortOrder` (int: display order)
  - [ ] `active` (boolean)
  - [ ] `createdAt`, `updatedAt` (timestamps)
- [ ] Populate default settings data:
  - [ ] Priorities: A (Green), B (Yellow), C (Orange), D (Red)
  - [ ] Segments: Fine Dining, Fast Food, Healthcare, Catering, Institutional
  - [ ] Distributors: Sysco, USF, PFG, Direct, Other
  - [ ] Contact Roles: Chef, Manager, Owner, Purchasing, Other
  - [ ] Influence Levels: High, Medium, Low
  - [ ] Decision Roles: Decision Maker, Influencer, Gatekeeper, User
- [ ] Create SettingsManager component for admin configuration
- **Success Criteria:** Settings table created, default data populated, admin interface functional

### 🏢 **Task 1.2: Create Organizations Entity**
**Priority:** Critical | **Effort:** 1.5 days
- [ ] Create Organizations table in Supabase:
  - [ ] `id` (Primary Key)
  - [ ] `name` (string: restaurant/business name)
  - [ ] `priorityId` (Foreign Key → Setting)
  - [ ] `segmentId` (Foreign Key → Setting)
  - [ ] `distributorId` (Foreign Key → Setting)
  - [ ] `accountManager` (string: assigned sales rep)
  - [ ] `address`, `city`, `state`, `zipCode` (location fields)
  - [ ] `phone`, `website` (contact information)
  - [ ] `notes` (text: business details)
  - [ ] `createdAt`, `updatedAt`, `createdBy` (audit fields)
- [ ] Set up Row Level Security (RLS) for Organizations
- [ ] Create database relationships with Settings
- **Success Criteria:** Organizations table created with proper relationships and RLS policies

### ✅ **Task 1.3: Create Contacts Entity** 
**Priority:** Critical | **Effort:** 1.5 days | **Status:** COMPLETED
- [x] Create Contacts table in Supabase:
  - [x] `id` (Primary Key)
  - [x] `organizationId` (Foreign Key → Organization)
  - [x] `firstName`, `lastName` (person's name)
  - [x] `email`, `phone` (contact information)
  - [x] `roleId` (Foreign Key → Setting: Chef, Manager, Owner, etc.)
  - [x] `influenceLevelId` (Foreign Key → Setting: High, Medium, Low)
  - [x] `decisionRoleId` (Foreign Key → Setting: Decision Maker, Influencer, etc.)
  - [x] `linkedInUrl` (string: professional profile)
  - [x] `isPrimary` (boolean: primary contact for organization)
  - [x] `notes` (text: relationship notes)
  - [x] `createdAt`, `updatedAt`, `createdBy` (audit fields)
- [x] Set up Row Level Security (RLS) for Contacts
- [x] Create database relationships with Organizations and Settings
- [x] Enhanced B2B contacts data generator with faker.js integration
- [x] TypeScript types verification and testing
- **Success Criteria:** ✅ Contacts table created with proper relationships, RLS policies, and realistic data generation

### 🎨 **Task 1.4: Build Organizations UI Components**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create OrganizationList component:
  - [ ] Mobile-first responsive design
  - [ ] Display organization name, segment, priority (color-coded)
  - [ ] Filter by priority, segment, distributor
  - [ ] Search by organization name
  - [ ] Touch-friendly list items (44px+ height)
- [ ] Create OrganizationCreate/Edit components:
  - [ ] Form with all organization fields
  - [ ] Settings-based dropdowns for priority, segment, distributor
  - [ ] Address validation and formatting
  - [ ] Mobile-optimized form layout
  - [ ] GPS coordinate capture for address
- [ ] Create OrganizationShow component:
  - [ ] Complete organization details
  - [ ] Related contacts list
  - [ ] Quick actions (call, email, directions)
  - [ ] Edit and delete functionality
- **Success Criteria:** Full CRUD operations for Organizations work on mobile and desktop

### 👤 **Task 1.5: Build Contacts UI Components**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create ContactList component:
  - [ ] Display within organization context
  - [ ] Show contact role, influence level, decision role
  - [ ] Primary contact highlighting
  - [ ] Mobile-optimized contact cards
  - [ ] Filter by role, influence level
- [ ] Create ContactCreate/Edit components:
  - [ ] Form linked to parent organization
  - [ ] Settings-based dropdowns for role, influence, decision
  - [ ] Contact information validation
  - [ ] LinkedIn profile integration
  - [ ] Mobile-friendly form controls
- [ ] Create ContactShow component:
  - [ ] Complete contact details
  - [ ] Organization context
  - [ ] Communication history placeholder
  - [ ] Quick actions (call, email, LinkedIn)
- **Success Criteria:** Full CRUD operations for Contacts work with Organization relationships

### 🔗 **Task 1.6: Implement Organization-Contact Relationships**
**Priority:** Critical | **Effort:** 1 day
- [ ] Create Organization detail page with embedded contacts:
  - [ ] Organization header with key details
  - [ ] Contacts tab with full contact management
  - [ ] Add new contact functionality
  - [ ] Primary contact designation
- [ ] Implement contact selection flows:
  - [ ] Organization selection when creating contacts
  - [ ] Contact transfer between organizations
  - [ ] Duplicate contact detection
- [ ] Add relationship management features:
  - [ ] Set primary contact per organization
  - [ ] Contact role hierarchy display
  - [ ] Influence mapping visualization
- **Success Criteria:** Organizations and Contacts work together seamlessly, relationships properly managed

### 📱 **Task 1.7: Mobile Optimization for Organizations & Contacts**
**Priority:** High | **Effort:** 1 day
- [ ] Optimize touch interactions:
  - [ ] 44px+ minimum touch targets
  - [ ] Swipe gestures for actions
  - [ ] Pull-to-refresh functionality
- [ ] Implement mobile navigation:
  - [ ] Bottom tab bar navigation
  - [ ] Breadcrumb navigation for relationships
  - [ ] Back button functionality
- [ ] Add mobile-specific features:
  - [ ] Click-to-call phone numbers
  - [ ] Email integration
  - [ ] GPS directions to organizations
- **Success Criteria:** All Organization and Contact features work smoothly on mobile devices

### ✅ **Phase 1 Testing Milestone**
**Priority:** Critical | **Effort:** 0.5 days
- [ ] Test Organization management:
  - [ ] Create, read, update, delete organizations
  - [ ] Settings-based dropdowns work correctly
  - [ ] Search and filtering functional
  - [ ] Mobile responsiveness verified
- [ ] Test Contact management:
  - [ ] Create, read, update, delete contacts
  - [ ] Organization relationships work
  - [ ] Role and influence settings functional
  - [ ] Primary contact designation works
- [ ] Test data integrity:
  - [ ] RLS policies enforce data isolation
  - [ ] Foreign key constraints working
  - [ ] Settings relationships maintained
- **Success Criteria:** Phase 1 features fully functional, UI tested and approved before proceeding

---

## Phase 2: Principals & Products (Week 3)

### ✅ **Task 2.1: Set Up Principals in Settings** 
**Priority:** Critical | **Effort:** 0.5 days | **Status:** COMPLETED
- [x] Add 11 food service principals to Settings:
  - [x] Category: 'principal'
  - [x] Include major food service brands (Sysco, US Foods, PFG, McLane, UNFI, C&S, Gordon Food Service, Tyson, Maines, Reinhart, Reyes)
  - [x] Assign brand colors for UI consistency
  - [x] Set display order by market importance
- [x] Create PrincipalManager component for admin interface
- [x] Update SettingsCreate to include 'principal' category
- [x] Add principal filtering to SettingsList
- **Success Criteria:** ✅ 11 principals configured in Settings system with full admin interface

### ✅ **Task 2.2: Create Products Entity**
**Priority:** Critical | **Effort:** 1 day | **Status:** COMPLETED
- [x] Update Product TypeScript interface for B2B schema:
  - [x] `id` (Primary Key)
  - [x] `name` (string: product name)
  - [x] `principalId` (Foreign Key → Setting)
  - [x] `category` (string: product category)
  - [x] `description` (text: product details)
  - [x] `price` (decimal: current price)
  - [x] `sku` (string: product SKU)
  - [x] `active` (boolean: available for sale)
  - [x] `createdAt`, `updatedAt`, `createdBy` (audit fields)
- [x] Create Products data generator with 150+ realistic food service products
- [x] Build complete Products UI (List, Create, Edit, Show components)
- [x] Register Products resource in CRM application
- [x] Integrate with existing Principal relationships from Settings
- **Success Criteria:** ✅ Complete Products system with principal relationships functional

### 🛍️ **Task 2.3: Build Products UI Components**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create ProductList component:
  - [ ] Display products with principal branding
  - [ ] Filter by principal, category, active status
  - [ ] Search by product name, SKU
  - [ ] Price display and sorting
  - [ ] Mobile-optimized product cards
- [ ] Create ProductCreate/Edit components:
  - [ ] Form with all product fields
  - [ ] Principal selection from Settings
  - [ ] Price formatting and validation
  - [ ] Product image upload (future enhancement)
  - [ ] Mobile-friendly form layout
- [ ] Create ProductShow component:
  - [ ] Complete product details
  - [ ] Principal branding display
  - [ ] Related opportunities (placeholder)
  - [ ] Price history (placeholder)
- **Success Criteria:** Full CRUD operations for Products work with Principal relationships

### 🔗 **Task 2.4: Integrate Principals with Products**
**Priority:** High | **Effort:** 1 day
- [ ] Create Principal-based product views:
  - [ ] Products grouped by principal (Principal → Product relationship)
  - [ ] Principal branding throughout UI
  - [ ] Principal performance metrics
- [ ] Add product search and filtering:
  - [ ] Filter by specific principals
  - [ ] Category-based filtering
  - [ ] Active/inactive product toggle
- [ ] Implement product catalog features:
  - [ ] Product comparison functionality
  - [ ] Bulk product operations
  - [ ] Product import/export tools
- **Success Criteria:** Principal → Product relationships working correctly, filtering and search functional

### ✅ **Phase 2 Testing Milestone**
**Priority:** Critical | **Effort:** 0.5 days
- [ ] Test Product management:
  - [ ] Create, read, update, delete products
  - [ ] Principal relationships work correctly
  - [ ] Search and filtering functional
  - [ ] Mobile responsiveness verified
- [ ] Test Principal integration:
  - [ ] Principal branding displays correctly
  - [ ] Product grouping by principal works
  - [ ] Settings-based principal selection functional
- **Success Criteria:** Phase 2 features fully functional, UI tested and approved before proceeding

---

## Phase 3: Opportunities & Interactions (Week 4-5)

### 💼 **Task 3.1: Create Opportunities Entity**
**Priority:** Critical | **Effort:** 1.5 days
- [ ] Create Opportunities table in Supabase:
  - [ ] `id` (Primary Key)
  - [ ] `organizationId` (Foreign Key → Organization)
  - [ ] `contactId` (Foreign Key → Contact)
  - [ ] `productId` (Foreign Key → Product)
  - [ ] `stageId` (Foreign Key → Setting: pipeline stages)
  - [ ] `status` (string: active, won, lost, on-hold)
  - [ ] `probability` (int: 0-100% chance of closing)
  - [ ] `estimatedValue` (decimal: potential revenue)
  - [ ] `expectedCloseDate` (datetime: target close date)
  - [ ] `notes` (text: opportunity details)
  - [ ] `createdAt`, `updatedAt`, `createdBy` (audit fields)
- [ ] Set up Row Level Security (RLS) for Opportunities
- [ ] Create database relationships with Organizations, Contacts, Products, Settings
- **Success Criteria:** Opportunities table created with all relationships

### 📞 **Task 3.2: Create Interactions Entity**
**Priority:** Critical | **Effort:** 1.5 days
- [ ] Create Interactions table in Supabase:
  - [ ] `id` (Primary Key)
  - [ ] `organizationId` (Foreign Key → Organization)
  - [ ] `contactId` (Foreign Key → Contact)
  - [ ] `opportunityId` (Foreign Key → Opportunity)
  - [ ] `typeId` (Foreign Key → Setting: Email, Call, In Person, Demo, Quote, Follow-up)
  - [ ] `subject` (string: interaction title)
  - [ ] `notes` (text: detailed notes)
  - [ ] `scheduledDate` (datetime: planned date/time)
  - [ ] `completedDate` (datetime: actual completion)
  - [ ] `isCompleted` (boolean: completion status)
  - [ ] `latitude`, `longitude` (GPS coordinates for in-person interactions)
  - [ ] `createdAt`, `updatedAt`, `createdBy` (audit fields)
- [ ] Set up Row Level Security (RLS) for Interactions
- [ ] Create database relationships with all related entities
- **Success Criteria:** Interactions table created with full relationship model

### 🎯 **Task 3.3: Build Opportunities UI Components**
**Priority:** Critical | **Effort:** 2.5 days
- [ ] Create OpportunityList component:
  - [ ] Pipeline view with drag-and-drop stage progression
  - [ ] Filter by stage, probability, close date
  - [ ] Organization and contact context
  - [ ] Mobile-optimized opportunity cards
  - [ ] Revenue totals and forecasting
- [ ] Create OpportunityCreate/Edit components:
  - [ ] Linked to organization and contact
  - [ ] Product selection with principal context
  - [ ] Pipeline stage selection
  - [ ] Probability and value estimation
  - [ ] Expected close date picker
- [ ] Create OpportunityShow component:
  - [ ] Complete opportunity details
  - [ ] Related interactions timeline
  - [ ] Stage progression history
  - [ ] Quick action buttons
- **Success Criteria:** Full opportunity management with pipeline visualization

### 📱 **Task 3.4: Build Interactions UI Components**
**Priority:** Critical | **Effort:** 2.5 days
- [ ] Create InteractionList component:
  - [ ] Timeline view of all interactions
  - [ ] Filter by type, date, completion status
  - [ ] Organization and opportunity context
  - [ ] Mobile-optimized interaction cards
- [ ] Create InteractionCreate/Edit components:
  - [ ] 6 interaction types (Email, Call, In Person, Demo, Quote, Follow-up)
  - [ ] Link to organization, contact, opportunity
  - [ ] GPS capture for in-person interactions
  - [ ] Scheduling and completion tracking
  - [ ] Mobile-first form design
- [ ] Create InteractionShow component:
  - [ ] Complete interaction details
  - [ ] Organization and opportunity context
  - [ ] GPS location for in-person meetings
  - [ ] Follow-up scheduling
- **Success Criteria:** Full interaction tracking with 6 types and GPS integration

### 🔄 **Task 3.5: Implement Sales Pipeline Management**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create Pipeline Dashboard:
  - [ ] Visual pipeline with opportunities by stage
  - [ ] Drag-and-drop stage progression
  - [ ] Revenue forecasting by stage
  - [ ] Pipeline velocity metrics
- [ ] Add Pipeline stages to Settings:
  - [ ] Lead Discovery, Contacted, Sampled/Visited, Follow-up, Close
  - [ ] Stage-specific probability defaults
  - [ ] Color coding for pipeline visualization
- [ ] Implement stage progression logic:
  - [ ] Automatic interaction logging on stage changes
  - [ ] Required fields by stage
  - [ ] Stage-specific notifications
- **Success Criteria:** Complete pipeline management with stage progression and forecasting

### 🔗 **Task 3.6: Integrate Complete Relationship Model**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create unified dashboard showing:
  - [ ] Organizations with contact counts
  - [ ] Opportunities by stage and value
  - [ ] Recent interactions by type
  - [ ] Upcoming scheduled interactions
- [ ] Implement cross-entity navigation:
  - [ ] Organization → Contacts → Opportunities → Interactions
  - [ ] Principal → Products → Opportunities using that product
  - [ ] Contact → Opportunities → Interactions
- [ ] Add relationship-based reporting:
  - [ ] Interaction frequency by organization
  - [ ] Opportunity conversion rates
  - [ ] Principal performance metrics
- **Success Criteria:** All entities work together seamlessly with proper navigation

### 📱 **Task 3.7: Mobile Optimization for Complete System**
**Priority:** High | **Effort:** 1.5 days
- [ ] Optimize mobile workflows:
  - [ ] Quick interaction logging from any screen
  - [ ] GPS auto-capture for in-person interactions
  - [ ] Offline interaction storage
- [ ] Implement mobile-specific features:
  - [ ] One-tap calling and emailing
  - [ ] Camera integration for interaction notes
  - [ ] Voice-to-text for note taking
- [ ] Add mobile dashboard:
  - [ ] Today's scheduled interactions
  - [ ] Quick opportunity updates
  - [ ] GPS-based "near me" organizations
- **Success Criteria:** Complete mobile workflow optimized for field sales

### ✅ **Phase 3 Testing Milestone**
**Priority:** Critical | **Effort:** 1 day
- [ ] Test complete sales workflow:
  - [ ] Organization → Contact → Opportunity → Interaction flow
  - [ ] Pipeline stage progression
  - [ ] All 6 interaction types functional
  - [ ] GPS capture for in-person interactions
- [ ] Test mobile usability:
  - [ ] All features work on mobile devices
  - [ ] Touch targets appropriate size
  - [ ] Performance acceptable on mobile networks
- [ ] Test data integrity:
  - [ ] All relationships maintained
  - [ ] RLS policies working across all entities
  - [ ] Settings properly driving all dropdowns
- **Success Criteria:** Complete B2B food service CRM functional and tested

---

## Phase 4: Advanced Features & Polish (Week 6)

### 🗺️ **Task 4.1: Advanced GPS and Mapping**
**Priority:** High | **Effort:** 1.5 days
- [ ] Integrate Google Maps for organizations
- [ ] Route planning between organizations
- [ ] GPS tracking for field rep routes
- [ ] "Near me" organization discovery

### 📊 **Task 4.2: Reporting and Analytics**
**Priority:** High | **Effort:** 2 days
- [ ] Pipeline reporting and forecasting
- [ ] Interaction frequency analysis
- [ ] Principal performance metrics
- [ ] Territory management reporting

### 🧪 **Task 4.3: Testing and Deployment**
**Priority:** Critical | **Effort:** 2 days
- [ ] Comprehensive testing across all features
- [ ] Performance optimization
- [ ] Production deployment
- [ ] User training materials

## Success Metrics for Complete B2B CRM

- ✅ 10+ organizations with multiple contacts each
- ✅ 50+ opportunities across pipeline stages  
- ✅ 200+ interactions logged (all 6 types)
- ✅ Pipeline conversion tracking functional
- ✅ Mobile workflow optimized for field sales
- ✅ GPS tracking accurate for in-person interactions
- ✅ Settings-driven configuration throughout

This comprehensive plan transforms the CRM into a complete B2B food service sales platform with proper entity relationships, mobile optimization, and full sales pipeline management.