# ForkFlow CRM Style Guide & Design System

## 🎨 Kitchen Pantry Design System

ForkFlow CRM uses the **Kitchen Pantry** design system - a food-industry inspired design language that creates warmth, professionalism, and familiarity for food brokers and restaurant professionals.

---

## 🌈 Color Palette

### Primary Colors - Kitchen/Food Inspired

```css
/* Sage Green - Herbs & Fresh Produce */
primary-50:  #f7f9f5   /* Lightest mint */
primary-100: #edf2e6   /* Light sage */
primary-200: #d8e4c8   /* Soft sage */
primary-300: #b8d099   /* Medium sage */
primary-400: #9abd67   /* Rich sage */
primary-500: #7ea142   /* Base sage green */
primary-600: #638532   /* Deep sage */
primary-700: #4d672a   /* Dark sage */
primary-800: #405426   /* Very dark sage */
primary-900: #374724   /* Darkest sage */
```

**Usage**: Primary actions, headers, branding, success states
**Inspiration**: Fresh herbs, produce sections, kitchen gardens

### Secondary Colors - Professional Steel

```css
/* Steel Blue-Gray - Kitchen Equipment */
secondary-50:  #f8fafc   /* Light steel */
secondary-100: #f1f5f9   /* Soft steel */
secondary-200: #e2e8f0   /* Medium steel */
secondary-300: #cbd5e1   /* Base steel */
secondary-400: #94a3b8   /* Dark steel */
secondary-500: #64748b   /* Base steel blue-gray */
secondary-600: #475569   /* Deep steel */
secondary-700: #334155   /* Dark steel */
secondary-800: #1e293b   /* Very dark steel */
secondary-900: #0f172a   /* Darkest steel */
```

**Usage**: Text, backgrounds, neutral elements, professional contexts
**Inspiration**: Stainless steel kitchen equipment, professional kitchens

### Accent & Supporting Colors

```css
/* Fresh Blue - Water & Cleanliness */
accent-500: #3b82f6     /* Fresh blue */
accent-600: #2563eb     /* Deep fresh blue */

/* Warm Orange - Spices & Energy */
warm-500: #f97316       /* Spice orange */
warm-600: #ea580c       /* Deep spice orange */

/* Success Green - Fresh & Safe */
success-500: #22c55e    /* Fresh green */
success-600: #16a34a    /* Deep success */

/* Warning Amber - Caution */
warning-500: #f59e0b    /* Amber warning */
warning-600: #d97706    /* Deep amber */

/* Error Red - Danger & Expired */
error-500: #ef4444      /* Alert red */
error-600: #dc2626      /* Deep error */
```

### CRM-Specific Status Colors

```css
/* Priority Levels */
priority-high:     #ef4444  /* Red - urgent */
priority-medium:   #f59e0b  /* Amber - important */
priority-low:      #22c55e  /* Green - normal */
priority-critical: #dc2626  /* Dark red - critical */

/* Workflow Status */
status-prospect:  #8b5cf6   /* Purple - new lead */
status-active:    #22c55e   /* Green - engaged */
status-inactive:  #6b7280   /* Gray - dormant */
status-closed:    #ef4444   /* Red - lost/ended */
status-won:       #16a34a   /* Dark green - success */
status-nurture:   #f59e0b   /* Amber - developing */
```

---

## 📏 Typography Scale

### Type Hierarchy

```css
/* Headings */
h1: 2.25rem (36px) | font-bold    | line-height: 1.2
h2: 1.875rem (30px) | font-bold   | line-height: 1.2
h3: 1.5rem (24px) | font-semibold | line-height: 1.3
h4: 1.25rem (20px) | font-semibold | line-height: 1.4
h5: 1.125rem (18px) | font-medium | line-height: 1.4
h6: 1rem (16px) | font-medium     | line-height: 1.5

/* Body Text */
body1: 1rem (16px) | font-normal | line-height: 1.6
body2: 0.875rem (14px) | font-normal | line-height: 1.5
caption: 0.75rem (12px) | font-normal | line-height: 1.4
```

