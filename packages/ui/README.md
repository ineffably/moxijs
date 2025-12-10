# @moxijs/ui

UI component library for MoxiJS - PIXI.js based game UI with theming, layout, and form controls.

🎮 **[View Live Examples](https://ineffably.github.io/moxijs/)** - Interactive UI demos  
📚 **[API Documentation](https://ineffably.github.io/moxijs/docs/ui/)** - Complete API reference

## Installation

```bash
npm install @moxijs/ui pixi.js
```

## Quick Start

```typescript
import { FlexContainer, FlexDirection, UIButton, UILabel, EdgeInsets } from '@moxijs/ui';

// Create a UI container
const container = new FlexContainer({
  direction: FlexDirection.Column,
  gap: 16,
  padding: EdgeInsets.all(20)
});

// Add components
container.addChild(new UILabel({ text: 'Welcome!', fontSize: 24 }));
container.addChild(new UIButton({
  label: 'Start Game',
  width: 150,
  height: 40,
  onClick: () => console.log('Clicked!')
}));

// Layout and add to stage
container.layout(800, 600);
stage.addChild(container.container);
```

## Components

### Layout

#### FlexContainer

Flexbox-style container for laying out child components.

```typescript
const row = new FlexContainer({
  direction: FlexDirection.Row,       // Row | Column
  justify: FlexJustify.SpaceBetween,  // Start | End | Center | SpaceBetween | SpaceAround
  align: FlexAlign.Center,            // Start | End | Center | Stretch
  gap: 8,
  padding: EdgeInsets.symmetric(16, 24),
  backgroundColor: 0x333333
});

row.addChild(button1);
row.addChild(button2);
row.layout(400, 100);

// Clear all children
row.removeAllChildren();
```

### Form Controls

#### UIButton

```typescript
const button = new UIButton({
  label: 'Click Me',
  width: 120,
  height: 40,
  backgroundColor: 0x4a90e2,
  textColor: 0xffffff,
  fontFamily: 'PixelOperator',  // Font family name
  fontType: 'canvas',           // 'canvas' (default), 'msdf', or 'bitmap'
  onClick: () => console.log('Clicked!'),
  onHover: () => console.log('Hovered!')
});
```

#### UITextInput

```typescript
const input = new UITextInput({
  width: 200,
  height: 32,
  placeholder: 'Enter text...',
  value: '',
  fontFamily: 'PixelOperator',  // Optional: custom font (inherits from parent)
  onChange: (value) => console.log('Input:', value)
});

// Dynamic resizing (useful in resizable dialogs)
input.setSize(300, 40);
input.setWidth(250);
```

#### UITextArea

```typescript
const textarea = new UITextArea({
  width: 300,
  height: 100,
  placeholder: 'Enter description...',
  onChange: (value) => console.log('Text:', value)
});

// Dynamic resizing
textarea.setSize(400, 150);
```

#### UICheckbox

```typescript
const checkbox = new UICheckbox({
  checked: false,
  size: 20,
  onChange: (checked) => console.log('Checked:', checked)
});
```

#### UIRadioGroup

```typescript
const radioGroup = new UIRadioGroup({
  options: [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ],
  value: 'medium',
  direction: 'vertical',
  onChange: (value) => console.log('Selected:', value)
});
```

#### UISelect (Dropdown)

```typescript
const select = new UISelect({
  width: 200,
  options: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ],
  value: 'opt1',
  onChange: (value) => console.log('Selected:', value)
});
```

### Display

#### UILabel

```typescript
const label = new UILabel({
  text: 'Hello World',
  fontSize: 16,
  color: 0xffffff,
  fontFamily: 'Arial',
  align: 'center'  // 'left' | 'center' | 'right'
});
```

#### UIPanel

```typescript
const panel = new UIPanel({
  width: 300,
  height: 200,
  backgroundColor: 0x222222,
  borderRadius: 8,
  borderColor: 0x444444,
  borderWidth: 1
});

// All UIComponents now have x/y getters/setters
panel.x = 100;
panel.y = 50;
```

### Navigation

#### UITabs

```typescript
const tabs = new UITabs({
  width: 400,
  height: 300,
  items: [
    { key: 'settings', label: 'Settings', content: settingsPanel },
    { key: 'controls', label: 'Controls', content: controlsPanel }
  ],
  activeKey: 'settings',
  onChange: (key) => console.log('Tab:', key)
});
```

#### UIScrollContainer

```typescript
const scroll = new UIScrollContainer({
  width: 300,
  height: 400,
  scrollbarWidth: 12,
  // Smooth scrolling (enabled by default)
  smoothScroll: true,
  scrollEasing: 0.15,      // 0.1 = slow, 0.3 = snappy
  scrollSpeed: 1,          // Wheel sensitivity multiplier
  scrollPaddingBottom: 50  // Extra scroll space at bottom (for chat UIs)
});

scroll.addChild(tallContent);
scroll.scrollTo(100);           // Smooth scroll to position
scroll.scrollTo(100, false);    // Instant scroll (no animation)
scroll.scrollToBottom();

// Dynamic scroll padding
scroll.setScrollPaddingBottom(100);
```

## Theming

### ThemeManager

Manage application themes with persistence.

```typescript
import { ThemeManager, DefaultUITheme, createDefaultDarkTheme, createDefaultLightTheme } from '@moxijs/ui';

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

themeManager.setTheme('Dark');

// Listen for theme changes
themeManager.addListener((theme, info) => {
  console.log('Theme changed to:', info.name);
});
```

### ThemeResolver

Apply theme colors to components.

```typescript
import { ThemeResolver } from '@moxijs/ui';

const resolver = new ThemeResolver(themeManager.getTheme());

const checkbox = new UICheckbox({
  themeResolver: resolver,
  onChange: (checked) => console.log(checked)
});
```

## Box Model & Layout

### EdgeInsets

```typescript
EdgeInsets.all(16);                    // All sides equal
EdgeInsets.symmetric(8, 16);           // Vertical, Horizontal
EdgeInsets.only({ top: 10, left: 20 }); // Specific sides
EdgeInsets.zero();                     // No padding/margin
```

### BoxModel

Components support CSS-like box model:

```typescript
const component = new UIButton({...}, {
  width: 200,
  height: 'auto',
  padding: EdgeInsets.all(8),
  margin: EdgeInsets.symmetric(4, 8),
  minWidth: 100,
  maxWidth: 400
});
```

## Focus Management

```typescript
import { UIFocusManager } from '@moxijs/ui';

const focusManager = new UIFocusManager();

// Register focusable components
focusManager.register(button1);
focusManager.register(input1);
focusManager.register(button2);

// Tab navigation is automatic
// Or programmatic control:
focusManager.focusFirst();
focusManager.focusNext();
focusManager.focus(input1);
```

## API Reference

### Exports

```typescript
// Layout
export { FlexContainer, FlexDirection, FlexJustify, FlexAlign } from '@moxijs/ui';
export { EdgeInsets, BoxModel, UIComponent } from '@moxijs/ui';

// Components
export { UIButton, UILabel, UIPanel } from '@moxijs/ui';
export { UITextInput, UITextArea, UICheckbox, UIRadioGroup, UISelect } from '@moxijs/ui';
export { UITabs, UIScrollContainer } from '@moxijs/ui';

// Theming
export { ThemeManager, ThemeResolver, DefaultUITheme } from '@moxijs/ui';
export { createDefaultDarkTheme, createDefaultLightTheme } from '@moxijs/ui';

// Focus
export { UIFocusManager, Focusable } from '@moxijs/ui';
```

## Requirements

- PIXI.js ^8.14.0
- @moxijs/core ^0.2.4 (peer dependency)

## License

MIT
