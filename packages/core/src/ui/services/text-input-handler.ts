/**
 * Text Input Handler Service
 * 
 * Single Responsibility: Handle keyboard input and cursor management for text inputs.
 * Composable service - can be used by UITextInput, UITextArea, etc.
 * 
 * @category UI Services
 */

/**
 * Configuration for text input handler
 */
export interface TextInputHandlerConfig {
  /** Initial value */
  value: string;
  /** Maximum character length */
  maxLength?: number;
  /** Input type for validation */
  type?: 'text' | 'number';
  /** Whether multi-line (for textarea) */
  multiline?: boolean;
  /** Change callback */
  onChange?: (value: string) => void;
}

/**
 * Text Input Handler
 * 
 * Manages keyboard input, cursor position, and text editing.
 * Reusable across UITextInput and UITextArea.
 */
export class TextInputHandler {
  private value: string;
  private cursorPosition: number = 0;
  private maxLength: number;
  private type: 'text' | 'number';
  private multiline: boolean;
  private onChange?: (value: string) => void;

  constructor(config: TextInputHandlerConfig) {
    this.value = config.value ?? '';
    this.maxLength = config.maxLength ?? (config.multiline ? 1000 : 100);
    this.type = config.type ?? 'text';
    this.multiline = config.multiline ?? false;
    this.onChange = config.onChange;
    this.cursorPosition = this.value.length;
  }

  /**
   * Get the current value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Set the value programmatically
   */
  setValue(value: string): void {
    this.value = value;
    this.cursorPosition = Math.min(this.cursorPosition, this.value.length);
    this.onChange?.(this.value);
  }

  /**
   * Get the current cursor position
   */
  getCursorPosition(): number {
    return this.cursorPosition;
  }

  /**
   * Set the cursor position
   */
  setCursorPosition(position: number): void {
    this.cursorPosition = Math.max(0, Math.min(position, this.value.length));
  }

  /**
   * Handle a keyboard event
   * Returns true if the event was handled
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const key = event.key;

    // Enter key behavior differs for single-line vs multi-line
    if (key === 'Enter') {
      if (this.multiline) {
        // Multi-line: insert newline
        this.insertCharacter('\n');
        return true;
      } else {
        // Single-line: don't handle (let parent handle blur)
        return false;
      }
    }

    if (key === 'Escape') {
      // Don't handle escape (let parent handle blur)
      return false;
    }

    if (key === 'Backspace') {
      this.handleBackspace();
      return true;
    }

    if (key === 'Delete') {
      this.handleDelete();
      return true;
    }

    if (key === 'ArrowLeft') {
      this.moveCursor(-1);
      return true;
    }

    if (key === 'ArrowRight') {
      this.moveCursor(1);
      return true;
    }

    if (key === 'ArrowUp' && this.multiline) {
      this.moveCursorVertically(-1);
      return true;
    }

    if (key === 'ArrowDown' && this.multiline) {
      this.moveCursorVertically(1);
      return true;
    }

    if (key === 'Home') {
      this.moveToLineStart();
      return true;
    }

    if (key === 'End') {
      this.moveToLineEnd();
      return true;
    }

    // Handle character input
    if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
      // Type validation
      if (this.type === 'number' && !/[0-9.-]/.test(key)) {
        return true; // Consume invalid character
      }

      this.insertCharacter(key);
      return true;
    }

    return false;
  }

  /**
   * Insert a character at the current cursor position
   */
  private insertCharacter(char: string): void {
    if (this.value.length >= this.maxLength) {
      return;
    }

    this.value =
      this.value.substring(0, this.cursorPosition) +
      char +
      this.value.substring(this.cursorPosition);
    this.cursorPosition++;
    this.onChange?.(this.value);
  }

  /**
   * Handle backspace key
   */
  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      this.value =
        this.value.substring(0, this.cursorPosition - 1) +
        this.value.substring(this.cursorPosition);
      this.cursorPosition--;
      this.onChange?.(this.value);
    }
  }

  /**
   * Handle delete key
   */
  private handleDelete(): void {
    if (this.cursorPosition < this.value.length) {
      this.value =
        this.value.substring(0, this.cursorPosition) +
        this.value.substring(this.cursorPosition + 1);
      this.onChange?.(this.value);
    }
  }

  /**
   * Move cursor horizontally
   */
  private moveCursor(direction: number): void {
    this.cursorPosition = Math.max(0, Math.min(this.cursorPosition + direction, this.value.length));
  }

  /**
   * Move cursor vertically (for multi-line)
   */
  private moveCursorVertically(direction: number): void {
    if (!this.multiline) return;

    const lines = this.value.split('\n');
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
    if (this.multiline) {
      const lineStart = this.value.lastIndexOf('\n', this.cursorPosition - 1) + 1;
      this.cursorPosition = lineStart;
    } else {
      this.cursorPosition = 0;
    }
  }

  /**
   * Move cursor to end of current line
   */
  private moveToLineEnd(): void {
    if (this.multiline) {
      let lineEnd = this.value.indexOf('\n', this.cursorPosition);
      if (lineEnd === -1) lineEnd = this.value.length;
      this.cursorPosition = lineEnd;
    } else {
      this.cursorPosition = this.value.length;
    }
  }

  /**
   * Set the onChange callback
   */
  setOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }
}

