# Theming System Usage Guide

## Overview

The MoxiJS theming system provides a **data-driven**, **KISS**, **SRP-compliant**, and **separation of concerns** approach to theming UI components.

## Architecture

```
Theme Data → Theme Resolver → Components
   (data)      (logic)        (rendering)
```

### Layers

1. **Theme Data** (`theme-data.ts`): Pure data structures - no logic
2. **Theme Resolver** (`theme-resolver.ts`): Color resolution logic - pure functions
3. **Theme Manager** (`theme-manager.ts`): Theme registration, switching, persistence
4. **Components**: Use ThemeResolver for automatic color resolution

## Quick Start

### 1. Create Theme Manager

```typescript
import { ThemeManager, DefaultUITheme, createDefaultDarkTheme } from '@moxijs/core';

const themeManager = new ThemeManager<DefaultUITheme>('my-app-theme', 'Dark');

themeManager.registerTheme({
  name: 'Dark',
  variant: 'dark',
  theme: createDefaultDarkTheme()
});
```

### 2. Create Theme Resolver

```typescript
import { ThemeResolver } from '@moxijs/core';

const theme = themeManager.getTheme();
const resolver = new ThemeResolver(theme);
```

### 3. Use in Components

```typescript
import { UICheckbox } from '@moxijs/core';

// Option 1: Pass ThemeResolver (recommended)
const checkbox = new UICheckbox({
  themeResolver: resolver,
  checked: true
});

// Option 2: Pass colors directly (backward compatible)
const checkbox = new UICheckbox({
  backgroundColor: theme.controlBackground,
  checkedBackgroundColor: theme.controlSelected
});
```

## Theme Structure

### Simplified Theme (~15 properties)

```typescript
interface DefaultUITheme {
  // Base colors
  background: number;
  panelBackground: number;
  surfaceBackground: number;
  border: number;
  
  // Text colors
  text: number;
  textSecondary: number;
  
  // Generic control colors (used by ALL controls)
  controlBackground: number;
  controlBorder: number;
  controlText: number;
  controlSelected: number;      // Selected/checked state
  controlHover: number;         // Hover state
  controlFocus: number;         // Focus state
  controlDisabled: number;      // Disabled background
  controlDisabledText: number;   // Disabled text
  
  // Minimal control-specific overrides (only when different)
  checkboxCheckmark?: number;
  textInputPlaceholder?: number;
  selectDropdown?: number;
  
  // Accent & status
  accent: number;
  error: number;
  success: number;
}
```

## ThemeResolver API

### Basic Color Resolution

```typescript
const resolver = new ThemeResolver(theme);

// Get generic control color
const bgColor = resolver.getColor('background');        // → theme.controlBackground
const borderColor = resolver.getColor('border');        // → theme.controlBorder
const selectedColor = resolver.getColor('selected');    // → theme.controlSelected
const hoverColor = resolver.getColor('hover');         // → theme.controlHover
const disabledColor = resolver.getColor('disabled');   // → theme.controlDisabled

// With override (highest priority)
const customBg = resolver.getColor('background', 0xff0000); // → 0xff0000
```

### Control-Specific Colors

```typescript
// Falls back to generic if control-specific not found
const checkboxBg = resolver.getControlColor('checkbox', 'background');
const textInputBg = resolver.getControlColor('textInput', 'background');
```

### Specialized Helpers

```typescript
// Text colors
const textColor = resolver.getTextColor();
const secondaryText = resolver.getTextSecondary();

// Control-specific properties
const placeholderColor = resolver.getPlaceholderColor();  // → textInputPlaceholder ?? textSecondary
const checkmarkColor = resolver.getCheckmarkColor();       // → checkboxCheckmark ?? controlText
const dropdownBg = resolver.getSelectDropdownBackground(); // → selectDropdown ?? controlBackground
```

## Component Integration

### Components Supporting ThemeResolver

Currently supported:
- ✅ `UICheckbox`
- ✅ `UICheckboxWithLabel`
- 🔄 `UIRadioButton` (planned)
- 🔄 `UIRadioOption` (planned)
- 🔄 `UISelect` (planned)
- 🔄 `UIButton` (planned)
- 🔄 `UITextInput` (planned)
- 🔄 `UITextArea` (planned)

### Usage Pattern

```typescript
// Component accepts optional themeResolver
interface ComponentProps {
  // ... other props
  themeResolver?: ThemeResolver;
}

// Component uses resolver for defaults
constructor(props: ComponentProps) {
  const resolver = props.themeResolver;
  
  this.props = {
    backgroundColor: props.backgroundColor ?? resolver?.getColor('background') ?? 0xffffff,
    borderColor: props.borderColor ?? resolver?.getColor('border') ?? 0xcccccc,
    // ...
  };
}
```

## Best Practices

### 1. Create Resolver Once, Reuse

