# Mini-GUI Refactor Plan

## Overview

Refactor `@moxijs/mini-gui` to use consistent, data-driven components with proper layout containers and collapsible behavior.

---

## Current Problems

1. **Duplicated Layout Code** - Each control (Number, Boolean, String, Option) manually positions label + value with nearly identical code
2. **Inconsistent Alignment** - Labels and values don't align vertically due to independent centering calculations
3. **Broken Collapse** - Folders toggle `visible` instead of collapsing height (no animation, abrupt)
4. **Config Scattered** - Controls reach back to `GUI_CONST` or `_panel.config` inconsistently
5. **No Shared Row Concept** - Each control is a full row, duplicating row container logic

---

## Proposed Architecture

```
GUI (Panel)
├── GUIHeader
│   ├── CollapseIndicator (▶/▼)
│   └── TitleLabel
├── GUIBody (collapsible container with height animation)
│   ├── ControlRow
│   │   ├── RowLabel (left, clipped to labelRatio)
│   │   └── RowWidget (right, contains control widget)
│   ├── ControlRow
│   │   └── ...
│   └── GUIFolder (nested GUI, inherits config)
│       ├── GUIHeader
│       └── GUIBody
│           └── ...
```

### Core Components

| Component | Responsibility |
|-----------|---------------|
| `GUIHeader` | Title bar with collapse toggle, drag handle |
| `GUIBody` | Collapsible container, manages height transitions |
| `ControlRow` | Single row with label (left) + widget slot (right) |
| `RowLabel` | Text label with automatic clipping |
| `RowWidget` | Container for control-specific UI |

### Control Types

Controls become simpler - they only render their widget content:

| Control | Widget Content |
|---------|---------------|
| `NumberControl` | Slider track + value text |
| `BooleanControl` | Checkbox graphic |
| `StringControl` | Text input box |
| `OptionControl` | Dropdown selector |

---

## Spec

### ControlRow

```ts
interface ControlRowOptions {
  label: string;
  config: GUIConfig;
}

class ControlRow extends UIComponent {
  protected _label: RowLabel;
  protected _widget: Container;  // Slot for control content

  // Consistent layout - label left, widget right
  // Single source of truth for row height, alignment
  // Exposes widget container for controls to populate
}
```

### GUIBody (Collapsible)

```ts
class GUIBody extends UIComponent {
  private _collapsed: boolean = false;
  private _targetHeight: number = 0;
  private _currentHeight: number = 0;

  collapse(animated?: boolean): void;
  expand(animated?: boolean): void;
  toggle(): void;

  // Uses mask to clip content during collapse animation
  // Updates height smoothly over frames when animated
}
```

### Config Flow

```
GUI (creates config from options + defaults)
 └── passes config to GUIBody
      └── passes config to ControlRow
           └── row uses config for dimensions
```

No more reaching back to `GUI_CONST` from controls.

---

## Scope

### In Scope

- [x] Existing controls (Number, Boolean, String, Option)
- [x] ControlRow component for consistent layout
- [x] GUIBody with collapsible height animation
- [x] GUIHeader extraction from GUI
- [x] Config passed down cleanly (no global lookups)
- [x] Vertical alignment fixed via shared row container
- [x] Label clipping handled by RowLabel

### Out of Scope (Future)

- ColorControl (Phase 3)
- ButtonControl
- Theming/custom colors
- Keyboard navigation
- Touch/mobile optimizations

---

## Tasks

### Phase 1: ControlRow Foundation

1. [x] Create `ControlRow` class
   - Handles row background, hover state
   - Creates RowLabel (left) with clipping mask
   - Creates widget container (right)
   - Single `layout()` method for positioning
   - Accepts config in constructor

2. [x] Create `RowLabel` class (or keep inline in ControlRow)
   - Text with automatic clipping to allocated width
   - Consistent font, color from config
   - (Implemented inline in ControlRow)

3. [x] Update `Control` base class
   - Extend `ControlRow` instead of `UIComponent`
   - Remove duplicate label/positioning code
   - Controls only populate `_widget` container

### Phase 2: Migrate Controls

4. [x] Migrate `NumberControl`
   - Remove row layout code
   - Only render slider + value in widget area

5. [x] Migrate `BooleanControl`
   - Remove row layout code
   - Only render checkbox in widget area

6. [x] Migrate `StringControl`
   - Remove row layout code
   - Only render input box in widget area

7. [x] Migrate `OptionControl`
   - Remove row layout code
   - Only render dropdown in widget area

### Phase 3: Collapsible Body

8. [x] Create `GUIBody` class
   - Container for controls/folders
   - `collapse()`/`expand()` methods
   - Height animation with mask clipping
   - Emits events on open/close

9. [x] Create `GUIHeader` class
   - Extract from GUI
   - Collapse indicator, title, drag handle
   - Click to toggle collapse

10. [x] Update `GUI` class
    - Compose from GUIHeader + GUIBody
    - Simplify internal structure

### Phase 4: Cleanup

11. [x] Remove dead code from controls
12. [x] Update examples to verify functionality
13. [ ] Update LLMS.txt with new API (if changed)
14. [x] Test all control types
15. [x] Test nested folders
16. [x] Test config overrides

---

## File Changes

### New Files
- `src/components/control-row.ts`
- `src/components/gui-body.ts`
- `src/components/gui-header.ts`
- `src/components/index.ts`

### Modified Files
- `src/controls/base-control.ts` - Extend ControlRow
- `src/controls/number-control.ts` - Simplify to widget only
- `src/controls/boolean-control.ts` - Simplify to widget only
- `src/controls/string-control.ts` - Simplify to widget only
- `src/controls/option-control.ts` - Simplify to widget only
- `src/gui.ts` - Use GUIHeader + GUIBody
- `src/index.ts` - Export new components

### Potentially Removed
- Duplicate layout code in each control (~50-60 lines each)

---

## Success Criteria

1. All controls vertically aligned consistently
2. Folders collapse with height animation (not just hide)
3. No duplicate row layout code in controls
4. Config flows down cleanly from GUI to controls
5. Existing API unchanged (backwards compatible)
6. Example works correctly after refactor

---

## Notes

- Keep existing public API (`gui.add()`, `gui.addFolder()`, etc.)
- Internal refactor should not break user code
- Animation can be optional (default: true, with option to disable)
- Consider using `requestAnimationFrame` for smooth collapse animation
