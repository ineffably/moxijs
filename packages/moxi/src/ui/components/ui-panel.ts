import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';

/**
 * 9-slice configuration for scalable sprites
 *
 * @category UI
 */
export interface NineSliceConfig {
  /** Width of left edge that doesn't scale */
  leftWidth: number;
  /** Height of top edge that doesn't scale */
  topHeight: number;
  /** Width of right edge that doesn't scale */
  rightWidth: number;
  /** Height of bottom edge that doesn't scale */
  bottomHeight: number;
}

/**
 * Props for configuring a UIPanel
 *
 * @category UI
 */
export interface UIPanelProps {
  /** Background texture */
  texture?: PIXI.Texture;
  /** Background color (if no texture) */
  backgroundColor?: number;
  /** Background alpha */
  backgroundAlpha?: number;
  /** 9-slice configuration (if using texture) */
  nineSlice?: NineSliceConfig;
  /** Fixed width */
  width?: number;
  /** Fixed height */
  height?: number;
  /** Border radius (if using solid color) */
  borderRadius?: number;
}

/**
 * A panel component with optional 9-slice background
 * Can use either a texture or solid color background
 *
 * @category UI
 *
 * @example
 * ```typescript
 * // With texture and 9-slice
 * const panel = new UIPanel({
 *   texture: panelTexture,
 *   nineSlice: { leftWidth: 16, topHeight: 16, rightWidth: 16, bottomHeight: 16 },
 *   width: 300,
 *   height: 200
 * });
 *
 * // With solid color
 * const panel = new UIPanel({
 *   backgroundColor: 0x2c3e50,
 *   width: 300,
 *   height: 200,
 *   borderRadius: 8
 * });
 * ```
 */
export class UIPanel extends UIComponent {
  private props: UIPanelProps;
  private background?: PIXI.NineSliceSprite | PIXI.Graphics;

  constructor(props: UIPanelProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      backgroundAlpha: props.backgroundAlpha ?? 1,
      ...props
    };

    // Set box model dimensions if provided
    if (props.width !== undefined) {
      this.boxModel.width = props.width;
    }
    if (props.height !== undefined) {
      this.boxModel.height = props.height;
    }

    // Create background
    this.createBackground();
  }

  /**
   * Creates the background (either 9-slice sprite or graphics)
   */
  private createBackground(): void {
    if (this.props.texture && this.props.nineSlice) {
      // Use 9-slice sprite
      const { leftWidth, topHeight, rightWidth, bottomHeight } = this.props.nineSlice;
      this.background = new PIXI.NineSliceSprite({
        texture: this.props.texture,
        leftWidth,
        topHeight,
        rightWidth,
        bottomHeight
      });
      this.background.alpha = this.props.backgroundAlpha ?? 1;
      this.container.addChild(this.background);
    } else if (this.props.backgroundColor !== undefined) {
      // Use graphics for solid color
      this.background = new PIXI.Graphics();
      this.container.addChild(this.background);
    }
  }

  /**
   * Measures the size needed for this panel
   */
  measure(): MeasuredSize {
    const padding = this.boxModel.padding;

    let contentWidth = 0;
    let contentHeight = 0;

    if (typeof this.boxModel.width === 'number') {
      contentWidth = this.boxModel.width;
    } else if (this.props.width !== undefined) {
      contentWidth = this.props.width;
    }

    if (typeof this.boxModel.height === 'number') {
      contentHeight = this.boxModel.height;
    } else if (this.props.height !== undefined) {
      contentHeight = this.props.height;
    }

    return {
      width: contentWidth + padding.horizontal,
      height: contentHeight + padding.vertical
    };
  }

  /**
   * Performs layout for this panel
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    const padding = this.boxModel.padding;

    // Calculate final dimensions
    let finalWidth = measured.width;
    let finalHeight = measured.height;

    if (this.boxModel.width === 'fill') {
      finalWidth = availableWidth;
    }
    if (this.boxModel.height === 'fill') {
      finalHeight = availableHeight;
    }

    // Apply max constraints
    if (this.boxModel.maxWidth !== undefined) {
      finalWidth = Math.min(finalWidth, this.boxModel.maxWidth);
    }
    if (this.boxModel.maxHeight !== undefined) {
      finalHeight = Math.min(finalHeight, this.boxModel.maxHeight);
    }

    // Update computed layout
    this.computedLayout.width = finalWidth;
    this.computedLayout.height = finalHeight;
    this.computedLayout.contentX = padding.left;
    this.computedLayout.contentY = padding.top;
    this.computedLayout.contentWidth = finalWidth - padding.horizontal;
    this.computedLayout.contentHeight = finalHeight - padding.vertical;

    this.layoutDirty = false;
    this.render();
  }

  /**
   * Renders the panel background
   */
  protected render(): void {
    if (!this.background) return;

    const { width, height } = this.computedLayout;

    if (this.background instanceof PIXI.NineSliceSprite) {
      // Update 9-slice sprite size
      this.background.width = width;
      this.background.height = height;
    } else if (this.background instanceof PIXI.Graphics) {
      // Redraw graphics
      this.background.clear();

      if (this.props.borderRadius && this.props.borderRadius > 0) {
        this.background.roundRect(0, 0, width, height, this.props.borderRadius);
      } else {
        this.background.rect(0, 0, width, height);
      }

      if (this.props.backgroundColor !== undefined) {
        this.background.fill({
          color: this.props.backgroundColor,
          alpha: this.props.backgroundAlpha
        });
      }
    }
  }

  /**
   * Updates the background color (only works for solid color panels)
   */
  setBackgroundColor(color: number, alpha: number = 1): void {
    if (this.background instanceof PIXI.Graphics) {
      this.props.backgroundColor = color;
      this.props.backgroundAlpha = alpha;
      this.render();
    }
  }

  /**
   * Updates the texture (only works for texture-based panels)
   */
  setTexture(texture: PIXI.Texture): void {
    if (this.background instanceof PIXI.NineSliceSprite) {
      this.background.texture = texture;
    }
  }
}
