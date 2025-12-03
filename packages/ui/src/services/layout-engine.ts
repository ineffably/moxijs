/**
 * Layout Engine Service
 * 
 * Single Responsibility: Calculate layout from box model and constraints.
 * Pure functions - data in, data out. No rendering, no side effects.
 * 
 * @category UI Services
 */

import { BoxModel, ComputedLayout, MeasuredSize, SizeConstraint } from '../base/box-model';
import { EdgeInsets } from '../base/edge-insets';

/**
 * Size constraints for layout calculation
 */
export interface SizeConstraints {
  width: number;
  height: number;
}

/**
 * Layout Engine
 * 
 * Pure service for calculating component layouts.
 * Takes box model + constraints → computed layout.
 */
export class LayoutEngine {
  /**
   * Measure the size needed for a component based on its box model and content size
   * 
   * @param boxModel - The component's box model
   * @param contentSize - The size of the component's content
   * @returns Measured size including padding and margins
   */
  measure(boxModel: BoxModel, contentSize: MeasuredSize): MeasuredSize {
    const padding = boxModel.padding;
    const border = boxModel.border ?? EdgeInsets.zero();
    
    // Calculate content area size (content + padding + border)
    const contentAreaWidth = contentSize.width + padding.horizontal + border.horizontal;
    const contentAreaHeight = contentSize.height + padding.vertical + border.vertical;
    
    // Apply width constraint
    let measuredWidth: number;
    if (typeof boxModel.width === 'number') {
      measuredWidth = boxModel.width;
    } else if (boxModel.width === 'fill') {
      // Fill will be resolved during layout, use content size for measurement
      measuredWidth = contentAreaWidth;
    } else {
      // 'auto' - use content size
      measuredWidth = contentAreaWidth;
    }
    
    // Apply height constraint
    let measuredHeight: number;
    if (typeof boxModel.height === 'number') {
      measuredHeight = boxModel.height;
    } else if (boxModel.height === 'fill') {
      // Fill will be resolved during layout, use content size for measurement
      measuredHeight = contentAreaHeight;
    } else {
      // 'auto' - use content size
      measuredHeight = contentAreaHeight;
    }
    
    // Apply min constraints
    if (boxModel.minWidth !== undefined) {
      measuredWidth = Math.max(measuredWidth, boxModel.minWidth);
    }
    if (boxModel.minHeight !== undefined) {
      measuredHeight = Math.max(measuredHeight, boxModel.minHeight);
    }
    
    return {
      width: measuredWidth,
      height: measuredHeight
    };
  }

  /**
   * Calculate the final layout for a component
   * 
   * @param boxModel - The component's box model
   * @param measuredSize - The measured size from measure()
   * @param constraints - Available space constraints
   * @param position - Optional position (x, y) - defaults to (0, 0)
   * @returns Computed layout with final dimensions and content area
   */
  layout(
    boxModel: BoxModel,
    measuredSize: MeasuredSize,
    constraints: SizeConstraints,
    position: { x: number; y: number } = { x: 0, y: 0 }
  ): ComputedLayout {
    const padding = boxModel.padding;
    const border = boxModel.border ?? EdgeInsets.zero();
    
    // Calculate final dimensions
    let finalWidth = measuredSize.width;
    let finalHeight = measuredSize.height;
    
    // Handle 'fill' constraint
    if (boxModel.width === 'fill') {
      finalWidth = constraints.width;
    }
    if (boxModel.height === 'fill') {
      finalHeight = constraints.height;
    }
    
    // Apply max constraints
    if (boxModel.maxWidth !== undefined) {
      finalWidth = Math.min(finalWidth, boxModel.maxWidth);
    }
    if (boxModel.maxHeight !== undefined) {
      finalHeight = Math.min(finalHeight, boxModel.maxHeight);
    }
    
    // Ensure min constraints are met
    if (boxModel.minWidth !== undefined) {
      finalWidth = Math.max(finalWidth, boxModel.minWidth);
    }
    if (boxModel.minHeight !== undefined) {
      finalHeight = Math.max(finalHeight, boxModel.minHeight);
    }
    
    // Calculate content area (inside padding and border)
    const contentX = padding.left + border.left;
    const contentY = padding.top + border.top;
    const contentWidth = finalWidth - padding.horizontal - border.horizontal;
    const contentHeight = finalHeight - padding.vertical - border.vertical;
    
    return {
      x: position.x,
      y: position.y,
      width: finalWidth,
      height: finalHeight,
      contentX,
      contentY,
      contentWidth: Math.max(0, contentWidth),
      contentHeight: Math.max(0, contentHeight)
    };
  }

  /**
   * Calculate position relative to parent layout
   * 
   * @param layout - The component's computed layout
   * @param parentLayout - The parent's computed layout
   * @returns Updated layout with position relative to parent
   */
  position(layout: ComputedLayout, parentLayout: ComputedLayout): ComputedLayout {
    return {
      ...layout,
      x: parentLayout.contentX + layout.x,
      y: parentLayout.contentY + layout.y
    };
  }
}

