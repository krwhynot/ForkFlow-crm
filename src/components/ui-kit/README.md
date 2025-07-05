# ForkFlow-CRM UI Kit

A modern, Tailwind CSS-based component library for ForkFlow-CRM, designed to replace Material-UI (MUI) with accessible, mobile-friendly, and easily customizable React components.

---

## 📦 Components Overview

| Component         | Description                                 | MUI Equivalent(s)         |
|------------------|----------------------------------------------|---------------------------|
| `Alert`          | Notification/alert messages                  | `Alert`                   |
| `Avatar`         | User/company avatars with fallback           | `Avatar`                  |
| `AvatarGroup`    | Group of avatars with overflow indicator     | `AvatarGroup`             |
| `Badge`          | Count/status indicator                       | `Badge`                   |
| `Box`            | Layout utility, customizable tag             | `Box`                     |
| `Button`         | Action button, supports variants/sizes       | `Button`                  |
| `Card`           | Card container and subcomponents             | `Card`, `CardContent`, etc|
| `Checkbox`       | Checkbox input                               | `Checkbox`                |
| `Chip`           | Compact label with optional icon             | `Chip`                    |
| `CircularProgress`| Loading spinner                             | `CircularProgress`        |
| `Dialog`         | Modal dialog (Headless UI)                   | `Dialog`, `DialogTitle`   |
| `Divider`        | Visual separator                             | `Divider`                 |
| `Dropdown`       | Dropdown menu (Headless UI)                  | `Menu`, `MenuItem`        |
| `Fab`            | Floating action button                       | `Fab`, `SpeedDial`        |
| `Filter`         | Filter panel (react-admin compatible)        | `Filter`                  |
| `Grid`           | Responsive grid layout                       | `Grid`                    |
| `IconButton`     | Icon-only button                             | `IconButton`              |
| `Input`          | Text input                                   | `TextField`               |
| `LinearProgress` | Progress bar                                 | `LinearProgress`          |
| `List`           | List and subcomponents                       | `List`, `ListItem`, etc.  |
| `Menu`           | Dropdown menu (Headless UI)                  | `Menu`, `MenuItem`        |
| `Modal`          | Simple modal dialog (Headless UI)            | `Modal`                   |
| `Paper`          | Elevated content container                   | `Paper`                   |
| `Stack`          | Flexbox layout utility                       | `Stack`                   |
| `Table`          | Table and subcomponents                      | `Table`, `TableRow`, etc. |
| `Tooltip`        | Contextual info on hover (Headless UI)       | `Tooltip`                 |
| `Typography`     | Text with semantic/visual variants           | `Typography`              |

---

## 🚀 Migration Guidelines: MUI → UI Kit

### 1. Replace Imports

**From:**
```tsx
import { Button, Typography, Card } from '@mui/material';
```
**To:**
```tsx
import { Button, Typography, Card } from '@/components/ui-kit';
```

### 2. Update Props and Variants
- **Variants:** Use `variant`, `color`, and `size` props as supported by the UI kit. Some prop names or values may differ (see below).
- **ClassName:** Use `className` for Tailwind utility classes and custom styles.
- **Accessibility:** All components are accessible by default and support `ref` forwarding.

### 3. Common MUI → UI Kit Replacements

#### Button
**MUI:**
```tsx
<Button variant="contained" color="primary" size="large">Save</Button>
```
**UI Kit:**
```tsx
<Button variant="contained" color="primary" size="lg">Save</Button>
```

#### Typography
**MUI:**
```tsx
<Typography variant="h6" color="textSecondary" gutterBottom>
  Subtitle
</Typography>
```
**UI Kit:**
```tsx
<Typography variant="h6" color="secondary" gutterBottom>
  Subtitle
</Typography>
```

#### Card
**MUI:**
```tsx
<Card>
  <CardHeader title="Title" />
  <CardContent>Content</CardContent>
</Card>
```
**UI Kit:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Dialog
**MUI:**
```tsx
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Close</Button>
  </DialogActions>
</Dialog>
```
**UI Kit:**
```tsx
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Close</Button>
  </DialogActions>
</Dialog>
```

