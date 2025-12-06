import { EdgeInsets } from './edge-insets';

/**
 * Size constraint values for UI components.
 * - number: Fixed pixels (e.g., 100)
 * - 'auto': Fit to content
 * - 'fill': Expand to available space (alias for '100%')
 * - '${n}%': Percentage of parent (e.g., '50%')
 *
 * @category UI
 */
export type SizeConstraint = number | 'auto' | 'fill' | `${number}%`;

/**
 * Display mode for components
 */
export type DisplayMode = 'flex' | 'none';

/**
 * Position mode for components
 */
export type PositionMode = 'relative' | 'absolute';

/**
 * Flex direction values
 */
export type FlexDirectionValue = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Flex wrap values
 */
export type FlexWrapValue = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Justify content values (main axis alignment)
 */
export type JustifyContentValue =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Align items values (cross axis alignment)
 */
export type AlignItemsValue = 'start' | 'end' | 'center' | 'stretch';

/**
 * Align content values (wrapped lines alignment)
 */
export type AlignContentValue =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around';

/**
 * Align self values (item override)
 */
export type AlignSelfValue = 'auto' | 'start' | 'end' | 'center' | 'stretch';

/**
 * Flex properties for controlling how a component behaves in a FlexContainer
 */
export interface FlexProps {
  // === Flex Item Properties ===

  /** Flex grow factor (default: 0) */
  grow?: number;

  /** Flex shrink factor (default: 1) */
  shrink?: number;

  /** Flex basis - initial size before grow/shrink (default: 'auto') */
  basis?: SizeConstraint;

  /** Alignment override for this item (default: 'auto') */
  alignSelf?: AlignSelfValue;

  // === Flex Container Properties ===

  /** Main axis direction (default: 'row') */
  direction?: FlexDirectionValue;

  /** Wrapping behavior (default: 'nowrap') */
  wrap?: FlexWrapValue;

  /** Main axis alignment (default: 'start') */
  justify?: JustifyContentValue;

  /** Cross axis alignment for items (default: 'stretch') */
  alignItems?: AlignItemsValue;

  /** Cross axis alignment for wrapped lines (default: 'stretch') */
  alignContent?: AlignContentValue;

  /** Gap between children - shorthand for row and column gap (default: 0) */
  gap?: number;

  /** Gap between rows when wrapped */
  rowGap?: number;

  /** Gap between columns */
  columnGap?: number;
}

/**
 * Represents the box model for a UI component.
 * Similar to CSS box model with width, height, padding, margin, and border.
 * Extended with CSS-lite flex layout properties.
 *
 * @category UI
 */
export interface BoxModel {
  // === Dimensions ===

  /** Width constraint */
  width: SizeConstraint;

  /** Height constraint */
  height: SizeConstraint;

  /** Minimum width */
  minWidth?: number;

  /** Minimum height */
  minHeight?: number;

  /** Maximum width */
  maxWidth?: number;

  /** Maximum height */
  maxHeight?: number;

  // === Spacing ===

  /** Inner spacing */
  padding: EdgeInsets;

  /** Outer spacing */
  margin: EdgeInsets;

  /** Border spacing (visual border implemented separately) */
  border?: EdgeInsets;

  // === Display & Position ===

  /** Display mode. 'none' hides the component from layout. */
  display?: DisplayMode;

  /** Positioning mode. 'absolute' removes from flex flow. */
  position?: PositionMode;

  /** Absolute positioning offset from top */
  top?: number;

  /** Absolute positioning offset from right */
  right?: number;

  /** Absolute positioning offset from bottom */
  bottom?: number;

  /** Absolute positioning offset from left */
  left?: number;

  // === Flex Properties ===

  /** Flex layout properties */
  flex?: FlexProps;

  // === Ordering ===

  /** Visual order (lower values rendered first). Default: 0 */
  order?: number;

  /** Z-index for layering. Default: 0 */
  zIndex?: number;
}

/**
 * The computed/actual layout of a component after measurement
 * All values are concrete pixel values
 *
 * @category UI
 */
export interface ComputedLayout {
  // Position relative to parent
  x: number;
  y: number;

  // Final dimensions
  width: number;
  height: number;

  // Content area (inside padding)
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
}

/**
 * Result of measuring a component's size
 *
 * @category UI
 */
export interface MeasuredSize {
  width: number;
  height: number;
}

/**
 * Helper to create a default BoxModel
 */
export function createDefaultBoxModel(overrides?: Partial<BoxModel>): BoxModel {
  return {
    width: 'auto',
    height: 'auto',
    padding: EdgeInsets.zero(),
    margin: EdgeInsets.zero(),
    display: 'flex',
    position: 'relative',
    flex: {},
    order: 0,
    zIndex: 0,
    ...overrides
  };
}

/**
 * Helper to create an empty computed layout
 */
export function createEmptyComputedLayout(): ComputedLayout {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    contentX: 0,
    contentY: 0,
    contentWidth: 0,
    contentHeight: 0
  };
}
