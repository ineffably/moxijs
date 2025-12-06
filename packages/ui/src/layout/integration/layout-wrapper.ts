/**
 * Layout Wrapper
 *
 * Wraps raw PIXI.js objects to participate in the flex layout system.
 * Useful for integrating existing PIXI content (sprites, text, graphics)
 * into the flex layout without creating full UIComponent subclasses.
 *
 * @module layout/integration/layout-wrapper
 */

import * as PIXI from 'pixi.js';
import {
  LayoutNode,
  LayoutStyle,
  ComputedLayout,
  createLayoutNode,
  createDefaultLayoutStyle,
} from '../core/layout-types';
import { IFlexLayoutParticipant, syncBoxModelToLayoutStyle } from './layout-participant';
import { SizeValue } from '../core/size-value';

// Unique ID counter for wrappers
let nextWrapperId = 0;

/**
 * Style options for LayoutWrapper
 */
export interface LayoutWrapperStyle {
  width?: SizeValue;
  height?: SizeValue;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: SizeValue;
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
}

/**
 * Options for creating a LayoutWrapper
 */
export interface LayoutWrapperOptions {
  /** The PIXI object to wrap */
  displayObject: PIXI.Container;

  /** Optional ID for the layout node */
  id?: string;

  /** Style options */
  style?: LayoutWrapperStyle;

  /**
   * Custom measure function.
   * If not provided, uses displayObject.getBounds().
   */
  measureFn?: () => { width: number; height: number };
}

/**
 * Wraps a raw PIXI.js Container to participate in flex layout.
 *
 * @example
 * ```typescript
 * // Wrap a sprite
 * const sprite = PIXI.Sprite.from('texture.png');
 * const wrapper = new LayoutWrapper({
 *   displayObject: sprite,
 *   style: { flexGrow: 1, margin: 10 }
 * });
 *
 * // Add to a FlexContainer
 * flexContainer.layoutNode.children.push(wrapper.layoutNode);
 *
 * // Or add to LayoutTree
 * layoutTree.addChild(parent.layoutNode, wrapper.layoutNode);
 * ```
 */
export class LayoutWrapper implements IFlexLayoutParticipant {
  public readonly id: string;
  private readonly _layoutNode: LayoutNode;
  private readonly _displayObject: PIXI.Container;
  private readonly _customMeasureFn?: () => { width: number; height: number };

  constructor(options: LayoutWrapperOptions) {
    this.id = options.id ?? `wrapper-${nextWrapperId++}`;
    this._displayObject = options.displayObject;
    this._customMeasureFn = options.measureFn;

    // Create layout node
    this._layoutNode = createLayoutNode(this.id);

    // Set up measure function
    this._layoutNode.measureFn = () => this.measureContent();

    // Apply initial style
    if (options.style) {
      this.setStyle(options.style);
    }
  }

  /**
   * Get the layout node
   */
  get layoutNode(): LayoutNode {
    return this._layoutNode;
  }

  /**
   * Get the wrapped display object
   */
  get displayObject(): PIXI.Container {
    return this._displayObject;
  }

  /**
   * Measure the content size
   */
  measureContent(): { width: number; height: number } {
    if (this._customMeasureFn) {
      return this._customMeasureFn();
    }

    // Default: use display object bounds
    const bounds = this._displayObject.getBounds();
    return {
      width: bounds.width,
      height: bounds.height,
    };
  }

  /**
   * Apply computed layout to the display object
   */
  applyLayout(computed: ComputedLayout): void {
    this._displayObject.position.set(computed.x, computed.y);

    // If the display object is a Graphics or has a clear way to resize,
    // derived classes can override this
  }

  /**
   * Sync style (no-op for wrapper, use setStyle instead)
   */
  syncLayoutStyle(): void {
    // No BoxModel to sync from - style is set directly
  }

  /**
   * Set style options
   */
  setStyle(style: LayoutWrapperStyle): void {
    const layoutStyle = this._layoutNode.style;

    if (style.width !== undefined) {
      layoutStyle.width = style.width;
    }
    if (style.height !== undefined) {
      layoutStyle.height = style.height;
    }
    if (style.minWidth !== undefined) {
      layoutStyle.minWidth = style.minWidth;
    }
    if (style.maxWidth !== undefined) {
      layoutStyle.maxWidth = style.maxWidth;
    }
    if (style.minHeight !== undefined) {
      layoutStyle.minHeight = style.minHeight;
    }
    if (style.maxHeight !== undefined) {
      layoutStyle.maxHeight = style.maxHeight;
    }

    // Margin
    if (style.margin !== undefined) {
      if (typeof style.margin === 'number') {
        layoutStyle.margin = style.margin;
      } else {
        layoutStyle.margin = style.margin;
      }
    }

    // Flex item properties
    if (style.flexGrow !== undefined) {
      layoutStyle.flexGrow = style.flexGrow;
    }
    if (style.flexShrink !== undefined) {
      layoutStyle.flexShrink = style.flexShrink;
    }
    if (style.flexBasis !== undefined) {
      layoutStyle.flexBasis = style.flexBasis;
    }
    if (style.alignSelf !== undefined) {
      layoutStyle.alignSelf = style.alignSelf;
    }
  }

  /**
   * Get the current style
   */
  getStyle(): LayoutStyle {
    return this._layoutNode.style;
  }

  /**
   * Dispose the wrapper (does not destroy the display object)
   */
  dispose(): void {
    this._layoutNode.measureFn = null;
    this._layoutNode.parent = null;
    this._layoutNode.children = [];
  }
}

/**
 * Create a layout wrapper for a PIXI display object
 */
export function wrapForLayout(
  displayObject: PIXI.Container,
  style?: LayoutWrapperStyle,
  measureFn?: () => { width: number; height: number }
): LayoutWrapper {
  return new LayoutWrapper({
    displayObject,
    style,
    measureFn,
  });
}

/**
 * Wrap a PIXI.Text for layout
 */
export function wrapText(
  text: PIXI.Text,
  style?: LayoutWrapperStyle
): LayoutWrapper {
  return new LayoutWrapper({
    displayObject: text,
    style,
    measureFn: () => ({
      width: text.width,
      height: text.height,
    }),
  });
}

/**
 * Wrap a PIXI.Sprite for layout
 */
export function wrapSprite(
  sprite: PIXI.Sprite,
  style?: LayoutWrapperStyle
): LayoutWrapper {
  return new LayoutWrapper({
    displayObject: sprite,
    style,
    measureFn: () => ({
      width: sprite.width,
      height: sprite.height,
    }),
  });
}