```typescript
// ✅ Good: Create resolver once
const resolver = new ThemeResolver(theme);

const checkbox1 = new UICheckbox({ themeResolver: resolver });
const checkbox2 = new UICheckbox({ themeResolver: resolver });
const button = new UIButton({ themeResolver: resolver });

// ❌ Bad: Create resolver for each component
const checkbox1 = new UICheckbox({ themeResolver: new ThemeResolver(theme) });
const checkbox2 = new UICheckbox({ themeResolver: new ThemeResolver(theme) });
```

### 2. Override When Needed

```typescript
// ✅ Good: Use resolver for defaults, override when needed
const specialButton = new UIButton({
  themeResolver: resolver,
  backgroundColor: 0xff0000  // Override default
});

// ❌ Bad: Hardcode all colors
const button = new UIButton({
  backgroundColor: 0x4a90e2,
  textColor: 0xffffff,
  // ... many more hardcoded colors
});
```

### 3. Listen for Theme Changes

```typescript
themeManager.addListener((newTheme, info) => {
  // Recreate resolver with new theme
  const resolver = new ThemeResolver(newTheme);
  
  // Update components (or recreate them)
  updateAllComponents(resolver);
});
```

## Migration Guide

### Before (Direct Theme Access)

```typescript
const checkbox = new UICheckbox({
  backgroundColor: theme.buttonBackground,
  checkedBackgroundColor: theme.accent,
  checkColor: theme.text
});
```

### After (ThemeResolver)

```typescript
const resolver = new ThemeResolver(theme);

const checkbox = new UICheckbox({
  themeResolver: resolver
  // Colors automatically resolved from theme
});
```

### Benefits

1. **Consistency**: All controls use same color resolution logic
2. **Simplicity**: Less code, fewer hardcoded colors
3. **Maintainability**: Change theme structure, components adapt automatically
4. **Flexibility**: Override specific colors when needed

## Examples

### Example 1: Basic Usage

```typescript
import { ThemeManager, ThemeResolver, createDefaultDarkTheme, UICheckbox } from '@moxijs/core';

// Setup
const themeManager = new ThemeManager('app-theme', 'Dark');
themeManager.registerTheme({
  name: 'Dark',
  variant: 'dark',
  theme: createDefaultDarkTheme()
});

const theme = themeManager.getTheme();
const resolver = new ThemeResolver(theme);

// Use
const checkbox = new UICheckbox({
  themeResolver: resolver,
  checked: true
});
```

### Example 2: Theme Switching

```typescript
import { ThemeManager, ThemeResolver, createDefaultDarkTheme, createDefaultLightTheme } from '@moxijs/core';

const themeManager = new ThemeManager('app-theme');

// Register themes
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

// Store components
const components: UICheckbox[] = [];

// Listen for changes
themeManager.addListener((newTheme, info) => {
  const resolver = new ThemeResolver(newTheme);
  
  // Update all components
  components.forEach(component => {
    // Recreate with new resolver (or update if component supports it)
    component.destroy();
    // ... recreate with new resolver
  });
});

// Switch theme
themeManager.setTheme('Light');
```

### Example 3: Custom Theme

```typescript
import { ThemeManager, ThemeResolver, DefaultUITheme } from '@moxijs/core';

const customTheme: DefaultUITheme = {
  // Base colors
  background: 0x1a1a2e,
  panelBackground: 0x2d2d44,
  surfaceBackground: 0x3a3a5a,
  border: 0x4a4a6a,
  
  // Text colors
  text: 0xffffff,
  textSecondary: 0xcccccc,
  
  // Generic control colors
  controlBackground: 0x2d2d44,
  controlBorder: 0x4a4a6a,
  controlText: 0xffffff,
  controlSelected: 0x4a90e2,
  controlHover: 0x3a3a5a,
  controlFocus: 0x3a3a5a,
  controlDisabled: 0x2d2d44,
  controlDisabledText: 0x666666,
  
  // Control-specific overrides
  checkboxCheckmark: 0xffffff,
  textInputPlaceholder: 0x999999,
  selectDropdown: 0x2d2d44,
  
  // Accent & status
  accent: 0x4a90e2,
  error: 0xdc3545,
  success: 0x28a745
};

const themeManager = new ThemeManager('app-theme');
themeManager.registerTheme({
  name: 'Custom Blue',
  variant: 'dark',
  theme: customTheme
});

const resolver = new ThemeResolver(customTheme);
```

## Principles

### ✅ Data Driven
- Theme is pure data structure
- Resolution logic is separate from data
- Components read from theme, don't modify it

### ✅ KISS (Keep It Simple, Stupid)
- Minimal theme properties (~15 vs 60+)
- Simple resolution function (override → specific → generic)
- One clear pattern

### ✅ SRP (Single Responsibility Principle)
- ThemeData: Stores values only
- ThemeResolver: Resolves colors only
- Component: Renders only

### ✅ Separation of Concerns
- Data layer (theme values)
- Resolution layer (color resolution)
- Component layer (rendering)
- Clear boundaries between layers

