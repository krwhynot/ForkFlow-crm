UI Component Library & Style Guide (Revised for Atomic CRM Stack)
Version: 2.0
Date: June 25, 2025
Tech Stack: React + react-admin + TypeScript + Tailwind CSS

1. Design System Overview
1.1 Vision Statement
"Deliver a professional, website-first CRM interface that maintains full functionality across all devices, with mobile-friendly UI patterns for brokers in the field."

1.2 Design Principles
Website-First: Desktop-optimized workflows with mobile adaptability

Touch-Optimized: 44px+ touch targets for mobile interactions

Performance: Fast loading on all connection types

Professional: Clean business aesthetic

Accessible: WCAG 2.1 AA compliant

Consistent: Unified patterns across all interfaces

2. Component Integration Strategy
2.1 Core Stack
react-admin Components: Base CRUD interfaces (List, Edit, Show views)

Tailwind CSS: Custom styling and responsive utilities

shadcn/ui: Custom form controls and interactive elements

Tremor: Data visualization for dashboards

2.2 Implementation Approach
tsx
// Example: Customizing react-admin with Tailwind
const CustomerList = () => (
  <List>
    <Datagrid sx={{
      '& .RaDatagrid-row': 'py-4',
      '& .RaDatagrid-headerCell': 'bg-gray-50'
    }}>
      <TextField source="name" className="font-medium" />
      <CustomPhoneField source="phone" />
      <ShowButton className="text-primary-600" />
    </Datagrid>
  </List>
)
3. Color Palette (Same as Previous)
Retain existing color system for brand consistency