### Font Family

```css
font-family: 'ui-sans-serif', 'system-ui', '-apple-system', 
             'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 
             'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'
```

**Why**: System fonts ensure fast loading, consistent rendering across platforms, and professional appearance.

---

## 📐 Spacing & Layout

### Spacing Scale (Based on 0.25rem units)

```css
/* Micro Spacing */
space-1: 0.25rem (4px)   /* Tiny gaps */
space-2: 0.5rem (8px)    /* Small gaps */
space-3: 0.75rem (12px)  /* Medium-small gaps */
space-4: 1rem (16px)     /* Standard gap */

/* Macro Spacing */
space-6: 1.5rem (24px)   /* Large gaps */
space-8: 2rem (32px)     /* Section spacing */
space-12: 3rem (48px)    /* Major section spacing */
space-16: 4rem (64px)    /* Page section spacing */
```

### Touch Targets (WCAG Compliance)

```css
/* Minimum Touch Target */
min-height: 44px  /* Critical for accessibility */
min-width: 44px   /* Critical for accessibility */
```

**All interactive elements must meet 44px minimum for mobile accessibility.**

---

## 🧩 Component Architecture

### 3-Tier Component Structure

```
src/components/
├── core/           # Reusable, generic UI components
│   ├── buttons/    # Button variants and actions
│   ├── cards/      # Card layouts and containers
│   ├── dialogs/    # Modal and dialog components
│   ├── layout/     # Box, Stack, Grid layouts
│   ├── patterns/   # Utility pattern components
│   └── typography/ # Text and heading components
├── features/       # App-specific functionality
│   ├── auth/       # Authentication components
│   ├── dashboard/  # Dashboard-specific widgets
│   └── security/   # Security and compliance
└── business/       # Domain logic components
    ├── contacts/   # Contact management
    ├── organizations/ # Organization management
    └── interactions/ # Interaction tracking
```

### Component Patterns

#### Status Badge Pattern
```tsx
<StatusBadge status="Ready" variant="default" />
<StatusBadge status="In Development" variant="small" />
```

#### Feature List Pattern
```tsx
<FeatureList 
  features={['Feature 1', 'Feature 2']} 
  variant="dots" 
  size="md" 
/>
```

#### Page Header Pattern
```tsx
<PageHeader
  title="Page Title"
  subtitle="Page description"
  icon={<Icon />}
  actions={<Button>Action</Button>}
/>
```

#### Timeline Pattern
```tsx
<TimelineItem
  icon={<PhoneIcon />}
  title="Call with client"
  subtitle="Discussed requirements"
  timestamp="2 hours ago"
  metadata={<span>Duration: 15min</span>}
/>
```

---

## 🎛️ Component Usage Guidelines

### Button Hierarchy

```tsx
/* Primary Actions - Use sparingly (1-2 per view) */
<Button variant="contained" color="primary">Save</Button>

/* Secondary Actions - Common actions */
<Button variant="outlined" color="primary">Edit</Button>

/* Tertiary Actions - Low-emphasis actions */
<Button variant="text" color="secondary">Cancel</Button>

/* Destructive Actions */
<Button variant="contained" color="error">Delete</Button>
```

### Card Layout Patterns

```tsx
/* Standard Content Card */
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

/* Action Card with Header Actions */
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <Button variant="outlined" size="sm">Action</Button>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Typography Usage

```tsx
/* Page Titles */
<Typography variant="h3" className="text-secondary-800">
  Main Page Title
</Typography>

/* Section Titles */
<Typography variant="h5" className="text-secondary-700">
  Section Title
</Typography>

/* Body Content */
<Typography variant="body1" className="text-secondary-600">
  Standard body content with good readability.
</Typography>

/* Secondary Information */
<Typography variant="body2" className="text-secondary-500">
  Supplementary information, descriptions, meta data.
</Typography>
```

---

## ♿ Accessibility Standards

### Color Contrast (WCAG 2.1 AA)

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio  
- **UI components**: Minimum 3:1 contrast ratio

### Accessible Color Combinations

```css
/* High Contrast - Excellent readability */
text-secondary-800 on bg-white         /* 9.1:1 */
text-secondary-700 on bg-gray-50       /* 8.2:1 */