#### Alert
**MUI:**
```tsx
<Alert severity="success" onClose={handleClose}>Success!</Alert>
```
**UI Kit:**
```tsx
<Alert severity="success" onClose={handleClose}>Success!</Alert>
```

#### Chip
**MUI:**
```tsx
<Chip label="Active" color="primary" />
```
**UI Kit:**
```tsx
<Chip label="Active" color="primary" />
```

#### Tooltip
**MUI:**
```tsx
<Tooltip title="Info"><Button>Hover me</Button></Tooltip>
```
**UI Kit:**
```tsx
<Tooltip content="Info"><Button>Hover me</Button></Tooltip>
```

#### Stack
**MUI:**
```tsx
<Stack direction="row" spacing={2}>
  <Button>A</Button>
  <Button>B</Button>
</Stack>
```
**UI Kit:**
```tsx
<Stack direction="row" gap={2}>
  <Button>A</Button>
  <Button>B</Button>
</Stack>
```

---

## 📑 Component Prop Tables

### Button Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `variant`    | 'contained' \| 'outlined' \| 'text' \| 'primary' \| 'secondary' \| 'icon' | 'contained'  | Visual style of the button                       |
| `size`       | 'small' \| 'medium' \| 'large' \| 'sm' \| 'md' \| 'lg'         | 'medium'     | Button size                                      |
| `color`      | 'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' | 'primary'     | Button color theme                               |
| `startIcon`  | ReactNode                                         | -            | Icon to display before the label                 |
| `endIcon`    | ReactNode                                         | -            | Icon to display after the label                  |
| `fullWidth`  | boolean                                           | false        | Makes button take full width                     |
| `component`  | React.ElementType                                 | 'button'     | Custom component to render as                    |
| `children`   | ReactNode                                         | -            | Button content                                   |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Button variant="contained" color="success" size="lg">Save</Button>
```

### Typography Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `variant`    | 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body1' \| 'body2' \| 'caption' | 'body1'      | Typography style/semantic                        |
| `color`      | 'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'textPrimary' \| 'textSecondary' \| 'textDisabled' | 'textPrimary' | Text color                                       |
| `align`      | 'left' \| 'center' \| 'right' \| 'justify'        | -            | Text alignment                                   |
| `gutterBottom`| boolean                                          | false        | Adds margin below                                |
| `noWrap`     | boolean                                           | false        | Prevents text wrapping                           |
| `paragraph`  | boolean                                           | false        | Adds paragraph spacing                           |
| `component`  | React.ElementType                                 | -            | Custom HTML tag                                  |
| `as`         | React.ElementType                                 | -            | Custom HTML tag                                  |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Typography variant="h4" color="primary" gutterBottom>
  Welcome!
</Typography>
```

### Card Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `className`  | string                                            | -            | Additional Tailwind classes                      |
| `children`   | ReactNode                                         | -            | Card content                                     |

**Subcomponents:** `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (all accept `className` and `children`)

**Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Alert Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `severity`   | 'success' \| 'warning' \| 'info' \| 'error'        | 'info'       | Alert color and icon                             |
| `variant`    | 'filled' \| 'outlined' \| 'standard'               | 'standard'   | Visual style                                     |
| `onClose`    | () => void                                        | -            | Close handler                                    |
| `title`      | string                                            | -            | Optional alert title                             |
| `children`   | ReactNode                                         | -            | Alert message                                    |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Alert severity="error" variant="filled" onClose={handleClose} title="Error!">
  Something went wrong.
</Alert>
```

