# Headless UI Migration Implementation Plan

This document outlines the plan and progress for migrating the ForkFlow-CRM application from Material-UI to a headless UI stack consisting of Headless UI, Heroicons, and Tremor, with Tailwind CSS for styling.

## 1. Migration Plan

The migration will be conducted in three phases to minimize disruption and ensure a smooth transition.

### Phase 1: Setup and Foundation

**Status:** Completed

**Tasks:**

1.  **Create a new Git branch:** `refactor/tailwind-headless-ui` to isolate the changes.
2.  **Install new dependencies:** `@headlessui/react`, `@heroicons/react`, and `@tremor/react`.
3.  **Update `tailwind.config.js`:** Configure the color palette, typography scale, and font weights as per the design system.
4.  **Create `src/components/ui-kit` directory:** This directory will house the new, reusable components.
5.  **Create `src/components/ui-kit/Button.tsx`:** Implement a foundational Button component using Headless UI and Tailwind CSS.
6.  **Create `src/components/ui-kit/Input.tsx`:** Implement a foundational Input component using `React.forwardRef` to ensure compatibility with `react-hook-form`.

### Phase 2: Incremental Component Migration

**Status:** In Progress

**Tasks:**

1.  **Migrate the Login Page:**
    *   [x] Replace Material-UI components in `src/login/LoginForm.tsx` with the new `Button` and `Input` components from the `ui-kit`.
    *   [x] Replace any remaining Material-UI components on the login page.
2.  **Migrate the Dashboard:**
    *   [x] Replace Material-UI components with `ui-kit` components.
    *   [x] Replace existing charts with new chart components from Tremor.
3.  **Migrate Resource Views (Customers, Deals, etc.):**
    *   [x] Systematically migrate each resource's list, edit, create, and show views.
    *   [ ] This will involve replacing `react-admin`'s data components (`<Datagrid>`, `<SimpleForm>`, etc.) with custom components built with `ra-core`'s headless hooks and our new `ui-kit`.
4.  **Migrate the Main Layout:**
    *   [x] This is the most complex part of the migration. It will involve replacing `react-admin`'s `<RaLayout>` and the custom `Header` with a new layout built from scratch with Tailwind CSS.

### Phase 3: Finalization and Cleanup

**Status:** Not Started

**Tasks:**

1.  **Remove Material-UI Dependencies:** [x] Once all components have been migrated, uninstall `@mui/material`, `@emotion/react`, and `@emotion/styled`.
2.  **Enable Tailwind Preflight:** [x] Re-enable Tailwind's `preflight` CSS reset in `tailwind.config.js` for global style consistency.
3.  **Code Cleanup:** Remove any old, unused component files and styles.
4.  **Final Review:** Conduct a full design and functionality review of the application.

## 2. Key Challenges and Solutions

*   **`react-admin`'s Deep Integration with Material-UI:**
    *   **Challenge:** Many of `react-admin`'s components are built with Material-UI.
    *   **Solution:** We will leverage `react-admin`'s headless `ra-core` package, which provides hooks and components that are UI-agnostic. This allows us to keep `react-admin`'s powerful data and state management capabilities while rebuilding the UI with our new component stack.

*   **Styling Conflicts:**
    *   **Challenge:** Running two UI libraries simultaneously can lead to CSS conflicts.
    *   **Solution:** We have temporarily disabled Tailwind's `preflight` reset. Once the migration is complete, we will re-enable it. During the transition, we will use careful scoping and targeted styles to prevent issues.

*   **`ref` Forwarding in Form Components:**
    *   **Challenge:** Form libraries like `react-hook-form` need to access the underlying DOM nodes of input components.
    *   **Solution:** All custom input components in our `ui-kit` will be wrapped in `React.forwardRef` to ensure they can be correctly used with `react-hook-form`.

This document will be updated as the migration progresses.
