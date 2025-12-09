import * as PIXI from 'pixi.js';
import { UIComponent, FontType } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { UIPanel } from './ui-panel';
import { EdgeInsets } from '../base/edge-insets';
import { UIFocusManager } from '../base/ui-focus-manager';
import { asTextDPR, ActionManager } from '@moxijs/core';
import { ThemeResolver } from '../theming/theme-resolver';
import {
  FormStateManager,
  TextInputHandler
} from '../services';
import { UI_DEFAULTS } from '../theming/theme-data';

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
  /**
   * Font family name.
   * For canvas: Any CSS font family (e.g., 'Arial', 'Helvetica')
   * For MSDF/bitmap: Must match the loaded font's family name
   */
  fontFamily?: string;
  /**
   * Font rendering type.
   * - 'canvas' (default): Standard PIXI.Text with DPR scaling
   * - 'msdf': Multi-channel Signed Distance Field for crisp text at any scale
   * - 'bitmap': Pre-rendered bitmap font atlas
   * 
   * Note: Text inputs currently only support 'canvas' mode for cursor positioning.
   */
  fontType?: FontType;
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
  // Props
  private props: Required<Omit<UITextInputProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver' | 'fontFamily' | 'fontType'>>;
  /** Local fontFamily prop (can be overridden by parent inheritance) */
  private localFontFamily?: string;
  /** Local fontType prop (can be overridden by parent inheritance) */
  private localFontType?: FontType;
  
  // Services (composition)
  private stateManager: FormStateManager<string>;
  private inputHandler: TextInputHandler;
  // ThemeApplier removed - using base class helpers
  
  // Visual elements
  private background: UIPanel;
  private textDisplay: PIXI.Text;
  private cursor: PIXI.Graphics;
  
  // Cursor blink state
  private cursorBlinkInterval?: number;
  private cursorVisible: boolean = true;

  // Event listener management
  private actions = new ActionManager();

  // State is now in base class (enabled, focused, hovered, pressed)
  
  // Theme resolver is now in base class
  private colorOverrides: {
    backgroundColor?: number;
    textColor?: number;
    placeholderColor?: number;
  } = {};

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

    // Store color overrides
    this.colorOverrides = {
      backgroundColor: props.backgroundColor,
      textColor: props.textColor,
      placeholderColor: props.placeholderColor
    };

    // Store font props for inheritance
    this.localFontFamily = props.fontFamily;
    this.localFontType = props.fontType;

    // Initialize theme resolver
    this.themeResolver = props.themeResolver;
    
    this.stateManager = new FormStateManager({
      value: props.value,
      defaultValue: props.defaultValue,
      onChange: props.onChange
    });
    // Initialize input handler - it now uses stateManager directly
    this.inputHandler = new TextInputHandler({
      stateManager: this.stateManager,
      maxLength: this.props.maxLength,
      type: this.props.type,
      multiline: false
    });

    // Update component state
    this.enabled = !this.props.disabled;

    // Make text input focusable by default
    this.tabIndex = 0;

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create visual elements
    this.createVisuals();

    // Setup interactivity
    this.setupInteractivity();
  }

  /**
   * Create visual elements
   */
  private createVisuals(): void {
    // Create background
    const bgColor = this.resolveColor('background', this.colorOverrides.backgroundColor);
    
    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChild(this.background.container);

    // Create text display
    const displayText = this.getDisplayText();
    const textColor = displayText === this.props.placeholder
      ? this.resolvePlaceholderColor(this.colorOverrides.placeholderColor)
      : this.resolveTextColor(this.colorOverrides.textColor);

    // Resolve font family - check local prop first, then inherit from parent
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: effectiveFontFamily,
        fontSize: this.props.fontSize,
        fill: textColor,
        align: 'left'
      },
      dprScale: UI_DEFAULTS.DPR_SCALE,
      pixelPerfect: true
    });
    const textY = Math.round((this.props.height - this.props.fontSize) / 2);
    this.textDisplay.position.set(12, textY);
    this.textDisplay.roundPixels = true;
    this.container.addChild(this.textDisplay);

    // Create cursor
    this.cursor = new PIXI.Graphics();
    this.cursor.visible = false;
    this.container.addChild(this.cursor);
  }

  /**
   * Gets the display text (value or placeholder)
   */
  private getDisplayText(): string {
    const value = this.stateManager.getValue();
    return value || this.props.placeholder;
  }

  /**
   * Sets up mouse/keyboard event handlers
   */
  private setupInteractivity(): void {
    this.makeInteractive('text');

    // Click to focus
    this.container.on('pointerdown', this.handlePointerDown.bind(this));

    // Listen for global keyboard events
    if (typeof window !== 'undefined') {
      this.actions.add(window, 'keydown', this.handleKeyDown.bind(this) as EventListener);
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
   * Called when input receives focus
   */
  override onFocus(): void {
    if (this.focused) return;

    super.onFocus();
    // focused is already set by super.onFocus()
    
    // Set cursor position
    this.inputHandler.setCursorPosition(this.stateManager.getValue().length);
    this.cursor.visible = true;
    this.updateCursor();
    this.startCursorBlink();

    // Update background for focus state
    this.updateBackground();
  }

  /**
   * Called when input loses focus
   */
  override onBlur(): void {
    if (!this.focused) return;

    super.onBlur();
    // focused is already set by super.onBlur()
    this.cursor.visible = false;
    this.stopCursorBlink();

    // Update background for normal state
    this.updateBackground();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.focused || this.props.disabled) return;

    // Handle Enter/Escape for blur (before delegating to handler)
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.onBlur();
      return;
    }

    // Delegate keyboard handling to TextInputHandler
    const handled = this.inputHandler.handleKeyDown(e);
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      // Handler updates stateManager directly, so we just need to update visuals
      this.updateText();
      this.updateCursor();
    }
  }

  /**
   * Update text display
   */
  private updateText(): void {
    const value = this.stateManager.getValue();
    const displayText = this.getDisplayText();
    
    this.textDisplay.text = displayText;
    
    // Update text color based on whether showing placeholder
    const textColor = value
      ? this.resolveTextColor(this.colorOverrides.textColor)
      : this.resolvePlaceholderColor(this.colorOverrides.placeholderColor);
    
    this.textDisplay.style.fill = textColor;
    this.updateCursor();
  }

  /**
   * Update background based on state
   */
  private updateBackground(): void {
    const bgColor = this.focused
      ? this.resolveColor('focus', this.colorOverrides.backgroundColor)
      : this.resolveColor('background', this.colorOverrides.backgroundColor);

    // Update existing panel color instead of recreating
    this.background.setBackgroundColor(bgColor);
  }

  /**
   * Update cursor position visually
   */
  private updateCursor(): void {
    const value = this.stateManager.getValue();
    const cursorPos = this.inputHandler.getCursorPosition();
    const textUpToCursor = value.substring(0, cursorPos);
    
    // Ensure cursor position is valid
    if (cursorPos > value.length) {
      this.inputHandler.setCursorPosition(value.length);
    }
    const dprScale = UI_DEFAULTS.DPR_SCALE;
    // Use same font family as display text
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;
    const tempText = new PIXI.Text({
      text: textUpToCursor,
      style: {
        fontFamily: effectiveFontFamily, // Match the display font
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
    const cursorColor = this.resolveTextColor(this.colorOverrides.textColor);
    this.cursor.fill({ color: cursorColor });

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
    }, UI_DEFAULTS.CURSOR_BLINK_INTERVAL);
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
   * Measures the size needed for this input
   */
  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.props.width,
      height: this.props.height
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /**
   * Performs layout for this input
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    super.layout(availableWidth, availableHeight);

    // Layout background
    this.background.layout(measured.width, measured.height);
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
    this.stateManager.setValue(value);
    this.inputHandler.setValue(value);
    this.inputHandler.setCursorPosition(value.length);
    this.updateText();
    this.updateCursor();
  }

  /**
   * Gets the current value
   */
  getValue(): string {
    return this.stateManager.getValue();
  }

  /**
   * Update value (for controlled mode)
   */
  updateValue(value: string): void {
    this.stateManager.updateValue(value);
    // Handler uses stateManager directly, just update cursor position
    this.inputHandler.setCursorPosition(value.length);
    this.updateText();
    this.updateCursor();
  }

  /**
   * Sets the size of the input and redraws
   * @param width - New width in pixels
   * @param height - New height in pixels (optional, keeps current if not provided)
   */
  setSize(width: number, height?: number): void {
    this.props.width = width;
    if (height !== undefined) {
      this.props.height = height;
    }
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Recreate visuals with new size
    this.recreateVisuals();
    this.markLayoutDirty();
  }

  /**
   * Sets the width of the input
   */
  setWidth(width: number): void {
    this.setSize(width, this.props.height);
  }

  /**
   * Gets the current width
   */
  getWidth(): number {
    return this.props.width;
  }

  /**
   * Gets the current height
   */
  getHeight(): number {
    return this.props.height;
  }

  /**
   * Recreates visual elements (used after size change)
   */
  private recreateVisuals(): void {
    // Update background size
    this.background.destroy();

    const bgColor = this.resolveColor('background', this.colorOverrides.backgroundColor);
    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });

    // Insert background at position 0 (behind other elements)
    this.container.addChildAt(this.background.container, 0);

    // Update text position
    const textY = Math.round((this.props.height - this.props.fontSize) / 2);
    this.textDisplay.position.set(12, textY);

    // Update cursor
    this.updateCursor();
  }

  /**
   * Cleanup when destroying
   */
  destroy(): void {
    this.stopCursorBlink();
    this.actions.removeAll();
    super.destroy();
  }
}
