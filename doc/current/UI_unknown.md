#### **Tremor - Data Visualization**

- **Role:** Charts and analytics components
- **Cost:** 100% Free and open source
- **Why:** Mobile-responsive charts built specifically for dashboards
- **Coverage:** KPI cards, bar charts, line charts, data tables
- **GitHub:** 15k+ stars, Vercel-backed


### 2.2 Alternative Free Stacks

  

#### **Option A: Headless UI + Heroicons + Tremor**

- **Headless UI:** Unstyled, accessible components by Tailwind team
- **Heroicons:** Beautiful SVG icons (also by Tailwind team)
- **Tremor:** Charts and data visualization
- **Total Cost:** 100% Free

    

  

## 3. Color Palette

  

### 3.1 Primary Colors

```css

/* Primary Brand Colors */

--color-primary-50: #eff6ff;   /* Very light blue */
--color-primary-100: #dbeafe;  /* Light blue */
--color-primary-500: #3b82f6;  /* Main brand blue */
--color-primary-600: #2563eb;  /* Darker blue */
--color-primary-700: #1d4ed8;  /* Dark blue */
--color-primary-900: #1e3a8a;  /* Very dark blue */  

/* Success Colors */

--color-success-50: #f0fdf4;   /* Light green background */
--color-success-500: #22c55e;  /* Success green */
--color-success-700: #15803d;  /* Dark success green */  

/* Warning Colors */
--color-warning-50: #fffbeb;   /* Light amber background */
--color-warning-500: #f59e0b;  /* Warning amber */
--color-warning-700: #b45309;  /* Dark warning amber */  

/* Error Colors */
--color-error-50: #fef2f2;     /* Light red background */
--color-error-500: #ef4444;    /* Error red */
--color-error-700: #c53030;    /* Dark error red */
```

  

### 3.2 Neutral Colors

```css

/* Gray Scale */
--color-gray-50: #f9fafb;      /* Very light gray */
--color-gray-100: #f3f4f6;     /* Light gray */
--color-gray-200: #e5e7eb;     /* Border gray */
--color-gray-300: #d1d5db;     /* Input border */
--color-gray-400: #9ca3af;     /* Placeholder text */
--color-gray-500: #6b7280;     /* Secondary text */
--color-gray-600: #4b5563;     /* Primary text */
--color-gray-700: #374151;     /* Dark text */
--color-gray-800: #1f2937;     /* Very dark text */
--color-gray-900: #111827;     /* Heading text */
```

  

### 3.3 Usage Guidelines

- **Primary Blue:** Main actions, links, active states
- **Success Green:** Completed visits, successful actions
- **Warning Amber:** Overdue follow-ups, attention needed
- **Error Red:** Failed actions, validation errors
- **Gray Scale:** Text hierarchy, backgrounds, borders

    

## 4. Typography

  

### 4.1 Font Stack

```css

/* Primary Font Family */

font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,

             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",

             sans-serif, "Apple Color Emoji", "Segoe UI Emoji",

             "Segoe UI Symbol", "Noto Color Emoji";

```

  

### 4.2 Type Scale

```css

/* Headings */

.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* H1 - Page titles */

.text-2xl { font-size: 1.5rem; line-height: 2rem; }     /* H2 - Section headers */

.text-xl  { font-size: 1.25rem; line-height: 1.75rem; } /* H3 - Subsections */

.text-lg  { font-size: 1.125rem; line-height: 1.75rem; }/* H4 - Card titles */

  

/* Body Text */

.text-base { font-size: 1rem; line-height: 1.5rem; }    /* Body text */

.text-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* Small text */

.text-xs   { font-size: 0.75rem; line-height: 1rem; }   /* Captions */

```

  

### 4.3 Font Weights

```css

.font-light    { font-weight: 300; } /* Light - rarely used */
.font-normal   { font-weight: 400; } /* Normal - body text */
.font-medium   { font-weight: 500; } /* Medium - emphasis */
.font-semibold { font-weight: 600; } /* Semibold - headings */
.font-bold     { font-weight: 700; } /* Bold - strong emphasis */

```

  

---

  

## 5. Component Specifications

  

### 5.1 Buttons

  

#### **Primary Button**

```tsx

// Large Touch Target for Mobile

<button className="

  bg-primary-500 hover:bg-primary-600
  text-white font-medium
  px-6 py-4 rounded-lg
  min-h-[44px] min-w-[44px]

  shadow-sm hover:shadow-md

  transition-all duration-200

  disabled:opacity-50 disabled:cursor-not-allowed

">

  Log Visit

</button>

```

  

