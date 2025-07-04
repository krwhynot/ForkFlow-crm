# Component Standards & Patterns

## Headless UI Library Selection
- **Primary**: Use Headless UI for basic components (Button, Dialog, Menu)
- **Secondary**: Use Radix UI for complex components requiring advanced accessibility
- **Fallback**: Use Shadcn/ui for pre-styled components when rapid development needed

## Component API Consistency
- Maintain similar prop interfaces to original MUI components
- Use compound component patterns for complex components
- Implement proper TypeScript interfaces for all new components
- Preserve accessibility attributes and ARIA properties

## File Organization
- Create new components in `src/components/ui/` directory
- Use barrel exports (index.ts) for component exports
- Maintain separate files for types, styles, and component logic
- Follow naming convention: `ComponentName.tsx`, `ComponentName.types.ts`

## Component Implementation Rules
- ALWAYS implement proper accessibility (ARIA attributes, keyboard navigation)
- Use React.forwardRef for components that need ref forwarding
- Implement proper error boundaries for complex components
- Use React.memo for components that receive stable props

## Migration Pattern
// OLD MUI Component
import { Button } from '@mui/material';
<Button variant="contained" color="primary">Click me</Button>

// NEW Tailwind + Headless UI
import { Button } from '@/components/ui/Button';
<Button variant="primary" className="bg-blue-500 hover:bg-blue-600">Click me</Button>


## Anti-Patterns to Avoid
- Do NOT mix MUI and Tailwind classes on same element
- Do NOT use `sx` prop patterns with Tailwind components
- Do NOT ignore accessibility requirements in migration
- Do NOT create monolithic component files (>300 lines)


