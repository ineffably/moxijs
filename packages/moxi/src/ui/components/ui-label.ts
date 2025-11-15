import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';

/**
 * Text alignment options
 *
 * @category UI
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Props for configuring a UILabel
 *
 * @category UI
 */
export interface UILabelProps {
  /** The text to display */
  text: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family name */
  fontFamily?: string;
  /** Text color (hex number) */
  color?: number;
  /** Text alignment */
  align?: TextAlign;
  /** Enable word wrapping */
  wordWrap?: boolean;
  /** Word wrap width (required if wordWrap is true) */
  wordWrapWidth?: number;
  /** Font weight */
  fontWeight?: string;
  /** Line height multiplier */
  lineHeight?: number;
}

/**
 * A text label component
 * Wraps PIXI.Text with layout integration
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const label = new UILabel({
 *   text: 'Hello World',
 *   fontSize: 24,
 *   color: 0xffffff,
 *   align: 'center'
 * });
 * ```
 */
export class UILabel extends UIComponent {
  private props: Required<UILabelProps>;
  private textObject: PIXI.Text;

  constructor(props: UILabelProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      text: props.text,
      fontSize: props.fontSize ?? 16,
      fontFamily: props.fontFamily ?? 'Arial',
      color: props.color ?? 0xffffff,
      align: props.align ?? 'left',
      wordWrap: props.wordWrap ?? false,
      wordWrapWidth: props.wordWrapWidth ?? 0,
      fontWeight: props.fontWeight ?? 'normal',
      lineHeight: props.lineHeight ?? 1.2
    };

    // Create PIXI.Text with initial style
    this.textObject = new PIXI.Text({
      text: this.props.text,
      style: this.getTextStyle(),
      resolution: window.devicePixelRatio || 2 // Match device resolution for crisp text
    });

    this.container.addChild(this.textObject);
  }

  /**
   * Gets the PIXI text style based on current props
   */
  private getTextStyle(): PIXI.TextStyle {
    const style: any = {
      fontFamily: this.props.fontFamily,
      fontSize: this.props.fontSize,
      fill: this.props.color,
      align: this.props.align,
      fontWeight: this.props.fontWeight,
      lineHeight: this.props.fontSize * this.props.lineHeight
    };

    if (this.props.wordWrap) {
      style.wordWrap = true;
      style.wordWrapWidth = this.props.wordWrapWidth;
    }

    return style;
  }

  /**
   * Measures the size needed for this label
   */
  measure(): MeasuredSize {
    const padding = this.boxModel.padding;
    const metrics = this.textObject;

    // Get text bounds
    const textWidth = metrics.width;
    const textHeight = metrics.height;

    return {
      width: textWidth + padding.horizontal,
      height: textHeight + padding.vertical
    };
  }

  /**
   * Performs layout for this label
   */
  layout(availableWidth: number, availableHeight: number): void {
    const padding = this.boxModel.padding;

    // Update word wrap width if needed
    if (this.props.wordWrap && this.props.wordWrapWidth === 0) {
      // Use available width minus padding
      const wrapWidth = availableWidth - padding.horizontal;
      this.props.wordWrapWidth = wrapWidth;
      this.textObject.style = this.getTextStyle();
    }

    const measured = this.measure();

    // Handle 'fill' constraints
    let finalWidth = measured.width;
    let finalHeight = measured.height;

    if (this.boxModel.width === 'fill') {
      finalWidth = availableWidth;
    } else if (typeof this.boxModel.width === 'number') {
      finalWidth = this.boxModel.width + padding.horizontal;
    }

    if (this.boxModel.height === 'fill') {
      finalHeight = availableHeight;
    } else if (typeof this.boxModel.height === 'number') {
      finalHeight = this.boxModel.height + padding.vertical;
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
   * Renders the label (positions the text object)
   */
  protected render(): void {
    const padding = this.boxModel.padding;
    this.textObject.position.set(padding.left, padding.top);
  }

  /**
   * Updates the text content
   */
  setText(text: string): void {
    this.props.text = text;
    this.textObject.text = text;
    this.markLayoutDirty();
  }

  /**
   * Updates the text color
   */
  setColor(color: number): void {
    this.props.color = color;
    this.textObject.style.fill = color;
  }

  /**
   * Updates the font size
   */
  setFontSize(size: number): void {
    this.props.fontSize = size;
    this.textObject.style.fontSize = size;
    this.markLayoutDirty();
  }

  /**
   * Gets the current text
   */
  getText(): string {
    return this.props.text;
  }
}
