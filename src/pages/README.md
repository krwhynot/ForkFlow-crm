# ForkFlow CRM Dashboard

This directory contains the main dashboard page and related components for the ForkFlow CRM system. The dashboard is built using React, TypeScript, and Tremor for data visualization.

## Tech Stack

- **React + TypeScript**: Core framework
- **Tremor**: Data visualization and analytics components
- **Tailwind CSS**: Styling and responsive design
- **Heroicons**: Icon system
- **react-admin**: Admin panel framework

## Dashboard Components

### Main Components

1. **Dashboard.tsx**
   - Main dashboard layout
   - Responsive grid system
   - Component composition and layout management

### Data Visualization

1. **InteractionsChart**
   - Line and area charts for interaction tracking
   - Filterable by interaction type
   - Week-over-week comparison

2. **OpportunitiesChart**
   - Bar chart for opportunity pipeline
   - Value and count visualization
   - Principal-based filtering

3. **KanbanBoard**
   - Drag-and-drop opportunity management
   - Stage-based visualization
   - Progress tracking with metrics

### Metrics and Goals

1. **WeeklyGoals**
   - Progress tracking with Tremor ProgressBar
   - Category-based organization
   - Visual status indicators

2. **BrokerKPICards**
   - Key performance metrics
   - Delta indicators for trends
   - Responsive metric cards

### Activity Tracking

1. **RecentInteractions**
   - Timeline of recent customer interactions
   - Filterable by type
   - Quick action buttons

2. **UpcomingMeetings**
   - Calendar integration
   - Priority-based sorting
   - Quick meeting actions

## Component Structure

```
src/
├── pages/
│   ├── Dashboard.tsx        # Main dashboard page
│   └── README.md           # This documentation
├── components/
│   └── dashboard/          # Dashboard components
│       ├── InteractionsChart.tsx
│       ├── OpportunitiesChart.tsx
│       ├── KanbanBoard.tsx
│       ├── WeeklyGoals.tsx
│       └── ...
└── types/                  # TypeScript definitions
```

## Tremor Integration

The dashboard uses Tremor components for data visualization and metrics display:

- **Charts**: LineChart, BarChart, AreaChart
- **Metrics**: Card, Metric, BadgeDelta
- **Layout**: Grid, Flex
- **Progress**: ProgressBar
- **Navigation**: TabGroup, Tab
- **Status**: BadgeDelta

### Example Usage

```typescript
import { Card, Metric, Text, BadgeDelta } from '@tremor/react';

<Card decoration="top" decorationColor="emerald">
    <Text>Total Value</Text>
    <Metric>{formatCurrency(totalValue)}</Metric>
    <BadgeDelta deltaType="increase">+12.3%</BadgeDelta>
</Card>
```

## Mobile Responsiveness

The dashboard is built with a mobile-first approach:

- Responsive grid layouts
- Touch-friendly components (44px+ touch targets)
- Collapsible sections for mobile
- Optimized charts for small screens

## Data Integration

- Real-time data fetching with React Query
- Supabase backend integration
- Cached data management
- Optimistic updates for better UX

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the dashboard at:
   ```
   http://localhost:5173/dashboard
   ```

## Best Practices

1. **Component Organization**
   - Keep components focused and single-responsibility
   - Use TypeScript interfaces for props
   - Implement error boundaries

2. **Performance**
   - Implement proper memoization
   - Use skeleton loaders for data fetching
   - Optimize re-renders

3. **Accessibility**
   - Maintain WCAG 2.1 compliance
   - Use proper ARIA labels
   - Ensure keyboard navigation

4. **State Management**
   - Use React Query for server state
   - Implement proper loading states
   - Handle error cases gracefully

## Contributing

When adding new components or features to the dashboard:

1. Follow the established component structure
2. Add TypeScript types and interfaces
3. Include proper documentation
4. Test mobile responsiveness
5. Ensure accessibility compliance 