4. Typography System
4.1 react-admin Typography Overrides
css
/* Override Material UI typography */
.MuiTypography-h1 { 
  @apply text-3xl font-semibold text-gray-900;
}
.MuiTypography-body1 {
  @apply text-base text-gray-600;
}
5. Component Specifications
5.1 react-admin Components with Tailwind Customization
Customer List Item
tsx
const CustomerRow = () => (
  <div className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50">
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-3">
        <BuildingStorefrontIcon className="h-5 w-5 text-primary-500" />
        <span className="text-lg font-medium text-gray-900 truncate">
          Mario's Italian Restaurant
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Last visit: 3 days ago | (555) 123-4567
      </p>
    </div>
    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
  </div>
)
Visit Log Form
tsx
const VisitCreate = () => (
  <Create>
    <SimpleForm className="space-y-6">
      <TextInput source="notes" 
        className="bg-white rounded-lg border border-gray-300 p-4"
        minRows={4} 
      />
      <div className="flex space-x-4">
        <SaveButton className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg" />
        <Button label="Cancel" variant="outlined" className="border-gray-300" />
      </div>
    </SimpleForm>
  </Create>
)
6. Layout System
6.1 Responsive Dashboard Layout
tsx
const DashboardLayout = () => (
  <Layout
    sx={{
      '& .RaLayout-content': 'pt-6 px-4',
      '& .RaLayout-appFrame': 'md:flex'
    }}
  >
    {/* Desktop sidebar */}
    <div className="hidden md:block md:w-64 border-r border-gray-200">
      <Menu>
        <Menu.Item to="/customers" primaryText="Customers" />
        <Menu.Item to="/visits" primaryText="Visits" />
        <Menu.Item to="/reports" primaryText="Reports" />
      </Menu>
    </div>
    
    {/* Mobile bottom nav */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around py-2">
        <NavButton icon={<UsersIcon />} label="Customers" />
        <NavButton icon={<MapPinIcon />} label="Visits" />
        <NavButton icon={<ChartBarIcon />} label="Reports" />
      </div>
    </div>
  </Layout>
)
7. Mobile UI Guidelines
7.1 Adaptive Components
tsx
// Conditional rendering example
const ActionBar = () => (
  <div className="flex space-x-4">
    {/* Desktop */}
    <div className="hidden md:flex space-x-2">
      <Button variant="contained">Export CSV</Button>
      <Button variant="outlined">Filter</Button>
    </div>
    
    {/* Mobile */}
    <div className="md:hidden flex-1">
      <Button fullWidth variant="contained">
        Log Visit
      </Button>
    </div>
  </div>
)
7.2 Touch Optimization
Form Controls: 48px height for all inputs

Button Spacing: 12px between interactive elements

Gesture Support: Swipe actions in lists

8. Data Visualization
8.1 Dashboard Metrics
tsx
const Dashboard = () => (
  <Card className="p-6">
    <Title className="text-lg font-semibold mb-4">Weekly Visits</Title>
    <div className="grid grid-cols-2 gap-4">
      <MetricCard value={23} label="This Week" trend="+12%" />
      <MetricCard value={89} label="This Month" />
    </div>
    <AreaChart
      data={visitData}
      index="date"
      categories={["visits"]}
      className="mt-6 h-48"
    />
  </Card>
)
9. Accessibility Implementation
9.1 react-admin A11y Features
tsx
<TextInput 
  source="email"
  aria-label="Customer email"
  InputProps={{
    'aria-describedby': 'email-helper-text'
  }}
/>
9.2 Custom Accessibility Rules
Color Contrast: 4.5:1 minimum for text

Focus States: Visible focus rings for keyboard navigation

Screen Reader: Semantic HTML with ARIA landmarks

10. Performance Optimization
10.1 Code Patterns
tsx
// Dynamic imports for heavy components
const MapView = React.lazy(() => import('./MapView'));

const CustomerShow = () => (
  <Show>
    <SimpleForm>
      {/* ... */}
      <React.Suspense fallback={<div>Loading map...</div>}>
        <MapView />
      </React.Suspense>
    </SimpleForm>
  </Show>
)
11. Component Implementation Examples
11.1 Customer Detail View
tsx
const CustomerShow = () => (
  <Show>
    <TabbedForm>
      <FormTab label="Details">
        <TextInput source="name" className="text-xl font-bold" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextInput source="phone" />
          <TextInput source="email" />
          <TextInput source="address" fullWidth />
        </div>
      </FormTab>
      
      <FormTab label="Visits">
        <ReferenceManyField reference="visits" target="customer_id">
          <Datagrid>
            <DateField source="date" />
            <TextField source="notes" />
            <ShowButton />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
      
      <FormTab label="Map">
        <div className="h-96">
          <GoogleMap coordinates={[32.7767, -96.7970]} />
        </div>
      </FormTab>
    </TabbedForm>
  </Show>
)
11.2 Responsive App Bar
tsx
const AppBar = () => (
  <MuiAppBar position="static" className="bg-white shadow-sm">
    <Toolbar className="flex justify-between">
      <div className="flex items-center">
        <img src="/logo.svg" alt="Logo" className="h-8 mr-4" />
        <span className="hidden md:block text-xl font-semibold">Food Broker CRM</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <SearchBar />
        <NotificationBell />
        <UserMenu />
      </div>
    </Toolbar>
  </MuiAppBar>
)
12. Design Tokens (Tailwind Config)
javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb'
        }
      },
      spacing: {
        128: '32rem',
        '44px': '44px'
      }
    }
  },
  corePlugins: {
    // Disable preflight to preserve Material UI base styles
    preflight: false,
  }
}
13. Testing Checklist
13.1 Cross-Device Verification
Element	Desktop	Mobile	Tablet
List Views	Multi-column	Single column	Single column
Forms	Full width	Stacked	Stacked
Navigation	Sidebar	Bottom bar	Sidebar
Data Visuals	Full detail	Simplified	Medium detail
13.2 Performance Metrics
TTFB: < 500ms

FCP: < 1s (3G)

CLS: < 0.1

TBT: < 200ms

This revised design system maintains brand consistency while optimizing for the react-admin framework, providing website-first experiences with robust mobile usability for food brokers.