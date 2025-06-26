# ForkFlow-CRM Development TODO List for Cursor AI

Now that your ForkFlow-CRM project is correctly set up with Supabase, here's a comprehensive, detailed TODO list that Cursor AI can follow to transform the Atomic CRM into your food broker CRM system. This list follows best practices for AI-driven development and includes clear success criteria for each task.

## Project Overview for Cursor AI

**Project Name:** ForkFlow-CRM  
**Purpose:** Website-first, mobile UI friendly CRM for food brokers visiting restaurants and stores  
**Tech Stack:** React + react-admin + TypeScript + Tailwind CSS + Supabase (cloud)  
**Foundation:** Atomic CRM customization  
**Development Approach:** AI-assisted development using Cursor with Supabase MCP integration  

## Phase 1: Database Schema & Foundation Setup (Week 1)

### 🔧 **Task 1.1: Configure Environment Variables**
**Priority:** Critical | **Effort:** 0.5 days
- [✅] Update `.env` file with Supabase cloud credentials
- [✅] Remove any Docker/local Supabase references
- [✅] Add Google Maps API key placeholder
- [✅] Verify Supabase connection works with frontend
- **Success Criteria:** Frontend connects to cloud Supabase, no Docker dependencies remain

### 🗄️ **Task 1.2: Transform Database Schema for Food Brokers**
**Priority:** Critical | **Effort:** 1 day
- [ ] Use Supabase MCP to rename `contacts` table to `customers`
- [ ] Add food broker specific fields to customers:
  - [ ] `business_type` (restaurant, grocery, distributor, other)
  - [ ] `latitude` and `longitude` for GPS coordinates  
  - [ ] `notes` field (500 character limit)
- [ ] Create `visits` table with broker visit tracking:
  - [ ] `customer_id` (foreign key to customers)
  - [ ] `broker_id` (foreign key to auth.users)
  - [ ] `visit_date` (timestamp)
  - [ ] `notes` (1000 character limit)
  - [ ] `latitude` and `longitude` (GPS coordinates)
- [ ] Create `reminders` table for follow-ups:
  - [ ] `customer_id` (foreign key to customers) 
  - [ ] `broker_id` (foreign key to auth.users)
  - [ ] `reminder_date` (timestamp)
  - [ ] `notes` (500 character limit)
  - [ ] `is_completed` (boolean)
- **Success Criteria:** All new tables created, foreign key relationships established, data types match PRD specifications

### 🔐 **Task 1.3: Set Up Row Level Security (RLS)**
**Priority:** Critical | **Effort:** 0.5 days
- [ ] Enable RLS on all custom tables (customers, visits, reminders)
- [ ] Create policies for brokers to only see their own data:
  - [ ] Customers: brokers see only customers they created
  - [ ] Visits: brokers see only their own visits
  - [ ] Reminders: brokers see only their own reminders
- [ ] Test RLS policies with multiple user accounts
- **Success Criteria:** Data isolation verified, brokers cannot access other brokers' data

### 📱 **Task 1.4: Update UI Dependencies**
**Priority:** High | **Effort:** 0.5 days
- [ ] Install mobile-friendly components:
  - [ ] `@googlemaps/react-wrapper` for map integration
  - [ ] Additional Tailwind CSS utilities if needed
- [ ] Verify all react-admin dependencies are current
- [ ] Test responsive design framework
- **Success Criteria:** All dependencies installed, no conflicts, responsive framework operational

## Phase 2: Core Food Broker Features (Week 2)

### 👥 **Task 2.1: Customize Customer Management**
**Priority:** Critical | **Effort:** 2 days
- [ ] Transform ContactList component to CustomerList:
  - [ ] Update to show business names instead of person names
  - [ ] Add business type filter and display
  - [ ] Include "last visit" information
  - [ ] Add click-to-call functionality for phone numbers
- [ ] Modify customer detail/edit forms:
  - [ ] Add business type dropdown (restaurant, grocery, distributor, other)
  - [ ] Include GPS coordinate fields (auto-populated)
  - [ ] Expand notes section for business details
  - [ ] Add touch-friendly form controls (44px+ targets)
- [ ] Implement customer search and filtering:
  - [ ] Search by business name, contact person, phone
  - [ ] Filter by business type
  - [ ] Filter by "needs visit" (no visit in 30+ days)
- **Success Criteria:** Customer management fully functional, mobile-optimized, business-focused fields working

### 📍 **Task 2.2: Implement Visit Logging System**
**Priority:** Critical | **Effort:** 2 days
- [ ] Create VisitCreate component:
  - [ ] Auto-capture GPS coordinates on component load
  - [ ] Large textarea for visit notes (1000 char limit)
  - [ ] Customer selection/reference
  - [ ] Auto-populate visit date/time
  - [ ] Mobile-optimized layout
