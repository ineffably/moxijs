import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { EdgeInsets } from '../core/edge-insets';
import { UIFocusManager } from '../core/ui-focus-manager';
import { asTextDPR } from '../../library/as-pixi';
import { ThemeResolver } from '../theming/theme-resolver';
// Theme resolver is now in base class
import {
  FormStateManager,
  TextInputHandler
} from '../services';

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
  // Props
  private props: Required<Omit<UITextInputProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  
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

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: 'PixelOperator8',
        fontSize: this.props.fontSize,
        fill: textColor,
        align: 'left'
      },
      dprScale: 2,
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

    // Recreate background panel with new color
    const oldBackground = this.background;
    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    
    // Replace in container
    const index = this.container.getChildIndex(oldBackground.container);
    this.container.removeChild(oldBackground.container);
    this.container.addChildAt(this.background.container, index);
    oldBackground.destroy();
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
