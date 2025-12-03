import * as PIXI from 'pixi.js';
import { UIComponent } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { UIPanel } from './ui-panel';
import { UIFocusManager } from '../base/ui-focus-manager';
import { asTextDPR, ActionManager } from '@moxijs/core';
import { ThemeResolver } from '../theming/theme-resolver';
// Theme resolver is now in base class
import {
  FormStateManager,
  TextInputHandler
} from '../services';
import { UI_DEFAULTS } from '../theming/theme-data';

/**
 * Props for configuring a UITextArea
 *
 * @category UI
 */
export interface UITextAreaProps {
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
  /** Width of the textarea */
  width?: number;
  /** Height of the textarea */
  height?: number;
  /** Whether the textarea is disabled */
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
  /** Line height multiplier (e.g., 1.5 means 1.5x the font size) */
  lineHeight?: number;
  /** Number of visible rows */
  rows?: number;
  /** Optional ThemeResolver for automatic color resolution */
  themeResolver?: ThemeResolver;
}

/**
 * A multi-line text area component
 * Supports word wrapping and scrolling
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const textarea = new UITextArea({
 *   placeholder: 'Enter your message...',
 *   onChange: (value) => console.log('Message:', value),
 *   width: 400,
 *   height: 120,
 *   rows: 4
 * });
 * ```
 */
export class UITextArea extends UIComponent {
  // Props
  private props: Required<Omit<UITextAreaProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver'>>;
  
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
  
  // Theme data
  // Theme resolver is now in base class
  private colorOverrides: {
    backgroundColor?: number;
    textColor?: number;
    placeholderColor?: number;
  } = {};

  constructor(props: UITextAreaProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    const defaultLineHeight = props.lineHeight ?? 1.2; // Tighter spacing for pixel fonts
    const defaultHeight = (props.rows ?? 4) * (props.fontSize ?? 14) * defaultLineHeight + 24;

    this.props = {
      placeholder: props.placeholder ?? '',
      maxLength: props.maxLength ?? 1000,
      width: props.width ?? 400,
      height: props.height ?? defaultHeight,
      disabled: props.disabled ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      placeholderColor: props.placeholderColor ?? 0x999999,
      borderRadius: props.borderRadius ?? 4,
      fontSize: props.fontSize ?? 14,
      lineHeight: defaultLineHeight,
      rows: props.rows ?? 4
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
      type: 'text', // Textarea doesn't support number type
      multiline: true
    });

    // Update component state
    this.enabled = !this.props.disabled;

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create visual elements
    this.createVisuals();

    // Create cursor
    this.cursor = new PIXI.Graphics();
    this.cursor.visible = false;
    this.container.addChild(this.cursor);

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

    // Create text display with word wrapping and high-DPI DPR rendering
    const displayText = this.getDisplayText();
    const dprScale = UI_DEFAULTS.DPR_SCALE;
    const textColor = displayText === this.props.placeholder
      ? this.resolvePlaceholderColor(this.colorOverrides.placeholderColor)
      : this.resolveTextColor(this.colorOverrides.textColor);

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: UI_DEFAULTS.FONT_FAMILY,
        fontSize: this.props.fontSize,
        fill: textColor,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: (this.props.width - 24) * dprScale,
        lineHeight: this.props.fontSize * this.props.lineHeight * dprScale
      },
      dprScale,
      pixelPerfect: true
    });
    this.textDisplay.position.set(12, 12);
    this.textDisplay.roundPixels = true;
    this.container.addChild(this.textDisplay);
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
   * Called when textarea receives focus
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
   * Called when textarea loses focus
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

    // Don't prevent default for Tab (allow tab navigation)
    if (e.key === 'Tab') {
      return; // Let tab navigation work
    }

    // Handle Enter/Escape for blur
    if (e.key === 'Escape') {
      this.onBlur();
      return;
    }

    // Delegate keyboard handling to TextInputHandler
    const handled = this.inputHandler.handleKeyDown(e);
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      // Handler updates stateManager directly, so we need to update visuals
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

    // Create temporary text to measure
    // Note: wordWrapWidth needs to account for DPR scaling (multiply by dprScale)
    const dprScale = UI_DEFAULTS.DPR_SCALE;
    const tempText = new PIXI.Text({
      text: textUpToCursor,
      style: {
        fontFamily: UI_DEFAULTS.FONT_FAMILY, // Match the display font
        fontSize: this.props.fontSize * dprScale, // Account for DPR scaling
        fill: this.textDisplay.style.fill,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: (this.props.width - 24) * dprScale,
        lineHeight: this.props.fontSize * this.props.lineHeight * dprScale
      }
    });
    // Ensure effects is initialized to prevent null reference errors
    if (tempText.effects === null) {
      tempText.effects = [];
    }

    // Get the bounds to find cursor position
    const metrics = tempText.getLocalBounds();

    // For multi-line, we need to find the last line position
    const lines = textUpToCursor.split('\n');
    const lastLine = lines[lines.length - 1];

    const lastLineText = new PIXI.Text({
      text: lastLine,
      style: {
        fontFamily: UI_DEFAULTS.FONT_FAMILY, // Match the display font
        fontSize: this.props.fontSize * dprScale, // Account for DPR scaling
        fill: this.textDisplay.style.fill,
        align: 'left',
        lineHeight: this.props.fontSize * this.props.lineHeight * dprScale
      }
    });
    // Ensure effects is initialized to prevent null reference errors
    if (lastLineText.effects === null) {
      lastLineText.effects = [];
    }

    // Account for DPR scaling when calculating cursor position
    const cursorX = 12 + (lastLineText.width / dprScale);
    const cursorY = 12 + (lines.length - 1) * (this.props.fontSize * this.props.lineHeight);

    this.cursor.clear();
    this.cursor.rect(cursorX, cursorY, 1, this.props.fontSize);
    const cursorColor = this.resolveTextColor(this.colorOverrides.textColor);
    this.cursor.fill({ color: cursorColor });

    // Clean up temp objects
    tempText.destroy();
    lastLineText.destroy();
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
   * Measures the size needed for this textarea
   */
  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.props.width,
      height: this.props.height
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /**
   * Performs layout for this textarea
   */
  layout(availableWidth: number, availableHeight: number): void {
    const measured = this.measure();
    super.layout(availableWidth, availableHeight);

    // Layout background
    this.background.layout(measured.width, measured.height);
  }

  /**
   * Renders the textarea
   */
  protected render(): void {
    // Rendering handled by background, text, and cursor
  }

  /**
   * Sets the value programmatically
   */
  setValue(value: string): void {
    this.stateManager.setValue(value);
    // Handler uses stateManager directly, just update cursor position
    this.inputHandler.setCursorPosition(value.length);
    this.updateText();
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
