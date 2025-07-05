# ForkFlow-CRM: Complete Material-UI to Tailwind CSS Migration

## Background Context
You are completing the final 15% of a Material-UI to Tailwind CSS + Headless UI migration for ForkFlow-CRM, a food broker CRM system. The migration is 85% complete with a well-architected UI kit already in place.

## Current State
- ✅ 34+ UI components already migrated to `src/components/ui-kit/`
- ✅ Tailwind CSS configured with custom theme
- ✅ Headless UI integration working
- ✅ Heroicons adopted for most icons
- ❌ 4 files still using `@mui/material` components
- ❌ 15+ files still using `@mui/icons-material`

## Technical Requirements

### Architecture Standards
- **Components**: Use existing UI kit from `@/components/ui-kit`
- **Icons**: Use `@heroicons/react/24/outline` (or `/24/solid` for filled)
- **Styling**: Tailwind CSS utility classes
- **Interactions**: Headless UI for complex components
- **Mobile**: 44px minimum touch targets
- **TypeScript**: Maintain strict typing

### Import Patterns
```typescript
// ✅ Correct imports
import { Button, Typography, Card } from '@/components/ui-kit';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

// ❌ Remove these
import { Button, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
```

## Migration Tasks

### Priority 1: Create Missing UI Kit Components

#### 1.1 Create Stepper Component (`src/components/ui-kit/Stepper.tsx`)
**Purpose**: Replace Material-UI Stepper in MultiStepOrganizationCreate.tsx

**Requirements**:
- Support horizontal and vertical orientation
- Step states: active, completed, disabled
- Mobile-responsive design
- Accessibility with proper ARIA labels

**API Compatibility**:
```typescript
interface StepperProps {
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

interface StepProps {
  completed?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

interface StepLabelProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

interface StepContentProps {
  children: React.ReactNode;
}
```

#### 1.2 Create ImageList Component (`src/components/ui-kit/ImageList.tsx`)
**Purpose**: Replace Material-UI ImageList in NoteAttachments.tsx

**Requirements**:
- Grid layout with configurable columns
- Responsive breakpoints
- Support for different aspect ratios
- Touch-friendly on mobile

**API Compatibility**:
```typescript
interface ImageListProps {
  cols?: number;
  gap?: number;
  children: React.ReactNode;
}

interface ImageListItemProps {
  children: React.ReactNode;
}
```

#### 1.3 Enhance Select/TextField Components
**Purpose**: Replace Material-UI MenuItem/TextField in StatusSelector.tsx

**Requirements**:
- Dropdown with search/filter capability
- Keyboard navigation
- Mobile-friendly touch interactions
- Support for custom option rendering

### Priority 2: File-by-File Migration

#### 2.1 MultiStepOrganizationCreate.tsx
**Current MUI Usage**: `Stepper, Step, StepLabel, StepContent, Collapse`

**Migration Steps**:
1. Replace Stepper components with new UI kit versions
2. Update icons from Material-UI to Heroicons:
   - `ArrowBack` → `ArrowLeftIcon`
   - `ArrowForward` → `ArrowRightIcon`
   - `Check` → `CheckIcon`
   - `Error` → `ExclamationCircleIcon`
   - `Warning` → `ExclamationTriangleIcon`
   - `Save` → `DocumentArrowDownIcon`
   - `Close` → `XMarkIcon`

#### 2.2 StatusSelector.tsx
**Current MUI Usage**: `MenuItem, TextField`

**Migration Steps**:
1. Replace with enhanced Select component from UI kit
2. Maintain current API and functionality
3. Ensure dropdown works on mobile

#### 2.3 NoteAttachments.tsx
**Current MUI Usage**: `ImageList, ImageListItem`

**Migration Steps**:
1. Replace with new ImageList component
2. Update AttachFileIcon to Heroicons: `AttachFileIcon` → `PaperClipIcon`
3. Maintain existing image handling logic

#### 2.4 CustomerImportButton.tsx
**Current MUI Usage**: `Button`

**Migration Steps**:
1. Replace with UI kit Button
2. Update icon: `Upload` → `ArrowUpTrayIcon`
3. Remove `sx` prop, use Tailwind classes

### Priority 3: Icon Migration

#### 3.1 Icon Mapping Guide
Create systematic replacements for all Material-UI icons:

