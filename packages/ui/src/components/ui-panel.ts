import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { EdgeInsets } from '../base/edge-insets';
import { UI_LAYOUT_DEFAULTS } from '../theming/theme-data';

/** 9-slice configuration for scalable sprites. */
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

/** UIPanel configuration. */
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
  /** Border color */
  borderColor?: number;
  /** Border width in pixels */
  borderWidth?: number;
}

/**
 * Panel component with 9-slice sprite or solid color background.
 * Use for containers, windows, cards, boxes, and other UI backgrounds.
 *
 * @example
 * ```ts
 * // 9-slice sprite background (scales without distorting corners)
 * const panel = new UIPanel({
 *   texture: panelTexture,
 *   nineSlice: { leftWidth: 16, topHeight: 16, rightWidth: 16, bottomHeight: 16 },
 *   width: 300,
 *   height: 200
 * });
 *
 * // Solid color background with border
 * const colorPanel = new UIPanel({
 *   backgroundColor: 0x2c3e50,
 *   backgroundAlpha: 0.9,
 *   borderColor: 0x3d3d54,
 *   borderWidth: 1,
 *   width: 300,
 *   height: 200,
 *   borderRadius: 8
 * });
 *
 * // Update at runtime
 * panel.setBackgroundColor(0xff0000);
 * panel.setBorder(0x00ff00, 2);
 * ```
 */
export class UIPanel extends UIComponent {
  private props: UIPanelProps;
  private background?: PIXI.NineSliceSprite | PIXI.Graphics;
  private explicitPadding: boolean = false;

  constructor(props: UIPanelProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    // Check if padding was explicitly provided
    if (boxModel?.padding) {
      this.explicitPadding = true;
    }

    this.props = {
      backgroundAlpha: props.backgroundAlpha ?? 1,
      borderWidth: props.borderWidth ?? 0,
      borderRadius: props.borderRadius ?? 0,
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

  /** @internal */
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

  /** @internal */
  measure(): MeasuredSize {
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

    const contentSize: MeasuredSize = {
      width: contentWidth,
      height: contentHeight
    };

    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /**
   * Performs layout - resolving inherited defaults if needed
   */
  layout(availableWidth: number, availableHeight: number): void {
    // If padding wasn't explicitly set, try to inherit or use default
    if (!this.explicitPadding) {
      const inheritedPadding = this.resolveInheritedLayoutParam('defaultPadding');
      if (inheritedPadding !== undefined) {
        this.boxModel.padding = EdgeInsets.all(inheritedPadding);
      } else {
        // Fallback to global default
        this.boxModel.padding = EdgeInsets.all(UI_LAYOUT_DEFAULTS.PADDING);
      }
    }

    super.layout(availableWidth, availableHeight);
  }

  /** @internal */
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

      const { backgroundColor, backgroundAlpha, borderColor, borderWidth, borderRadius } = this.props;

      // Resolve border radius - check for inherited value if not set
      let effectiveBorderRadius = borderRadius || 0;
      if (effectiveBorderRadius === 0) {
        const inheritedRadius = this.resolveInheritedLayoutParam('borderRadius');
        if (inheritedRadius !== undefined) {
          effectiveBorderRadius = inheritedRadius;
        }
      }

      // Draw background fill first
      if (backgroundColor !== undefined) {
        if (effectiveBorderRadius > 0) {
          this.background.roundRect(0, 0, width, height, effectiveBorderRadius);
        } else {
          this.background.rect(0, 0, width, height);
        }
        this.background.fill({
          color: backgroundColor,
          alpha: backgroundAlpha
        });
      }

      // Draw border on top
      if (borderWidth && borderWidth > 0 && borderColor !== undefined) {
        if (effectiveBorderRadius > 0) {
          this.background.roundRect(0, 0, width, height, effectiveBorderRadius);
        } else {
          this.background.rect(0, 0, width, height);
        }
        this.background.stroke({ color: borderColor, width: borderWidth });
      }
    }
  }

  /** Update background color (solid color panels only). */
  setBackgroundColor(color: number, alpha: number = 1): void {
    if (this.background instanceof PIXI.Graphics) {
      this.props.backgroundColor = color;
      this.props.backgroundAlpha = alpha;
      this.render();
    }
  }

  /** Update border (solid color panels only). */
  setBorder(color: number, width: number): void {
    if (this.background instanceof PIXI.Graphics) {
      this.props.borderColor = color;
      this.props.borderWidth = width;
      this.render();
    }
  }

  /** Update texture (texture-based panels only). */
  setTexture(texture: PIXI.Texture): void {
    if (this.background instanceof PIXI.NineSliceSprite) {
      this.background.texture = texture;
    }
  }
}
