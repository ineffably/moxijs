# Theming System

A generic, extensible theming system for MoxiJS UI components.

## Overview

The theming system provides:
- **Generic Theme Interface**: Extend `BaseTheme` to define your own theme properties
- **Theme Manager**: Register, switch, and persist themes
- **Change Listeners**: React to theme changes
- **Persistence**: Automatic localStorage persistence
- **Type Safety**: Full TypeScript support

## Basic Usage

### 1. Define Your Theme Interface

```typescript
import { BaseTheme } from '@moxijs/core';

interface MyAppTheme extends BaseTheme {
  background: number;
  text: number;
  accent: number;
  buttonBackground: number;
  buttonText: number;
}
```

### 2. Create Theme Manager

```typescript
import { ThemeManager } from '@moxijs/core';

const themeManager = new ThemeManager<MyAppTheme>('my-app-theme', 'Dark');
```

### 3. Register Themes

```typescript
themeManager.registerTheme({
  name: 'Dark',
  variant: 'dark',
  theme: {
    background: 0x1e1e1e,
    text: 0xffffff,
    accent: 0x4a90e2,
    buttonBackground: 0x404040,
    buttonText: 0xffffff
  }
});

themeManager.registerTheme({
  name: 'Light',
  variant: 'light',
  theme: {
    background: 0xffffff,
    text: 0x000000,
    accent: 0x4a90e2,
    buttonBackground: 0xe0e0e0,
    buttonText: 0x000000
  }
});
```

### 4. Use Theme in Components

```typescript
// Get current theme
const theme = themeManager.getTheme();

// Use theme colors
const button = new UIButton({
  backgroundColor: theme.buttonBackground,
  textColor: theme.buttonText
});
```

### 5. Listen for Theme Changes

```typescript
themeManager.addListener((theme, info) => {
  console.log(`Theme changed to: ${info.name}`);
  // Update all components with new theme
  updateAllComponents(theme);
});
```

### 6. Switch Themes

```typescript
// Switch by name
themeManager.setTheme('Light');

// Or get theme info and switch
const lightTheme = themeManager.getAllThemes().find(t => t.name === 'Light');
if (lightTheme) {
  themeManager.setThemeInfo(lightTheme);
}
```

## Using DefaultUITheme

For quick start, use the provided `DefaultUITheme`:

```typescript
import {
  ThemeManager,
  DefaultUITheme,
  createDefaultDarkTheme,
  createDefaultLightTheme
} from '@moxijs/core';

const themeManager = new ThemeManager<DefaultUITheme>('my-app-theme');

themeManager.registerTheme({
  name: 'Dark',
  variant: 'dark',
  theme: createDefaultDarkTheme()
});

themeManager.registerTheme({
  name: 'Light',
  variant: 'light',
  theme: createDefaultLightTheme()
});
```

## Integrating with UI Components

### Option 1: Pass Theme to Components

```typescript
const theme = themeManager.getTheme();

const checkbox = new UICheckboxWithLabel({
  label: 'Enable feature',
  checkedBackgroundColor: theme.accent,
  textColor: theme.text
});
```

### Option 2: Create Themed Component Wrappers

```typescript
function createThemedCheckbox(label: string, checked: boolean) {
  const theme = themeManager.getTheme();
  return new UICheckboxWithLabel({
    label,
    checked,
    checkedBackgroundColor: theme.accent,
    textColor: theme.text,
    borderColor: theme.border
  });
}
```

### Option 3: Make Components Theme-Aware (Future)

Components could accept a `theme` prop or automatically use a global theme:

```typescript
// Future API
const checkbox = new UICheckboxWithLabel({
  label: 'Enable feature',
  theme: themeManager.getTheme() // or use global theme
});
```

## Theme Persistence

Themes are automatically persisted to localStorage using the storage key you provide:

```typescript
const themeManager = new ThemeManager('my-app-theme');
// Theme selection is automatically saved and restored
```

## Migration from PIKCELL

If you're migrating from PIKCELL's theme system:

1. **Extract PIKCELL Theme Interface**:
   ```typescript
   interface PikcellTheme extends BaseTheme {
     workspace: number;
     cardBackground: number;
     cardTitleBar: number;
     cardBorder: number;
     buttonBackground: number;
     bevelColor: number;
     accent: number;
     text: number;
   }
   ```

2. **Create Theme Manager**:
   ```typescript
   const themeManager = new ThemeManager<PikcellTheme>('pikcell-theme');
   ```

3. **Register Existing Themes**:
   ```typescript
   // Convert existing PIKCELL themes
   themeManager.registerTheme({
     name: 'Dark',
     variant: 'dark',
     theme: existingDarkTheme
   });
   ```

4. **Update Components**:
   ```typescript
   // Before: getTheme().text
   // After: themeManager.getTheme().text
   ```

## Best Practices

1. **Single Theme Manager**: Create one theme manager per application
2. **Type Safety**: Always extend `BaseTheme` for your theme interface
3. **Theme Variants**: Use `variant: 'dark' | 'light'` for theme categorization
4. **Listeners**: Use listeners to update components when theme changes
5. **Default Theme**: Always register a default theme as the first theme

## API Reference

### ThemeManager<T extends BaseTheme>

- `registerTheme(themeInfo: ThemeInfo<T>): void` - Register a theme
- `registerThemes(themes: ThemeInfo<T>[]): void` - Register multiple themes
- `getTheme(): T` - Get current theme
- `getThemeInfo(): ThemeInfo<T>` - Get current theme info
- `getAllThemes(): ThemeInfo<T>[]` - Get all registered themes
- `getThemesByVariant(variant: ThemeVariant): ThemeInfo<T>[]` - Get themes by variant
- `setTheme(name: string): boolean` - Set theme by name
- `setThemeInfo(themeInfo: ThemeInfo<T>): void` - Set theme by ThemeInfo
- `addListener(listener: ThemeChangeListener<T>): void` - Add change listener
- `removeListener(listener: ThemeChangeListener<T>): void` - Remove listener
- `clearStorage(): void` - Clear persisted theme