### Chip Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `label`      | ReactNode                                         | -            | Chip label                                       |
| `icon`       | ReactNode                                         | -            | Optional icon                                    |
| `color`      | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' | 'primary'     | Chip color                                       |
| `variant`    | 'filled' \| 'outlined'                             | 'filled'     | Visual style                                     |
| `size`       | 'small' \| 'medium'                                | 'medium'     | Chip size                                        |
| `onClick`    | () => void                                        | -            | Click handler                                    |
| `disabled`   | boolean                                           | false        | Disabled state                                   |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Chip label="Active" color="success" variant="outlined" />
```

### Dialog Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `open`       | boolean                                           | -            | Whether dialog is open                           |
| `onClose`    | () => void                                        | -            | Close handler                                    |
| `children`   | ReactNode                                         | -            | Dialog content                                   |
| `className`  | string                                            | -            | Additional Tailwind classes                      |
| `maxWidth`   | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'              | 'md'         | Max width of dialog                              |

**Subcomponents:** `DialogTitle`, `DialogContent`, `DialogActions`, `DialogCloseButton`

**Example:**
```tsx
<Dialog open={open} onClose={handleClose} maxWidth="sm">
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogContent>Dialog content goes here.</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Close</Button>
  </DialogActions>
</Dialog>
```

### Avatar Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `src`        | string                                            | -            | Image source URL                                 |
| `alt`        | string                                            | -            | Alt text                                         |
| `size`       | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'              | 'md'         | Avatar size                                      |
| `width`      | number                                            | -            | Custom width (px)                                |
| `height`     | number                                            | -            | Custom height (px)                               |
| `title`      | string                                            | -            | Tooltip/title                                     |
| `children`   | ReactNode                                         | -            | Fallback initials                                |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Avatar src="/user.png" alt="User" size="lg">AB</Avatar>
```

### Stack Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `direction`  | 'row' \| 'col'                                    | 'col'        | Flex direction                                   |
| `gap`        | number                                            | 0            | Gap between children (in rem units)              |
| `align`      | 'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline' | -      | Align items                                      |
| `justify`    | 'start' \| 'center' \| 'end' \| 'between' \| 'around' | -      | Justify content                                  |
| `as`         | React.ElementType                                 | -            | Custom HTML tag                                  |
| `className`  | string                                            | -            | Additional Tailwind classes                      |
| `children`   | ReactNode                                         | -            | Stack content                                    |

**Example:**
```tsx
<Stack direction="row" gap={4} align="center">
  <Button>A</Button>
  <Button>B</Button>
</Stack>
```

### Tooltip Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `content`    | ReactNode                                         | -            | Tooltip content                                  |
| `placement`  | 'top' \| 'bottom' \| 'left' \| 'right'            | 'top'        | Tooltip position                                  |
| `delay`      | number                                            | 300          | Show delay (ms)                                  |
| `className`  | string                                            | -            | Additional Tailwind classes                      |
| `contentClassName`| string                                       | -            | Classes for tooltip content                      |
| `children`   | ReactNode                                         | -            | Trigger element                                  |

**Example:**
```tsx
<Tooltip content="More info" placement="bottom">
  <Button>Hover me</Button>
</Tooltip>
```

### Checkbox Props
| Prop         | Type                                              | Default      | Description                                      |
|--------------|---------------------------------------------------|--------------|--------------------------------------------------|
| `checked`    | boolean                                           | -            | Checked state                                    |
| `onChange`   | (event: React.ChangeEvent<HTMLInputElement>) => void | -         | Change handler                                   |
| `disabled`   | boolean                                           | false        | Disabled state                                   |
| `className`  | string                                            | -            | Additional Tailwind classes                      |

**Example:**
```tsx
<Checkbox checked={checked} onChange={handleChange} />
```

---

## 📝 Notes
- All components are styled with Tailwind CSS and support `className` for custom styles.
- Some advanced MUI features (e.g., transitions, popovers) may require custom implementation or use of Headless UI primitives.
- For icons, consider using [Heroicons](https://heroicons.com/) or another icon library, as MUI icons are not included in the UI kit.
- For any missing features or edge cases, extend the component or open a PR.

---

## 📚 Component Reference

For detailed props and usage, see the source code and Storybook stories for each component.

---

## 💡 Contributing
- Follow the established patterns for new components.
- Write clear, accessible, and mobile-friendly code.
- Add Storybook stories for new or updated components.

---

Happy coding! 