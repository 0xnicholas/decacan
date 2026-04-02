# Theme System Documentation

This document describes the shared theme system used across Decacan applications.

## Overview

The theme system provides a unified visual experience across all Decacan apps with support for:
- **Light mode** - Clean, bright interface
- **Dark mode** - Comfortable low-light viewing
- **System preference** - Automatically follows OS setting

## Architecture

### Shared Theme Package (`@decacan/ui`)

The theme configuration is centralized in the `@decacan/ui` package:

```
packages/ui/
├── css/
│   └── styles.css          # Complete theme configuration
├── src/
│   └── components/
│       └── theme-provider.tsx  # React context for theme switching
```

### Theme Configuration

**CSS Variables** (in `packages/ui/css/styles.css`):

```css
:root {
  --background: var(--color-white);
  --foreground: var(--color-zinc-950);
  --primary: #0066FF;
  --primary-foreground: var(--color-white);
  /* ... */
}

.dark {
  --background: var(--color-zinc-950);
  --foreground: var(--color-zinc-50);
  /* ... */
}
```

## Usage

### In Applications

Import the shared theme in your app's main CSS file:

```css
/* apps/workspaces/src/css/styles.css */
@import '@decacan/ui/css/styles.css';
```

Wrap your app with ThemeProvider:

```tsx
// apps/workspaces/src/main.tsx
import { ThemeProvider } from '@decacan/ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="workspaces-theme">
    <App />
  </ThemeProvider>
);
```

### Using Theme in Components

Use the `useTheme` hook to access theme state:

```tsx
import { useTheme } from '@decacan/ui';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark' (actual applied theme)
  
  return (
    <div>
      <p>Current theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to dark mode
      </button>
    </div>
  );
}
```

### Using Design Tokens

Reference CSS variables in your Tailwind classes:

```tsx
// Background colors
<div className="bg-background">

// Text colors  
<span className="text-foreground">
<span className="text-muted-foreground">

// Border colors
<div className="border-border">

// Primary actions
<button className="bg-primary text-primary-foreground">
```

## Available Tokens

### Colors
- `--color-background` / `bg-background`
- `--color-foreground` / `text-foreground`
- `--color-muted` / `bg-muted`
- `--color-muted-foreground` / `text-muted-foreground`
- `--color-primary` / `bg-primary`, `text-primary`
- `--color-secondary` / `bg-secondary`
- `--color-accent` / `bg-accent`
- `--color-border` / `border-border`
- `--color-input` / `border-input`
- `--color-ring` / `ring-ring`

### Border Radius
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`

## Button Variants

The shared Button component supports these variants:

```tsx
<Button variant="primary">Primary</Button>
<Button variant="mono">Mono</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

## Migration Guide

### From Custom Theme

If migrating from a custom theme:

1. Replace custom `@theme` configuration with `@import '@decacan/ui/css/styles.css'`
2. Update color references from custom values to design tokens
3. Add ThemeProvider to your app's entry point
4. Update test helpers to wrap with ThemeProvider

### Color Migration Examples

```css
/* Before */
--color-background: #f8f1de;

/* After */
bg-background  /* Uses CSS variable */
```

```tsx
// Before
<div className="bg-surface border-foreground/10">

// After  
<div className="bg-background border-border">
```

## Best Practices

1. **Always use design tokens** - Don't hardcode colors
2. **Test in both modes** - Verify your UI looks good in light and dark
3. **Use semantic naming** - Choose tokens based on meaning, not appearance
4. **Keep app-specific CSS minimal** - Import shared theme, add only what's needed

## Browser Support

The theme system uses:
- CSS Custom Properties (variables)
- Tailwind CSS v4
- React 19 Context API

Supported in all modern browsers (Chrome, Firefox, Safari, Edge).

## Troubleshooting

### Theme not switching

Ensure ThemeProvider is at the root of your component tree:
```tsx
<ThemeProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ThemeProvider>
```

### Build errors

Verify vite.config.ts has the correct alias:
```ts
resolve: {
  alias: {
    '@decacan/ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
  },
}
```

### Test failures

Update test render helper:
```tsx
import { ThemeProvider } from '@decacan/ui';

export function renderApp(ui: ReactElement) {
  return render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      {ui}
    </ThemeProvider>
  );
}
```

## Related

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)