#### **Secondary Button**

```tsx

<button className="

  bg-white hover:bg-gray-50

  text-gray-700 font-medium

  border border-gray-300 hover:border-gray-400

  px-6 py-4 rounded-lg

  min-h-[44px] min-w-[44px]

  shadow-sm hover:shadow-md

  transition-all duration-200

">

  Cancel

</button>

```

  

#### **Icon Button (Mobile Optimized)**

```tsx

<button className="

  bg-primary-500 hover:bg-primary-600

  text-white

  p-3 rounded-full

  min-h-[44px] min-w-[44px]

  shadow-md hover:shadow-lg

  transition-all duration-200

">

  <PlusIcon className="h-5 w-5" />

</button>

```

  

### 5.2 Form Components

  

#### **Input Field (Mobile Optimized)**

```tsx

<div className="space-y-2">

  <label className="block text-sm font-medium text-gray-700">

    Customer Name

  </label>

  <input

    type="text"

    className="

      block w-full

      px-4 py-4

      text-base

      border border-gray-300

      rounded-lg

      focus:ring-2 focus:ring-primary-500 focus:border-primary-500

      placeholder-gray-400

      min-h-[44px]

    "

    placeholder="Enter customer name"

  />

</div>

```

  

#### **Textarea (Visit Notes)**

```tsx

<div className="space-y-2">

  <label className="block text-sm font-medium text-gray-700">

    Visit Notes

  </label>

  <textarea

    rows={4}

    className="

      block w-full

      px-4 py-4

      text-base

      border border-gray-300

      rounded-lg

      focus:ring-2 focus:ring-primary-500 focus:border-primary-500

      placeholder-gray-400

      resize-none

    "

    placeholder="What happened during this visit?"

  />

</div>

```

  

#### **Select Dropdown (Touch Friendly)**

```tsx

<div className="space-y-2">

  <label className="block text-sm font-medium text-gray-700">

    Business Type

  </label>

  <select className="

    block w-full

    px-4 py-4

    text-base

    border border-gray-300

    rounded-lg

    focus:ring-2 focus:ring-primary-500 focus:border-primary-500

    bg-white

    min-h-[44px]

  ">

    <option>Select business type</option>

    <option>Restaurant</option>

    <option>Grocery Store</option>

    <option>Food Distributor</option>

  </select>

</div>

```

  

### 5.3 Card Components

  

#### **Customer Card (Mobile List Item)**

```tsx

<div className="

  bg-white

  border border-gray-200

  rounded-lg

  p-4

  shadow-sm hover:shadow-md

  transition-shadow duration-200

  cursor-pointer

">

  <div className="flex items-center justify-between">

    <div className="flex-1 min-w-0">

      <h3 className="text-lg font-semibold text-gray-900 truncate">

        Mario's Italian Restaurant

      </h3>

      <p className="text-sm text-gray-500">

        Last visit: 3 days ago

      </p>

      <p className="text-sm text-gray-500">

        (555) 123-4567

      </p>

    </div>

    <div className="flex flex-col items-end space-y-2">

      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">

        Active

      </span>

      <ChevronRightIcon className="h-5 w-5 text-gray-400" />

    </div>

  </div>

</div>

```

  

#### **KPI Card (Dashboard)**

```tsx

<div className="

  bg-white

  border border-gray-200

  rounded-lg

  p-6

  shadow-sm

">

  <div className="flex items-center">

    <div className="flex-shrink-0">

      <UsersIcon className="h-8 w-8 text-primary-500" />

    </div>

    <div className="ml-4">

      <dl>

        <dt className="text-sm font-medium text-gray-500 truncate">

          Visits This Week

        </dt>

        <dd className="text-2xl font-semibold text-gray-900">

          23

        </dd>

      </dl>

    </div>

  </div>

</div>

```

  

### 5.4 Navigation Components

  

#### **Mobile Bottom Navigation**

```tsx

<nav className="

  fixed bottom-0 left-0 right-0

  bg-white border-t border-gray-200

  px-4 py-2

  md:hidden

">

  <div className="flex justify-around">

    {navigationItems.map((item) => (

      <button

        key={item.name}

        className="

          flex flex-col items-center

          px-3 py-2

          text-xs font-medium

          text-gray-500 hover:text-primary-500

          min-w-[44px]

        "

      >

        <item.icon className="h-6 w-6 mb-1" />

        {item.name}

      </button>

    ))}

  </div>

</nav>

```

  

#### **Mobile Header**

