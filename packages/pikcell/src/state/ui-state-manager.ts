/**
 * UI State Manager - Persists card positions and sizes to localStorage
 */

export interface CardState {
  id: string;                    // Unique identifier for the card
  x: number;                     // Position X
  y: number;                     // Position Y
  contentWidth: number;          // Content width in grid units
  contentHeight: number;         // Content height in grid units
  visible: boolean;              // Visibility state
}

export interface UIState {
  version: string;               // For future migrations
  timestamp: number;             // When saved
  canvasWidth: number;           // Canvas dimensions at save time
  canvasHeight: number;
  cards: CardState[];            // All card states
}

export class UIStateManager {
  private static readonly VERSION = '1.0.0';
  private static readonly STORAGE_KEY = 'sprite-editor-ui-state';

  /**
   * Save UI state to localStorage
   */
  static saveState(
    cards: Map<string, CardState>,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const state: UIState = {
      version: UIStateManager.VERSION,
      timestamp: Date.now(),
      canvasWidth,
      canvasHeight,
      cards: Array.from(cards.values())
    };

    try {
      localStorage.setItem(
        UIStateManager.STORAGE_KEY,
        JSON.stringify(state)
      );
      console.log('💾 UI state saved:', cards.size, 'cards');
    } catch (e) {
      console.error('Failed to save UI state:', e);
    }
  }

  /**
   * Load UI state from localStorage
   */
  static loadState(): UIState | null {
    try {
      const json = localStorage.getItem(UIStateManager.STORAGE_KEY);
      if (!json) return null;

      const state = JSON.parse(json) as UIState;

      // Validate version
      if (state.version !== UIStateManager.VERSION) {
        console.warn('UI state version mismatch, ignoring');
        return null;
      }

      console.log('📂 UI state loaded:', state.cards.length, 'cards');
      return state;
    } catch (e) {
      console.error('Failed to load UI state:', e);
      return null;
    }
  }

  /**
   * Clear saved UI state
   */
  static clearState(): void {
    localStorage.removeItem(UIStateManager.STORAGE_KEY);
    console.log('🗑️ UI state cleared');
  }

  /**
   * Check if saved state exists
   */
  static hasState(): boolean {
    return localStorage.getItem(UIStateManager.STORAGE_KEY) !== null;
  }

  /**
   * Adjust card positions for different canvas size
   * (Handles window resize between sessions)
   */
  static adjustForCanvasSize(
    state: UIState,
    newWidth: number,
    newHeight: number
  ): UIState {
    const scaleX = newWidth / state.canvasWidth;
    const scaleY = newHeight / state.canvasHeight;

    return {
      ...state,
      canvasWidth: newWidth,
      canvasHeight: newHeight,
      cards: state.cards.map(card => ({
        ...card,
        x: Math.round(card.x * scaleX),
        y: Math.round(card.y * scaleY)
      }))
    };
  }
}
