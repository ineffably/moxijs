import * as PIXI from 'pixi.js';
import { UIComponent, UIFontConfig } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { EdgeInsets } from '../base/edge-insets';
import { UI_LAYOUT_DEFAULTS } from '../theming/theme-data';
import { FlexDirection, FlexJustify, FlexAlign } from './flex-container';
import { isFlexLayoutParticipant } from './layout-participant';

/**
 * FlexContainerPanel configuration.
 * Combines FlexContainer layout with panel features (background, border, clipping).
 */
export interface FlexContainerPanelProps {
  /** Flex direction */
  direction?: FlexDirection;
  /** Main axis alignment */
  justify?: FlexJustify;
  /** Cross axis alignment */
  align?: FlexAlign;
  /** Gap between children */
  gap?: number;
  /** Inner padding */
  padding?: EdgeInsets;
  /** Panel width */
  width?: number;
  /** Panel height */
  height?: number;
  /** Background color */
  backgroundColor?: number;
  /** Background alpha (0-1) */
  backgroundAlpha?: number;
  /** Border color */
  borderColor?: number;
  /** Border width */
  borderWidth?: number;
  /** Border radius */
  borderRadius?: number;
  /** Clip children to panel bounds */
  clipContent?: boolean;
  /** Font configuration for children to inherit */
  fontConfig?: UIFontConfig;
}

/**
 * A panel with flex layout capabilities.
 * Combines the layout power of FlexContainer with panel styling (background, border, clipping).
 *
 * @example
 * ```ts
 * const panel = new FlexContainerPanel({
 *   width: 400,
 *   height: 300,
 *   backgroundColor: 0x2a2a3a,
 *   borderColor: 0x404050,
 *   borderWidth: 1,
 *   borderRadius: 8,
 *   clipContent: true,
 *   direction: FlexDirection.Column,
 *   padding: EdgeInsets.all(10),
 *   gap: 8
 * });
 *
 * panel.addChild(label);
 * panel.addChild(button);
 * ```
 */
export class FlexContainerPanel extends UIComponent {
  private props: Required<Omit<FlexContainerPanelProps, 'padding' | 'fontConfig'>>;
  public children: UIComponent[] = [];

  private background: PIXI.Graphics;
  private contentContainer: PIXI.Container;
  private contentMask: PIXI.Graphics | null = null;

  constructor(props: FlexContainerPanelProps = {}) {
    const boxModel: Partial<BoxModel> = {
      padding: props.padding ?? EdgeInsets.zero(),
      width: props.width ?? 'auto',
      height: props.height ?? 'auto',
      flex: {
        direction: props.direction ?? FlexDirection.Column,
        justify: props.justify ?? FlexJustify.Start,
        alignItems: props.align ?? FlexAlign.Start,
        gap: props.gap ?? 0,
        wrap: 'nowrap'
      }
    };

    super(boxModel);

    this.props = {
      direction: props.direction ?? FlexDirection.Column,
      justify: props.justify ?? FlexJustify.Start,
      align: props.align ?? FlexAlign.Start,
      gap: props.gap ?? 0,
      width: props.width ?? 0,
      height: props.height ?? 0,
      backgroundColor: props.backgroundColor ?? 0x2a2a3a,
      backgroundAlpha: props.backgroundAlpha ?? 1,
      borderColor: props.borderColor ?? 0x404050,
      borderWidth: props.borderWidth ?? 0,
      borderRadius: props.borderRadius ?? 0,
      clipContent: props.clipContent ?? false
    };

    // Set font config if provided
    if (props.fontConfig) {
      this.setFontConfig(props.fontConfig);
    }

    // Create background
    this.background = new PIXI.Graphics();
    this.container.addChild(this.background);

    // Create content container
    this.contentContainer = new PIXI.Container();
    this.container.addChild(this.contentContainer);

    // Create mask if clipping is enabled
    if (this.props.clipContent) {
      this.contentMask = new PIXI.Graphics();
      this.container.addChild(this.contentMask);
      this.contentContainer.mask = this.contentMask;
    }

    // Draw initial background
    this.drawBackground();
  }

  /**
   * Draw the background and border
   */
  private drawBackground(): void {
    const { width, height, backgroundColor, backgroundAlpha, borderColor, borderWidth, borderRadius } = this.props;

    this.background.clear();

    // Draw background
    if (borderRadius > 0) {
      this.background.roundRect(0, 0, width, height, borderRadius);
    } else {
      this.background.rect(0, 0, width, height);
    }
    this.background.fill({ color: backgroundColor, alpha: backgroundAlpha });

    // Draw border
    if (borderWidth > 0) {
      if (borderRadius > 0) {
        this.background.roundRect(0, 0, width, height, borderRadius);
      } else {
        this.background.rect(0, 0, width, height);
      }
      this.background.stroke({ color: borderColor, width: borderWidth });
    }

    // Update mask if clipping
    if (this.contentMask) {
      this.contentMask.clear();
      if (borderRadius > 0) {
        this.contentMask.roundRect(0, 0, width, height, borderRadius);
      } else {
        this.contentMask.rect(0, 0, width, height);
      }
      this.contentMask.fill({ color: 0xffffff });
    }
  }