/* Medium Contrast - Good readability */
text-secondary-600 on bg-white         /* 5.8:1 */
text-primary-600 on bg-primary-50      /* 4.7:1 */

/* Avoid These Combinations */
text-secondary-400 on bg-white         /* 3.1:1 - Too low */
text-primary-400 on bg-white           /* 2.8:1 - Too low */
```

### Motion & Animation

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

All interactive elements must have clear focus indicators:

```css
/* Standard focus ring */
.focus-ring:focus {
  outline: 2px solid theme(colors.accent.500);
  outline-offset: 2px;
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
xs: 480px   /* Small phones */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Large laptops */
2xl: 1536px /* Desktops */
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
/* Mobile-first responsive classes */
<div className="
  flex flex-col space-y-4           /* Mobile: stack vertically */
  md:flex-row md:space-y-0 md:space-x-6  /* Tablet+: horizontal layout */
  lg:space-x-8                      /* Larger screens: more spacing */
">
```

---

## 🛠️ Development Best Practices

### Class Organization

```tsx
/* Group classes logically: layout, spacing, colors, responsive */
<div className="
  flex items-center justify-between    /* Layout */
  p-4 space-x-4                      /* Spacing */
  bg-white border border-gray-200     /* Appearance */
  md:p-6 lg:p-8                      /* Responsive */
">
```

### Avoiding Style Complexity

❌ **Don't**: Inline complex styling
```tsx
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 space-x-4 md:p-6 lg:p-8 xl:p-10">
```

✅ **Do**: Use pattern components
```tsx
<PageHeader title="Title" subtitle="Subtitle" actions={<Button>Action</Button>} />
```

### Performance Considerations

- Use Tailwind's purge configuration to remove unused styles
- Prefer utility classes over custom CSS
- Use pattern components to reduce class duplication
- Leverage component composition over complex single components

---

## 📚 Component Reference

### Core Pattern Components

| Component | Purpose | Reduces Complexity |
|-----------|---------|-------------------|
| `StatusBadge` | Standardized status indicators | Eliminates inline status styling |
| `FeatureList` | Consistent bullet lists | Replaces repeated list patterns |
| `PageHeader` | Standardized page headers | Consolidates header layouts |
| `TimelineItem` | Timeline/activity items | Unifies timeline patterns |
| `ActionButtonGroup` | Button group layouts | Standardizes button spacing |

### Design Token Usage

```tsx
/* Use design tokens, not arbitrary values */
<div className="text-primary-600">  /* ✅ Good */
<div className="text-[#638532]">    /* ❌ Avoid */

<div className="space-y-4">         /* ✅ Good */
<div className="space-y-[16px]">    /* ❌ Avoid */
```

---

## 🔄 Migration Guide

### From MUI to UI Kit

1. **Replace imports**: `@mui/material` → `@/components/ui-kit`
2. **Update props**: Some prop names differ (see UI Kit README)
3. **Use pattern components**: Replace complex layouts with patterns
4. **Apply design tokens**: Use standardized colors and spacing

### From Complex Components

1. **Identify patterns**: Look for repeated styling patterns
2. **Extract patterns**: Create reusable pattern components
3. **Refactor gradually**: Update one section at a time
4. **Test thoroughly**: Ensure visual consistency

---

## 🎯 Quality Metrics

### Style Complexity Targets

- **High complexity**: >100 Tailwind classes → Refactor required
- **Medium complexity**: 50-100 classes → Review recommended  
- **Low complexity**: <50 classes → Acceptable

### Bundle Size Goals

- **Primary goal**: 20-30% reduction in CSS bundle size
- **Method**: Aggressive purging + pattern component usage
- **Monitoring**: Regular complexity analysis with automated scripts

---

This style guide serves as the foundation for consistent, accessible, and maintainable design implementation across ForkFlow CRM. Regular updates ensure it stays aligned with project evolution and industry best practices.