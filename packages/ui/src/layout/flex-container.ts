import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { EdgeInsets } from '../base/edge-insets';

/** Flexbox direction. */
export enum FlexDirection {
  Row = 'row',              // Horizontal, left to right
  RowReverse = 'row-reverse',
  Column = 'column',        // Vertical, top to bottom
  ColumnReverse = 'column-reverse'
}

/** Main axis alignment. */
export enum FlexJustify {
  Start = 'start',          // Pack items to start
  End = 'end',              // Pack items to end
  Center = 'center',        // Center items
  SpaceBetween = 'space-between',  // Space between items
  SpaceAround = 'space-around',    // Space around items
  SpaceEvenly = 'space-evenly'     // Even space between items
}

/** Cross axis alignment. */
export enum FlexAlign {
  Start = 'start',
  End = 'end',
  Center = 'center',
  Stretch = 'stretch'       // Stretch to fill cross axis
}

/** FlexContainer configuration. */
export interface FlexContainerProps {
  direction?: FlexDirection;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: number;              // Space between children
  wrap?: boolean;            // Allow wrapping (Phase 2)
  padding?: EdgeInsets;
  width?: number | 'fill';
  height?: number | 'fill';
}

/**
 * Flexbox-style layout container for arranging UI components.
 * Supports row/column direction, alignment, justify, and gaps.
 *
 * @example
 * ```ts
 * // Horizontal row with centered items
 * const toolbar = new FlexContainer({
 *   direction: FlexDirection.Row,
 *   justify: FlexJustify.Center,
 *   align: FlexAlign.Center,
 *   gap: 10,
 *   padding: EdgeInsets.all(20)
 * });
 * toolbar.addChild(button1);
 * toolbar.addChild(button2);
 * toolbar.addChild(button3);
 *
 * // Vertical column with space between
 * const sidebar = new FlexContainer({
 *   direction: FlexDirection.Column,
 *   justify: FlexJustify.SpaceBetween,
 *   width: 200,
 *   height: 'fill'
 * });
 * ```
 */
export class FlexContainer extends UIComponent {
  private props: Required<Omit<FlexContainerProps, 'padding' | 'width' | 'height'>>;
  public children: UIComponent[] = [];

  constructor(props: FlexContainerProps = {}) {
    const boxModel: Partial<BoxModel> = {
      padding: props.padding ?? EdgeInsets.zero(),
      width: props.width ?? 'auto',
      height: props.height ?? 'auto'
    };

    super(boxModel);

    this.props = {
      direction: props.direction ?? FlexDirection.Row,
      justify: props.justify ?? FlexJustify.Start,
      align: props.align ?? FlexAlign.Start,
      gap: props.gap ?? 0,
      wrap: props.wrap ?? false
    };
  }

  /** Add child component. */
  addChild(child: UIComponent): void {
    child.parent = this;
    this.children.push(child);
    this.container.addChild(child.container);
    this.markLayoutDirty();
  }

