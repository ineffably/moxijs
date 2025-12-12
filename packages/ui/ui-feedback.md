# MoxiJS UI System Feedback & Improvements

This document tracks feedback and improvement requests for the MoxiJS UI system based on real-world usage in examples and applications.

## Priority 1 - Critical for Development

### 1. Debug Mode for FlexContainer
**Status:** Requested  
**Use Case:** Sprite Sheet Generator layout debugging  
**Description:** Add visual debugging to FlexContainer that shows:
- Container bounds (outer box)
- Content area (inner box after padding)
- Child bounds and positions
- Gap visualization
- Alignment indicators

**Proposed API:**
```typescript
const container = new FlexContainer({
  direction: FlexDirection.Column,
  debug: true  // Enable visual debugging
});
```

**Implementation Notes:**
- Add optional `debug?: boolean` to `FlexContainerProps`
- Draw colored overlay graphics showing layout structure
- Should be toggleable at runtime
- Different colors for container vs children
- Label dimensions and positions

### 2. FlexJustify Support Missing in FlexAlign
**Status:** Identified  
**Use Case:** Need SpaceBetween alignment for horizontal layouts  
**Description:** FlexAlign only has Start, End, Center, Stretch. Missing justify options like SpaceBetween.

**Current Issue:**
```typescript
// This doesn't exist:
align: FlexAlign.SpaceBetween  // ❌ Not available
```

**Options:**
1. Add FlexJustify values to FlexAlign enum
2. Keep separate but make both work on main axis
3. Add `justify` prop that works alongside `align`

**Note:** FlexJustify already exists but may not be properly wired up.

## Priority 2 - Nice to Have

### 3. Better Documentation for Layout System
**Status:** Needed  
**Description:** 
- More examples showing flex layouts
- Common patterns (toolbars, sidebars, grids)
- Migration guide from manual positioning
- Performance considerations

### 4. Layout Presets
**Status:** Idea  
**Description:** Common layout patterns as presets
```typescript
FlexContainer.toolbar({ gap: 10 })
FlexContainer.sidebar({ width: 200 })
FlexContainer.grid({ columns: 3 })
```

## Priority 3 - Future Enhancements

### 5. Responsive Layouts
**Status:** Future  
**Description:** Auto-adjust based on screen size

### 6. Animation Support for Layout Changes
**Status:** Future  
**Description:** Smooth transitions when layout changes

## Notes from Sprite Sheet Generator Development

**Date:** 2025-12-10  
**Context:** Building sprite sheet configurator with carousel, title bar, and control panels

**Key Learnings:**
1. Mixing FlexContainer with manual positioning causes confusion
2. Need debug mode to understand what's happening
3. FlexAlign.SpaceBetween would be very useful for right-aligning panels
4. Documentation needs more real-world examples
5. It's important to dogfood our own system - this example exposed gaps

**Quote from Developer:**
> "NO! not manual... please we need to fix this in this codebase because of this example, we are IN MoxiJS and we have access to it's source. and can modify it based on this feedback."

This is the right attitude - improve the framework based on real usage!

## Action Items

- [ ] Implement debug mode for FlexContainer
- [ ] Review FlexJustify/FlexAlign relationship
- [ ] Add more layout examples to documentation
- [ ] Create layout testing example that shows all features
- [ ] Consider adding FlexAlign.SpaceBetween or fixing FlexJustify usage

## Related Files

- `/packages/ui/src/layout/flex-container.ts` - Main implementation
- `/packages/moxijs-examples/src/examples/05-tools/sprite-sheet-generator.ts` - Use case
