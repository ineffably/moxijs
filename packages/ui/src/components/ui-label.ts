import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { asTextDPR } from '@moxijs/core';
import { LayoutEngine } from '../services';
import { UI_DEFAULTS } from '../theming/theme-data';

/** Text alignment options. */
export type TextAlign = 'left' | 'center' | 'right';

/** UILabel configuration. */
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
  /**
   * Line height as a multiplier of fontSize (like CSS unitless line-height).
   * - 1.0 = no extra spacing (tight)
   * - 1.2 = 20% extra spacing (default)
   * - 2.0 = double spacing
   * Note: This is NOT absolute pixels - use 1.2, not 24 for an 18px font.
   */
  lineHeight?: number;
  /** MSDF font family name. If provided, uses MSDF (Multi-channel Signed Distance Field) text rendering for crisp text at any scale. Must match the loaded MSDF font's family name. */
  msdfFontFamily?: string;
}

/**
 * Text label component wrapping PIXI.Text with layout integration.
 * Supports word wrapping, custom fonts, and alignment.
 *
 * @example
 * ```ts
 * const label = new UILabel({
 *   text: 'Hello World',
 *   fontSize: 24,
 *   color: 0xffffff,
 *   fontFamily: 'Arial',
 *   align: 'center'
 * });
 *
 * // With word wrap
 * const paragraph = new UILabel({
 *   text: 'Long text that needs wrapping...',
 *   wordWrap: true,
 *   wordWrapWidth: 200
 * });
 *
 * // Update text dynamically
 * label.setText('New text');
 * label.setColor(0xff0000);
 * ```
 */
export class UILabel extends UIComponent {
  private props: Required<Omit<UILabelProps, 'msdfFontFamily'>>;
  private textObject: PIXI.Text | null = null;
  private msdfTextObject: PIXI.BitmapText | null = null;
  private readonly dprScale = 2; // DPR scaling factor for crisp text
  /** Local msdfFontFamily prop (can be overridden by parent inheritance) */
  private readonly localMsdfFontFamily?: string;
  /** Local fontFamily prop (can be overridden by parent inheritance) */
  private readonly localFontFamily?: string;
  /** Track if text object has been initialized */
  private textInitialized = false;

  // Services (composition)

  constructor(props: UILabelProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    // Store local props - actual values will be resolved via inheritance
    this.localMsdfFontFamily = props.msdfFontFamily;
    this.localFontFamily = props.fontFamily;

    this.props = {
      text: props.text,
      fontSize: props.fontSize ?? 16,
      fontFamily: props.fontFamily ?? UI_DEFAULTS.FONT_FAMILY, // Default (may be overridden by inheritance)
      color: props.color ?? 0xffffff,
      align: props.align ?? 'left',
      wordWrap: props.wordWrap ?? false,
      wordWrapWidth: props.wordWrapWidth ?? 0,
      fontWeight: props.fontWeight ?? 'normal',
      lineHeight: props.lineHeight ?? 1.2
    };

    // Note: Text object creation is deferred to ensureTextObject()
    // to allow font inheritance from parent containers
  }

  /**
   * Ensures text object is created (lazy initialization).
   * Called before measure/render to allow parent inheritance to work.
   */
  private ensureTextObject(): void {
    if (this.textInitialized) return;
    this.textInitialized = true;

    // Resolve MSDF font family - check local prop first, then inherit from parent
    const effectiveMsdfFont = this.getInheritedMsdfFontFamily(this.localMsdfFontFamily);

    if (effectiveMsdfFont) {
      // Create PIXI.BitmapText for MSDF rendering (crisp at any scale)
      this.msdfTextObject = new PIXI.BitmapText({
        text: this.props.text,
        style: {
          fontFamily: effectiveMsdfFont,
          fontSize: this.props.fontSize,
          fill: this.props.color,
          align: this.props.align
        }
      });
      this.msdfTextObject.roundPixels = true;
      this.container.addChild(this.msdfTextObject);
    } else {
      // Create PIXI.Text with high-DPI DPR rendering for crisp text
      this.textObject = asTextDPR({
        text: this.props.text,
        style: this.getTextStyle(),
        dprScale: this.dprScale,
        pixelPerfect: true
      });
      this.textObject.roundPixels = true; // Ensure pixel-perfect positioning
      this.container.addChild(this.textObject);
    }
  }

  /** @internal */
  private getTextStyle(): { [key: string]: any } {
    // Resolve fontFamily through inheritance chain (local -> parent -> default)
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;

    // Note: fontSize is multiplied by dprScale in asTextDPR, so we pass display size here
    const style: { [key: string]: any } = {
      fontFamily: effectiveFontFamily,
      fontSize: this.props.fontSize, // Display size - asTextDPR will multiply by dprScale
      fill: this.props.color,
      align: this.props.align,
      fontWeight: this.props.fontWeight,
      lineHeight: this.props.fontSize * this.props.lineHeight // Display line height
    };

    if (this.props.wordWrap) {
      style.wordWrap = true;
      // wordWrapWidth needs to be in the scaled coordinate space
      style.wordWrapWidth = this.props.wordWrapWidth * this.dprScale;
    }

    return style;
  }

