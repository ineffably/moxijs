import { UndoManager } from '../../src/state/undo-manager';

describe('UndoManager', () => {
  let undoManager: UndoManager;

  beforeEach(() => {
    undoManager = new UndoManager();
  });

  describe('stroke recording', () => {
    it('should start with empty history', () => {
      expect(undoManager.canUndo()).toBe(false);
      expect(undoManager.canRedo()).toBe(false);
      expect(undoManager.getHistorySize()).toEqual({ undo: 0, redo: 0 });
    });

    it('should record a stroke with pixel changes', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.recordPixelChange(1, 0, 0, 2);
      undoManager.endStroke();

      expect(undoManager.canUndo()).toBe(true);
      expect(undoManager.getHistorySize().undo).toBe(1);
    });

    it('should not record stroke if no changes', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.endStroke();

      expect(undoManager.canUndo()).toBe(false);
    });

    it('should ignore pixel change if old equals new', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 5, 5); // same color
      undoManager.endStroke();

      expect(undoManager.canUndo()).toBe(false);
    });

    it('should merge multiple changes to same pixel in one stroke', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.recordPixelChange(0, 0, 1, 2); // same pixel, different color

      // Undo should return operation with merged change
      undoManager.endStroke();
      const op = undoManager.undo();

      expect(op?.changes.length).toBe(1);
      expect(op?.changes[0].oldColorIndex).toBe(0);
      expect(op?.changes[0].newColorIndex).toBe(2);
    });
  });

  describe('undo/redo', () => {
    it('should undo last operation', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.endStroke();

      const operation = undoManager.undo();

      expect(operation).not.toBeNull();
      expect(operation?.changes[0]).toEqual({
        x: 0,
        y: 0,
        oldColorIndex: 0,
        newColorIndex: 1,
      });
      expect(undoManager.canUndo()).toBe(false);
      expect(undoManager.canRedo()).toBe(true);
    });

    it('should redo undone operation', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.endStroke();

      undoManager.undo();
      const operation = undoManager.redo();

      expect(operation).not.toBeNull();
      expect(undoManager.canUndo()).toBe(true);
      expect(undoManager.canRedo()).toBe(false);
    });

    it('should clear redo stack on new operation', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.endStroke();

      undoManager.undo();
      expect(undoManager.canRedo()).toBe(true);

      // New operation clears redo stack
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(1, 1, 0, 2);
      undoManager.endStroke();

      expect(undoManager.canRedo()).toBe(false);
    });

    it('should return null when nothing to undo/redo', () => {
      expect(undoManager.undo()).toBeNull();
      expect(undoManager.redo()).toBeNull();
    });
  });

  describe('history limits', () => {
    it('should respect maxHistory config', () => {
      const limitedManager = new UndoManager({ maxHistory: 3 });

      for (let i = 0; i < 5; i++) {
        limitedManager.beginStroke('sheet-1');
        limitedManager.recordPixelChange(i, 0, 0, i + 1);
        limitedManager.endStroke();
      }

      expect(limitedManager.getHistorySize().undo).toBe(3);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.endStroke();

      undoManager.clearHistory();

      expect(undoManager.canUndo()).toBe(false);
      expect(undoManager.canRedo()).toBe(false);
    });

    it('should clear history for specific sheet only', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.recordPixelChange(0, 0, 0, 1);
      undoManager.endStroke();

      undoManager.beginStroke('sheet-2');
      undoManager.recordPixelChange(0, 0, 0, 2);
      undoManager.endStroke();

      undoManager.clearHistory('sheet-1');

      expect(undoManager.getHistorySize().undo).toBe(1);
      const op = undoManager.undo();
      expect(op?.spriteSheetId).toBe('sheet-2');
    });
  });

  describe('isStrokeInProgress', () => {
    it('should return false when no stroke', () => {
      expect(undoManager.isStrokeInProgress()).toBe(false);
    });

    it('should return true during stroke', () => {
      undoManager.beginStroke('sheet-1');
      expect(undoManager.isStrokeInProgress()).toBe(true);
    });

    it('should return false after stroke ends', () => {
      undoManager.beginStroke('sheet-1');
      undoManager.endStroke();
      expect(undoManager.isStrokeInProgress()).toBe(false);
    });
  });
});