**Common Mappings**:
- `Person` → `UserIcon`
- `Business` → `BuildingOfficeIcon`
- `LocationOn` → `MapPinIcon`
- `Phone` → `PhoneIcon`
- `Email` → `EnvelopeIcon`
- `Edit` → `PencilIcon`
- `Delete` → `TrashIcon`
- `Add` → `PlusIcon`
- `Remove` → `MinusIcon`
- `Save` → `DocumentArrowDownIcon`
- `Cancel` → `XMarkIcon`
- `Search` → `MagnifyingGlassIcon`
- `Filter` → `FunnelIcon`
- `Sort` → `BarsArrowUpIcon`
- `Visibility` → `EyeIcon`
- `VisibilityOff` → `EyeSlashIcon`

#### 3.2 Files Requiring Icon Migration
Process these files to replace Material-UI icons:
- `src/organizations/common/SmartKeyboard.tsx`
- `src/organizations/common/LayoutSelector.tsx`
- `src/organizations/form/MobileOrganizationCreate.tsx`
- `src/interactions/InteractionTimeline.tsx`
- `src/interactions/InteractionTypeSelector.tsx`
- `src/interactions/components/InteractionSettings.tsx`
- `src/dashboard/NeedsVisitList.tsx`
- `src/dashboard/FollowUpRemindersWidget.tsx`
- `src/components/security/SessionTimeout.tsx`
- `src/components/security/SecurityDashboard.tsx`
- `src/components/auth/AuthStatusIndicator.tsx`

### Priority 4: Cleanup and Validation

#### 4.1 Remove Dependencies
After migration is complete:
1. Remove `@mui/material` from package.json
2. Remove `@mui/icons-material` from package.json
3. Run `npm install` to clean up node_modules

#### 4.2 Validation Steps
1. Build project successfully: `npm run build`
2. Run tests: `npm test`
3. Check for any remaining MUI imports: `grep -r "@mui" src/`
4. Verify responsive design on mobile breakpoints
5. Test accessibility with screen readers

## Quality Standards

### Code Quality
- Maintain existing TypeScript interfaces
- Use consistent naming conventions
- Add proper JSDoc comments for new components
- Follow existing file structure patterns

### Design System
- Use existing Tailwind theme colors
- Maintain 44px minimum touch targets
- Preserve existing spacing and typography scales
- Ensure consistent hover/focus states

### Performance
- Lazy load components where appropriate
- Minimize bundle size impact
- Use proper React.memo for expensive components
- Maintain existing optimization patterns

## Testing Requirements

### Component Testing
- Test new Stepper component with different states
- Test ImageList with various grid configurations
- Test Select component with keyboard navigation
- Verify icon replacements render correctly

### Integration Testing
- Test multi-step forms still work correctly
- Test file attachments display properly
- Test all interactive elements on mobile devices
- Verify no visual regressions

## Success Criteria

### Completion Checklist
- [ ] All 4 files migrated from Material-UI components
- [ ] All Material-UI icons replaced with Heroicons
- [ ] New UI kit components created and exported
- [ ] All imports updated to use UI kit
- [ ] Dependencies removed from package.json
- [ ] Build passes without errors
- [ ] Tests pass
- [ ] No remaining `@mui` imports in codebase
- [ ] Mobile responsiveness maintained
- [ ] Accessibility standards met

### Final Validation
- [ ] `grep -r "@mui/material" src/` returns no results
- [ ] `grep -r "@mui/icons-material" src/` returns no results
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] Visual regression testing passes
- [ ] Mobile touch interactions work correctly

## Notes for Implementation

1. **Preserve Existing Functionality**: Do not change component behavior, only the underlying implementation
2. **Mobile-First**: Ensure all new components work well on mobile devices
3. **Accessibility**: Maintain or improve accessibility features
4. **Performance**: Don't introduce performance regressions
5. **TypeScript**: Maintain strict typing throughout
6. **Testing**: Add tests for new components
7. **Documentation**: Update component documentation as needed

## Emergency Rollback Plan

If issues arise during migration:
1. Git revert to last working state
2. Re-add Material-UI dependencies temporarily
3. Address issues incrementally
4. Resume migration with fixes

---

**Estimated Completion Time**: 2-3 days for complete migration
**Priority Order**: UI Kit components → File migrations → Icon replacements → Cleanup 