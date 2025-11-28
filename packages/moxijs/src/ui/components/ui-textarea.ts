import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UIPanel } from './ui-panel';
import { UIFocusManager } from '../core/ui-focus-manager';

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
  /** Background color */
  backgroundColor?: number;
  /** Text color */
  textColor?: number;
  /** Placeholder text color */
  placeholderColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Font size */
  fontSize?: number;
  /** Line height multiplier (e.g., 1.5 means 1.5x the font size) */
  lineHeight?: number;
  /** Number of visible rows */
  rows?: number;
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
  private props: Required<Omit<UITextAreaProps, 'onChange' | 'value' | 'defaultValue'>>;
  private onChange?: (value: string) => void;

  private currentValue: string;
  private background: UIPanel;
  private textDisplay: PIXI.Text;
  private cursor: PIXI.Graphics;
  private cursorPosition: number = 0;
  private cursorBlinkInterval?: number;
  private cursorVisible: boolean = true;

  constructor(props: UITextAreaProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    const defaultHeight = (props.rows ?? 4) * (props.fontSize ?? 14) * (props.lineHeight ?? 1.5) + 24;

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
      lineHeight: props.lineHeight ?? 1.5,
      rows: props.rows ?? 4
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

    // Create text display with word wrapping
    this.textDisplay = new PIXI.Text({
      text: this.getDisplayText(),
      style: {
        fontFamily: 'Arial',
        fontSize: this.props.fontSize,
        fill: this.currentValue ? this.props.textColor : this.props.placeholderColor,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: this.props.width - 24,
        lineHeight: this.props.fontSize * this.props.lineHeight
      },
      resolution: window.devicePixelRatio || 2
    });
    this.textDisplay.position.set(12, 12);
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

    // Listen for global keyboard events
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
   * Called when textarea receives focus (override from base class)
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
   * Called when textarea loses focus (override from base class)
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

    // Don't prevent default for Tab (allow tab navigation)
    if (e.key !== 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }

    const key = e.key;

    // Enter adds new line in textarea
    if (key === 'Enter') {
      if (this.currentValue.length < this.props.maxLength) {
        this.currentValue =
          this.currentValue.substring(0, this.cursorPosition) +
          '\n' +
          this.currentValue.substring(this.cursorPosition);
        this.cursorPosition++;
        this.updateText();
      }
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

    if (key === 'ArrowUp') {
      // Move cursor up one line
      this.moveCursorVertically(-1);
      return;
    }

    if (key === 'ArrowDown') {
      // Move cursor down one line
      this.moveCursorVertically(1);
      return;
    }

    if (key === 'Home') {
      // Move to start of current line
      const lineStart = this.currentValue.lastIndexOf('\n', this.cursorPosition - 1) + 1;
      this.cursorPosition = lineStart;
      this.updateCursor();
      return;
    }

    if (key === 'End') {
      // Move to end of current line
      let lineEnd = this.currentValue.indexOf('\n', this.cursorPosition);
      if (lineEnd === -1) lineEnd = this.currentValue.length;
      this.cursorPosition = lineEnd;
      this.updateCursor();
      return;
    }

    // Handle character input
    if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
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
   * Moves cursor vertically by the specified number of lines
   */
  private moveCursorVertically(direction: number): void {
    const lines = this.currentValue.split('\n');
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
    this.updateCursor();
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
    // Get text metrics up to cursor position
    const textUpToCursor = this.currentValue.substring(0, this.cursorPosition);

    // Create temporary text to measure
    const tempText = new PIXI.Text({
      text: textUpToCursor,
      style: {
        ...this.textDisplay.style,
        wordWrap: true,
        wordWrapWidth: this.props.width - 24
      }
    });

    // Get the bounds to find cursor position
    const metrics = tempText.getLocalBounds();

    // For multi-line, we need to find the last line position
    const lines = textUpToCursor.split('\n');
    const lastLine = lines[lines.length - 1];

    const lastLineText = new PIXI.Text({
      text: lastLine,
      style: this.textDisplay.style
    });

    const cursorX = 12 + lastLineText.width;
    const cursorY = 12 + (lines.length - 1) * (this.props.fontSize * this.props.lineHeight);

    this.cursor.clear();
    this.cursor.rect(cursorX, cursorY, 1, this.props.fontSize);
    this.cursor.fill({ color: this.props.textColor });

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
   * Measures the size needed for this textarea
   */
  measure(): MeasuredSize {
    return {
      width: this.props.width,
      height: this.props.height
    };
  }

  /**
   * Performs layout for this textarea
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
   * Renders the textarea
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