- [ ] Add "Log Visit" buttons throughout app:
  - [ ] Prominent button on customer detail page
  - [ ] Quick access from customer list
  - [ ] Integration with main navigation
- [ ] Create visit history display:
  - [ ] Chronological list of visits per customer
  - [ ] Visit summary information
  - [ ] Edit/update existing visits
- [ ] Implement GPS integration:
  - [ ] Request location permissions
  - [ ] Auto-capture coordinates
  - [ ] Fallback for manual location entry
- **Success Criteria:** Visit logging works on mobile, GPS capture functional, visit history displays correctly

### ⏰ **Task 2.3: Build Follow-up Reminder System**
**Priority:** High | **Effort:** 1.5 days
- [ ] Create reminder creation interface:
  - [ ] Date/time picker for follow-up scheduling
  - [ ] Link to specific customers
  - [ ] Reminder notes/description
  - [ ] Priority levels
- [ ] Build reminder dashboard/list:
  - [ ] Today's reminders prominently displayed
  - [ ] Overdue reminders highlighted
  - [ ] Mark as completed functionality
  - [ ] Snooze/reschedule options
- [ ] Integrate reminders with visit logging:
  - [ ] Option to set follow-up during visit logging
  - [ ] Auto-suggest follow-up based on visit notes
- **Success Criteria:** Reminders can be created, viewed, and managed; integration with visit system works

### 📊 **Task 2.4: Create Broker Dashboard**
**Priority:** High | **Effort:** 1 day
- [ ] Design dashboard layout for mobile and desktop
- [ ] Implement KPI cards:
  - [ ] Visits this week/month
  - [ ] Total customers
  - [ ] Overdue follow-ups
  - [ ] New customers this month
- [ ] Add quick action buttons:
  - [ ] "Log Visit" prominent placement
  - [ ] "Add Customer" quick access
  - [ ] "View Map" navigation
- [ ] Create activity feed:
  - [ ] Recent visits
  - [ ] Upcoming reminders
  - [ ] New customer additions
- **Success Criteria:** Dashboard displays relevant broker KPIs, quick actions work, responsive design

## Phase 3: Maps & Advanced Features (Week 3)

### 🗺️ **Task 3.1: Integrate Google Maps**
**Priority:** High | **Effort:** 2 days
- [ ] Set up Google Maps API integration:
  - [ ] Configure API key and permissions
  - [ ] Install and configure @googlemaps/react-wrapper
  - [ ] Create base map component
- [ ] Display customer locations:
  - [ ] Show customer pins on map
  - [ ] Customer info popup on pin click
  - [ ] Different pin colors for business types
- [ ] Add map navigation features:
  - [ ] "Get Directions" buttons
  - [ ] "Near Me" view with GPS
  - [ ] Route planning between customers
- [ ] Mobile optimization:
  - [ ] Touch-friendly map controls
  - [ ] Responsive map sizing
  - [ ] GPS location accuracy handling
- **Success Criteria:** Map displays customer locations, directions work, mobile interaction smooth

### 📱 **Task 3.2: Mobile UI Optimization**
**Priority:** High | **Effort:** 1.5 days
- [ ] Implement mobile navigation:
  - [ ] Bottom tab bar for primary navigation
  - [ ] Touch-friendly menu items
  - [ ] Swipe gestures where appropriate
- [ ] Optimize form interactions:
  - [ ] Large touch targets (44px minimum)
  - [ ] Appropriate keyboard types (tel, email, url)
  - [ ] Clear error states and validation
- [ ] Add mobile-specific features:
  - [ ] Pull-to-refresh on lists
  - [ ] Loading states for slow connections
  - [ ] Offline indicators
- [ ] Test across devices:
  - [ ] iOS Safari compatibility
  - [ ] Android Chrome compatibility
  - [ ] Tablet layout optimization
- **Success Criteria:** All interactions work smoothly on mobile, touch targets appropriate size, responsive across devices

### 📈 **Task 3.3: Implement Reporting Features**
**Priority:** Medium | **Effort:** 1.5 days
- [ ] Create visit frequency reports:
  - [ ] Charts showing visits per day/week/month
  - [ ] Customer visit frequency analysis
  - [ ] Broker performance metrics
- [ ] Build "needs attention" reports:
  - [ ] Customers not visited in 30+ days
  - [ ] Overdue follow-ups
  - [ ] Inactive customers
- [ ] Add data export functionality:
  - [ ] CSV export for customers
  - [ ] CSV export for visits
  - [ ] Custom date range selection
- [ ] Implement mobile-friendly charts:
  - [ ] Use Tremor or similar mobile-optimized library
  - [ ] Responsive chart sizing
  - [ ] Touch-friendly interactions