  /** @internal */
  private updateTextStyle(): void {
    if (!this.textObject) return;

    // Update the text style, accounting for DPR scaling
    const style = this.getTextStyle();
    // asTextDPR already multiplied fontSize by dprScale, so we need to update it
    this.textObject.style.fontSize = style.fontSize * this.dprScale;
    this.textObject.style.fontFamily = style.fontFamily;
    this.textObject.style.fill = style.fill;
    this.textObject.style.align = style.align;
    this.textObject.style.fontWeight = style.fontWeight;
    this.textObject.style.lineHeight = style.lineHeight * this.dprScale;
    if (this.props.wordWrap) {
      this.textObject.style.wordWrap = style.wordWrap;
      this.textObject.style.wordWrapWidth = style.wordWrapWidth;
    }
  }

  /** @internal */
  measure(): MeasuredSize {
    // Ensure text object exists (lazy init for inheritance support)
    this.ensureTextObject();

    const padding = this.boxModel.padding;

    // Get text bounds from the appropriate text object
    let textWidth: number;
    let textHeight: number;

    if (this.msdfTextObject) {
      textWidth = this.msdfTextObject.width;
      textHeight = this.msdfTextObject.height;
    } else if (this.textObject) {
      textWidth = this.textObject.width;
      textHeight = this.textObject.height;
    } else {
      textWidth = 0;
      textHeight = 0;
    }

    const contentSize: MeasuredSize = {
      width: textWidth,
      height: textHeight
    };

    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /** @internal */
  layout(availableWidth: number, availableHeight: number): void {
    const padding = this.boxModel.padding;

    // Update word wrap width if needed
    if (this.props.wordWrap && this.props.wordWrapWidth === 0) {
      // Use available width minus padding (display width)
      const wrapWidth = availableWidth - padding.horizontal;
      this.props.wordWrapWidth = wrapWidth; // Store display width
      this.updateTextStyle();
    }

    const measured = this.measure();
    
    // Use LayoutEngine to calculate layout
    this.computedLayout = this.layoutEngine.layout(
      this.boxModel,
      measured,
      { width: availableWidth, height: availableHeight }
    );

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

  /** @internal */
  protected render(): void {
    const padding = this.boxModel.padding;
    const x = Math.round(padding.left);

    // Get text height from the appropriate object
    const textHeight = this.msdfTextObject?.height ?? this.textObject?.height ?? 0;

    // Vertically center text if height is specified and larger than text height
    let y: number;
    if (this.computedLayout.height > 0 && this.computedLayout.contentHeight > 0) {
      const availableHeight = this.computedLayout.contentHeight;
      // Center vertically within available content height
      y = Math.round(padding.top + (availableHeight - textHeight) / 2);
    } else {
      y = Math.round(padding.top);
    }

    if (this.msdfTextObject) {
      this.msdfTextObject.position.set(x, y);
      this.msdfTextObject.roundPixels = true;
    } else if (this.textObject) {
      this.textObject.position.set(x, y);
      this.textObject.roundPixels = true; // Ensure pixel-perfect positioning
    }
  }

  /** Update displayed text. */
  setText(text: string): void {
    this.props.text = text;
    this.ensureTextObject();
    if (this.msdfTextObject) {
      this.msdfTextObject.text = text;
    } else if (this.textObject) {
      this.textObject.text = text;
    }
    this.markLayoutDirty();
  }

  /** Update text color. */
  setColor(color: number): void {
    this.props.color = color;
    this.ensureTextObject();
    if (this.msdfTextObject) {
      this.msdfTextObject.style.fill = color;
    } else if (this.textObject) {
      this.textObject.style.fill = color;
    }
  }

  /** Set the position of the label (overrides layout positioning) */
  setPosition(x: number, y: number): void {
    this.ensureTextObject();
    if (this.msdfTextObject) {
      this.msdfTextObject.position.set(Math.round(x), Math.round(y));
    } else if (this.textObject) {
      this.textObject.position.set(Math.round(x), Math.round(y));
    }
  }

  /** Update font size. */
  setFontSize(size: number): void {
    this.props.fontSize = size;
    this.ensureTextObject();
    if (this.msdfTextObject) {
      this.msdfTextObject.style.fontSize = size;
    } else if (this.textObject) {
      // Account for DPR scaling - fontSize in style is display size * dprScale
      this.textObject.style.fontSize = size * this.dprScale;
      // Also update line height
      this.textObject.style.lineHeight = size * this.props.lineHeight * this.dprScale;
    }
    this.markLayoutDirty();
  }

  /** Get current text. */
  getText(): string {
    return this.props.text;
  }

  /** Check if this label uses MSDF text rendering (includes inherited) */
  isMSDF(): boolean {
    return !!this.getInheritedMsdfFontFamily(this.localMsdfFontFamily);
  }
}
