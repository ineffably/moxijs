import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { EdgeInsets } from '../core/edge-insets';
import { UIFocusManager } from '../core/ui-focus-manager';
import { asTextDPR } from '../../library/as-pixi';
import { ThemeResolver } from '../theming/theme-resolver';

/**
 * Props for configuring a UITextInput
 *
 * @category UI
 */
export interface UITextInputProps {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change callback */
  onChange?: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Width of the input */
  width?: number;
  /** Height of the input */
  height?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Background color (overrides theme) */
  backgroundColor?: number;
  /** Text color (overrides theme) */
  textColor?: number;
  /** Placeholder text color (overrides theme) */
  placeholderColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Font size */
  fontSize?: number;
  /** Input type for validation */
  type?: 'text' | 'number';
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A text input component following Ant Design patterns
 * Supports both controlled and uncontrolled modes
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const input = new UITextInput({
 *   placeholder: 'Enter your name...',
 *   onChange: (value) => console.log('Input:', value),
 *   maxLength: 50
 * });
 * ```
 */
export class UITextInput extends UIComponent {
  private props: Required<Omit<UITextInputProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  private onChange?: (value: string) => void;

  private currentValue: string;
  private background: UIPanel;
  private textDisplay: PIXI.Text;
  private cursor: PIXI.Graphics;
  private cursorPosition: number = 0;
  private cursorBlinkInterval?: number;
  private cursorVisible: boolean = true;

  constructor(props: UITextInputProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = {
      placeholder: props.placeholder ?? '',
      maxLength: props.maxLength ?? 100,
      width: props.width ?? 200,
      height: props.height ?? 36,
      disabled: props.disabled ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      placeholderColor: props.placeholderColor ?? 0x999999,
      borderRadius: props.borderRadius ?? 4,
      fontSize: props.fontSize ?? 14,
      type: props.type ?? 'text'
    };

    this.onChange = props.onChange;
    this.currentValue = props.value ?? props.defaultValue ?? '';

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create background
    this.background = new UIPanel({
      backgroundColor: this.props.backgroundColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChild(this.background.container);

    // Create text display with high-DPI DPR rendering
    this.textDisplay = asTextDPR({
      text: this.getDisplayText(),
      style: {
        fontFamily: 'PixelOperator8', // Pixel-perfect font
        fontSize: this.props.fontSize,
        fill: this.currentValue ? this.props.textColor : this.props.placeholderColor,
        align: 'left'
      },
      dprScale: 2,
      pixelPerfect: true
    });
    // Round position to avoid blurry text from fractional pixels
    const textY = Math.round((this.props.height - this.props.fontSize) / 2);
    this.textDisplay.position.set(12, textY);
    this.textDisplay.roundPixels = true; // Ensure pixel-perfect positioning
    this.container.addChild(this.textDisplay);

    // Create cursor
    this.cursor = new PIXI.Graphics();
    this.cursor.visible = false;
    this.container.addChild(this.cursor);

    // Setup interactivity
    this.setupInteractivity();
  }

  /**
   * Gets the display text (value or placeholder)
   */
  private getDisplayText(): string {
    if (this.currentValue) {
      return this.currentValue;
    }
    return this.props.placeholder;
  }

  /**
   * Sets up mouse/keyboard event handlers
   */
  private setupInteractivity(): void {
    this.container.eventMode = 'static';
    this.container.cursor = 'text';

    // Click to focus
    this.container.on('pointerdown', this.handlePointerDown.bind(this));

    // Listen for global click to blur
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private handlePointerDown(e: PIXI.FederatedPointerEvent): void {
    if (this.props.disabled) return;

    // Request focus through the focus manager
    const focusManager = UIFocusManager.getInstance();
    if (focusManager) {
      focusManager.requestFocus(this);
    } else {
      // Fallback if no focus manager
      this.onFocus();
    }
    e.stopPropagation();
  }

  /**
   * Called when input receives focus (override from base class)
   */
  override onFocus(): void {
    if (this.focused) return;

    super.onFocus();
    this.cursorPosition = this.currentValue.length;
    this.cursor.visible = true;
    this.updateCursor();
    this.startCursorBlink();

    // Update background to show focus state
    this.background = new UIPanel({
      backgroundColor: this.lightenColor(this.props.backgroundColor, 0.95),
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
  }

  /**
   * Called when input loses focus (override from base class)
   */
  override onBlur(): void {
    if (!this.focused) return;

    super.onBlur();
    this.cursor.visible = false;
    this.stopCursorBlink();

    // Restore normal background
    this.background = new UIPanel({
      backgroundColor: this.props.backgroundColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.focused || this.props.disabled) return;

    // Stop event from propagating
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;

    if (key === 'Enter') {
      this.onBlur();
      return;
    }

    if (key === 'Escape') {
      this.onBlur();
      return;
    }

    if (key === 'Backspace') {
      if (this.cursorPosition > 0) {
        this.currentValue =
          this.currentValue.substring(0, this.cursorPosition - 1) +
          this.currentValue.substring(this.cursorPosition);
        this.cursorPosition--;
        this.updateText();
      }
      return;
    }

    if (key === 'Delete') {
      if (this.cursorPosition < this.currentValue.length) {
        this.currentValue =
          this.currentValue.substring(0, this.cursorPosition) +
          this.currentValue.substring(this.cursorPosition + 1);
        this.updateText();
      }
      return;
    }

    if (key === 'ArrowLeft') {
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
        this.updateCursor();
      }
      return;
    }

    if (key === 'ArrowRight') {
      if (this.cursorPosition < this.currentValue.length) {
        this.cursorPosition++;
        this.updateCursor();
      }
      return;
    }

    if (key === 'Home') {
      this.cursorPosition = 0;
      this.updateCursor();
      return;
    }

    if (key === 'End') {
      this.cursorPosition = this.currentValue.length;
      this.updateCursor();
      return;
    }

    // Handle character input
    if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Type validation
      if (this.props.type === 'number' && !/[0-9.-]/.test(key)) {
        return;
      }

      // Check max length
      if (this.currentValue.length >= this.props.maxLength) {
        return;
      }

      // Insert character at cursor position
      this.currentValue =
        this.currentValue.substring(0, this.cursorPosition) +
        key +
        this.currentValue.substring(this.cursorPosition);
      this.cursorPosition++;
      this.updateText();
    }
  }

  /**
   * Updates the text display and triggers onChange
   */
  private updateText(): void {
    this.textDisplay.text = this.getDisplayText();
    this.textDisplay.style.fill = this.currentValue ? this.props.textColor : this.props.placeholderColor;
    this.updateCursor();
    this.onChange?.(this.currentValue);
  }

  /**
   * Updates cursor position visually
   */
  private updateCursor(): void {
    // Measure text up to cursor position by creating a temporary text object
    const textUpToCursor = this.currentValue.substring(0, this.cursorPosition);
    const dprScale = 2;
    const tempText = new PIXI.Text({
      text: textUpToCursor,
      style: {
        fontFamily: 'PixelOperator8', // Match the display font
        fontSize: this.props.fontSize * dprScale, // Account for DPR scaling
        fill: this.textDisplay.style.fill,
        align: 'left'
      }
    });
    // Ensure effects is initialized to prevent null reference errors
    if (tempText.effects === null) {
      tempText.effects = [];
    }

    // Account for DPR scaling when calculating cursor position
    const cursorX = 12 + (tempText.width / dprScale);
    const cursorY = (this.props.height - this.props.fontSize) / 2;

    this.cursor.clear();
    this.cursor.rect(cursorX, cursorY, 1, this.props.fontSize);
    this.cursor.fill({ color: this.props.textColor });

    // Clean up temp text
    tempText.destroy();
  }

  /**
   * Starts cursor blinking animation
   */
  private startCursorBlink(): void {
    this.stopCursorBlink();
    this.cursorVisible = true;

    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.cursor.visible = this.cursorVisible;
    }, 530);
  }

  /**
   * Stops cursor blinking animation
   */
  private stopCursorBlink(): void {
    if (this.cursorBlinkInterval) {
      window.clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = undefined;
    }
  }

  /**
   * Lightens a color by a factor
   */
  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) / factor);
    const g = Math.min(255, ((color >> 8) & 0xff) / factor);
    const b = Math.min(255, (color & 0xff) / factor);
    return ((r << 16) | (g << 8) | b) >>> 0;
  }

  /**
   * Measures the size needed for this input
   */
  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  /**
   * Performs layout for this input
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();

    this.computedLayout.width = measured.width;
    this.computedLayout.height = measured.height;

    // Layout background
    this.background.layout(measured.width, measured.height);

    this.layoutDirty = false;
    this.render();
  }

  /**
   * Renders the input
   */
  protected render(): void {
    // Rendering handled by background, text, and cursor
  }

  /**
   * Sets the value programmatically
   */
  setValue(value: string): void {
    this.currentValue = value;
    this.cursorPosition = value.length;
    this.updateText();
  }

  /**
   * Gets the current value
   */
  getValue(): string {
    return this.currentValue;
  }

  /**
   * Cleanup when destroying
   */
  destroy(): void {
    this.stopCursorBlink();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
    super.destroy();
  }
}