- **Success Criteria:** Reports display correctly, exports work, charts responsive on mobile

## Phase 4: Testing & Deployment (Week 4)

### 🧪 **Task 4.1: Comprehensive Testing**
**Priority:** Critical | **Effort:** 1.5 days
- [ ] Functional testing:
  - [ ] All CRUD operations work for customers, visits, reminders
  - [ ] GPS capture and maps integration functional
  - [ ] User authentication and data isolation
  - [ ] Mobile responsiveness across devices
- [ ] Performance testing:
  - [ ] Page load times under 3 seconds
  - [ ] Smooth scrolling and interactions
  - [ ] GPS and maps performance
- [ ] Browser compatibility testing:
  - [ ] iOS Safari 14+
  - [ ] Android Chrome 90+
  - [ ] Desktop browsers (Chrome, Firefox, Edge)
- [ ] User acceptance testing:
  - [ ] Test with actual broker workflows
  - [ ] Gather feedback on usability
  - [ ] Verify all PRD requirements met
- **Success Criteria:** All features work reliably, performance meets targets, cross-browser compatibility confirmed

### 🚀 **Task 4.2: Production Deployment**
**Priority:** Critical | **Effort:** 1 day
- [ ] Prepare production environment:
  - [ ] Configure production Supabase instance
  - [ ] Set up production environment variables
  - [ ] Configure domain and SSL certificates
- [ ] Deploy application:
  - [ ] Deploy to Vercel/Netlify or similar platform
  - [ ] Configure custom domain
  - [ ] Set up automated deployments from Git
- [ ] Post-deployment verification:
  - [ ] Verify all features work in production
  - [ ] Test with production data
  - [ ] Monitor for errors and performance
- **Success Criteria:** Application deployed successfully, all features functional in production environment

### 📚 **Task 4.3: Documentation & Training**
**Priority:** Medium | **Effort:** 1 day
- [ ] Create user documentation:
  - [ ] Getting started guide for brokers
  - [ ] Feature documentation with screenshots
  - [ ] Troubleshooting guide
  - [ ] Mobile usage best practices
- [ ] Prepare training materials:
  - [ ] Video walkthrough of key features
  - [ ] Step-by-step user guides
  - [ ] FAQ document
- [ ] Set up support systems:
  - [ ] Error monitoring and logging
  - [ ] User feedback collection
  - [ ] Support contact methods
- **Success Criteria:** Complete documentation available, training materials ready, support systems operational

## Phase 5: Launch & Post-Launch Support (Ongoing)

### 📊 **Task 5.1: Monitor & Optimize**
**Priority:** Medium | **Effort:** Ongoing
- [ ] Set up monitoring:
  - [ ] Application performance monitoring
  - [ ] User activity analytics
  - [ ] Error tracking and alerting
- [ ] Gather user feedback:
  - [ ] Usage patterns analysis
  - [ ] Feature adoption metrics
  - [ ] User satisfaction surveys
- [ ] Performance optimization:
  - [ ] Database query optimization
  - [ ] Frontend performance tuning
  - [ ] Mobile experience improvements
- **Success Criteria:** Monitoring systems operational, regular feedback collection, performance maintained

### 🔮 **Task 5.2: Plan Future Enhancements**
**Priority:** Low | **Effort:** 0.5 days
- [ ] Document enhancement roadmap:
  - [ ] Territory management features
  - [ ] Product catalog integration
  - [ ] Advanced reporting and analytics
  - [ ] Multi-tenant support planning
- [ ] Technical debt assessment:
  - [ ] Code quality review
  - [ ] Security audit planning
  - [ ] Scalability considerations
- **Success Criteria:** Clear roadmap for future development, technical foundation assessed

## Using This TODO List with Cursor AI

### **Cursor AI Instructions:**

1. **Start with Task 1.1** and work through tasks sequentially
2. **Use Supabase MCP** for all database operations - ask Cursor to generate SQL using natural language
3. **Focus on mobile-first design** - ensure all components work well on mobile devices
4. **Test after each task** - verify functionality before moving to next task
5. **Update this TODO list** - mark completed tasks with `[x]` and add any new tasks discovered during development
6. **Ask for confirmation** before moving to the next major phase

### **Success Metrics for MVP:**
- ✅ 5 brokers can use the system simultaneously
- ✅ 500-1,000 customer records supported
- ✅ 10-25 daily visits logged
- ✅ Page load times under 3 seconds on mobile
- ✅ GPS capture accuracy within 10 meters
- ✅ 95% uptime during business hours

This comprehensive TODO list provides Cursor AI with clear, actionable tasks to transform the Atomic CRM into your ForkFlow-CRM system. Each task includes priority levels, effort estimates, and specific success criteria to ensure systematic progress toward your food broker CRM objectives[1][2][3][4][5].
