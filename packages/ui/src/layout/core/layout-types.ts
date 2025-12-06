/**
 * Core Layout Types
 *
 * Defines the data structures used by the flex layout engine.
 *
 * @module layout/core/layout-types
 */

import { EdgeInsets } from '../../base/edge-insets';
import { SizeValue } from './size-value';

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT STYLE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Flexible input for EdgeInsets - can be a number (all sides),
 * an EdgeInsets instance, or an object with individual sides.
 */
export type EdgeInsetsInput =
  | number
  | EdgeInsets
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

/**
 * Flex direction values
 */
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Flex wrap values
 */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Justify content values (main axis alignment)
 */
export type JustifyContent =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Align items/content values (cross axis alignment)
 */
export type AlignItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Align content values (wrapped lines alignment)
 */
export type AlignContent =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around';

/**
 * Align self values (item override)
 */
export type AlignSelf = 'auto' | 'start' | 'end' | 'center' | 'stretch';

/**
 * Display values
 */
export type Display = 'flex' | 'none';

/**
 * Position values
 */
export type Position = 'relative' | 'absolute';

/**
 * Layout style - flattened style properties for the layout algorithm.
 * This is the internal representation synced from BoxModel.
 */
export interface LayoutStyle {
  // Display & Position
  display: Display;
  position: Position;

  // Absolute positioning offsets
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;

  // Dimensions
  width: SizeValue;
  height: SizeValue;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  // Spacing
  padding: EdgeInsetsInput;
  margin: EdgeInsetsInput;

  // Flex container properties
  flexDirection: FlexDirection;
  flexWrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;

  // Gap
  gap: number;
  rowGap?: number;
  columnGap?: number;

  // Flex item properties
  flexGrow: number;
  flexShrink: number;
  flexBasis: SizeValue;
  alignSelf: AlignSelf;

  // Ordering
  order: number;
  zIndex: number;
}

/**
 * Create a default LayoutStyle
 */
export function createDefaultLayoutStyle(
  overrides?: Partial<LayoutStyle>
): LayoutStyle {
  return {
    display: 'flex',
    position: 'relative',
    width: 'auto',
    height: 'auto',
    padding: 0,
    margin: 0,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
    order: 0,
    zIndex: 0,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// RESOLVED STYLE (after Pass 1)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Resolved style values after Pass 1 (prepare).
 * Percentages are resolved, EdgeInsets are normalized.
 */
export interface ResolvedStyle {
  padding: EdgeInsets;
  margin: EdgeInsets;

  width: number | 'auto';
  height: number | 'auto';
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;

  flexBasis: number | 'auto';

  mainGap: number;
  crossGap: number;
}

// ════════════════════════════════════════════════════════════════════════════
// MEASURED SIZE (after Pass 2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Measured size values after Pass 2 (measure).
 */
export interface MeasuredLayout {
  /** Hypothetical width (before flex adjustment) */
  width: number;

  /** Hypothetical height (before flex adjustment) */
  height: number;

  /** Flex lines (for containers) */
  lines: FlexLine[] | null;
}

/**
 * A line of flex items (for wrapping)
 */
export interface FlexLine {
  items: FlexItem[];
  mainSize: number;
  crossSize: number;
  crossOffset?: number;
  crossFinalSize?: number;
}

/**
 * A flex item within a line
 */
export interface FlexItem {
  node: LayoutNode;
  mainBaseSize: number;
  crossBaseSize: number;
  mainFinalSize: number;
  crossFinalSize: number;
  frozen: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPUTED LAYOUT (after Pass 3)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Final computed layout after Pass 3 (position).
 */
export interface ComputedLayout {
  /** Position relative to parent content area */
  x: number;
  y: number;

  /** Outer dimensions (including padding, excluding margin) */
  width: number;
  height: number;

  /** Content area offset (padding.left, padding.top) */
  contentX: number;
  contentY: number;

  /** Content area dimensions (inner space for children/content) */
  contentWidth: number;
  contentHeight: number;
}

/**
 * Create an empty computed layout
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
    contentHeight: 0,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT NODE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pure data structure for layout computation.
 * Separated from UIComponent for algorithm clarity.
 */
export interface LayoutNode {
  /** Unique identifier */
  id: string;

  /** Style properties */
  style: LayoutStyle;

  /** Child nodes */
  children: LayoutNode[];

  /** Parent reference (set by tree) */
  parent: LayoutNode | null;

  /** Intrinsic content size (for leaf nodes with static size) */
  intrinsicSize: { width: number; height: number } | null;

  /** Dynamic measure function (for leaf nodes with dynamic size) */
  measureFn: (() => { width: number; height: number }) | null;

  // === Internal Computed Values (set during layout passes) ===

  /** After Pass 1: Resolved styles */
  _resolved: ResolvedStyle | null;

  /** After Pass 2: Measured sizes */
  _measured: MeasuredLayout | null;

  /** After Pass 3: Final computed layout */
  _computed: ComputedLayout | null;
}

/**
 * Create a layout node with default values
 */
export function createLayoutNode(
  id: string,
  style?: Partial<LayoutStyle>,
  options?: {
    children?: LayoutNode[];
    intrinsicSize?: { width: number; height: number };
    measureFn?: () => { width: number; height: number };
  }
): LayoutNode {
  return {
    id,
    style: createDefaultLayoutStyle(style),
    children: options?.children ?? [],
    parent: null,
    intrinsicSize: options?.intrinsicSize ?? null,
    measureFn: options?.measureFn ?? null,
    _resolved: null,
    _measured: null,
    _computed: null,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// DIRTY TRACKING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Reasons a node can be marked dirty
 */
export type DirtyReason = 'style' | 'children' | 'size' | 'position';

/**
 * Information about a dirty node
 */
export interface DirtyInfo {
  node: LayoutNode;
  reason: DirtyReason;
  timestamp: number;
}