  /** Remove child component. */
  removeChild(child: UIComponent): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.container.removeChild(child.container);
      child.parent = undefined;
      this.markLayoutDirty();
    }
  }

  /** @internal */
  measure(): MeasuredSize {
    if (this.children.length === 0) {
      const padding = this.boxModel.padding;
      return {
        width: padding.horizontal,
        height: padding.vertical
      };
    }

    // Measure all children
    const childSizes = this.children.map(child => child.measure());
    const { direction, gap } = this.props;
    const padding = this.boxModel.padding;

    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    const totalGap = gap * (this.children.length - 1);

    let measuredWidth = 0;
    let measuredHeight = 0;

    if (isRow) {
      // Row: sum widths, max height
      measuredWidth = childSizes.reduce((sum, size) => sum + size.width, 0) + totalGap;
      measuredHeight = Math.max(...childSizes.map(size => size.height));
    } else {
      // Column: max width, sum heights
      measuredWidth = Math.max(...childSizes.map(size => size.width));
      measuredHeight = childSizes.reduce((sum, size) => sum + size.height, 0) + totalGap;
    }

    return {
      width: measuredWidth + padding.horizontal,
      height: measuredHeight + padding.vertical
    };
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    const padding = this.boxModel.padding;
    const { direction, justify, align, gap } = this.props;

    // Determine container size
    let containerWidth: number;
    let containerHeight: number;

    if (this.boxModel.width === 'fill') {
      containerWidth = availableWidth;
    } else if (typeof this.boxModel.width === 'number') {
      containerWidth = this.boxModel.width;
    } else {
      const measured = this.measure();
      containerWidth = measured.width;
    }

    if (this.boxModel.height === 'fill') {
      containerHeight = availableHeight;
    } else if (typeof this.boxModel.height === 'number') {
      containerHeight = this.boxModel.height;
    } else {
      const measured = this.measure();
      containerHeight = measured.height;
    }

    // Update computed layout
    this.computedLayout.width = containerWidth;
    this.computedLayout.height = containerHeight;
    this.computedLayout.contentX = padding.left;
    this.computedLayout.contentY = padding.top;
    this.computedLayout.contentWidth = containerWidth - padding.horizontal;
    this.computedLayout.contentHeight = containerHeight - padding.vertical;

    // Layout children
    if (this.children.length > 0) {
      this.layoutChildren();
    }

    this.layoutDirty = false;
    this.render();
  }

  /** @internal */
  private layoutChildren(): void {
    const { direction, justify, align, gap } = this.props;
    const padding = this.boxModel.padding;
    const contentWidth = this.computedLayout.contentWidth;
    const contentHeight = this.computedLayout.contentHeight;

    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;

    // Measure children
    const childSizes = this.children.map(child => child.measure());

    // Calculate total main axis size
    const totalGap = gap * (this.children.length - 1);
    const totalChildSize = isRow
      ? childSizes.reduce((sum, size) => sum + size.width, 0)
      : childSizes.reduce((sum, size) => sum + size.height, 0);

    const mainAxisSize = isRow ? contentWidth : contentHeight;
    const crossAxisSize = isRow ? contentHeight : contentWidth;
    const freeSpace = mainAxisSize - totalChildSize - totalGap;

    // Calculate starting position based on justify
    let mainAxisOffset = 0;
    let spaceBetween = 0;

    switch (justify) {
      case FlexJustify.Start:
        mainAxisOffset = 0;
        break;
      case FlexJustify.End:
        mainAxisOffset = freeSpace;
        break;
      case FlexJustify.Center:
        mainAxisOffset = freeSpace / 2;
        break;
      case FlexJustify.SpaceBetween:
        spaceBetween = this.children.length > 1 ? freeSpace / (this.children.length - 1) : 0;
        break;
      case FlexJustify.SpaceAround:
        spaceBetween = freeSpace / this.children.length;
        mainAxisOffset = spaceBetween / 2;
        break;
      case FlexJustify.SpaceEvenly:
        spaceBetween = freeSpace / (this.children.length + 1);
        mainAxisOffset = spaceBetween;
        break;
    }

    // Position children
    let currentPosition = mainAxisOffset;

    this.children.forEach((child, index) => {
      const childSize = childSizes[index];

      // Layout child
      child.layout(childSize.width, childSize.height);

      // Calculate cross axis position based on align
      let crossAxisPosition = 0;

      switch (align) {
        case FlexAlign.Start:
          crossAxisPosition = 0;
          break;
        case FlexAlign.End:
          crossAxisPosition = crossAxisSize - (isRow ? childSize.height : childSize.width);
          break;
        case FlexAlign.Center:
          crossAxisPosition = (crossAxisSize - (isRow ? childSize.height : childSize.width)) / 2;
          break;
        case FlexAlign.Stretch:
          // Stretch child to fill cross axis (implement later)
          crossAxisPosition = 0;
          break;
      }

      // Set child position
      if (isRow) {
        child.setPosition(
          padding.left + currentPosition,
          padding.top + crossAxisPosition
        );
        currentPosition += childSize.width + gap + spaceBetween;
      } else {
        child.setPosition(
          padding.left + crossAxisPosition,
          padding.top + currentPosition
        );
        currentPosition += childSize.height + gap + spaceBetween;
      }
    });
  }

  /** @internal */
  protected render(): void {
    // FlexContainer itself has no visual representation
    // Could add debug borders here if needed
  }
}