  /**
   * Add a child component
   */
  addChild(child: UIComponent): void {
    child.parent = this;
    this.children.push(child);
    this.contentContainer.addChild(child.container);

    // Sync to layout node tree
    if (isFlexLayoutParticipant(child)) {
      child.layoutNode.parent = this.layoutNode;
      this.layoutNode.children.push(child.layoutNode);
    }
  }

  /**
   * Remove a child component
   */
  removeChild(child: UIComponent): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.contentContainer.removeChild(child.container);
      child.parent = undefined;

      if (isFlexLayoutParticipant(child)) {
        const nodeIndex = this.layoutNode.children.indexOf(child.layoutNode);
        if (nodeIndex !== -1) {
          this.layoutNode.children.splice(nodeIndex, 1);
        }
        child.layoutNode.parent = null;
      }
    }
  }

  /**
   * Remove all children
   */
  removeAllChildren(): void {
    for (const child of [...this.children]) {
      this.removeChild(child);
    }
  }

  /**
   * Get the content container (for adding raw PIXI objects)
   */
  getContentContainer(): PIXI.Container {
    return this.contentContainer;
  }

  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  layout(availableWidth: number, availableHeight: number): void {
    const width = this.props.width || availableWidth;
    const height = this.props.height || availableHeight;

    // Update props if size changed
    if (this.props.width !== width || this.props.height !== height) {
      this.props.width = width;
      this.props.height = height;
      this.drawBackground();
    }

    // Calculate content area
    const padding = this.boxModel.padding;
    const contentX = padding.left;
    const contentY = padding.top;
    const contentWidth = width - padding.horizontal;
    const contentHeight = height - padding.vertical;

    // Position content container
    this.contentContainer.position.set(contentX, contentY);

    // Layout children using flex rules
    const { direction, justify, align, gap } = this.props;
    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    const isReverse = direction === FlexDirection.RowReverse || direction === FlexDirection.ColumnReverse;

    // Measure children
    const childSizes: { width: number; height: number }[] = [];
    let totalMainSize = 0;

    for (const child of this.children) {
      child.layout(contentWidth, contentHeight);
      const layout = child.getLayout();
      childSizes.push({ width: layout.width, height: layout.height });
      totalMainSize += isRow ? layout.width : layout.height;
    }

    // Add gaps to total
    if (this.children.length > 1) {
      totalMainSize += gap * (this.children.length - 1);
    }

    // Calculate starting position based on justify
    const mainAxisSize = isRow ? contentWidth : contentHeight;
    const remainingSpace = mainAxisSize - totalMainSize;

    let mainPos = 0;
    let spaceBetween = 0;

    switch (justify) {
      case FlexJustify.End:
        mainPos = remainingSpace;
        break;
      case FlexJustify.Center:
        mainPos = remainingSpace / 2;
        break;
      case FlexJustify.SpaceBetween:
        if (this.children.length > 1) {
          spaceBetween = remainingSpace / (this.children.length - 1);
        }
        break;
      case FlexJustify.SpaceAround:
        if (this.children.length > 0) {
          const space = remainingSpace / this.children.length;
          mainPos = space / 2;
          spaceBetween = space;
        }
        break;
      case FlexJustify.SpaceEvenly:
        if (this.children.length > 0) {
          const space = remainingSpace / (this.children.length + 1);
          mainPos = space;
          spaceBetween = space;
        }
        break;
    }

    // Position children
    const orderedChildren = isReverse ? [...this.children].reverse() : this.children;
    const orderedSizes = isReverse ? [...childSizes].reverse() : childSizes;

    for (let i = 0; i < orderedChildren.length; i++) {
      const child = orderedChildren[i];
      const size = orderedSizes[i];

      // Calculate cross axis position
      const crossAxisSize = isRow ? contentHeight : contentWidth;
      const childCrossSize = isRow ? size.height : size.width;
      let crossPos = 0;

      switch (align) {
        case FlexAlign.End:
          crossPos = crossAxisSize - childCrossSize;
          break;
        case FlexAlign.Center:
          crossPos = (crossAxisSize - childCrossSize) / 2;
          break;
        case FlexAlign.Stretch:
          crossPos = 0;
          break;
      }

      // Set position
      if (isRow) {
        child.container.position.set(mainPos, crossPos);
        mainPos += size.width + gap + spaceBetween;
      } else {
        child.container.position.set(crossPos, mainPos);
        mainPos += size.height + gap + spaceBetween;
      }
    }

    // Update computed layout
    this.computedLayout = {
      x: 0,
      y: 0,
      width,
      height,
      contentX,
      contentY,
      contentWidth,
      contentHeight
    };
  }

  protected render(): void {
    // Rendering handled by background and children
  }

  /**
   * Update background color
   */
  setBackgroundColor(color: number, alpha?: number): void {
    this.props.backgroundColor = color;
    if (alpha !== undefined) {
      this.props.backgroundAlpha = alpha;
    }
    this.drawBackground();
  }

  /**
   * Update border
   */
  setBorder(color: number, width: number): void {
    this.props.borderColor = color;
    this.props.borderWidth = width;
    this.drawBackground();
  }

  /**
   * Update size
   */
  setSize(width: number, height: number): void {
    this.props.width = width;
    this.props.height = height;
    this.boxModel.width = width;
    this.boxModel.height = height;
    this.drawBackground();
  }

  destroy(): void {
    this.removeAllChildren();
    super.destroy();
  }
}
