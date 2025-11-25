/**
 * UI State Manager - Persists card positions and sizes to localStorage
 */
export interface CardState {
    id: string;
    x: number;
    y: number;
    contentWidth: number;
    contentHeight: number;
    visible: boolean;
}
export interface UIState {
    version: string;
    timestamp: number;
    canvasWidth: number;
    canvasHeight: number;
    cards: CardState[];
}
export declare class UIStateManager {
    private static readonly VERSION;
    private static readonly STORAGE_KEY;
    /**
     * Save UI state to localStorage
     */
    static saveState(cards: Map<string, CardState>, canvasWidth: number, canvasHeight: number): void;
    /**
     * Load UI state from localStorage
     */
    static loadState(): UIState | null;
    /**
     * Clear saved UI state
     */
    static clearState(): void;
    /**
     * Check if saved state exists
     */
    static hasState(): boolean;
    /**
     * Adjust card positions for different canvas size
     * (Handles window resize between sessions)
     */
    static adjustForCanvasSize(state: UIState, newWidth: number, newHeight: number): UIState;
}
