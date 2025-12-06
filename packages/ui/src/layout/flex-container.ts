import * as PIXI from 'pixi.js';
import { UIComponent, UIFontConfig } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { EdgeInsets } from '../base/edge-insets';
import { UI_LAYOUT_DEFAULTS } from '../theming/theme-data';
import { IFlexLayoutParticipant, isFlexLayoutParticipant } from './layout-participant';
import { UIFocusManager, Focusable } from '../base/ui-focus-manager';

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
  /** Font configuration that children will inherit (like CSS) */
  fontConfig?: UIFontConfig;
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
  private props: Required<Omit<FlexContainerProps, 'padding' | 'width' | 'height' | 'fontConfig'>>;
  public children: UIComponent[] = [];

  constructor(props: FlexContainerProps = {}) {
    const boxModel: Partial<BoxModel> = {
      padding: props.padding ?? EdgeInsets.all(UI_LAYOUT_DEFAULTS.PADDING),
      width: props.width ?? 'auto',
      height: props.height ?? 'auto',
      // Sync flex container properties to BoxModel
      flex: {
        direction: props.direction ?? FlexDirection.Row,
        justify: props.justify ?? FlexJustify.Start,
        alignItems: props.align ?? FlexAlign.Stretch,
        gap: props.gap ?? UI_LAYOUT_DEFAULTS.GAP,
        wrap: props.wrap ? 'wrap' : 'nowrap',
      }
    };

    super(boxModel);

    this.props = {
      direction: props.direction ?? FlexDirection.Row,
      justify: props.justify ?? FlexJustify.Start,
      align: props.align ?? FlexAlign.Stretch,
      gap: props.gap ?? UI_LAYOUT_DEFAULTS.GAP,
      wrap: props.wrap ?? false
    };

    // Set font config if provided (children will inherit this)
    if (props.fontConfig) {
      this.setFontConfig(props.fontConfig);
    }
  }

  /** Add child component. */
  addChild(child: UIComponent): void {
    child.parent = this;
    this.children.push(child);
    this.container.addChild(child.container);

    // Sync to layout node tree (for new flex layout system)
    if (isFlexLayoutParticipant(child)) {
      child.layoutNode.parent = this.layoutNode;
      this.layoutNode.children.push(child.layoutNode);
    }

    // Auto-register focusable children with the global focus manager
    this.autoRegisterFocusable(child);

    this.markLayoutDirty();
  }

  /**
   * Automatically registers a focusable component with the global focus manager.
   * Recursively checks children if the component is a container.
   */
  private autoRegisterFocusable(component: UIComponent): void {
    const focusManager = UIFocusManager.getInstance();
    if (!focusManager) return;

    // Check if this component is focusable
    if (this.isFocusableComponent(component)) {
      focusManager.register(component as UIComponent & Focusable);
    }

    // Recursively check children (for nested containers)
    if ('children' in component && Array.isArray((component as FlexContainer).children)) {
      const children = (component as FlexContainer).children;
      children.forEach(child => this.autoRegisterFocusable(child));
    }
  }

  /**
   * Checks if a component implements the Focusable interface
   */
  private isFocusableComponent(component: UIComponent): component is UIComponent & Focusable {
    return (
      typeof (component as any).tabIndex === 'number' &&
      (component as any).tabIndex >= 0 &&
      typeof (component as any).canFocus === 'function' &&
      typeof (component as any).onFocus === 'function' &&
      typeof (component as any).onBlur === 'function' &&
      typeof (component as any).isFocused === 'function'
    );
  }

  /** Remove child component. */
  removeChild(child: UIComponent): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.container.removeChild(child.container);
      child.parent = undefined;

      // Sync to layout node tree
      if (isFlexLayoutParticipant(child)) {
        const nodeIndex = this.layoutNode.children.indexOf(child.layoutNode);
        if (nodeIndex !== -1) {
          this.layoutNode.children.splice(nodeIndex, 1);
        }
        child.layoutNode.parent = null;
      }

      // Auto-unregister focusable children from the global focus manager
      this.autoUnregisterFocusable(child);

      this.markLayoutDirty();
    }
  }

  /**
   * Automatically unregisters a focusable component from the global focus manager.
   * Recursively checks children if the component is a container.
   */
  private autoUnregisterFocusable(component: UIComponent): void {
    const focusManager = UIFocusManager.getInstance();
    if (!focusManager) return;

    // Check if this component is focusable
    if (this.isFocusableComponent(component)) {
      focusManager.unregister(component as UIComponent & Focusable);
    }

    // Recursively check children (for nested containers)
    if ('children' in component && Array.isArray((component as FlexContainer).children)) {
      const children = (component as FlexContainer).children;
      children.forEach(child => this.autoUnregisterFocusable(child));
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
    const isReverse = direction === FlexDirection.RowReverse || direction === FlexDirection.ColumnReverse;

    // 1. Measure base sizes (flex-basis)
    const items = this.children.map(child => {
      const box = child.getBoxModel();
      const flex = box.flex ?? {};
      const grow = flex.grow ?? 0;
      const shrink = flex.shrink ?? 1;
      const basis = flex.basis ?? 'auto';
      const alignSelf = flex.alignSelf ?? 'auto';

      const measured = child.measure();

      // Determine hypothetical main size based on basis
      let mainBaseSize = 0;
      let crossBaseSize = 0;

      if (isRow) {
        // If basis is 'auto' or a percentage string, use measured size; otherwise use the number
        mainBaseSize = (basis === 'auto' || typeof basis === 'string') ? measured.width : basis;
        crossBaseSize = measured.height;
      } else {
        mainBaseSize = (basis === 'auto' || typeof basis === 'string') ? measured.height : basis;
        crossBaseSize = measured.width;
      }

      return {
        child,
        measured,
        grow,
        shrink,
        basis,
        alignSelf,
        mainBaseSize,
        crossBaseSize,
        finalMainSize: mainBaseSize,
        finalCrossSize: crossBaseSize
      };
    });

    // 2. Resolve Flexible Lengths
    const containerMainSize = isRow ? contentWidth : contentHeight;
    const totalGap = gap * (Math.max(0, items.length - 1));
    const totalBaseSize = items.reduce((sum, item) => sum + item.mainBaseSize, 0);
    const freeSpace = containerMainSize - totalBaseSize - totalGap;

    if (freeSpace > 0) {
      // Grow
      const totalGrow = items.reduce((sum, item) => sum + item.grow, 0);
      if (totalGrow > 0) {
        items.forEach(item => {
          const share = (item.grow / totalGrow) * freeSpace;
          item.finalMainSize += share;
        });
      }
    } else if (freeSpace < 0) {
      // Shrink
      // Standard flex shrink: weighted by size * shrink factor
      const totalScaledShrink = items.reduce((sum, item) => sum + (item.mainBaseSize * item.shrink), 0);

      if (totalScaledShrink > 0) {
        items.forEach(item => {
          const ratio = (item.mainBaseSize * item.shrink) / totalScaledShrink;
          const shrinkAmount = ratio * Math.abs(freeSpace);
          item.finalMainSize = Math.max(0, item.finalMainSize - shrinkAmount);
        });
      }
    }

    // 3. Layout Children with final sizes to get cross size
    // We need to re-layout because changing main size might affect cross size (e.g. text wrapping)
    // For now, simpler approach: just assume cross size stays same unless stretch

    // Cross Axis Alignment
    const containerCrossSize = isRow ? contentHeight : contentWidth;

    items.forEach(item => {
      let alignMode = item.alignSelf !== 'auto' ? item.alignSelf : align;
      // map string literal 'start'/'end'/etc to the logic

      let crossSize = item.crossBaseSize;

      // Handle Stretch
      // Force cast to string for comparison to avoid enum overlap issues in checks
      const modeStr = String(alignMode);
      if (modeStr === 'stretch' || alignMode === FlexAlign.Stretch) {
        crossSize = containerCrossSize;

        // Constrain max/min cross size
        const box = item.child.getBoxModel();
        if (isRow) {
          if (box.maxHeight !== undefined) crossSize = Math.min(crossSize, box.maxHeight);
          if (box.minHeight !== undefined) crossSize = Math.max(crossSize, box.minHeight);
        } else {
          if (box.maxWidth !== undefined) crossSize = Math.min(crossSize, box.maxWidth);
          if (box.minWidth !== undefined) crossSize = Math.max(crossSize, box.minWidth);
        }
      }

      item.finalCrossSize = crossSize;

      // Perform final layout on child
      if (isRow) {
        item.child.layout(item.finalMainSize, item.finalCrossSize);
      } else {
        item.child.layout(item.finalCrossSize, item.finalMainSize);
      }
    });

    // 4. Position Children (Main Axis)
    // Recalculate used space after flexibility
    const usedMainSpace = items.reduce((sum, item) => sum + item.finalMainSize, 0);
    const remainingSpace = containerMainSize - usedMainSpace - totalGap;

    let mainOffset = 0;
    let spaceBetween = 0;

    // Justify Content
    switch (justify) {
      case FlexJustify.Start:
        mainOffset = 0;
        break;
      case FlexJustify.End:
        mainOffset = remainingSpace;
        break;
      case FlexJustify.Center:
        mainOffset = remainingSpace / 2;
        break;
      case FlexJustify.SpaceBetween:
        if (items.length > 1) {
          spaceBetween = remainingSpace / (items.length - 1);
        }
        break;
      case FlexJustify.SpaceAround:
        if (items.length > 0) {
          spaceBetween = remainingSpace / items.length;
          mainOffset = spaceBetween / 2;
        }
        break;
      case FlexJustify.SpaceEvenly:
        if (items.length > 0) {
          spaceBetween = remainingSpace / (items.length + 1);
          mainOffset = spaceBetween;
        }
        break;
    }

    let currentMainPos = mainOffset;

    // Reverse logic if needed
    const processingOrder = isReverse ? [...items].reverse() : items;

    // We still position relative to top-left (contentX, contentY)
    // But if reverse, we just changed the order of items. Flex-direction reverse also flips the start point?
    // In CSS row-reverse: main start is right.
    // Simplifying: layout logic above assumes LTR/TTB calculation.
    // If reverse, we position from End? Or just reverse the array and position from Start?
    // CSS row-reverse means: items are laid out right-to-left.
    // Let's implement standard "Start" means "Left" for Row, "Right" for RowReverse?
    // Actually simplicity:
    // If row-reverse, we conceptually flip the axis. Start is Right.
    // But implementation wise, usually easiest to just reverse the list and treat Justify.Start as Right.
    // Let's stick to standard flow and let the user reverse the list if they want, 
    // OR just handle the reversal in the loop.

    // Correct Flexbox row-reverse:
    // 1. Items ordered reverse.
    // 2. Justify Start packs to the "main start" (which is Right).
    // This is getting complex for "CSS Light".
    // Let's stick to physical direction for now, or simple array reversal.
    // If row-reverse:
    // 1. Position starts at container Width.
    // 2. Advance negatively.
    // OR simpler:
    // Calculate as normal LTR, then flip coordinates if reverse.

    // Let's use the simple order reversal for now (visual order matches DOM order reversed).
    // And standard justification logic aligns them to the "Start" of the main axis.
    // For row-reverse, Main Start is Right.
    // To achieve that with simple math:
    // If isReverse:
    //   mainOffset initialized to handle "Start" alignment...
    // Let's defer full reverse support and just process logic order.

    if (isReverse) {
      // If Justify Start -> Align to Right (for Row) or Bottom (for Column)
      // This effectively flips Justify behavior.
      // Start -> becomes End physically.
      // Let's keep it simple: Justify always works in the direction of flow.
      // Start = start of flow.
    }

    processingOrder.forEach(item => {
      // Cross Axis Alignment per item
      let crossOffset = 0;
      let alignMode = item.alignSelf !== 'auto' ? item.alignSelf : align;

      // Resolve enum vs string
      // FlexAlign.Start = 'start'

      switch (alignMode) {
        case 'start':
        case FlexAlign.Start:
          crossOffset = 0;
          break;
        case 'end':
        case FlexAlign.End:
          crossOffset = containerCrossSize - item.finalCrossSize;
          break;
        case 'center':
        case FlexAlign.Center:
          crossOffset = (containerCrossSize - item.finalCrossSize) / 2;
          break;
        case 'stretch':
        case FlexAlign.Stretch:
          crossOffset = 0;
          break;
      }

      if (isRow) {
        // Standard Flow
        // If row-reverse, reverse the visual position in line
        if (direction === FlexDirection.RowReverse) {
          const x = padding.left + currentMainPos;
          // Flip in content area: width - right_edge
          // right_edge = x + item.finalMainSize
          // flipped_left = contentWidth - (x - padding.left + item.finalMainSize) + padding.left
          // Let's simplify: contentWidth - (currentMainPos + item.finalMainSize) + padding.left
          const flippedX = contentWidth - (currentMainPos + item.finalMainSize) + padding.left;

          item.child.setPosition(flippedX, padding.top + crossOffset);
        } else {
          item.child.setPosition(
            padding.left + currentMainPos,
            padding.top + crossOffset
          );
        }
      } else {
        // Column
        if (direction === FlexDirection.ColumnReverse) {
          const y = padding.top + currentMainPos;
          const flippedY = contentHeight - (currentMainPos + item.finalMainSize) + padding.top;
          item.child.setPosition(padding.left + crossOffset, flippedY);
        } else {
          item.child.setPosition(
            padding.left + crossOffset,
            padding.top + currentMainPos
          );
        }
      } currentMainPos += item.finalMainSize + gap + spaceBetween;
    });
  }

  /** @internal */
  protected render(): void {
    // FlexContainer itself has no visual representation
    // Could add debug borders here if needed
  }

  /**
   * Override measureContent for flex layout system.
   * Containers return 0,0 since children determine their size.
   */
  override measureContent(): { width: number; height: number } {
    // Container's size is determined by children, not intrinsic content
    return { width: 0, height: 0 };
  }
}
