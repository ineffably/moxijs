/**
 * UndoManager - Tracks pixel operations for undo/redo
 *
 * Uses stroke-based undo where each pointer down/up cycle is one operation.
 */

/** A single pixel change */
export interface PixelChange {
  x: number;
  y: number;
  oldColorIndex: number;
  newColorIndex: number;
}

/** A stroke operation (group of pixel changes) */
export interface StrokeOperation {
  timestamp: number;
  changes: PixelChange[];
  spriteSheetId: string;
}

/** Undo manager configuration */
export interface UndoManagerConfig {
  maxHistory?: number;  // Maximum number of operations to keep (default: 50)
}

/**
 * Manages undo/redo history for pixel operations
 */
export class UndoManager {
  private undoStack: StrokeOperation[] = [];
  private redoStack: StrokeOperation[] = [];
  private currentStroke: PixelChange[] = [];
  private currentSpriteSheetId: string | null = null;
  private maxHistory: number;

  constructor(config: UndoManagerConfig = {}) {
    this.maxHistory = config.maxHistory ?? 50;
  }

  /**
   * Start recording a new stroke
   */
  beginStroke(spriteSheetId: string): void {
    this.currentStroke = [];
    this.currentSpriteSheetId = spriteSheetId;
  }

  /**
   * Record a pixel change within the current stroke
   */
  recordPixelChange(x: number, y: number, oldColorIndex: number, newColorIndex: number): void {
    // Only record if there's an actual change
    if (oldColorIndex === newColorIndex) return;

    // Check if we already have a change for this pixel in the current stroke
    const existingIndex = this.currentStroke.findIndex(c => c.x === x && c.y === y);

    if (existingIndex >= 0) {
      // Update the existing change (keep original oldColorIndex, update newColorIndex)
      this.currentStroke[existingIndex].newColorIndex = newColorIndex;
    } else {
      // Add new change
      this.currentStroke.push({ x, y, oldColorIndex, newColorIndex });
    }
  }

  /**
   * End the current stroke and add it to history
   */
  endStroke(): void {
    if (this.currentStroke.length > 0 && this.currentSpriteSheetId) {
      const operation: StrokeOperation = {
        timestamp: Date.now(),
        changes: [...this.currentStroke],
        spriteSheetId: this.currentSpriteSheetId
      };

      this.undoStack.push(operation);

      // Trim history if needed
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }

      // Clear redo stack when new operation is added
      this.redoStack = [];
    }

    this.currentStroke = [];
    this.currentSpriteSheetId = null;
  }

  /**
   * Check if there's a stroke in progress
   */
  isStrokeInProgress(): boolean {
    return this.currentSpriteSheetId !== null;
  }

  /**
   * Undo the last operation
   * @returns The operation to undo, or null if nothing to undo
   */
  undo(): StrokeOperation | null {
    const operation = this.undoStack.pop();
    if (operation) {
      this.redoStack.push(operation);
      return operation;
    }
    return null;
  }

  /**
   * Redo the last undone operation
   * @returns The operation to redo, or null if nothing to redo
   */
  redo(): StrokeOperation | null {
    const operation = this.redoStack.pop();
    if (operation) {
      this.undoStack.push(operation);
      return operation;
    }
    return null;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history for a specific sprite sheet
   */
  clearHistory(spriteSheetId?: string): void {
    if (spriteSheetId) {
      this.undoStack = this.undoStack.filter(op => op.spriteSheetId !== spriteSheetId);
      this.redoStack = this.redoStack.filter(op => op.spriteSheetId !== spriteSheetId);
    } else {
      this.undoStack = [];
      this.redoStack = [];
    }
    this.currentStroke = [];
    this.currentSpriteSheetId = null;
  }

  /**
   * Get current history size
   */
  getHistorySize(): { undo: number; redo: number } {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }
}
