## Website-First, Mobile UI Friendly CRM Plan (Atomic CRM Structure & Tech Stack)

This plan is structured for a **website-first** CRM that is highly usable and visually optimized on both desktop and mobile, following the architecture and conventions of [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm). All language has been updated to emphasize a primary website experience with mobile-friendly UI, not a mobile-first approach.

## 1. Executive Summary

- **Product:** Website-first CRM for food brokers, optimized for both desktop and mobile browsers.   
- **Tech Stack:** React + react-admin + TypeScript + Tailwind CSS (frontend); Supabase (PostgreSQL, Auth,Storage, REST API) as backend.    
- **Deployment:** Static frontend (Vercel/Netlify), managed backend (Supabase).    
- **MVP Target:** 5 brokers, 500-1,000 customers, 10-25 visits/day.    

## 2. Product Strategy

- **Vision:** Deliver a web-based CRM that is robust and efficient on desktop, with a user interface that remains intuitive and accessible on mobile devices.    
- **Success Criteria:**    
    - 100% browser accessibility (desktop, tablet, mobile)        
    - Visit logging under 2 minutes on any device        
    - 95% uptime, <3s load times        
    - No app store dependencies        
    - <$50/month operational cost       

## 3. User Stories & Requirements

## Authentication & User Management

- Supabase Auth (email/password, OAuth, magic link)    
- Role-based access (broker/admin)    
- Password reset via email    

## Customer Management

- Add/search/edit customer records (restaurants, stores)    
- View customer details, notes, visit history    
- Forms and lists optimized for both desktop and mobile    

## Visit Tracking

- Log visits from customer detail page    
- Capture GPS (browser-based, permissioned)    
- Add visit notes (1000 char)    
- Set follow-up reminders    
- View visit history per customer    

## Reporting & Dashboard

- react-admin dashboard: visits per day/week/month, overdue customers    
- CSV export for customers/visits    
- Responsive charts and data tables    

## Maps Integration

- Google Maps integration (frontend)    
- Customer pins, tap for info/directions    
- "Near Me" view using device GPS    

## 4. Technical Architecture

|Layer|Technology/Service|
|---|---|
|Frontend|React + react-admin + TypeScript + Tailwind CSS|
|State/Data|react-admin DataProvider (REST to Supabase)|
|Backend|Supabase (PostgreSQL, Auth, Storage, REST API)|
|Auth|Supabase Auth (email/password, OAuth)|
|Storage|Supabase Storage (photos, docs)|
|Maps|Google Maps JS API (frontend)|
|Reporting|react-admin dashboard + Tremor charts|
|Deployment|Vercel/Netlify (frontend), Supabase (backend)|

## 5. Data Model (Supabase Schema)

## Users (Managed by Supabase Auth)

- id (UUID, PK)    
- email (unique)    
- role (broker, admin) — via metadata    

## Customers

- id (UUID, PK)    
- business_name (string, required)    
- contact_person (string)    
- phone, email, address, city, state, zip    
- business_type (restaurant, grocery, distributor, other)    
- notes (text, 500 char)    
- latitude, longitude (decimal)    
- created_by (UUID, FK to users)    
- created_at, updated_at (timestamp)    

## Visits

- id (UUID, PK)    
- customer_id (UUID, FK)    
- broker_id (UUID, FK)    
- visit_date (timestamp)    
- notes (text, 1000 char)    
- latitude, longitude (decimal)    
- created_at, updated_at (timestamp)    

## Reminders

- id (UUID, PK)    
- customer_id (UUID, FK)    
- broker_id (UUID, FK)    
- reminder_date (timestamp)    
- notes (text, 500 char)    
- is_completed (boolean)    
- created_at, completed_at (timestamp)    

## 6. UI & Component Library

- **Framework:** react-admin for all CRUD, search, and reporting UIs    
- **Styling:** Tailwind CSS, shadcn/ui, DaisyUI for consistent, responsive design    
- **Charts:** Tremor for dashboards    
- **Maps:** Google Maps React components    
- **UX:** Large click/tap targets, clear navigation, fast forms, keyboard accessible   

## 7. Key Screens (react-admin Resources)

- **Login:** Supabase Auth, accessible on all browsers    
- **Dashboard:** KPIs (visits, customers), overdue reminders, quick actions    
- **Customer List:** Search, filter, add, responsive cards and tables    
- **Customer Detail:** Info, visit log, edit, map, directions    
- **Visit Log:** Quick form, GPS capture, notes, follow-up    
- **Map View:** Customer pins, "Near Me" toggle, directions    
- **Reporting:** Visit frequency, overdue customers, CSV export    

## 8. Performance, Security, and Scalability

- **Performance:** <3s load, <500ms API, 5 concurrent users    
- **Security:** HTTPS, Supabase Auth, RLS for data isolation, encrypted backups    
- **Scalability:** Supabase/PostgreSQL for 1,000+ customers, 5,000+ visits, easy broker scaling    

## 9. Deployment & Cost

- **Frontend:** Deploy static site to Vercel/Netlify    
- **Backend:** Supabase (managed PostgreSQL, Auth, Storage)    
- **Cost:** Free tier for MVP; scale to <$50/month for 5 brokers    

## 10. Implementation Phases

1. **Month 1:** Supabase setup, react-admin scaffold, responsive UI, customer CRUD    
2. **Month 2:** Visit logging, maps, reporting, reminders, dashboard    
3. **Month 3:** Testing, optimization, broker training, go-live    

## 11. Design System

- **Color Palette:** Brand blue, green (success), amber (warning), red (error), neutral grays    
- **Typography:** System UI, clear hierarchy, readable at all sizes    
- **Accessibility:** WCAG 2.1 AA, keyboard navigation, screen reader support    
- **Component Examples:** See [UI_elements.md] for code snippets and patterns    

## 12. Testing & Support

- **Cross-device Testing:** iOS Safari, Android Chrome, desktop browsers   
- **Support:** Email, documentation, 24-hour response    

## 13. Roadmap

- **Post-MVP:** Territory management, product catalog, advanced analytics, native app, offline sync, multi-tenant support