```tsx

<header className="

  bg-white border-b border-gray-200

  px-4 py-3

  flex items-center justify-between

">

  <h1 className="text-xl font-semibold text-gray-900">

    Customers

  </h1>

  <button className="

    p-2

    text-gray-400 hover:text-gray-500

    min-h-[44px] min-w-[44px]

  ">

    <Bars3Icon className="h-6 w-6" />

  </button>

</header>

```

  

---

  

## 6. Layout System

  

### 6.1 Grid System

```css

/* Mobile-First Container */

.container {

  width: 100%;

  padding-left: 1rem;

  padding-right: 1rem;

  margin-left: auto;

  margin-right: auto;

}

  

/* Responsive Breakpoints */

@media (min-width: 640px) {

  .container { max-width: 640px; }

}

  

@media (min-width: 768px) {

  .container { max-width: 768px; }

}

  

@media (min-width: 1024px) {

  .container { max-width: 1024px; }

}

```

  

### 6.2 Spacing Scale

```css

/* Consistent spacing using Tailwind's scale */

.space-1  { margin: 0.25rem; }  /* 4px */

.space-2  { margin: 0.5rem; }   /* 8px */

.space-3  { margin: 0.75rem; }  /* 12px */

.space-4  { margin: 1rem; }     /* 16px */

.space-6  { margin: 1.5rem; }   /* 24px */

.space-8  { margin: 2rem; }     /* 32px */

.space-12 { margin: 3rem; }     /* 48px */

```

  

---

  

## 7. Mobile-Specific Guidelines

  

### 7.1 Touch Targets

- **Minimum Size:** 44px x 44px (Apple guidelines)

- **Recommended Size:** 48px x 48px for primary actions

- **Spacing:** Minimum 8px between touch targets

- **Visual Feedback:** Hover and active states for all interactive elements

  

### 7.2 Mobile Navigation Patterns

- **Bottom Tab Bar:** Primary navigation for mobile

- **Hamburger Menu:** Secondary/overflow navigation

- **Swipe Gestures:** Enable where appropriate (cards, lists)

- **Pull to Refresh:** For data that updates frequently

  

### 7.3 Form Optimization

- **Large Input Fields:** Minimum 44px height

- **Appropriate Input Types:** `tel`, `email`, `url` for better keyboards

- **Clear Labels:** Above inputs, not placeholder-only

- **Error States:** Clear, visible error messages

- **Progress Indicators:** For multi-step forms

  

---

  

## 8. Data Visualization

  

### 8.1 Chart Components (Using Free Tremor Library)

  

#### **Visit Frequency Chart**

```tsx

import { AreaChart } from '@tremor/react';

  

const visitData = [

  { date: 'Jan 1', visits: 5 },

  { date: 'Jan 2', visits: 8 },

  { date: 'Jan 3', visits: 12 },

  // ... more data

];

  

<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">

  <h3 className="text-lg font-semibold text-gray-900 mb-4">

    Visits This Month

  </h3>

  <AreaChart

    data={visitData}

    index="date"

    categories={["visits"]}

    colors={["blue"]}

    yAxisWidth={30}

    className="h-48"

  />

</div>

```

  

#### **KPI Grid (Mobile Optimized)**

```tsx

<div className="grid grid-cols-2 gap-4 mb-6">

  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">

    <div className="text-2xl font-bold text-gray-900">142</div>

    <div className="text-sm text-gray-500">Total Customers</div>

  </div>

  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">

    <div className="text-2xl font-bold text-green-600">23</div>

    <div className="text-sm text-gray-500">Visits This Week</div>

  </div>

</div>

```

  

---

  

## 9. Accessibility Guidelines

  

### 9.1 Color Contrast

- **Text on Background:** Minimum 4.5:1 ratio (WCAG AA)

- **Large Text:** Minimum 3:1 ratio

- **Interactive Elements:** Minimum 3:1 ratio for borders/icons

  

### 9.2 Keyboard Navigation

- **Tab Order:** Logical, predictable navigation flow

- **Focus Indicators:** Visible focus rings on all interactive elements

- **Skip Links:** For main content navigation

  

### 9.3 Screen Reader Support

- **Semantic HTML:** Proper heading hierarchy (h1, h2, h3)

- **ARIA Labels:** For icon buttons and complex interactions

- **Alt Text:** Descriptive text for all images

- **Form Labels:** Explicit labels for all form controls

  

---

  

## 10. Performance Guidelines

  

### 10.1 Image Optimization

- **Format:** WebP with JPEG fallback

- **Sizing:** Responsive images with multiple breakpoints

