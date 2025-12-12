import * as PIXI from 'pixi.js';
import { UIComponent, FontType } from '../base/ui-component';
import { BoxModel, MeasuredSize } from '../base/box-model';
import { UIPanel } from './ui-panel';
import { UIFocusManager } from '../base/ui-focus-manager';
import { asTextDPR, ActionManager } from '@moxijs/core';
import { ThemeResolver } from '../theming/theme-resolver';
import { FormStateManager } from '../services';
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
  /** Whether the textarea is read-only (displays text but not editable) */
  readOnly?: boolean;
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
   * Note: Text areas currently only support 'canvas' mode for cursor positioning.
   */
  fontType?: FontType;
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
  private props: Required<Omit<UITextAreaProps, 'onChange' | 'value' | 'defaultValue' | 'themeResolver' | 'fontFamily' | 'fontType' | 'readOnly'>> & { readOnly: boolean };
  /** Local fontFamily prop (can be overridden by parent inheritance) */
  private localFontFamily?: string;
  /** Local fontType prop (can be overridden by parent inheritance) */
  private localFontType?: FontType;

  // State management
  private stateManager: FormStateManager<string>;

  // Cursor state (inlined from TextInputHandler)
  private cursorPosition: number = 0;

  // Visual elements
  private background: UIPanel;
  private textDisplay: PIXI.Text;
  private cursor: PIXI.Graphics;

  // Cursor blink state
  private cursorBlinkInterval?: number;
  private cursorVisible: boolean = true;

  // Event listener management
  private actions = new ActionManager();

  // Theme data
  private colorOverrides: {
    backgroundColor?: number;
    textColor?: number;
    placeholderColor?: number;
  } = {};

  constructor(props: UITextAreaProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    const defaultLineHeight = props.lineHeight ?? 1.2;
    const defaultHeight = (props.rows ?? 4) * (props.fontSize ?? 14) * defaultLineHeight + 24;

    this.props = {
      placeholder: props.placeholder ?? '',
      maxLength: props.maxLength ?? 1000,
      width: props.width ?? 400,
      height: props.height ?? defaultHeight,
      disabled: props.disabled ?? false,
      readOnly: props.readOnly ?? false,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      textColor: props.textColor ?? 0x000000,
      placeholderColor: props.placeholderColor ?? 0x999999,
      borderRadius: props.borderRadius ?? 4,
      fontSize: props.fontSize ?? 14,
      lineHeight: defaultLineHeight,
      rows: props.rows ?? 4
    };

    // Store font props for inheritance
    this.localFontFamily = props.fontFamily;
    this.localFontType = props.fontType;

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

    // Initialize cursor position
    this.cursorPosition = this.stateManager.getValue().length;

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

    // Auto-layout if dimensions provided
    // This ensures the textarea is ready to use immediately without manual layout() call
    if (this.props.width > 0 && this.props.height > 0) {
      this.layout(this.props.width, this.props.height);
    }
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

    // Resolve font family through inheritance
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: effectiveFontFamily,
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

    // Set cursor position to end
    this.cursorPosition = this.stateManager.getValue().length;
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
    this.cursor.visible = false;
    this.stopCursorBlink();

    // Update background for normal state
    this.updateBackground();
  }

  /**
   * Handle keyboard input (inlined from TextInputHandler with multiline support)
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.focused || this.props.disabled) return;

    const key = e.key;

    // Don't prevent default for Tab (allow tab navigation)
    if (key === 'Tab') {
      return;
    }

    // Handle Escape for blur
    if (key === 'Escape') {
      this.onBlur();
      return;
    }

    let handled = false;

    if (key === 'Enter') {
      // Multiline: insert newline
      this.insertCharacter('\n');
      handled = true;
    } else if (key === 'Backspace') {
      this.handleBackspace();
      handled = true;
    } else if (key === 'Delete') {
      this.handleDelete();
      handled = true;
    } else if (key === 'ArrowLeft') {
      this.moveCursor(-1);
      handled = true;
    } else if (key === 'ArrowRight') {
      this.moveCursor(1);
      handled = true;
    } else if (key === 'ArrowUp') {
      this.moveCursorVertically(-1);
      handled = true;
    } else if (key === 'ArrowDown') {
      this.moveCursorVertically(1);
      handled = true;
    } else if (key === 'Home') {
      this.moveToLineStart();
      handled = true;
    } else if (key === 'End') {
      this.moveToLineEnd();
      handled = true;
    } else if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Character input
      this.insertCharacter(key);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      this.updateText();
      this.updateCursor();
    }
  }

  /**
   * Insert a character at cursor position
   */
  private insertCharacter(char: string): void {
    const value = this.stateManager.getValue();
    if (value.length >= this.props.maxLength) return;

    const newValue =
      value.substring(0, this.cursorPosition) +
      char +
      value.substring(this.cursorPosition);
    this.stateManager.setValue(newValue);
    this.cursorPosition++;
  }

  /**
   * Handle backspace key
   */
  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      const value = this.stateManager.getValue();
      const newValue =
        value.substring(0, this.cursorPosition - 1) +
        value.substring(this.cursorPosition);
      this.stateManager.setValue(newValue);
      this.cursorPosition--;
    }
  }

  /**
   * Handle delete key
   */
  private handleDelete(): void {
    const value = this.stateManager.getValue();
    if (this.cursorPosition < value.length) {
      const newValue =
        value.substring(0, this.cursorPosition) +
        value.substring(this.cursorPosition + 1);
      this.stateManager.setValue(newValue);
    }
  }

  /**
   * Move cursor horizontally
   */
  private moveCursor(direction: number): void {
    const value = this.stateManager.getValue();
    this.cursorPosition = Math.max(0, Math.min(this.cursorPosition + direction, value.length));
  }

  /**
   * Move cursor vertically (for multiline)
   */
  private moveCursorVertically(direction: number): void {
    const value = this.stateManager.getValue();
    const lines = value.split('\n');
    let currentLine = 0;
    let positionInLine = 0;
    let charCount = 0;

    // Find current line and position
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= this.cursorPosition) {
        currentLine = i;
        positionInLine = this.cursorPosition - charCount;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }

    // Move to target line
    const targetLine = Math.max(0, Math.min(lines.length - 1, currentLine + direction));
    if (targetLine === currentLine) return;

    // Calculate new cursor position
    let newPosition = 0;
    for (let i = 0; i < targetLine; i++) {
      newPosition += lines[i].length + 1;
    }
    newPosition += Math.min(positionInLine, lines[targetLine].length);

    this.cursorPosition = newPosition;
  }

  /**
   * Move cursor to start of current line
   */
  private moveToLineStart(): void {
    const value = this.stateManager.getValue();
    const lineStart = value.lastIndexOf('\n', this.cursorPosition - 1) + 1;
    this.cursorPosition = lineStart;
  }

  /**
   * Move cursor to end of current line
   */
  private moveToLineEnd(): void {
    const value = this.stateManager.getValue();
    let lineEnd = value.indexOf('\n', this.cursorPosition);
    if (lineEnd === -1) lineEnd = value.length;
    this.cursorPosition = lineEnd;
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
    // Note: cursor update is handled separately by caller to avoid double updates
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
    const textUpToCursor = value.substring(0, this.cursorPosition);

    // Ensure cursor position is valid
    if (this.cursorPosition > value.length) {
      this.cursorPosition = value.length;
    }

    // Resolve font family through inheritance
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;

    // For multi-line, we need to find the last line position
    const lines = textUpToCursor.split('\n');
    const lastLine = lines[lines.length - 1];

    // Measure text width using canvas context (much faster than creating PIXI.Text)
    // Must use scaled font size to match asTextDPR rendering (fontSize * dprScale, then scaled down)
    const scaledFontSize = this.props.fontSize * UI_DEFAULTS.DPR_SCALE;
    const scaledWidth = this.measureTextWidth(lastLine, effectiveFontFamily, scaledFontSize);
    // Scale back down to match the visual text width
    const lastLineWidth = scaledWidth / UI_DEFAULTS.DPR_SCALE;

    const cursorX = 12 + lastLineWidth;
    const cursorY = 12 + (lines.length - 1) * (this.props.fontSize * this.props.lineHeight);

    this.cursor.clear();
    this.cursor.rect(cursorX, cursorY, 1, this.props.fontSize);
    const cursorColor = this.resolveTextColor(this.colorOverrides.textColor);
    this.cursor.fill({ color: cursorColor });
  }

  /**
   * Measure text width using canvas 2D context (much faster than PIXI.Text)
   */
  private measureTextWidth(text: string, fontFamily: string, fontSize: number): number {
    // Use a shared canvas context for text measurement
    if (!UITextArea.measureCanvas) {
      UITextArea.measureCanvas = document.createElement('canvas');
      UITextArea.measureContext = UITextArea.measureCanvas.getContext('2d')!;
    }
    UITextArea.measureContext.font = `${fontSize}px ${fontFamily}`;
    return UITextArea.measureContext.measureText(text).width;
  }

  // Shared canvas for text measurement (static to avoid creating per instance)
  private static measureCanvas: HTMLCanvasElement;
  private static measureContext: CanvasRenderingContext2D;

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
   * Sets the value programmatically without triggering onChange.
   * Use this when setting value from external state (e.g., parent component).
   */
  setValue(value: string): void {
    const currentValue = this.stateManager.getValue();

    // If value hasn't changed, don't do anything (preserves cursor position)
    if (currentValue === value) {
      return;
    }

    this.stateManager.setValueSilent(value);

    // Only reset cursor to end if not focused (external update)
    // If focused, user is actively typing - preserve cursor position within bounds
    if (this.focused) {
      this.cursorPosition = Math.min(this.cursorPosition, value.length);
    } else {
      this.cursorPosition = value.length;
    }

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
    this.cursorPosition = value.length;
    this.updateText();
  }

  /**
   * Sets the size of the textarea and redraws
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
   * Sets the width of the textarea
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
    // Remove old visuals
    this.background.destroy();
    this.container.removeChild(this.textDisplay);
    this.textDisplay.destroy();

    // Recreate background
    const bgColor = this.focused
      ? this.resolveColor('focus', this.colorOverrides.backgroundColor)
      : this.resolveColor('background', this.colorOverrides.backgroundColor);

    this.background = new UIPanel({
      backgroundColor: bgColor,
      width: this.props.width,
      height: this.props.height,
      borderRadius: this.props.borderRadius
    });
    this.container.addChildAt(this.background.container, 0);

    // Recreate text display with new word wrap width
    const displayText = this.getDisplayText();
    const dprScale = UI_DEFAULTS.DPR_SCALE;
    const value = this.stateManager.getValue();
    const textColor = value
      ? this.resolveTextColor(this.colorOverrides.textColor)
      : this.resolvePlaceholderColor(this.colorOverrides.placeholderColor);

    // Resolve font family through inheritance
    const effectiveFontFamily = this.getInheritedFontFamily(this.localFontFamily) ?? UI_DEFAULTS.FONT_FAMILY;

    this.textDisplay = asTextDPR({
      text: displayText,
      style: {
        fontFamily: effectiveFontFamily,
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
    // Insert before cursor (cursor should be last)
    this.container.addChildAt(this.textDisplay, this.container.children.length - 1);

    // Update cursor position
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
