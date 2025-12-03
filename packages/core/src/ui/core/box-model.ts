import { EdgeInsets } from './edge-insets';

/**
 * Size constraint values for UI components
 * Can be a fixed number, 'auto' to fit content, or 'fill' to expand
 *
 * @category UI
 */
export type SizeConstraint = number | 'auto' | 'fill';

/**
 * Represents the box model for a UI component
 * Similar to CSS box model with width, height, padding, margin, and border
 *
 * @category UI
 */
export interface BoxModel {
  // Content area dimensions
  width: SizeConstraint;
  height: SizeConstraint;

  // Size constraints
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;

  // Spacing
  padding: EdgeInsets;
  margin: EdgeInsets;

  // Border (visual border will be implemented later)
  border?: EdgeInsets;
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
    ...overrides
  };
}

