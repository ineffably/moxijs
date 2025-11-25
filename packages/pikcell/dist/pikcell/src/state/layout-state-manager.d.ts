/**
 * Layout State Manager - Save and load layout configurations
 */
export interface CardLayoutState {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface LayoutSlotState {
    cards: CardLayoutState[];
}
export declare class LayoutStateManager {
    /**
     * Save current layout to a slot
     */
    static saveLayoutSlot(slot: 'A' | 'B' | 'C', layout: LayoutSlotState): void;
    /**
     * Load layout from a slot
     */
    static loadLayoutSlot(slot: 'A' | 'B' | 'C'): LayoutSlotState | null;
    /**
     * Check if a slot has a saved layout
     */
    static hasLayoutSlot(slot: 'A' | 'B' | 'C'): boolean;
    /**
     * Clear a layout slot
     */
    static clearLayoutSlot(slot: 'A' | 'B' | 'C'): void;
}
