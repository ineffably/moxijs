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
  /** FormStateManager to use as source of truth */
  stateManager: { getValue: () => string; setValue: (value: string) => void };
  /** Maximum character length */
  maxLength?: number;
  /** Input type for validation */
  type?: 'text' | 'number';
  /** Whether multi-line (for textarea) */
  multiline?: boolean;
}

/**
 * Text Input Handler
 * 
 * Manages keyboard input, cursor position, and text editing.
 * Reusable across UITextInput and UITextArea.
 * Uses FormStateManager as the source of truth for value.
 */
export class TextInputHandler {
  private stateManager: { getValue: () => string; setValue: (value: string) => void };
  private cursorPosition: number = 0;
  private maxLength: number;
  private type: 'text' | 'number';
  private multiline: boolean;

  constructor(config: TextInputHandlerConfig) {
    this.stateManager = config.stateManager;
    this.maxLength = config.maxLength ?? (config.multiline ? 1000 : 100);
    this.type = config.type ?? 'text';
    this.multiline = config.multiline ?? false;
    this.cursorPosition = this.stateManager.getValue().length;
  }

  /**
   * Get the current value from state manager
   */
  getValue(): string {
    return this.stateManager.getValue();
  }

  /**
   * Set the value programmatically (updates state manager)
   */
  setValue(value: string): void {
    this.stateManager.setValue(value);
    this.cursorPosition = Math.min(this.cursorPosition, value.length);
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
    const value = this.stateManager.getValue();
    this.cursorPosition = Math.max(0, Math.min(position, value.length));
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
    const value = this.stateManager.getValue();
    if (value.length >= this.maxLength) {
      return;
    }

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
   * Move cursor vertically (for multi-line)
   */
  private moveCursorVertically(direction: number): void {
    if (!this.multiline) return;

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
    if (this.multiline) {
      const value = this.stateManager.getValue();
      const lineStart = value.lastIndexOf('\n', this.cursorPosition - 1) + 1;
      this.cursorPosition = lineStart;
    } else {
      this.cursorPosition = 0;
    }
  }

  /**
   * Move cursor to end of current line
   */
  private moveToLineEnd(): void {
    const value = this.stateManager.getValue();
    if (this.multiline) {
      let lineEnd = value.indexOf('\n', this.cursorPosition);
      if (lineEnd === -1) lineEnd = value.length;
      this.cursorPosition = lineEnd;
    } else {
      this.cursorPosition = value.length;
    }
  }
}

