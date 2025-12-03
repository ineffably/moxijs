import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { LayoutEngine } from '../services';

/**
 * Props for configuring a UIBox
 *
 * @category UI
 */
export interface UIBoxProps {
  /** Background color (hex number, e.g., 0xff0000 for red) */
  backgroundColor?: number;
  /** Background alpha/opacity (0-1) */
  backgroundAlpha?: number;
  /** Border color */
  borderColor?: number;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius for rounded corners */
  borderRadius?: number;
  /** Fixed width */
  width?: number;
  /** Fixed height */
  height?: number;
}

/**
 * A simple rectangular box component with optional background and border
 * Foundation for panels, buttons, and other visual UI elements
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const box = new UIBox({
 *   backgroundColor: 0x4a90e2,
 *   width: 200,
 *   height: 100,
 *   borderRadius: 8
 * });
 * ```
 */
export class UIBox extends UIComponent {
  private props: UIBoxProps;
  private graphics: PIXI.Graphics;
  
  // Services (composition)

  constructor(props: UIBoxProps = {}, boxModel?: Partial<BoxModel>) {
    super(boxModel);
    
    
    this.props = {
      backgroundColor: 0x000000,
      backgroundAlpha: 1,
      borderWidth: 0,
      borderRadius: 0,
      ...props
    };

    // Create graphics object for rendering
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);

    // Set box model dimensions if provided
    if (props.width !== undefined) {
      this.boxModel.width = props.width;
    }
    if (props.height !== undefined) {
      this.boxModel.height = props.height;
    }
  }

  /**
   * Measures the size needed for this box
   */
  measure(): MeasuredSize {
    const padding = this.boxModel.padding;
    const border = this.boxModel.border;

    // Calculate content size
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

  // Layout is handled by base class

  /**
   * Renders the box visuals
   */
  protected render(): void {
    this.graphics.clear();

    const { width, height } = this.computedLayout;
    const { backgroundColor, backgroundAlpha, borderColor, borderWidth, borderRadius } = this.props;

    // Draw border if specified
    if (borderWidth && borderWidth > 0 && borderColor !== undefined) {
      this.graphics.rect(0, 0, width, height);
      this.graphics.stroke({ color: borderColor, width: borderWidth });
    }

    // Draw background
    if (backgroundColor !== undefined) {
      if (borderRadius && borderRadius > 0) {
        this.graphics.roundRect(0, 0, width, height, borderRadius);
      } else {
        this.graphics.rect(0, 0, width, height);
      }
      this.graphics.fill({ color: backgroundColor, alpha: backgroundAlpha });
    }
  }

  /**
   * Updates the background color
   */
  setBackgroundColor(color: number, alpha: number = 1): void {
    this.props.backgroundColor = color;
    this.props.backgroundAlpha = alpha;
    this.render();
  }

  /**
   * Updates the border
   */
  setBorder(color: number, width: number): void {
    this.props.borderColor = color;
    this.props.borderWidth = width;
    this.render();
  }
}