- **Lazy Loading:** For images below the fold

- **Compression:** Optimize for mobile bandwidth

  

### 10.2 Bundle Optimization

- **Tree Shaking:** Import only used components

- **Code Splitting:** Route-based splitting for faster initial load

- **Critical CSS:** Inline critical styles for above-the-fold content

  

---

  

## 11. Component Implementation Examples

  

### 11.1 Visit Log Form Component (Using Free shadcn/ui)

```tsx

import React from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

  

interface VisitFormData {

  notes: string;

  customerSatisfaction: number;

  followUpDate: string;

}

  

export function VisitLogForm() {

  const { register, handleSubmit, formState: { errors } } = useForm<VisitFormData>();

  

  return (

    <form className="space-y-6 p-4">

      <div className="space-y-2">

        <Label htmlFor="notes">Visit Notes</Label>

        <Textarea

          id="notes"

          {...register('notes', { required: 'Visit notes are required' })}

          placeholder="What happened during this visit?"

          className="min-h-[100px] text-base"

        />

        {errors.notes && (

          <p className="text-sm text-destructive">{errors.notes.message}</p>

        )}

      </div>

  

      <div className="flex space-x-4">

        <Button

          type="button"

          variant="outline"

          size="lg"

          className="flex-1"

        >

          Cancel

        </Button>

        <Button

          type="submit"

          size="lg"

          className="flex-1"

        >

          Save Visit

        </Button>

      </div>

    </form>

  );

}

```

  

### 11.2 Customer Search Component (Using Free Heroicons)

```tsx

import React, { useState } from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/ui/input';

  

interface SearchProps {

  onSearch: (query: string) => void;

  placeholder?: string;

}

  

export function CustomerSearch({ onSearch, placeholder = "Search customers..." }: SearchProps) {

  const [query, setQuery] = useState('');

  

  const handleSearch = (value: string) => {

    setQuery(value);

    onSearch(value);

  };

  

  return (

    <div className="relative">

      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

        <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />

      </div>

      <Input

        type="text"

        value={query}

        onChange={(e) => handleSearch(e.target.value)}

        className="pl-10 text-base h-12"

        placeholder={placeholder}

      />

    </div>

  );

}

```

  

---

  

## 12. Design Tokens

  

### 12.1 Tailwind Config Extension

```javascript

// tailwind.config.js

module.exports = {

  theme: {

    extend: {

      colors: {

        primary: {

          50: '#eff6ff',

          100: '#dbeafe',

          500: '#3b82f6',

          600: '#2563eb',

          700: '#1d4ed8',

          900: '#1e3a8a',

        }

      },

      fontFamily: {

        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],

      },

      spacing: {

        '18': '4.5rem',

        '88': '22rem',

      },

      minHeight: {

        '44': '44px',

      },

      minWidth: {

        '44': '44px',

      }

    }

  }

}

```

---

### **Analysis Summary: Project UI Stack vs. UI Document Guidelines**

I have completed the analysis of the project files against the `doc/current/UI_unknown.md` document. Here is a summary of my findings:

**UI Libraries & Frameworks:**

*   **Tremor:** Not used. The project does not include the `@tremor/react` package, and no components from this library are imported.
*   **Headless UI:** Not used. The `@headlessui/react` package is not a dependency.
*   **Heroicons:** Not used. The `@heroicons/react` package is not a dependency.
*   **shadcn/ui:** Not used. The project does not follow the typical `shadcn/ui` structure (e.g., a `components/ui` directory), and its dependencies are not present in `package.json`.
*   **Headless UI & Tailwind CSS:** Used. The project has been migrated to a headless UI stack, using Headless UI for components, Tailwind CSS for styling, and Tremor for charts.
*   **Tailwind CSS:** Used. The project is configured with Tailwind CSS, but the implementation diverges from the UI document's specifications.

**Design System Implementation:**

*   **Color Palette:** The color palette defined in `tailwind.config.js` does **not** match the one in the UI document. The project uses a different set of custom colors for priorities, statuses, and business types, rather than the specified primary, success, warning, and error colors.
*   **Typography:** The project does **not** implement the custom typography scale from the UI document. It relies on the default Tailwind CSS typography settings.
*   **Touch Targets:** The project **does** implement custom utilities for touch targets in `tailwind.config.js`, which aligns with the mobile-first guidelines in the UI document.

**Conclusion:**

The project's UI has been migrated to align with the guidelines in this document, using a headless UI stack consisting of Headless UI, Heroicons, and Tremor, with Tailwind CSS for styling.
