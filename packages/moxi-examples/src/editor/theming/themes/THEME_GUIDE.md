# Theme Authoring Guide

## Overview
Themes define the visual appearance of the editor through **10 semantic color properties**. Each property has a specific role in the visual hierarchy.

## Theme Properties

### Background Layers (4 colors)
These define depth through visual layering, from back to front:

- **`backgroundRoot`** - The canvas/viewport background (furthest back)
  - Used for: Main app background
  - Example: `#212123` (almost black in dark themes)

- **`backgroundSurface`** - Cards, panels, dialogs (main surfaces)
  - Used for: Card backgrounds, dialog backgrounds
  - Example: `#2C2C2E` (slightly lighter than root)

- **`backgroundRaised`** - Buttons, inputs, interactive elements (raised above surfaces)
  - Used for: Button backgrounds, input fields
  - Example: `#3A3A3C` (lighter still, appears "raised")

- **`backgroundOverlay`** - Headers, title bars, hover states (highest layer)
  - Used for: Title bars, headers, active/hover states
  - Example: `#48484A` (lightest background layer)

**Tip:** In dark themes, these go from darkest to lightest. In light themes, from lightest to darker.

### Borders (2 colors)
Define edges and separation:

- **`borderStrong`** - Primary borders, strong definition
  - Used for: Card borders, button outlines, strong separators
  - Example: `#000000` (black in dark themes)

- **`borderSubtle`** - Subtle dividers, inner borders
  - Used for: Inner button borders, light dividers, subtle separation
  - Example: `#48484A` (lighter gray)

### Accents (2 colors)
Draw attention and show state:

- **`accentPrimary`** - Active states, selections, primary actions
  - Used for: Selection highlights, active buttons, primary CTAs
  - Example: `#007AFF` (blue)

- **`accentSecondary`** - Hover states, secondary highlights
  - Used for: Hover highlights, secondary actions
  - Example: `#5AC8FA` (lighter blue/cyan)

### Text (2 colors)
Content hierarchy:

- **`textPrimary`** - Main content, important text
  - Used for: Body text, button labels, primary content
  - Example: `#FFFFFF` (white in dark themes)

- **`textSecondary`** - Labels, hints, de-emphasized content
  - Used for: Form labels, secondary info, hints
  - Example: `#8E8E93` (gray)

## Creating a New Theme

### 1. Pick Your Palette
Choose your base colors from your palette (e.g., CC-29, PICO-8, etc.)

### 2. Assign Background Layers
For **dark themes**: darkest → lightest
For **light themes**: lightest → darker

```json
{
  "backgroundRoot": "0x212123",     // Darkest
  "backgroundSurface": "0x2C2C2E",  // Lighter
  "backgroundRaised": "0x3A3A3C",   // Even lighter
  "backgroundOverlay": "0x48484A"   // Lightest
}
```

### 3. Choose Borders
- Strong: Usually the darkest color (or lightest in light themes)
- Subtle: A mid-tone for soft separation

### 4. Select Accents
- Primary: Your brand color or main accent
- Secondary: A complementary color for hover states

### 5. Define Text Colors
- Primary: High contrast with surface backgrounds
- Secondary: Lower contrast for hierarchy

## Example: Complete Dark Theme

```json
{
  "name": "Dark",
  "description": "Classic dark theme",
  "backgroundRoot": "0x212123",      // Almost black
  "backgroundSurface": "0x212123",   // Same (cards blend with background)
  "backgroundRaised": "0x646365",    // Medium gray (buttons stand out)
  "backgroundOverlay": "0x45444f",   // Dark gray-blue (title bars)
  "borderStrong": "0x212123",        // Black
  "borderSubtle": "0x868188",        // Light gray
  "accentPrimary": "0x4b80ca",       // Blue
  "accentSecondary": "0x68c2d3",     // Cyan
  "textPrimary": "0xf2f0e5",         // Cream (readable)
  "textSecondary": "0xb8b5b9"        // Light gray
}
```

## Example: Complete Light Theme

```json
{
  "name": "Light",
  "description": "Clean light theme",
  "backgroundRoot": "0x868188",      // Medium gray
  "backgroundSurface": "0xf2f0e5",   // Cream white
  "backgroundRaised": "0xb8b5b9",    // Light gray
  "backgroundOverlay": "0xb8b5b9",   // Same as raised
  "borderStrong": "0x646365",        // Dark gray
  "borderSubtle": "0xb8b5b9",        // Light gray
  "accentPrimary": "0x4b80ca",       // Blue
  "accentSecondary": "0x43436a",     // Deep blue
  "textPrimary": "0x212123",         // Almost black
  "textSecondary": "0x646365"        // Medium gray
}
```

## Tips

1. **Consistency**: Use colors from your chosen palette
2. **Contrast**: Ensure text has good contrast with backgrounds
3. **Hierarchy**: Background layers should have visible but subtle differences
4. **Test**: Try your theme with different components
5. **Accessibility**: Check color contrast ratios for text readability

## Adding Your Theme

1. Add your theme object to the appropriate array in the JSON file:
   - `classic` array for Dark/Light variants
   - `seasonal` array for themed variations

2. The UI will automatically pick up your new theme!
