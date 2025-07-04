# Material-UI Migration Audit & Plan

This document outlines the audit of Material-UI components in use and the prioritized plan for migrating them to our new Tailwind/Headless UI kit.

## Component Prioritization Matrix

The following table lists all identified MUI components, their import frequency, and their priority for migration. The priority is determined by a combination of frequency, foundational nature, and complexity.

| Category | Component | Frequency | Complexity | Priority | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Layout** | `Box` | 16 | Low | **P1** | Foundational. A simple `div` wrapper. |
| | `Stack` | 11 | Low | **P1** | Foundational. Key for flexbox layouts. |
| | `Grid` | 4 | Medium | P2 | Can be replaced with CSS Grid/Flexbox. |
| | `Container` | 2 | Low | P3 | Basic layout container. |
| | `Divider` | 2 | Low | P2 | Simple horizontal rule. |
| | `ImageList` | 1 | Medium | P4 | For image galleries. |
| **Typography**| `Typography` | 14 | Low | **P1** | Foundational. Core text element. |
| | `Link` | 3 | Low | P2 | Basic anchor tag styling. |
| **Surface** | `Card` | 7 | Low | **P1** | Core container for content. |
| | `CardContent`| 7 | Low | **P1** | Used with Card. |
| | `Paper` | 1 | Low | P2 | Similar to Card, a basic surface. |
| | `CardHeader` | 1 | Medium | P3 | More complex card part. |
| **Inputs** | `Button` | 6 | Medium | **P1** | Essential interactive element. |
| | `IconButton` | 1 | Medium | P2 | Variant of Button. |
| | `TextField` | 1 | High | P2 | Complex form element with state. |
| | `Switch` | 1 | Medium | P3 | Form toggle. |
| | `FormControlLabel`| 1 | Low | P3 | Used with Switch/Checkbox. |
| | `MenuItem` | 1 | Low | P3 | Used with Select/Menu. |
| **Feedback** | `Alert` | 3 | Medium | P2 | For notifications. |
| | `Dialog` | 3 | High | P2 | Modal component, complex state. |
| | `DialogTitle`| 2 | Low | P2 | Part of Dialog. |
| | `DialogContent`| 3 | Low | P2 | Part of Dialog. |
| | `Tooltip` | 2 | Medium | P3 | For hover-activated info. |
| | `CircularProgress`| 1 | Low | P2 | Loading indicator. |
| | `LinearProgress`| 1 | Low | P2 | Loading indicator. |
| | `Fade` | 1 | Low | P4 | Transition effect. |
| | `Collapse` | 2 | Low | P4 | Transition effect. |
| **Data Display**| `Chip` | 10 | Low | **P1** | Important for tags and statuses. |
| | `List` | 1 | Medium | P3 | Collection of items. |
| | `ListItem` | 1 | Low | P3 | Part of List. |
| | `ListItemIcon`| 1 | Low | P3 | Part of List. |
| | `ListItemText`| 1 | Low | P3 | Part of List. |
| **Hooks** | `useMediaQuery`| 6 | N/A | **P1** | Replace with Tailwind screens/custom hook. |
| | `useTheme` | 3 | N/A | **P1** | Replace with Tailwind's `theme()` function. |

---

## Migration Plan: Phase 3 Execution

Based on the matrix, we will proceed with building the UI kit in the following order, focusing on **P1** priorities first.

### Sprint 1: Foundational Layout & Text
1.  **`Box` & `Stack`**: Create flexible layout components.
2.  **`Typography`**: Create a text component that maps to our design tokens.
3.  **Hooks**: Create replacements for `useMediaQuery` and `useTheme` using Tailwind-native approaches.

### Sprint 2: Core Interactive Elements
1.  **`Button`**: Develop a comprehensive button component with variants and sizes.
2.  **`Card` & `CardContent`**: Build our primary content container.
3.  **`Chip`**: Create the new `Chip` component for tags.

### Sprint 3: Forms & Feedback
1.  **`TextField`**: Tackle the most complex form element.
2.  **`Alert`**: Build the notification component.
3.  **`Dialog`**: Build the base modal/dialog component.

Subsequent sprints will address P2, P3, and P4 components until the migration is complete. Each component will be built in isolation using Storybook, tested, and then systematically rolled out to replace its MUI counterpart.
