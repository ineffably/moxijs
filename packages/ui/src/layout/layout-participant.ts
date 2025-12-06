/**
 * Layout Participant Protocol
 *
 * Interface that UIComponent implements to participate in the flex layout system.
 * This provides a clean separation between the pure layout algorithm and the
 * PIXI rendering layer.
 *
 * @module layout/integration/layout-participant
 */

import { LayoutNode, ComputedLayout, LayoutStyle } from './layout-types';

/**
 * Protocol for components that participate in the flex layout system.
 *
 * Components implement this interface to:
 * 1. Provide their LayoutNode for tree management
 * 2. Measure their content size
 * 3. Apply computed layout to their visual representation
 *
 * @example
 * ```typescript
 * class MyControl extends UIComponent implements IFlexLayoutParticipant {
 *   measureContent(): { width: number; height: number } {
 *     return { width: this.label.width, height: this.label.height };
 *   }
 *
 *   applyLayout(computed: ComputedLayout): void {
 *     this.container.position.set(computed.x, computed.y);
 *     this.background.width = computed.width;
 *     this.background.height = computed.height;
 *   }
 * }
 * ```
 */
export interface IFlexLayoutParticipant {
  /**
   * Unique identifier for this participant
   */
  readonly id: string;

  /**
   * The layout node owned by this participant.
   * Created and managed by the participant, synced from BoxModel.
   */
  readonly layoutNode: LayoutNode;

  /**
   * Measure the content size of this component.
   * Called during Pass 2 (measure) of the layout algorithm.
   *
   * For containers, return { width: 0, height: 0 } - children determine size.
   * For leaf nodes, return the intrinsic content size.
   *
   * @returns The measured content size in pixels
   */
  measureContent(): { width: number; height: number };

  /**
   * Apply the computed layout to the visual representation.
   * Called after layout computation completes.
   *
   * @param computed - The final computed layout values
   */
  applyLayout(computed: ComputedLayout): void;

  /**
   * Sync style changes from BoxModel to LayoutNode.
   * Called when BoxModel properties change.
   */
  syncLayoutStyle(): void;
}

/**
 * Check if an object implements IFlexLayoutParticipant
 */
export function isFlexLayoutParticipant(obj: unknown): obj is IFlexLayoutParticipant {
  if (!obj || typeof obj !== 'object') return false;

  const candidate = obj as Partial<IFlexLayoutParticipant>;
  return (
    typeof candidate.id === 'string' &&
    candidate.layoutNode !== undefined &&
    typeof candidate.measureContent === 'function' &&
    typeof candidate.applyLayout === 'function' &&
    typeof candidate.syncLayoutStyle === 'function'
  );
}

/**
 * Helper to sync BoxModel properties to LayoutStyle.
 * Used by UIComponent and other participants.
 */
export function syncBoxModelToLayoutStyle(
  boxModel: {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    padding?: { top: number; right: number; bottom: number; left: number };
    margin?: { top: number; right: number; bottom: number; left: number };
    display?: 'flex' | 'none';
    position?: 'relative' | 'absolute';
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    order?: number;
    zIndex?: number;
    flex?: {
      grow?: number;
      shrink?: number;
      basis?: number | string;
      alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
      direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
      wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
      justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
      alignItems?: 'start' | 'end' | 'center' | 'stretch';
      alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';
      gap?: number;
      rowGap?: number;
      columnGap?: number;
    };
  },
  target: LayoutStyle
): void {
  // Dimensions
  target.width = boxModel.width as LayoutStyle['width'] ?? 'auto';
  target.height = boxModel.height as LayoutStyle['height'] ?? 'auto';
  target.minWidth = boxModel.minWidth;
  target.maxWidth = boxModel.maxWidth;
  target.minHeight = boxModel.minHeight;
  target.maxHeight = boxModel.maxHeight;

  // Spacing
  if (boxModel.padding) {
    target.padding = boxModel.padding;
  }
  if (boxModel.margin) {
    target.margin = boxModel.margin;
  }

  // Display & Position
  target.display = boxModel.display ?? 'flex';
  target.position = boxModel.position ?? 'relative';
  target.top = boxModel.top;
  target.right = boxModel.right;
  target.bottom = boxModel.bottom;
  target.left = boxModel.left;

  // Ordering
  target.order = boxModel.order ?? 0;
  target.zIndex = boxModel.zIndex ?? 0;

  // Flex item properties
  const flex = boxModel.flex ?? {};
  target.flexGrow = flex.grow ?? 0;
  target.flexShrink = flex.shrink ?? 1;
  target.flexBasis = flex.basis as LayoutStyle['flexBasis'] ?? 'auto';
  target.alignSelf = flex.alignSelf ?? 'auto';

  // Flex container properties
  target.flexDirection = flex.direction ?? 'row';
  target.flexWrap = flex.wrap ?? 'nowrap';
  target.justifyContent = flex.justify ?? 'start';
  target.alignItems = flex.alignItems ?? 'stretch';
  target.alignContent = flex.alignContent ?? 'stretch';
  target.gap = flex.gap ?? 0;
  target.rowGap = flex.rowGap;
  target.columnGap = flex.columnGap;
}
