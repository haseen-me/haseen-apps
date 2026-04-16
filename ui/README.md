<p align="center">
  <img src="https://img.shields.io/npm/v/@haseen-me/ui?color=2db8af&label=npm" alt="npm version" />
  <img src="https://img.shields.io/badge/react-18%2B%20%7C%2019-2db8af" alt="react" />
  <img src="https://img.shields.io/badge/typescript-5.8-2db8af" alt="typescript" />
  <img src="https://img.shields.io/badge/license-MIT-2db8af" alt="license" />
  <img src="https://img.shields.io/bundlephobia/minzip/@haseen-me/ui?color=2db8af&label=size" alt="bundle size" />
</p>

# Haseen UI

A modern, lightweight React design system with 25+ components, 4 hooks, and a full dark/light theming engine — all in **~53 KB** (ESM, tree-shakeable).

## Features

| | |
|---|---|
| **25+ Components** | Avatar, Button, Dialog, Dropdown, InputField, Tabs, Toast, Tooltip, and more |
| **Theme Engine** | Dark & light modes with 100+ semantic CSS custom properties (`--hsn-*`) |
| **TypeScript** | Full type exports, generic components, IntelliSense out of the box |
| **Zero CSS-in-JS Runtime** | No styled-components or emotion — pure CSS variables + inline styles |
| **Tree-shakeable** | ESM & CJS builds with proper `exports` map. Import only what you use |
| **Accessible** | WAI-ARIA roles, keyboard navigation hooks, focus management |

## Installation

```bash
npm install @haseen-me/ui
```

### Peer dependencies

```bash
npm install react react-dom @floating-ui/react framer-motion lucide-react
```

## Quick start

Wrap your app with `HaseenThemeProvider` to inject theme CSS variables:

```tsx
import { HaseenThemeProvider } from '@haseen-me/ui';

function App() {
  return (
    <HaseenThemeProvider>
      <YourApp />
    </HaseenThemeProvider>
  );
}
```

Use any component:

```tsx
import { Button, Typography, TypographySize, Type } from '@haseen-me/ui';
import { Send } from 'lucide-react';

function Hero() {
  return (
    <>
      <Typography size={TypographySize.H2}>Welcome to Haseen</Typography>
      <Button type={Type.PRIMARY} startIcon={<Send size={16} />}>
        Get Started
      </Button>
    </>
  );
}
```

## Components

| Component | Description |
|---|---|
| `Avatar` | User representation with initials or images |
| `Banner` | Colored message banner (info, success, warning, error) |
| `Button` | Primary, secondary, tertiary, destructive with icon slots |
| `ButtonGroup` | Grouped buttons for related actions |
| `Chip` | Compact tag with optional icon and delete action |
| `CircularProgress` | Animated loading spinner |
| `CodeInput` | Multi-field code entry (OTP, verification) |
| `Dialog` | Modal dialog with title, description, and actions |
| `Divider` | Horizontal content separator |
| `Dropdown` | Floating menu anchored to trigger element |
| `DropdownItem` | Individual item inside a Dropdown |
| `DropdownSubmenu` | Nested submenu inside a Dropdown |
| `Facepile` | Overlapping avatar row for user groups |
| `IconButton` | Icon-only button for toolbar actions |
| `IconText` | Icon + text pair for nav items and metadata |
| `InputField` | Input wrapper with label, validation, and sub-text |
| `Input` | Text input with icon slots and size variants |
| `KeyCodeSequence` | Keyboard shortcut display (e.g. ⌘K) |
| `MonoTag` | Monospace tag for versions and identifiers |
| `Portal` | Render children into document.body |
| `Select` | Type-safe dropdown selector |
| `Skeleton` | Pulsing placeholder for loading states |
| `Surface` | Layered background container (l0–l3) with glass variant |
| `Tabs` | Segmented view switcher |
| `Toast` | Auto-dismissing notification message |
| `Toggle` | On/off switch control |
| `Tooltip` | Floating hint on hover (Floating UI powered) |
| `Typography` | Text component with H1–Caption sizes |

## Hooks

| Hook | Description |
|---|---|
| `useOnClickOutside` | Detect clicks outside a ref, with modal exclusion support |
| `useKeyboardNavigation` | Arrow key, Enter, Escape navigation for lists |
| `useMousePosition` | Throttled mouse coordinate tracking |
| `useOnEscapePress` | Global Escape key listener |

## Theming

Haseen UI uses **CSS custom properties** prefixed with `--hsn-`. The `HaseenThemeProvider` applies ~100 semantic tokens to `document.body`.

```tsx
import { useTheme, ThemeMode } from '@haseen-me/ui';

function ThemeSwitch() {
  const { theme, setStoredTheme } = useTheme();
  return (
    <button onClick={() =>
      setStoredTheme(theme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK)
    }>
      {theme === ThemeMode.DARK ? '☀️' : '🌙'}
    </button>
  );
}
```

Theme persistence uses `localStorage` (key: `HASEEN_THEME_MODE`). System preference is auto-detected on first visit.

### Token categories

| Prefix | Examples |
|---|---|
| `--hsn-text-*` | primary, secondary, tertiary, disabled, link |
| `--hsn-icon-*` | primary, secondary, tertiary |
| `--hsn-bg-*` | l0–l3 (solid & glass), field, overlay, cell |
| `--hsn-border-*` | primary, secondary, tertiary, active |
| `--hsn-cta-*` | primary/secondary/tertiary/destructive × default/hover/active |
| `--hsn-accent-*` | teal, green, red, orange, yellow, blue, pink, indigo |
| `--hsn-shadow-*` | l1, l2, l3 elevation levels |

## Development

```bash
# Build the library
npm run build

# Watch mode
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint
```

### Build output

| Format | File | Size |
|---|---|---|
| ESM | `dist/index.mjs` | ~53 KB |
| CJS | `dist/index.js` | ~55 KB |
| Types | `dist/index.d.ts` | ~27 KB |

## Project structure

```
src/
├── components/     # 25+ React components
├── hooks/          # 4 utility hooks
├── theme/          # ThemeProvider, theme token maps
├── tokens.ts       # Design tokens (palette, spacing, radii, etc.)
├── types.ts        # Shared enums and utility types
├── utils/          # Color utils, click detection, BackgroundBlocker
└── index.ts        # Barrel export
```

## License

[MIT](LICENSE) © [Haseen](https://haseen.me)
